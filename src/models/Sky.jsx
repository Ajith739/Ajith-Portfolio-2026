import { useRef, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import skyScene from "../assets/3d/sky.glb";

// ═══════════════════════════════════════════════════════════
//  STARS – cross/diamond shaped, twinkling (from second block)
// ═══════════════════════════════════════════════════════════
function Stars({ visible }) {
  const starsRef = useRef();
  const starCount = 700;

  const { positions, sizes, starTypes, offsets } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const starTypes = new Float32Array(starCount);
    const offsets = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 220;
      const y = Math.random() * 90 + 10;
      const z = -Math.random() * 120 - 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const r = Math.random();
      if (r > 0.96) {
        sizes[i] = 5 + Math.random() * 3;
        starTypes[i] = 1.0;
      } else if (r > 0.82) {
        sizes[i] = 2 + Math.random() * 2;
        starTypes[i] = Math.random() > 0.5 ? 1.0 : 0.0;
      } else {
        sizes[i] = 0.6 + Math.random() * 1.2;
        starTypes[i] = 0.0;
      }

      offsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, starTypes, offsets };
  }, []);

  const sizeArray = useMemo(() => new Float32Array(sizes), [sizes]);

  useFrame(({ clock }) => {
    if (!starsRef.current || !visible) return;
    const time = clock.getElapsedTime();
    const attr = starsRef.current.geometry.attributes.size;

    for (let i = 0; i < starCount; i++) {
      const pulse = Math.sin(time * (0.8 + (i % 7) * 0.2) + offsets[i]) * 0.5 + 0.5;
      attr.array[i] = sizes[i] * (0.65 + pulse * 0.65);
    }
    attr.needsUpdate = true;
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float size;
        attribute float starType;
        varying float vStarType;
        varying float vSize;

        void main() {
          vStarType = starType;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vStarType;
        varying float vSize;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;

          float alpha = 0.0;
          vec3 color = vec3(1.0);

          if (vStarType > 0.5) {
            float ax = abs(uv.x);
            float ay = abs(uv.y);

            float vertical = smoothstep(0.05, 0.0, ax) * smoothstep(0.5, 0.0, ay);
            float horizontal = smoothstep(0.05, 0.0, ay) * smoothstep(0.5, 0.0, ax);
            float core = smoothstep(0.15, 0.0, dist);
            float glow = smoothstep(0.5, 0.0, dist) * 0.35;

            alpha = clamp(core + vertical * 0.9 + horizontal * 0.9 + glow, 0.0, 1.0);
            color = mix(vec3(0.75, 0.88, 1.0), vec3(1.0), core);
          } else {
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            glow = pow(glow, 2.5);
            alpha = glow;
            color = vec3(0.9, 0.95, 1.0);
          }

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  if (!visible) return null;

  return (
    <points ref={starsRef} material={material} renderOrder={100}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={starCount} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={sizeArray} count={starCount} itemSize={1} />
        <bufferAttribute attach="attributes-starType" array={starTypes} count={starCount} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}

// ═══════════════════════════════════════════════════════════
//  NIGHT SKY DOME – gradient from dark navy to bright blue
// ═══════════════════════════════════════════════════════════
function NightSkyDome({ visible }) {
  const domeRef = useRef();

  const domeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTopColor: { value: new THREE.Color("#050a1a") },
        uMidColor: { value: new THREE.Color("#0a1e5c") },
        uBottomColor: { value: new THREE.Color("#1a5fb4") },
        uHorizonColor: { value: new THREE.Color("#4da6e8") },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uMidColor;
        uniform vec3 uBottomColor;
        uniform vec3 uHorizonColor;
        varying vec3 vWorldPos;
        
        void main() {
          float h = normalize(vWorldPos).y;
          h = clamp(h, 0.0, 1.0);
          
          vec3 color;
          if (h > 0.6) {
            color = mix(uMidColor, uTopColor, smoothstep(0.6, 1.0, h));
          } else if (h > 0.2) {
            color = mix(uBottomColor, uMidColor, smoothstep(0.2, 0.6, h));
          } else {
            color = mix(uHorizonColor, uBottomColor, smoothstep(0.0, 0.2, h));
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  if (!visible) return null;

  return (
    <mesh ref={domeRef} renderOrder={-1}>
      <sphereGeometry args={[150, 32, 32]} />
      <primitive object={domeMaterial} attach="material" />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════
//  CLOUDS – billboard clouds with canvas textures (from third block)
// ═══════════════════════════════════════════════════════════
function makeCloudTexture(seed = 0) {
  const W = 512, H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  let s = seed + 1;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const puffs = [];
  for (let i = 0; i < 6; i++) puffs.push({ x: 50 + i * 82, y: 208 + rnd() * 12, r: 50 + rnd() * 18 });
  for (let i = 0; i < 5; i++) puffs.push({ x: 75 + i * 88, y: 162 + rnd() * 14, r: 58 + rnd() * 22 });
  puffs.push({ x: 110 + rnd() * 25, y: 105 + rnd() * 18, r: 56 + rnd() * 18 });
  puffs.push({ x: 205 + rnd() * 20, y: 88 + rnd() * 16, r: 63 + rnd() * 20 });
  puffs.push({ x: 308 + rnd() * 20, y: 96 + rnd() * 16, r: 60 + rnd() * 18 });
  puffs.push({ x: 400 + rnd() * 18, y: 108 + rnd() * 18, r: 54 + rnd() * 16 });
  puffs.push({ x: 255 + rnd() * 18, y: 65 + rnd() * 14, r: 50 + rnd() * 14 });

  puffs.sort((a, b) => b.r - a.r);
  puffs.forEach(({ x, y, r }, idx) => {
    const bv = Math.min(255, 228 + Math.floor(idx * 2.5));
    const grad = ctx.createRadialGradient(x, y, r * 0.04, x, y, r);
    grad.addColorStop(0.00, `rgba(${bv},${bv},${Math.min(255, bv + 10)}, 0.97)`);
    grad.addColorStop(0.38, `rgba(${bv - 6},${bv - 5},${bv + 2}, 0.82)`);
    grad.addColorStop(0.65, `rgba(${bv - 22},${bv - 18},${bv - 10}, 0.48)`);
    grad.addColorStop(0.85, `rgba(210,218,238, 0.18)`);
    grad.addColorStop(1.00, `rgba(190,210,238, 0.00)`);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
  });

  const fade = ctx.createRadialGradient(W / 2, H * 0.62, W * 0.06, W / 2, H * 0.62, W * 0.54);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.68, "rgba(0,0,0,0)");
  fade.addColorStop(1.0, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  return new THREE.CanvasTexture(canvas);
}

function Cloud({ position, width, height, opacity, seed }) {
  const meshRef = useRef();

  const texture = useMemo(() => makeCloudTexture(seed), [seed]);
  const material = useMemo(() =>
    new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity,
      depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    }), [texture, opacity]
  );

  // Billboard: face camera every frame
  useFrame(({ camera }) => {
    if (meshRef.current) meshRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

function Clouds({ isNightMode }) {
  const op = isNightMode ? 0.84 : 0.95;
  const clouds = [
    // LEFT SIDE — large primary cloud + layered backups to build a massive frame
    { pos: [-45, 18, -25], w: 85, h: 55, o: op, seed: 1 },
    { pos: [-60, 6, -35], w: 75, h: 45, o: op * 0.82, seed: 5 },
    { pos: [-38, 30, -20], w: 70, h: 45, o: op * 0.65, seed: 9 },
    { pos: [-55, 34, -40], w: 70, h: 40, o: op * 0.52, seed: 13 },

    // RIGHT SIDE — mirrored
    { pos: [45, 18, -25], w: 85, h: 55, o: op, seed: 2 },
    { pos: [60, 6, -35], w: 75, h: 45, o: op * 0.82, seed: 6 },
    { pos: [38, 30, -20], w: 70, h: 45, o: op * 0.65, seed: 10 },
    { pos: [55, 34, -40], w: 70, h: 40, o: op * 0.52, seed: 14 },

    // HORIZON — distant, wide, low opacity (keeps the center clear for text/island)
    { pos: [-20, 4, -60], w: 60, h: 25, o: op * 0.38, seed: 3 },
    { pos: [0, 3, -65], w: 70, h: 25, o: op * 0.32, seed: 7 },
    { pos: [20, 4, -60], w: 60, h: 25, o: op * 0.38, seed: 11 },
  ];

  return (
    <>
      {clouds.map((c, i) => (
        <Cloud key={i} position={c.pos} width={c.w} height={c.h} opacity={c.o} seed={c.seed} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MOON – soft glow disc (from third block)
// ═══════════════════════════════════════════════════════════
function Moon({ visible }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,252,218,1.0)");
    g.addColorStop(0.20, "rgba(252,242,195,0.9)");
    g.addColorStop(0.42, "rgba(180,200,255,0.4)");
    g.addColorStop(0.70, "rgba(120,160,255,0.14)");
    g.addColorStop(1.0, "rgba(80,120,240,0.0)");
    ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    return new THREE.CanvasTexture(c);
  }, []);

  if (!visible) return null;
  return (
    <mesh position={[20, 27, -50]} renderOrder={998}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial
        map={tex} transparent depthWrite={false} depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN SKY COMPONENT
// ═══════════════════════════════════════════════════════════
export function Sky({ isNightMode = true }) {
  const sky = useGLTF(skyScene);
  const skyRef = useRef();
  const originalMaterialRef = useRef(null);

  // Tint the GLB sky sphere (clouds texture)
  useEffect(() => {
    sky.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!originalMaterialRef.current) {
          originalMaterialRef.current = child.material.clone();
        }

        if (isNightMode) {
          child.material = originalMaterialRef.current.clone();
          child.material.color.set(new THREE.Color(0.2, 0.25, 0.5));
          child.material.emissive = new THREE.Color(0.02, 0.04, 0.08);
          child.material.emissiveIntensity = 0.5;
          child.material.transparent = true;
          child.material.opacity = 0.85;
          child.material.needsUpdate = true;
        } else {
          // Restore the fully original unmutated material for bright day view
          child.material = originalMaterialRef.current.clone();
          child.material.needsUpdate = true;
        }
      }
    });
  }, [isNightMode, sky.scene]);

  // Animate cloud drift
  useFrame(({ clock }, delta) => {
    if (!skyRef.current) return;
    const elapsed = clock.getElapsedTime();

    skyRef.current.rotation.y += 0.006 * delta;
    skyRef.current.position.y = Math.sin(elapsed * 0.25) * 0.25;

    skyRef.current.rotation.x = Math.sin(elapsed * 0.12) * 0.006;
    skyRef.current.rotation.z = Math.cos(elapsed * 0.18) * 0.004;
  });

  return (
    <group>
      {/* Gradient dome – only in night mode */}
      <NightSkyDome visible={isNightMode} />

      {/* GLB sky model with clouds texture */}
      <mesh ref={skyRef} scale={[1.2, 1.2, 1.2]} position={[0, -2, 0]}>
        <primitive object={sky.scene} />
      </mesh>

      {/* Billboard clouds (always present, opacity changes with night mode) */}
      <Clouds isNightMode={isNightMode} />

      {/* Stars – only at night */}
      <Stars visible={isNightMode} />

      {/* Moon – only at night */}
      <Moon visible={isNightMode} />
    </group>
  );
}