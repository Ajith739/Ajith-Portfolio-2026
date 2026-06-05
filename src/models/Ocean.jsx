import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import MaterialCache from "../engine/MaterialCache";

/* ─── vertex shader (supports variable wave count via #define) ─── */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;

varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vNormal_ws;
varying float vHeight;

#define PI 3.14159265359

vec3 gerstner(vec4 wave, vec3 p, inout vec3 T, inout vec3 B) {
  float S  = wave.z;
  float wl = wave.w;
  float k  = 2.0 * PI / wl;
  float c  = sqrt(9.81 / k);
  vec2  d  = normalize(wave.xy);
  float f  = k * (dot(d, p.xy) - c * uTime);
  float a  = S / k;

  T += vec3(-d.x * d.x * S * sin(f), -d.x * d.y * S * sin(f), d.x * S * cos(f));
  B += vec3(-d.x * d.y * S * sin(f), -d.y * d.y * S * sin(f), d.y * S * cos(f));

  return vec3(d.x * a * cos(f), d.y * a * cos(f), a * sin(f));
}

void main() {
  vUv = uv;
  vec3 T = vec3(1.0, 0.0, 0.0);
  vec3 B = vec3(0.0, 1.0, 0.0);
  vec3 pos = position;

  // Primary waves (always rendered)
  pos += gerstner(vec4( 1.0,  0.5,  0.15, 80.0), position, T, B);
  pos += gerstner(vec4( 0.7,  0.9,  0.12, 45.0), position, T, B);
  pos += gerstner(vec4(-0.3,  1.0,  0.08, 25.0), position, T, B);

  // Detail waves (conditionally compiled)
  #if WAVE_COUNT > 3
  pos += gerstner(vec4( 0.9, -0.4,  0.06, 15.0), position, T, B);
  #endif
  #if WAVE_COUNT > 4
  pos += gerstner(vec4(-0.5,  0.6,  0.04,  9.0), position, T, B);
  #endif
  #if WAVE_COUNT > 5
  pos += gerstner(vec4( 0.4, -0.8,  0.02,  5.0), position, T, B);
  #endif

  pos.z *= uAmplitude;
  vHeight = pos.z;

  vec3 N = normalize(cross(T, B));
  vNormal_ws = normalize((modelMatrix * vec4(N, 0.0)).xyz);

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/* ─── fragment shader — vibrant stylized ocean ─── */
const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3  uShallowColor;
uniform vec3  uDeepColor;
uniform vec3  uMidColor;
uniform vec3  uFoamColor;
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uSkyColor;
uniform vec3  uHorizonColor;
uniform float uTime;
uniform vec3  uCamPos;
uniform float uIsNight;

varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vNormal_ws;
varying float vHeight;

/* simplex 2D noise */
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec2 mod289v2(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec3 perm(vec3 x){ return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865,0.366025403,-0.577350269,0.024390244);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = perm(perm(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 xx = 2.0*fract(p*C.www)-1.0;
  vec3 h = abs(xx)-0.5;
  vec3 ox = floor(xx+0.5);
  vec3 a0 = xx - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x = a0.x*x0.x + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  vec3 N = normalize(vNormal_ws);
  vec3 V = normalize(uCamPos - vWorldPos);
  if(dot(V, N) < 0.0) N = -N;

  /* ── Fresnel ── */
  float cosA = max(dot(V, N), 0.0);
  float fresnel = pow(1.0 - cosA, 3.5);
  fresnel = clamp(fresnel, 0.05, 0.95);

  /* ── Water body color — vibrant blue gradient ── */
  float depthFactor = smoothstep(-2.0, 1.5, vHeight);
  vec3 waterBody = mix(uDeepColor, uMidColor, depthFactor * 0.6);
  waterBody = mix(waterBody, uShallowColor, depthFactor * depthFactor);

  // Subtle color variation
  float colorNoise = snoise(vWorldPos.xz * 0.01 + uTime * 0.03) * 0.08;
  waterBody += vec3(0.0, colorNoise * 0.5, colorNoise);

  /* ── Sky reflection ── */
  vec3 R = reflect(-V, N);
  float skyFactor = smoothstep(-0.1, 0.5, R.y);
  vec3 reflColor = mix(uHorizonColor, uSkyColor, skyFactor);

  /* ── Combine body + reflection ── */
  vec3 col = mix(waterBody, reflColor, fresnel * 0.6);

  /* ── Sub-surface scattering (translucent wave crests) ── */
  vec3 sunDir = normalize(uSunDir);
  float sss = pow(max(dot(V, -sunDir), 0.0), 3.0) * 0.2;
  float crestGlow = smoothstep(0.2, 1.2, vHeight) * 0.15;
  vec3 sssColor = mix(vec3(0.0, 0.4, 0.55), vec3(0.1, 0.6, 0.5), 1.0 - uIsNight);
  col += sssColor * (sss + crestGlow);

  /* ── Foam ── */
  float fn1 = snoise(vWorldPos.xz * 0.06 + uTime * 0.12);
  float fn2 = snoise(vWorldPos.xz * 0.18 + uTime * 0.25);
  float foam = smoothstep(0.4, 1.3, vHeight) * smoothstep(0.15, 0.5, fn1 * 0.6 + fn2 * 0.4);
  foam += smoothstep(0.6, 1.0, snoise(vWorldPos.xz * 0.5 + uTime * 0.6))
        * smoothstep(0.2, 0.8, vHeight) * 0.08;
  foam = clamp(foam, 0.0, 1.0);
  col = mix(col, uFoamColor, foam * 0.5);

  /* ── Sun specular ── */
  vec3 H = normalize(sunDir + V);
  float spec1 = pow(max(dot(N, H), 0.0), 350.0);  // sharp sun disk
  float spec2 = pow(max(dot(N, H), 0.0), 40.0);   // broad glow
  float spec3 = pow(max(dot(N, H), 0.0), 6.0);    // wide shimmer
  col += uSunColor * spec1 * 3.0;
  col += uSunColor * spec2 * 0.2;
  col += uSunColor * spec3 * 0.03;

  /* ── Horizon distance fade ── */
  float dist = length(vWorldPos.xz - uCamPos.xz);
  float horizonFade = smoothstep(60.0, 300.0, dist);
  col = mix(col, mix(uHorizonColor, uDeepColor, 0.3), horizonFade * 0.35);

  float alpha = mix(0.88, 1.0, fresnel);

  gl_FragColor = vec4(col, alpha);
}
`;

// ─── Color palettes: created once, never recreated ───
const DAY_COLORS = {
  shallow:  new THREE.Color("#1e90ff"),
  mid:      new THREE.Color("#0077cc"),
  deep:     new THREE.Color("#003d6b"),
  foam:     new THREE.Color("#e8f4ff"),
  sun:      new THREE.Color("#fffbe6"),
  sky:      new THREE.Color("#4db8ff"),
  horizon:  new THREE.Color("#7dd3fc"),
};

const NIGHT_COLORS = {
  shallow:  new THREE.Color("#0a5ca8"),
  mid:      new THREE.Color("#054080"),
  deep:     new THREE.Color("#001833"),
  foam:     new THREE.Color("#6699bb"),
  sun:      new THREE.Color("#556688"),
  sky:      new THREE.Color("#0a1e5c"),
  horizon:  new THREE.Color("#0f3060"),
};

/* ═══════════════════════════════════════════ */
/*               <Ocean /> component           */
/* ═══════════════════════════════════════════ */
const Ocean = ({ isNightMode = false, waterLevel = -10, segments: segmentsProp }) => {
  const meshRef = useRef();
  const { camera } = useThree();

  // Use prop-based segments from performance engine, fallback to auto-detect
  const segments = useMemo(() => {
    if (segmentsProp) return segmentsProp;
    if (typeof window === "undefined") return 128;
    const w = window.innerWidth;
    if (w < 768) return 48;
    if (w < 1280) return 80;
    return 128;
  }, [segmentsProp]);

  // Determine wave count based on segments (proxy for quality)
  const waveCount = useMemo(() => {
    if (segments <= 48) return 3;
    if (segments <= 80) return 4;
    return 6;
  }, [segments]);

  // Create the material ONCE — never recreate on theme toggle.
  // Instead, update uniform values when isNightMode changes.
  const material = useMemo(() => {
    const cacheKey = `ocean-material-w${waveCount}`;
    const cache = MaterialCache.getInstance();

    return cache.getOrCreate(cacheKey, () => {
      // Inject wave count as preprocessor define
      const defines = `#define WAVE_COUNT ${waveCount}\n`;

      return new THREE.ShaderMaterial({
        uniforms: {
          uTime:         { value: 0 },
          uAmplitude:    { value: 1.0 },
          uShallowColor: { value: DAY_COLORS.shallow.clone() },
          uMidColor:     { value: DAY_COLORS.mid.clone() },
          uDeepColor:    { value: DAY_COLORS.deep.clone() },
          uFoamColor:    { value: DAY_COLORS.foam.clone() },
          uSunDir:       { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
          uSunColor:     { value: DAY_COLORS.sun.clone() },
          uCamPos:       { value: new THREE.Vector3() },
          uSkyColor:     { value: DAY_COLORS.sky.clone() },
          uHorizonColor: { value: DAY_COLORS.horizon.clone() },
          uIsNight:      { value: 0.0 },
        },
        vertexShader: defines + vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    });
  }, [waveCount]);

  // When night mode changes, lerp uniforms — NO material recreation
  useEffect(() => {
    if (!material.uniforms) return;
    const u = material.uniforms;
    const palette = isNightMode ? NIGHT_COLORS : DAY_COLORS;

    u.uShallowColor.value.copy(palette.shallow);
    u.uMidColor.value.copy(palette.mid);
    u.uDeepColor.value.copy(palette.deep);
    u.uFoamColor.value.copy(palette.foam);
    u.uSunColor.value.copy(palette.sun);
    u.uSkyColor.value.copy(palette.sky);
    u.uHorizonColor.value.copy(palette.horizon);
    u.uIsNight.value = isNightMode ? 1.0 : 0.0;
  }, [isNightMode, material]);

  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.visible) return;
    const mat = meshRef.current.material;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uCamPos.value.copy(camera.position);
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, waterLevel, -2]}
      material={material}
      frustumCulled={false}
      renderOrder={999}
    >
      <planeGeometry args={[400, 300, segments, segments]} />
    </mesh>
  );
};

export default Ocean;