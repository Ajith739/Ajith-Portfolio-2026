import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── vertex shader ─── */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;

varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vNormal_ws;
varying float vHeight;
varying vec4  vScreen;

#define PI 3.14159265359

// Gerstner wave: physically-correct orbital motion
// wave = vec4(dirX, dirY, steepness, wavelength)
vec3 gerstner(vec4 wave, vec3 p, inout vec3 T, inout vec3 B) {
  float S  = wave.z;
  float wl = wave.w;
  float k  = 2.0 * PI / wl;
  float c  = sqrt(9.81 / k);          // phase speed (deep water)
  vec2  d  = normalize(wave.xy);
  float f  = k * (dot(d, p.xy) - c * uTime);
  float a  = S / k;                    // amplitude

  // accumulate tangent & binormal derivatives
  T += vec3(
    -d.x * d.x * S * sin(f),
    -d.x * d.y * S * sin(f),
     d.x * S * cos(f)
  );
  B += vec3(
    -d.x * d.y * S * sin(f),
    -d.y * d.y * S * sin(f),
     d.y * S * cos(f)
  );

  return vec3(d.x * a * cos(f),
              d.y * a * cos(f),
              a * sin(f));
}

void main() {
  vUv = uv;

  vec3 T = vec3(1.0, 0.0, 0.0);   // tangent  (∂p/∂x)
  vec3 B = vec3(0.0, 1.0, 0.0);   // binormal (∂p/∂y)
  vec3 pos = position;

  // 6 Gerstner wave layers — large swell → micro-chop
  pos += gerstner(vec4( 1.0,  0.5,  0.15, 80.0), position, T, B);
  pos += gerstner(vec4( 0.7,  0.9,  0.12, 45.0), position, T, B);
  pos += gerstner(vec4(-0.3,  1.0,  0.08, 25.0), position, T, B);
  pos += gerstner(vec4( 0.9, -0.4,  0.06, 15.0), position, T, B);
  pos += gerstner(vec4(-0.5,  0.6,  0.04,  9.0), position, T, B);
  pos += gerstner(vec4( 0.4, -0.8,  0.02,  5.0), position, T, B);

  pos.z *= uAmplitude;
  vHeight = pos.z;

  // analytic normal
  vec3 N = normalize(cross(T, B));
  vNormal_ws = normalize((modelMatrix * vec4(N, 0.0)).xyz);

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;

  vec4 clip = projectionMatrix * viewMatrix * wp;
  vScreen    = clip;
  gl_Position = clip;
}
`;

/* ─── fragment shader ─── */
const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uRefraction;
uniform vec3  uWaterColor;
uniform vec3  uDeepColor;
uniform vec3  uFoamColor;
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform float uTime;
uniform vec3  uCamPos;
uniform float uUnderwaterMix;   // 0 = above, 1 = fully submerged

varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vNormal_ws;
varying float vHeight;
varying vec4  vScreen;

/* ─── simplex 2-D noise ─── */
vec3 mod289_3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec2 mod289_2(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec3 perm(vec3 x){ return mod289_3(((x*34.0)+1.0)*x); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865,0.366025403,-0.577350269,0.024390244);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  vec3 p = perm(perm(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 xx = 2.0*fract(p*C.www)-1.0;
  vec3 h  = abs(xx)-0.5;
  vec3 ox = floor(xx+0.5);
  vec3 a0 = xx - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x *x0.x  + h.x *x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m,g);
}

/* ─── worley-like cell noise for caustics ─── */
float worley(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 1.0;
  for(int y=-1;y<=1;y++)
  for(int x=-1;x<=1;x++){
    vec2 n = vec2(float(x),float(y));
    vec2 r = n + fract(sin(dot(i+n, vec2(127.1,311.7)))*43758.5453) - f;
    d = min(d, dot(r,r));
  }
  return sqrt(d);
}

void main(){
  /* screen UV */
  vec2 sUV = vScreen.xy / vScreen.w * 0.5 + 0.5;

  vec3 N = normalize(vNormal_ws);
  vec3 V = normalize(uCamPos - vWorldPos);

  // flip normal when looking from below
  if(dot(V, N) < 0.0) N = -N;

  /* ── refraction ── */
  float d1 = snoise(vWorldPos.xz * 0.015 + uTime * 0.2) * 0.02;
  float d2 = snoise(vWorldPos.xz * 0.04  + uTime * 0.35)* 0.01;
  vec2 rUV = clamp(sUV + vec2(d1, d2), 0.005, 0.995);
  vec3 refr = texture2D(uRefraction, rUV).rgb;

  /* ── fresnel ── */
  float cosA = max(dot(V, N), 0.0);
  float F    = pow(1.0 - cosA, 4.0);
  F = clamp(F, 0.04, 0.96);

  /* ── depth colour ── */
  float dm   = smoothstep(-1.5, 2.0, vHeight);
  vec3  wCol = mix(uDeepColor, uWaterColor, dm);

  /* ── sky reflection ── */
  vec3 R      = reflect(-V, N);
  float sky   = smoothstep(-0.1, 0.4, R.y);
  vec3 reflCol = mix(vec3(0.08,0.22,0.55), vec3(0.5,0.72,1.0), sky);

  /* ── combine ── */
  vec3 col = mix(refr * wCol * 1.4, reflCol, F);

  /* ── sub-surface scattering ── */
  float sss = pow(max(dot(V, -normalize(uSunDir)), 0.0), 3.0) * 0.25;
  col += vec3(0.0, 0.25, 0.15) * sss;

  /* ── foam ── */
  float fn1  = snoise(vWorldPos.xz * 0.06 + uTime * 0.15);
  float fn2  = snoise(vWorldPos.xz * 0.15 + uTime * 0.3);
  float foam = smoothstep(0.35, 1.2, vHeight)
             * smoothstep(0.2, 0.55, fn1*0.6 + fn2*0.4);
  foam += smoothstep(0.5, 0.9, snoise(vWorldPos.xz*0.4+uTime*0.7))
        * smoothstep(0.15, 0.7, vHeight) * 0.12;
  foam = clamp(foam, 0.0, 1.0);
  col  = mix(col, uFoamColor, foam * 0.55);

  /* ── sun specular ── */
  vec3  H  = normalize(normalize(uSunDir) + V);
  float sp = pow(max(dot(N, H), 0.0), 256.0);
  col += uSunColor * sp * 2.5;
  col += uSunColor * pow(max(dot(N, H), 0.0), 48.0) * 0.2;

  /* ── underwater caustics projected on surface from below ── */
  float caustic = worley(vWorldPos.xz * 0.12 + uTime * 0.3);
  caustic = pow(1.0 - caustic, 3.0);
  col += vec3(0.2, 0.5, 0.7) * caustic * uUnderwaterMix * 0.4;

  /* ── underwater tint (blended when camera submerges) ── */
  vec3 uwTint = mix(col, col * vec3(0.3, 0.6, 0.9), uUnderwaterMix * 0.3);

  float alpha = mix(0.82, 1.0, F);

  gl_FragColor = vec4(uwTint, alpha);
}
`;

/* ═══════════════════════════════════════════ */
/*               <Ocean /> component           */
/* ═══════════════════════════════════════════ */
const Ocean = ({ isNightMode = false, waterLevel = -10, underwaterProgress = 0 }) => {
  const meshRef = useRef();
  const { scene, gl, camera, size } = useThree();

  /* ── refraction FBO ── */
  const fbo = useMemo(() => {
    const w = Math.min(Math.round(size.width * 0.6), 1536);
    const h = Math.min(Math.round(size.height * 0.6), 1536);
    return new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
  }, [size.width, size.height]);

  useEffect(() => () => fbo.dispose(), [fbo]);

  /* ── shader material ── */
  const material = useMemo(() => {
    const wc = isNightMode ? new THREE.Color("#0466b8") : new THREE.Color("#0588e6");
    const dc = isNightMode ? new THREE.Color("#001a33") : new THREE.Color("#003366");
    const fc = isNightMode ? new THREE.Color("#88bbdd") : new THREE.Color("#eef8ff");
    const sc = isNightMode ? new THREE.Color("#8899bb") : new THREE.Color("#fff5e0");

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 1.0 },
        uRefraction: { value: null },
        uWaterColor: { value: wc },
        uDeepColor: { value: dc },
        uFoamColor: { value: fc },
        uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
        uSunColor: { value: sc },
        uCamPos: { value: new THREE.Vector3() },
        uUnderwaterMix: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [isNightMode]);

  /* ── per-frame update ── */
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;

    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uCamPos.value.copy(camera.position);
    mat.uniforms.uUnderwaterMix.value = underwaterProgress;

    // refraction pass — render scene without water to FBO
    meshRef.current.visible = false;
    const prevBg = scene.background;
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    scene.background = prevBg;
    meshRef.current.visible = true;

    mat.uniforms.uRefraction.value = fbo.texture;
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
      <planeGeometry args={[400, 300, 200, 200]} />
    </mesh>
  );
};

export default Ocean;