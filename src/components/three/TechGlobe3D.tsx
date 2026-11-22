import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import {
  detectWebGLProfile,
  disposeObject3D,
} from '@/src/components/three/webglUtils';
import type { SkillCategory } from '@/src/types/portfolio';

interface TechGlobe3DProps {
  skills: SkillCategory[];
  isDark: boolean;
}

export interface TechNodeItem {
  label: string;
  category: string;
  description: string;
}

function buildVerifiedTechNodes(skills: SkillCategory[]): TechNodeItem[] {
  const seen = new Set<string>();
  const nodes: TechNodeItem[] = [];

  const pushNode = (label: string, category: string, sourceLine: string) => {
    const clean = label.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    nodes.push({
      label: clean,
      category,
      description: `Listed under "${category}" (${sourceLine}) in Raveesha's verified skills.`,
    });
  };

  for (const cat of skills) {
    for (const rawItem of cat.i) {
      // Split grouped parenthetical or comma-separated entries into clean tech tags while staying 100% faithful to user skills
      const cleaned = rawItem
        .replace(/^Version Control:\s*/i, '')
        .replace(/^IDEs & Software:\s*/i, '')
        .replace(/^OS Environment:\s*/i, '')
        .replace(/^Hardware & Microcontrollers\s*/i, '')
        .replace(/^Displays & Communication\s*/i, '')
        .replace(/^IoT Dashboards & Cloud\s*/i, '')
        .replace(/^App Development\s*/i, '')
        .replace(/^Web Development\s*/i, '');

      const parenMatch = /^([^(]+)\(([^)]+)\)$/.exec(cleaned);
      if (parenMatch) {
        const prefix = parenMatch[1].trim();
        const inside = parenMatch[2]
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);
        if (/^Object-Oriented Programming$/i.test(prefix)) {
          inside.forEach((x) => pushNode(x, cat.n, rawItem));
        } else if (/^Java$/i.test(prefix)) {
          pushNode('Java', cat.n, rawItem);
        } else if (/^Sensors$/i.test(prefix)) {
          pushNode('IoT Sensors', cat.n, rawItem);
        } else if (/^Displays$/i.test(prefix)) {
          pushNode('I2C LCD/OLED', cat.n, rawItem);
        } else if (/^IoT Cloud$/i.test(prefix)) {
          inside.forEach((x) => pushNode(x, cat.n, rawItem));
        } else if (inside.length) {
          inside.forEach((x) => pushNode(x, cat.n, rawItem));
        } else {
          pushNode(prefix, cat.n, rawItem);
        }
      } else {
        pushNode(cleaned, cat.n, rawItem);
      }
    }
  }

  return nodes;
}

function createBadgeTexture(
  label: string,
  isSelected: boolean,
  isDark: boolean
): THREE.CanvasTexture {
  const W = 280;
  const H = 84;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, W, H);

  // Rounded glass badge background
  const radius = 22;
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, radius);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (isSelected) {
    bg.addColorStop(0, '#7C3AED');
    bg.addColorStop(1, '#3B82F6');
  } else if (isDark) {
    bg.addColorStop(0, 'rgba(13, 16, 36, 0.92)');
    bg.addColorStop(1, 'rgba(30, 27, 75, 0.92)');
  } else {
    bg.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    bg.addColorStop(1, 'rgba(238, 242, 255, 0.95)');
  }
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.lineWidth = isSelected ? 4 : 2.5;
  ctx.strokeStyle = isSelected
    ? '#FFFFFF'
    : isDark
    ? 'rgba(167, 139, 250, 0.68)'
    : 'rgba(124, 58, 237, 0.5)';
  ctx.stroke();

  // Accent dot
  ctx.beginPath();
  ctx.arc(28, H / 2, 6, 0, Math.PI * 2);
  ctx.fillStyle = isSelected ? '#FFFFFF' : '#60A5FA';
  ctx.fill();

  // Label
  ctx.fillStyle = isSelected
    ? '#FFFFFF'
    : isDark
    ? '#F8FAFC'
    : '#0F172A';
  ctx.font = '700 23px "Outfit", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  const maxTextW = W - 62;
  let display = label;
  while (ctx.measureText(display).width > maxTextW && display.length > 4) {
    display = display.slice(0, -2) + '…';
  }
  ctx.fillText(display, 44, H / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function TechGlobe3D({ skills, isDark }: TechGlobe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const techNodes = useMemo(() => buildVerifiedTechNodes(skills), [skills]);
  const [selectedNode, setSelectedNode] = useState<TechNodeItem | null>(
    () => techNodes[0] ?? null
  );
  const [autoSpin, setAutoSpin] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;
  const resetSignalRef = useRef(0);

  useEffect(() => {
    if (
      selectedNode &&
      !techNodes.some((n) => n.label === selectedNode.label)
    ) {
      setSelectedNode(techNodes[0] ?? null);
    } else if (!selectedNode && techNodes.length) {
      setSelectedNode(techNodes[0]);
    }
  }, [techNodes, selectedNode]);

  useEffect(() => {
    const profile = detectWebGLProfile();
    if (!profile.supported) {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 420;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !profile.isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const dpr = profile.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.6);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Core wireframe geodesic sphere
    const wireSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 2),
      new THREE.MeshBasicMaterial({
        color: isDark ? 0x7c3aed : 0x6d28d9,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.28 : 0.22,
      })
    );
    globeGroup.add(wireSphere);

    // Inner subtle glowing core sphere
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 24, 24),
      new THREE.MeshBasicMaterial({
        color: isDark ? 0x1e1b4b : 0xc7d2fe,
        transparent: true,
        opacity: isDark ? 0.45 : 0.35,
      })
    );
    globeGroup.add(innerCore);

    // Equatorial halo ring
    const eqRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.018, 8, 80),
      new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.42,
      })
    );
    eqRing.rotation.x = Math.PI * 0.42;
    globeGroup.add(eqRing);

    // Fibonacci sphere placement for verified technology sprites
    const sprites: THREE.Sprite[] = [];
    const spriteTextures: THREE.CanvasTexture[] = [];
    const radius = 2.62;
    const total = Math.max(1, techNodes.length);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    techNodes.forEach((item, idx) => {
      const y = total === 1 ? 0 : 1 - (idx / (total - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * idx;
      const x = Math.cos(theta) * rAtY;
      const z = Math.sin(theta) * rAtY;

      const isSel = selectedNode?.label === item.label;
      const tex = createBadgeTexture(item.label, isSel, isDark);
      spriteTextures.push(tex);

      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x * radius, y * radius, z * radius);
      sprite.scale.set(1.32, 0.4, 1);
      sprite.userData.techIndex = idx;
      globeGroup.add(sprite);
      sprites.push(sprite);
    });

    // Interaction: Drag rotate + Raycast click
    let isDragging = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;
    let dragDist = 0;
    let velX = 0;
    let velY = 0;
    let lastResetSeen = resetSignalRef.current;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const axisX = new THREE.Vector3(1, 0, 0);
    const axisY = new THREE.Vector3(0, 1, 0);
    const dq = new THREE.Quaternion();

    const updateNdc = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragDist = 0;
      downX = e.clientX;
      downY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        dragDist = Math.hypot(e.clientX - downX, e.clientY - downY);
        velY = dx * 0.008;
        velX = dy * 0.008;
        dq.setFromAxisAngle(axisY, velY);
        globeGroup.quaternion.premultiply(dq);
        dq.setFromAxisAngle(axisX, velX);
        globeGroup.quaternion.premultiply(dq);
        lastX = e.clientX;
        lastY = e.clientY;
      } else {
        updateNdc(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(sprites, false);
        canvas.style.cursor = hits.length ? 'pointer' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      if (dragDist < 6) {
        updateNdc(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(sprites, false);
        if (hits.length) {
          const idx = hits[0].object.userData.techIndex as number;
          if (techNodes[idx]) {
            setSelectedNode(techNodes[idx]);
          }
        }
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();
    const identityQuat = new THREE.Quaternion();

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (resetSignalRef.current !== lastResetSeen) {
        lastResetSeen = resetSignalRef.current;
        globeGroup.quaternion.slerp(identityQuat, 1);
        velX = 0;
        velY = 0;
      }

      if (!document.hidden) {
        if (!isDragging) {
          if (Math.abs(velX) > 0.0004 || Math.abs(velY) > 0.0004) {
            dq.setFromAxisAngle(axisY, velY);
            globeGroup.quaternion.premultiply(dq);
            dq.setFromAxisAngle(axisX, velX);
            globeGroup.quaternion.premultiply(dq);
            velX *= 0.93;
            velY *= 0.93;
          } else if (autoSpinRef.current) {
            dq.setFromAxisAngle(axisY, dt * 0.24);
            globeGroup.quaternion.premultiply(dq);
          }
        }
        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      spriteTextures.forEach((t) => t.dispose());
      disposeObject3D(scene);
      renderer.dispose();
    };
  }, [techNodes, isDark, selectedNode?.label]);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/25 to-blue-600/25 border border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              3D Technology Globe
            </h3>
            <p className="font-mono-tech text-[11px] text-slate-500 dark:text-slate-400">
              {techNodes.length} Verified Technologies · Rotate &amp; Click Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {autoSpin ? (
              <>
                <Pause className="w-3.5 h-3.5 text-purple-500" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-blue-500" />
                Spin
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              resetSignalRef.current += 1;
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Globe Stage */}
        <div className="lg:col-span-7">
          {webglSupported ? (
            <div className="h-[340px] sm:h-[400px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-purple-950/10 to-blue-950/15 dark:from-[#080B1A]/65 dark:to-[#0D1024]/75 border border-purple-500/15 relative">
              <div ref={mountRef} className="w-full h-full" />
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-slate-900/75 text-slate-200 text-[11px] font-mono-tech border border-white/10 whitespace-nowrap">
                Drag to orbit globe · Click any technology badge
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-purple-500/20 bg-white/40 dark:bg-white/5 text-sm text-slate-600 dark:text-slate-300">
              3D Globe unavailable on this device — explore all verified technologies using the selector buttons.
            </div>
          )}
        </div>

        {/* Selected Tech Inspector + Clickable Tech Selector */}
        <div className="lg:col-span-5 space-y-4">
          {selectedNode && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/15 to-blue-600/15 border border-purple-400/35 space-y-2">
              <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-purple-600 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selectedNode.category}</span>
              </div>
              <h4 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                {selectedNode.label}
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Explore Technologies ({techNodes.length})
            </span>
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
              {techNodes.map((node) => {
                const active = selectedNode?.label === node.label;
                return (
                  <button
                    key={node.label}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-sm'
                        : 'bg-white/65 dark:bg-white/5 border-purple-500/20 text-slate-700 dark:text-slate-200 hover:border-purple-400/60'
                    }`}
                  >
                    {node.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
