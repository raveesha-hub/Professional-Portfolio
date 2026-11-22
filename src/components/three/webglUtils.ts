import * as THREE from 'three';

export interface WebGLProfile {
  supported: boolean;
  isSoftwareGl: boolean;
}

let cachedProfile: WebGLProfile | null = null;

export function detectWebGLProfile(): WebGLProfile {
  if (cachedProfile) return cachedProfile;
  if (typeof window === 'undefined') {
    return { supported: false, isSoftwareGl: false };
  }

  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      (testCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (testCanvas.getContext('webgl') as WebGLRenderingContext | null);

    if (!gl) {
      cachedProfile = { supported: false, isSoftwareGl: false };
      return cachedProfile;
    }

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rawRenderer = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl =
      /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rawRenderer);

    gl.getExtension('WEBGL_lose_context')?.loseContext();

    if (isSoftwareGl) {
      document.documentElement.classList.add('sw-gl');
    }

    cachedProfile = { supported: true, isSoftwareGl };
    return cachedProfile;
  } catch {
    cachedProfile = { supported: false, isSoftwareGl: false };
    return cachedProfile;
  }
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => disposeMaterial(m));
    } else if (mat) {
      disposeMaterial(mat);
    }
  });
}

function disposeMaterial(material: THREE.Material): void {
  const rec = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    const val = rec[key];
    if (val instanceof THREE.Texture) {
      val.dispose();
    }
  }
  material.dispose();
}

export function createSoftParticleTexture(
  innerColor = 'rgba(255,255,255,1)',
  midColor = 'rgba(167,139,250,0.65)',
  outerColor = 'rgba(59,130,246,0)'
): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    2,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
