import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createSoftParticleTexture,
  detectWebGLProfile,
  disposeObject3D,
} from '@/src/components/three/webglUtils';

interface DigitalUniverseCanvasProps {
  enabled: boolean;
  isDark: boolean;
}

export function DigitalUniverseCanvas({
  enabled,
  isDark,
}: DigitalUniverseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const profile = detectWebGLProfile();
    if (!profile.supported) {
      setWebglAvailable(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !profile.isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const dpr = profile.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x080b1a : 0xeef2ff, 0.016);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    camera.position.set(0, 0, 18);

    const ambient = new THREE.AmbientLight(0x8b5cf6, isDark ? 0.9 : 1.1);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    keyLight.position.set(10, 12, 14);
    scene.add(keyLight);

    const purpleRim = new THREE.DirectionalLight(0x7c3aed, 2.0);
    purpleRim.position.set(-12, -6, -8);
    scene.add(purpleRim);

    // 1. Multi-depth Purple/Blue Digital Particle Field
    const particleCount = profile.isSoftwareGl ? 140 : 320;
    const pPos = new Float32Array(particleCount * 3);
    const pCol = new Float32Array(particleCount * 3);
    const cPurple = new THREE.Color(isDark ? 0xa78bfa : 0x7c3aed);
    const cBlue = new THREE.Color(isDark ? 0x60a5fa : 0x2563eb);
    const cWhite = new THREE.Color(isDark ? 0xe0e7ff : 0x4f46e5);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 46;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 2] = -30 + Math.random() * 34;

      const r = Math.random();
      const mix =
        r < 0.45
          ? cPurple
          : r < 0.85
          ? cBlue
          : cWhite;
      pCol[i * 3] = mix.r;
      pCol[i * 3 + 1] = mix.g;
      pCol[i * 3 + 2] = mix.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const particleTex = createSoftParticleTexture(
      'rgba(255,255,255,0.95)',
      'rgba(167,139,250,0.45)',
      'rgba(59,130,246,0)'
    );
    const particleMat = new THREE.PointsMaterial({
      size: isDark ? 0.28 : 0.22,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.68 : 0.42,
      map: particleTex,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. Floating Futuristic 3D Geometric Shapes
    const geoRig = new THREE.Group();
    scene.add(geoRig);

    const wirePurple = new THREE.MeshBasicMaterial({
      color: isDark ? 0x8b5cf6 : 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.2 : 0.14,
    });
    const wireBlue = new THREE.MeshBasicMaterial({
      color: isDark ? 0x60a5fa : 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.15,
    });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x4c1d95 : 0x8b5cf6,
      roughness: 0.22,
      metalness: 0.72,
      transparent: true,
      opacity: isDark ? 0.45 : 0.28,
    });

    // Left-upper holographic icosahedron
    const icoGroup = new THREE.Group();
    icoGroup.position.set(-10.5, 4.2, -9);
    const icoOuter = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      wirePurple
    );
    const icoInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 0),
      crystalMat
    );
    icoGroup.add(icoOuter, icoInner);
    geoRig.add(icoGroup);

    // Right-lower torus orbital core
    const torusGroup = new THREE.Group();
    torusGroup.position.set(11.2, -3.6, -11);
    const torus = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.75, 0.36, 72, 12),
      wireBlue
    );
    torusGroup.add(torus);
    geoRig.add(torusGroup);

    // Ambient orbital rings around deep universe center
    const ringGeo1 = new THREE.TorusGeometry(9.5, 0.025, 8, 96);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isDark ? 0x7c3aed : 0x8b5cf6,
      transparent: true,
      opacity: isDark ? 0.22 : 0.14,
    });
    const orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitRing1.position.set(0, 0, -14);
    orbitRing1.rotation.set(Math.PI * 0.36, 0.25, 0);
    geoRig.add(orbitRing1);

    const ringGeo2 = new THREE.TorusGeometry(13.2, 0.025, 8, 96);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isDark ? 0x3b82f6 : 0x2563eb,
      transparent: true,
      opacity: isDark ? 0.18 : 0.12,
    });
    const orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitRing2.position.set(0, 0, -16);
    orbitRing2.rotation.set(-Math.PI * 0.28, -0.35, 0);
    geoRig.add(orbitRing2);

    // Floating octahedron data nodes
    const octaNodes: { mesh: THREE.Mesh; basePos: [number, number, number]; phase: number }[] = [];
    const nodeCoords: [number, number, number][] = [
      [-6.5, -5.2, -6],
      [7.8, 5.4, -8],
      [0.5, 6.2, -13],
      [-13.5, -1.5, -14],
    ];
    nodeCoords.forEach(([nx, ny, nz], idx) => {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65 + (idx % 2) * 0.25, 0),
        idx % 2 === 0 ? wireBlue : wirePurple
      );
      m.position.set(nx, ny, nz);
      geoRig.add(m);
      octaNodes.push({ mesh: m, basePos: [nx, ny, nz], phase: idx * 1.4 });
    });

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let elapsed = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let disposed = false;
    let contextLost = false;

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (document.hidden || contextLost) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      elapsed += dt;

      // Smooth pointer parallax on camera
      const targetCamX = pointerX * 0.9;
      const targetCamY = -pointerY * 0.6;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, dt * 2.5);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, dt * 2.5);
      camera.lookAt(0, 0, -6);

      particles.rotation.y = elapsed * 0.018;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.04;

      icoOuter.rotation.x = elapsed * 0.14;
      icoOuter.rotation.y = elapsed * 0.2;
      icoInner.rotation.y = -elapsed * 0.32;
      icoGroup.position.y = 4.2 + Math.sin(elapsed * 0.7) * 0.45;

      torus.rotation.x = elapsed * 0.12;
      torus.rotation.y = elapsed * 0.18;
      torusGroup.position.y = -3.6 + Math.cos(elapsed * 0.65) * 0.4;

      orbitRing1.rotation.z = elapsed * 0.08;
      orbitRing2.rotation.z = -elapsed * 0.06;

      octaNodes.forEach((node) => {
        node.mesh.rotation.x = elapsed * 0.4 + node.phase;
        node.mesh.rotation.y = elapsed * 0.55 + node.phase;
        node.mesh.position.y =
          node.basePos[1] + Math.sin(elapsed * 0.9 + node.phase) * 0.45;
      });

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (disposed) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
      lastTime = performance.now();
    };

    window.addEventListener('resize', onResize);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      disposeObject3D(scene);
      renderer.dispose();
    };
  }, [enabled, reducedMotion, isDark]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Atmospheric Purple-Blue Gradient Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 18% 15%, rgba(124, 58, 237, 0.24), transparent 65%), radial-gradient(ellipse 75% 55% at 85% 75%, rgba(59, 130, 246, 0.22), transparent 65%), #080B1A'
            : 'radial-gradient(ellipse 80% 60% at 18% 15%, rgba(124, 58, 237, 0.14), transparent 65%), radial-gradient(ellipse 75% 55% at 85% 75%, rgba(59, 130, 246, 0.15), transparent 65%), #F5F3FF',
        }}
      />

      {/* Subtle architectural perspective grid */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(167, 139, 250, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(96, 165, 250, 0.45) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 85% 80% at 50% 45%, black 35%, transparent 100%)',
        }}
      />

      {/* Active Three.js Digital Universe Canvas */}
      {enabled && !reducedMotion && webglAvailable && (
        <div ref={containerRef} className="absolute inset-0" />
      )}
    </div>
  );
}
