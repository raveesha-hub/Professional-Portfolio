import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  detectWebGLProfile,
  disposeObject3D,
} from '@/src/components/three/webglUtils';
import type { ProjectItem } from '@/src/types/portfolio';

interface ProjectsCube3DProps {
  projects: ProjectItem[];
  isDark: boolean;
  onSelectProject: (project: ProjectItem) => void;
}

// BoxGeometry material slot order: [+X (Right), -X (Left), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back)]
const FACE_NAMES = ['Front', 'Right', 'Back', 'Left', 'Top', 'Bottom'];
// Map logical slot 0..5 -> BoxGeometry material index [4, 0, 5, 1, 2, 3]
const SLOT_TO_MAT_INDEX = [4, 0, 5, 1, 2, 3];
const MAT_INDEX_TO_SLOT = [1, 3, 4, 5, 0, 2];

// Target Euler orientation so the selected BoxGeometry face points squarely at +Z camera
const SLOT_TARGET_EULER: [number, number, number][] = [
  [0, 0, 0], // 0: Front (+Z)
  [0, -Math.PI / 2, 0], // 1: Right (+X)
  [0, Math.PI, 0], // 2: Back (-Z)
  [0, Math.PI / 2, 0], // 3: Left (-X)
  [Math.PI / 2, 0, 0], // 4: Top (+Y)
  [-Math.PI / 2, 0, 0], // 5: Bottom (-Y)
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      lineCount++;
      if (lineCount >= maxLines) return y + lineCount * lineHeight;
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
    lineCount++;
  }
  return y + lineCount * lineHeight;
}

function renderFaceCanvas(
  canvas: HTMLCanvasElement,
  project: ProjectItem | null,
  slotNumber: number,
  isDark: boolean,
  loadedImg?: HTMLImageElement
) {
  const W = 768;
  const H = 768;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (isDark) {
    bg.addColorStop(0, '#0D1024');
    bg.addColorStop(0.55, '#15193B');
    bg.addColorStop(1, '#1A1140');
  } else {
    bg.addColorStop(0, '#FFFFFF');
    bg.addColorStop(0.55, '#EEF2FF');
    bg.addColorStop(1, '#E9D5FF');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle decorative tech grid
  ctx.strokeStyle = isDark
    ? 'rgba(167, 139, 250, 0.12)'
    : 'rgba(124, 58, 237, 0.1)';
  ctx.lineWidth = 1.5;
  for (let gx = 48; gx < W; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
  for (let gy = 48; gy < H; gy += 64) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  // Border frame
  const borderGrad = ctx.createLinearGradient(0, 0, W, H);
  borderGrad.addColorStop(0, '#7C3AED');
  borderGrad.addColorStop(1, '#3B82F6');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  if (!project) {
    ctx.fillStyle = isDark ? '#A78BFA' : '#7C3AED';
    ctx.font = '600 28px "JetBrains Mono", monospace';
    ctx.fillText(`FACE 0${slotNumber + 1}`, 56, 86);

    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.72)';
    ctx.font = '700 44px "Outfit", sans-serif';
    ctx.fillText('Next Project Slot', 56, 360);

    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.font = '400 26px "Plus Jakarta Sans", sans-serif';
    wrapText(
      ctx,
      'Add more projects in the Admin Dashboard to populate this 3D face.',
      56,
      415,
      W - 112,
      36,
      3
    );
    return;
  }

  // Top Media Thumbnail area
  const mediaX = 48;
  const mediaY = 48;
  const mediaW = W - 96;
  const mediaH = 265;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(mediaX, mediaY, mediaW, mediaH, 20);
  ctx.clip();

  if (loadedImg && loadedImg.naturalWidth > 0) {
    const imgRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
    const boxRatio = mediaW / mediaH;
    let drawW = mediaW;
    let drawH = mediaH;
    let drawX = mediaX;
    let drawY = mediaY;
    if (imgRatio > boxRatio) {
      drawW = mediaH * imgRatio;
      drawX = mediaX - (drawW - mediaW) / 2;
    } else {
      drawH = mediaW / imgRatio;
      drawY = mediaY - (drawH - mediaH) / 2;
    }
    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
    const sc = ctx.createLinearGradient(0, mediaY, 0, mediaY + mediaH);
    sc.addColorStop(0, 'rgba(8,11,26,0.12)');
    sc.addColorStop(1, 'rgba(8,11,26,0.72)');
    ctx.fillStyle = sc;
    ctx.fillRect(mediaX, mediaY, mediaW, mediaH);
  } else {
    const artGrad = ctx.createLinearGradient(
      mediaX,
      mediaY,
      mediaX + mediaW,
      mediaY + mediaH
    );
    artGrad.addColorStop(0, 'rgba(124, 58, 237, 0.42)');
    artGrad.addColorStop(0.55, 'rgba(59, 130, 246, 0.34)');
    artGrad.addColorStop(1, 'rgba(8, 11, 26, 0.85)');
    ctx.fillStyle = artGrad;
    ctx.fillRect(mediaX, mediaY, mediaW, mediaH);

    // Subtle geometric hardware/code motif inside thumbnail
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(mediaX + mediaW - 95, mediaY + 95, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mediaX + mediaW - 95, mediaY + 95, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText('PROJECT R // 3D MODULE', mediaX + 26, mediaY + mediaH - 28);
  }
  ctx.restore();

  // Index label
  ctx.fillStyle = isDark ? '#A78BFA' : '#7C3AED';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillText(`0${slotNumber + 1} / ${FACE_NAMES[slotNumber].toUpperCase()}`, 52, 366);

  // Title
  ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
  ctx.font = '700 40px "Outfit", sans-serif';
  const afterTitleY = wrapText(ctx, project.t, 52, 420, W - 104, 48, 2);

  // Short Description
  ctx.fillStyle = isDark ? '#CBD5E1' : '#334155';
  ctx.font = '400 25px "Plus Jakarta Sans", sans-serif';
  wrapText(
    ctx,
    project.d || 'Interactive engineering build.',
    52,
    afterTitleY + 14,
    W - 104,
    34,
    3
  );

  // Tech stack metadata text (typographic separator, no pill clutter)
  const techList = (project.tech && project.tech.length
    ? project.tech
    : ['Engineering', 'Software']
  )
    .slice(0, 4)
    .join('  ·  ');

  ctx.fillStyle = isDark ? '#60A5FA' : '#2563EB';
  ctx.font = '600 21px "JetBrains Mono", monospace';
  wrapText(ctx, techList, 52, H - 118, W - 104, 28, 1);

  // Bottom CTA bar
  ctx.fillStyle = borderGrad;
  ctx.fillRect(52, H - 86, W - 104, 2);

  ctx.fillStyle = isDark ? '#FFFFFF' : '#1E1B4B';
  ctx.font = '600 24px "Outfit", sans-serif';
  ctx.fillText('Click Face to Inspect Project  →', 52, H - 44);
}

export function ProjectsCube3D({
  projects,
  isDark,
  onSelectProject,
}: ProjectsCube3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const totalSets = Math.max(1, Math.ceil(projects.length / 6));
  const safeSetIndex = Math.min(setIndex, totalSets - 1);

  const currentSetProjects = useMemo(() => {
    const start = safeSetIndex * 6;
    const slice = projects.slice(start, start + 6);
    const slots: (ProjectItem | null)[] = Array.from({ length: 6 }, (_, i) =>
      slice[i] ?? null
    );
    return slots;
  }, [projects, safeSetIndex]);

  const targetQuatRef = useRef<THREE.Quaternion | null>(null);
  const pendingSelectRef = useRef<ProjectItem | null>(null);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const onSelectRef = useRef(onSelectProject);
  onSelectRef.current = onSelectProject;

  const focusSlot = (slotIdx: number, openAfterFocus = false) => {
    setActiveSlot(slotIdx);
    const [ex, ey, ez] = SLOT_TARGET_EULER[slotIdx];
    targetQuatRef.current = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(ex, ey, ez, 'XYZ')
    );
    if (openAfterFocus) {
      pendingSelectRef.current = currentSetProjects[slotIdx];
    } else {
      pendingSelectRef.current = null;
    }
  };

  useEffect(() => {
    setSetIndex((prev) => Math.min(prev, Math.max(0, totalSets - 1)));
  }, [totalSets]);

  useEffect(() => {
    const profile = detectWebGLProfile();
    if (!profile.supported) {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
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
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 6.2);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const purpleFill = new THREE.PointLight(0x7c3aed, 6, 16);
    purpleFill.position.set(-4, -2, 4);
    scene.add(purpleFill);

    const blueRim = new THREE.PointLight(0x3b82f6, 6, 16);
    blueRim.position.set(4, 3, -3);
    scene.add(blueRim);

    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.set(0.22, -0.35, 0);
    scene.add(cubeGroup);

    const faceCanvases: HTMLCanvasElement[] = [];
    const faceTextures: THREE.CanvasTexture[] = [];
    const faceMaterials: THREE.MeshStandardMaterial[] = Array.from(
      { length: 6 },
      () =>
        new THREE.MeshStandardMaterial({
          roughness: 0.28,
          metalness: 0.18,
        })
    );

    SLOT_TO_MAT_INDEX.forEach((matIdx, slotIdx) => {
      const c = document.createElement('canvas');
      const project = currentSetProjects[slotIdx];
      renderFaceCanvas(c, project, slotIdx, isDark);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = profile.isSoftwareGl ? 1 : 4;
      faceCanvases[slotIdx] = c;
      faceTextures[slotIdx] = tex;
      faceMaterials[matIdx].map = tex;
      faceMaterials[matIdx].needsUpdate = true;

      // Load optional project thumbnail image asynchronously
      const firstPic = project?.pics?.[0];
      if (project && firstPic) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (disposed) return;
          renderFaceCanvas(c, project, slotIdx, isDark, img);
          tex.needsUpdate = true;
        };
        img.src = firstPic;
      }
    });

    const cubeGeo = new THREE.BoxGeometry(2.85, 2.85, 2.85);
    const cubeMesh = new THREE.Mesh(cubeGeo, faceMaterials);
    cubeGroup.add(cubeMesh);

    // Futuristic glowing wireframe edge accent
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.9, 2.9, 2.9));
    const edgeLines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: isDark ? 0xa78bfa : 0x7c3aed,
        transparent: true,
        opacity: 0.68,
      })
    );
    cubeGroup.add(edgeLines);

    // Drag, Inertia, Hover & Raycast click interaction
    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastX = 0;
    let lastY = 0;
    let dragDistance = 0;
    let velX = 0;
    let velY = 0;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const rotAxisX = new THREE.Vector3(1, 0, 0);
    const rotAxisY = new THREE.Vector3(0, 1, 0);
    const deltaQuat = new THREE.Quaternion();

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickSlot = (): number | null => {
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(cubeMesh, false);
      if (!hits.length || !hits[0].face) return null;
      const matIdx = hits[0].face.materialIndex;
      return MAT_INDEX_TO_SLOT[matIdx] ?? null;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      targetQuatRef.current = null;
      pendingSelectRef.current = null;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        dragDistance = Math.hypot(
          e.clientX - pointerDownX,
          e.clientY - pointerDownY
        );
        velY = dx * 0.0085;
        velX = dy * 0.0085;

        deltaQuat.setFromAxisAngle(rotAxisY, velY);
        cubeGroup.quaternion.premultiply(deltaQuat);
        deltaQuat.setFromAxisAngle(rotAxisX, velX);
        cubeGroup.quaternion.premultiply(deltaQuat);

        lastX = e.clientX;
        lastY = e.clientY;
      } else {
        updateNdc(e.clientX, e.clientY);
        const slot = pickSlot();
        setHoveredSlot(slot);
        canvas.style.cursor = slot !== null ? 'pointer' : 'grab';
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

      if (dragDistance < 6) {
        updateNdc(e.clientX, e.clientY);
        const slot = pickSlot();
        if (slot !== null) {
          const proj = currentSetProjects[slot];
          if (proj) {
            focusSlot(slot, true);
          } else {
            focusSlot(slot, false);
          }
        }
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', () => {
      setHoveredSlot(null);
      canvas.style.cursor = 'grab';
    });

    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!document.hidden) {
        if (targetQuatRef.current) {
          cubeGroup.quaternion.slerp(targetQuatRef.current, Math.min(1, dt * 8.5));
          if (cubeGroup.quaternion.angleTo(targetQuatRef.current) < 0.03) {
            cubeGroup.quaternion.copy(targetQuatRef.current);
            targetQuatRef.current = null;
            if (pendingSelectRef.current) {
              const p = pendingSelectRef.current;
              pendingSelectRef.current = null;
              onSelectRef.current(p);
            }
          }
        } else if (!isDragging) {
          if (Math.abs(velX) > 0.0004 || Math.abs(velY) > 0.0004) {
            deltaQuat.setFromAxisAngle(rotAxisY, velY);
            cubeGroup.quaternion.premultiply(deltaQuat);
            deltaQuat.setFromAxisAngle(rotAxisX, velX);
            cubeGroup.quaternion.premultiply(deltaQuat);
            velX *= 0.93;
            velY *= 0.93;
          } else if (autoRotateRef.current) {
            deltaQuat.setFromAxisAngle(rotAxisY, dt * 0.28);
            cubeGroup.quaternion.premultiply(deltaQuat);
            deltaQuat.setFromAxisAngle(rotAxisX, Math.sin(now * 0.0005) * dt * 0.08);
            cubeGroup.quaternion.premultiply(deltaQuat);
          }
        }

        // Subtle float
        cubeGroup.position.y = Math.sin(now * 0.0018) * 0.08;
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
      faceTextures.forEach((t) => t.dispose());
      envTarget.dispose();
      disposeObject3D(scene);
      renderer.dispose();
    };
  }, [currentSetProjects, isDark]);

  return (
    <div className="space-y-6">
      {/* Main 3D Stage */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono-tech text-xs uppercase tracking-widest text-purple-600 dark:text-purple-300">
              Interactive 3D Cube
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono-tech text-xs text-slate-600 dark:text-slate-300">
              {projects.length === 0
                ? '0 Projects'
                : `Showing ${safeSetIndex * 6 + 1}–${Math.min(
                    (safeSetIndex + 1) * 6,
                    projects.length
                  )} of ${projects.length}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => focusSlot((activeSlot + 5) % 6)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 transition cursor-pointer inline-flex items-center gap-1"
              aria-label="Previous cube face"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev Face
            </button>
            <button
              type="button"
              onClick={() => focusSlot((activeSlot + 1) % 6)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 transition cursor-pointer inline-flex items-center gap-1"
              aria-label="Next cube face"
            >
              Next Face
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              {autoRotate ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-purple-500 dark:text-purple-300" />
                  Pause Spin
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300" />
                  Auto Spin
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => focusSlot(0)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400/50 transition cursor-pointer inline-flex items-center gap-1"
              aria-label="Reset cube rotation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas or Accessible Fallback */}
        {webglSupported ? (
          <div className="relative h-[380px] sm:h-[460px] lg:h-[500px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-purple-950/15 to-blue-950/20 dark:from-[#080B1A]/60 dark:to-[#0D1024]/70 border border-purple-500/15">
            <div ref={mountRef} className="w-full h-full" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-xl bg-slate-900/75 text-slate-200 text-[11px] font-mono-tech tracking-wide border border-white/10">
              {hoveredSlot !== null && currentSetProjects[hoveredSlot]
                ? `Click to inspect "${currentSetProjects[hoveredSlot]?.t}"`
                : 'Drag or touch to rotate 3D cube · Click any face to view details'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {currentSetProjects.map((proj, idx) =>
              proj ? (
                <button
                  key={proj.id || idx}
                  type="button"
                  onClick={() => onSelectProject(proj)}
                  className="text-left p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/20 hover:border-purple-400 transition cursor-pointer"
                >
                  <div className="font-mono-tech text-xs text-purple-500 mb-1">
                    0{idx + 1}
                  </div>
                  <h4 className="font-display font-bold text-lg mb-2">{proj.t}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {proj.d}
                  </p>
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Set Pagination Bar + Face Selector Strip */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {currentSetProjects.map((proj, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => focusSlot(idx, false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  activeSlot === idx
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md'
                    : 'bg-white/60 dark:bg-white/5 border-purple-500/20 text-slate-700 dark:text-slate-300 hover:border-purple-400/50'
                }`}
              >
                <span className="font-mono-tech mr-1.5">0{idx + 1}</span>
                {proj ? (
                  <span className="max-w-[110px] inline-block truncate align-bottom">
                    {proj.t}
                  </span>
                ) : (
                  <span className="opacity-60">{FACE_NAMES[idx]}</span>
                )}
              </button>
            ))}
          </div>

          {totalSets > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeSetIndex === 0}
                onClick={() => {
                  setSetIndex((s) => Math.max(0, s - 1));
                  focusSlot(0, false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/10 border border-purple-500/25 disabled:opacity-40 cursor-pointer"
              >
                ← Prev Set
              </button>
              <span className="font-mono-tech text-xs text-slate-600 dark:text-slate-300 px-1">
                Set {safeSetIndex + 1}/{totalSets}
              </span>
              <button
                type="button"
                disabled={safeSetIndex >= totalSets - 1}
                onClick={() => {
                  setSetIndex((s) => Math.min(totalSets - 1, s + 1));
                  focusSlot(0, false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/10 border border-purple-500/25 disabled:opacity-40 cursor-pointer"
              >
                Next Set →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
