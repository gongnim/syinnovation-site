import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Scroll-driven home hero. The .hero section is tall and .hero-pin sticks while it scrolls; p runs 0..1 across it.
// Copy appears only at the start and the end, like PacketGo. The visuals tell the rest:
//   p 0      night. Large lights circle the screen edges in brand colours; the glowing core rises from the bottom.
//            Two lights orbit the core: device 1 (PC / tablet, blue) and device 2 (phone, orange). Each time they meet
//            at their crossing, a verification light spreads over the core.
//   p ~0.3   the core rises.
//   p ~0.5   night turns into a bright field whose rays converge on the core; the two orbits widen and turn into rings.
//   p ~0.8   closing copy.

const MAX_IMPACTS = 6;
const RING_R = 1.42;
const NIGHT_RING = 0.76; // the orbits hug the core at night (1.08 core radii), then widen to full rings
const MEET_PERIOD = 9;
const FIRST_MEET = 3;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = THREE.MathUtils.lerp;

// Glossy core. Smoothness comes from soft light only: a crescent reflection hugging the upper-left rim,
// light gathered under the rim like an atmosphere, a crisp rim line brightest along the top, warm light on the right edge.
function makeOrbMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDay: { value: 0 },
      uImpacts: { value: Array.from({ length: MAX_IMPACTS }, () => new THREE.Vector4(0, 1, 0, -1)) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vObjN; varying vec3 vView;
      void main(){
        vObjN = normalize(position);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uDay;
      uniform vec4 uImpacts[${MAX_IMPACTS}]; // xyz = direction in orb space, w = start time, < 0 unused
      varying vec3 vN; varying vec3 vObjN; varying vec3 vView;
      float ripple(vec3 n){
        float acc = 0.0;
        for (int i = 0; i < ${MAX_IMPACTS}; i++){
          if (uImpacts[i].w < 0.0) continue;
          float age = uTime - uImpacts[i].w;
          if (age < 0.0 || age > 2.6) continue;
          float ang = acos(clamp(dot(n, normalize(uImpacts[i].xyz)), -1.0, 1.0));
          float fade = 1.0 - age / 2.6;
          acc += exp(-pow((ang - age * 0.8) * 5.5, 2.0)) * fade * fade * 0.55 + exp(-ang * 5.0) * max(0.0, 1.0 - age * 1.4) * 0.8;
        }
        return acc;
      }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec3 n = normalize(vN), v = normalize(vView);
        float edge = 1.0 - clamp(dot(n, v), 0.0, 1.0);
        float top = smoothstep(-0.2, 0.85, n.y);
        float rimLine = pow(edge, 14.0);

        // crescent reflection: a tapered band at a fixed angle from the view axis, over an arc at the upper left
        float th = acos(clamp(n.z, -1.0, 1.0));
        float ph = atan(n.y, n.x) - 2.0;
        ph -= 6.2831853 * floor((ph + 3.1415927) / 6.2831853);
        float a = ph / 0.46;
        float taper = max(1.0 - 0.3 * a - 0.3 * a * a, 0.25);
        float b = (th - 1.06) / (0.075 * taper);
        float amp = clamp(0.8 - 0.4 * a, 0.0, 1.0);
        float a2 = a * a;
        float streak = exp(-b * b) * exp(-a2 * a2) * amp;
        float streakGlow = exp(-b * b * 0.08) * exp(-a2 * 1.4) * amp;

        // night, authored in display (sRGB) values and converted to linear at the end.
        // A dark core whose colour slowly travels around the core as it turns (blue, brand orange, indigo),
        // a limb filled with coloured light (blue on the left, indigo on the right, pale on top),
        // a broad soft light from the upper left, a shadow toward the front right, and a crisp outline.
        float ndv = 1.0 - edge;
        float side = smoothstep(-0.72, 0.72, n.x), crest = smoothstep(0.08, 0.92, n.y);
        float lon = atan(vObjN.z, vObjN.x), lat = asin(clamp(vObjN.y, -1.0, 1.0));
        float cyc = lon + sin(lat * 1.5) * 0.3;
        vec3 chroma = vec3(0.03, 0.05, 0.16);
        chroma = mix(chroma, vec3(0.03, 0.15, 0.38), pow(0.5 + 0.5 * cos(cyc - 0.2), 2.4) * 0.85);
        chroma = mix(chroma, vec3(0.34, 0.12, 0.05), pow(0.5 + 0.5 * cos(cyc - 2.8), 2.6) * 0.7);
        chroma = mix(chroma, vec3(0.10, 0.10, 0.32), pow(0.5 + 0.5 * cos(cyc + 1.8), 2.2) * 0.4);
        vec3 core = vec3(0.016, 0.022, 0.075) + vec3(0.012, 0.02, 0.055) * smoothstep(-0.4, 0.95, n.y);
        core = mix(core, chroma, smoothstep(0.05, 0.4, ndv) * 0.8);
        vec3 limb = mix(vec3(0.16, 0.36, 0.82), vec3(0.20, 0.13, 0.52), side);
        limb = mix(limb, vec3(0.58, 0.68, 0.98), crest * 0.65);
        vec3 body = mix(core, limb, pow(edge, 1.85) * 0.8);
        body = mix(body, vec3(0.30, 0.45, 0.88), pow(edge, 1.75) * mix(1.0, 0.5, side) * mix(0.72, 1.0, crest) * 0.4);
        body += vec3(0.14, 0.15, 0.32) * pow(clamp(dot(n, normalize(vec3(-0.73, 0.48, 0.49))), 0.0, 1.0), 2.0);
        body += vec3(0.06, 0.08, 0.14) * pow(clamp(dot(n, normalize(vec3(-0.9, 0.08, 0.43))), 0.0, 1.0), 3.0);
        body *= 1.0 - 0.28 * pow(clamp(dot(n, normalize(vec3(0.38, -0.1, 0.92))), 0.0, 1.0), 1.65);
        float outline = 1.0 - smoothstep(0.01, 0.055 + crest * 0.055 + (1.0 - side) * 0.025, ndv);
        vec3 outCol = mix(mix(vec3(0.34, 0.67, 1.0), vec3(0.48, 0.44, 1.0), side), vec3(0.80, 0.88, 1.0), crest * 0.68);
        body += outline * outCol * (0.3 + crest * 0.45);
        body += vec3(0.62, 0.62, 0.92) * (streak * 0.55 + streakGlow * 0.05);
        vec3 night = pow(clamp(body, 0.0, 1.0), vec3(2.2));

        // day: vivid blue glass with a translucent edge and a warm peach underside
        vec3 day = mix(vec3(0.03, 0.08, 0.6), vec3(0.11, 0.25, 0.97), smoothstep(-0.25, 0.9, n.y - n.x * 0.3));
        day = mix(day, vec3(0.98, 0.56, 0.32), (1.0 - smoothstep(-0.95, -0.05, n.y)) * 0.85);
        day = mix(day, vec3(0.64, 0.75, 1.0), smoothstep(0.55, 1.0, edge) * 0.5);
        day += vec3(1.0) * (rimLine * 0.5 + streak * 0.75 + streakGlow * 0.08);
        day += vec3(1.0) * pow(clamp(dot(n, normalize(vec3(-0.45, 0.6, 0.66))), 0.0, 1.0), 14.0) * 0.18;

        vec3 col = mix(night, day, uDay);
        col += mix(vec3(0.72, 0.87, 1.0), vec3(1.0, 0.97, 0.92), uDay) * ripple(vObjN);
        col *= 1.0 + (hash(gl_FragCoord.xy) - 0.5) * 0.024; // dither against banding on the smooth gradients
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// Solid glossy ring (fades in with the day) with a light travelling along it.
function makeRingMaterial(tint: THREE.Color, glow: THREE.Color, dir: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTint: { value: tint }, uGlow: { value: glow }, uDir: { value: dir },
      uHead: { value: 0 }, uOpacity: { value: 0 },
      uLight: { value: new THREE.Vector3(-0.4, 0.7, 0.6).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vView; varying float vAng;
      void main(){
        vAng = atan(position.y, position.x);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTint; uniform vec3 uGlow; uniform vec3 uLight; uniform float uHead; uniform float uDir; uniform float uOpacity;
      varying vec3 vN; varying vec3 vView; varying float vAng;
      void main(){
        vec3 n = normalize(vN), v = normalize(vView);
        float diff = max(dot(n, uLight), 0.0);
        float nh = max(dot(n, normalize(uLight + v)), 0.0);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 col = uTint * (0.30 + 0.70 * diff);
        col += vec3(1.0) * (pow(nh, 80.0) * 1.4 + pow(nh, 10.0) * 0.12);
        col += uGlow * fres * 0.25;
        float d = vAng - uHead; d = atan(sin(d), cos(d));
        float tail = d * uDir < 0.0 ? exp(d * uDir * 3.0) : 0.0;
        col += uGlow * (exp(-d * d * 260.0) * 5.0 + tail * 0.8);
        gl_FragColor = vec4(col, uOpacity);
      }`,
  });
}

// Night version of the same path: only the travelling light and its comet tail, plus a faint orbit line.
function makeOrbitMaterial(glow: THREE.Color, dir: number) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uGlow: { value: glow }, uDir: { value: dir }, uHead: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying float vAng;
      void main(){ vAng = atan(position.y, position.x); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGlow; uniform float uHead; uniform float uDir; uniform float uOpacity; varying float vAng;
      void main(){
        float d = vAng - uHead; d = atan(sin(d), cos(d));
        float tail = d * uDir < 0.0 ? exp(d * uDir * 1.7) : 0.0;
        gl_FragColor = vec4(uGlow * (0.05 + exp(-d * d * 500.0) * 7.0 + tail * 1.1) * uOpacity, 1.0);
      }`,
  });
}

// Background. Night: four large soft lights circle the screen edges (logo blue, sky blue, orange, amber) while
// the centre stays dark, and the core gets a two-layer rim glow. Day: a bright silver field centred on the core.
function makeBackground() {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: {
        uAspect: { value: 1 }, uDay: { value: 0 }, uTime: { value: 0 },
        uOrb: { value: new THREE.Vector2(0.5, 0.5) }, uOrbPx: { value: new THREE.Vector2() }, uOrbR: { value: 1 }, uPx: { value: 1 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uAspect; uniform float uDay; uniform float uTime; uniform vec2 uOrb; uniform vec2 uOrbPx; uniform float uOrbR; uniform float uPx;
        varying vec2 vUv;
        vec2 path(float t){ float a = 6.2831853 * t; return vec2(0.5 - 0.62 * cos(a), 0.5 + 0.78 * sin(a)); }
        float blob(vec2 p, vec2 c, float r){ vec2 d = (p - c) * vec2(uAspect, 1.0) / r; return exp(-dot(d, d)); }
        float shade(vec2 p, vec2 c, vec2 r){ float q = length((p - c) / r); return 0.98 * (1.0 - smoothstep(0.3, 0.8, q)); }
        float glow(vec2 p, vec2 c, vec2 r){ vec2 d = (p - c) / r; return exp(-dot(d, d)); }
        void main(){
          vec2 p = vUv;
          float t = uTime / 40.0;
          vec3 night = vec3(0.001, 0.0016, 0.0045);
          night += vec3(0.022, 0.08, 0.40) * blob(p, path(t), 0.62);
          night += vec3(0.008, 0.12, 0.32) * blob(p, path(t + 0.25), 0.55);
          night += vec3(0.26, 0.065, 0.008) * blob(p, path(t + 0.5), 0.62);
          night += vec3(0.20, 0.045, 0.04) * blob(p, path(t + 0.75), 0.55);
          // keep the middle dark where the copy and the core sit
          night *= (1.0 - shade(p, vec2(0.52, 0.32), vec2(0.48, 0.95))) * (1.0 - shade(p, vec2(0.82, 1.0), vec2(0.58, 0.9)) * 0.8);
          // rim glow of the core: a tight cyan line glow and a wider blue one
          float o = (length(gl_FragCoord.xy - uOrbPx) - uOrbR) / uPx;
          if (o > 0.0) {
            night += vec3(0.30, 0.70, 1.0) * 0.55 * exp(-o / 3.5);
            night += vec3(0.10, 0.14, 1.0) * 0.30 * exp(-o / 10.0);
            night += vec3(0.02, 0.05, 0.22) * 0.6 * exp(-o / 80.0);
          }
          float r = length((p - uOrb) * vec2(uAspect, 1.0));
          vec3 day = mix(vec3(0.95, 0.96, 0.985), vec3(0.50, 0.56, 0.68), smoothstep(0.12, 1.1, r));
          day = mix(day, vec3(0.42, 0.56, 0.90), glow(p, vec2(-0.05, 0.5), vec2(0.28, 0.9)) * 0.55);
          day = mix(day, vec3(0.96, 0.64, 0.44), glow(p, vec2(1.05, 0.5), vec2(0.28, 0.9)) * 0.45);
          gl_FragColor = vec4(mix(night, day, uDay), 1.0);
        }`,
    }),
  );
}

// Light rays radiating from the core; pulses travel inward along some of them. Each ray is a screen-space quad.
function makeRays(count: number) {
  const dir = new Float32Array(count * 4 * 3), off = new Float32Array(count * 4), len = new Float32Array(count * 4);
  const seed = new Float32Array(count * 4), t = new Float32Array(count * 4), side = new Float32Array(count * 4);
  const index: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(a), Math.sin(a), -0.4 + Math.random()).normalize();
    const o = Math.random() * 1.4, l = 1.2 + Math.pow(Math.random(), 1.4) * 7, s = Math.random();
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k;
      dir.set([d.x, d.y, d.z], v * 3); off[v] = o; len[v] = l; seed[v] = s;
      t[v] = k < 2 ? 0 : 1; side[v] = k % 2 ? 1 : -1;
    }
    const b = i * 4;
    index.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 4 * 3), 3));
  g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
  g.setAttribute('aOff', new THREE.BufferAttribute(off, 1));
  g.setAttribute('aLen', new THREE.BufferAttribute(len, 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aT', new THREE.BufferAttribute(t, 1));
  g.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  g.setIndex(index);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uR0: { value: 2 }, uRes: { value: new THREE.Vector2(1, 1) }, uWidth: { value: 1 }, uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute vec3 aDir; attribute float aOff; attribute float aLen; attribute float aSeed; attribute float aT; attribute float aSide;
      uniform float uR0; uniform vec2 uRes; uniform float uWidth;
      varying float vT; varying float vSide; varying float vSeed; varying float vDist;
      void main(){
        float d0 = uR0 + aOff, d1 = d0 + aLen;
        vec4 c0 = projectionMatrix * modelViewMatrix * vec4(aDir * d0, 1.0);
        vec4 c1 = projectionMatrix * modelViewMatrix * vec4(aDir * d1, 1.0);
        vec2 sdir = normalize((c1.xy / c1.w - c0.xy / c0.w) * uRes);
        vec4 c = mix(c0, c1, aT);
        c.xy += vec2(-sdir.y, sdir.x) * aSide * uWidth * 2.0 / uRes * c.w;
        vT = aT; vSide = aSide; vSeed = aSeed; vDist = mix(d0, d1, aT);
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity;
      varying float vT; varying float vSide; varying float vSeed; varying float vDist;
      void main(){
        float ends = smoothstep(0.0, 0.12, vT) * (1.0 - smoothstep(0.55, 1.0, vT));
        float f = fract(vDist * 0.16 + uTime * 0.22 + vSeed * 7.0);
        float pulse = pow(1.0 - f, 16.0) * step(0.45, fract(vSeed * 13.7));
        float across = 1.0 - vSide * vSide * 0.6;
        float k = (0.30 + 0.25 * vSeed + 2.6 * pulse) * ends * across * uOpacity;
        gl_FragColor = vec4(vec3(0.92, 0.96, 1.0) * k, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  return mesh;
}

// A few calm light motes on the core's shoulders (in core units, so they follow it on scroll). Most are small and
// crisp; the ones far from the core's depth get larger and softer, like out-of-focus light.
function makeMotes(count: number) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count), size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.PI * (0.08 + Math.random() * 0.84); // upper half: where the core is on screen at night
    const r = 1.03 + Math.pow(Math.random(), 1.7) * 0.5;
    pos.set([Math.cos(a) * r, Math.sin(a) * r, -0.5 + Math.random() * 1.1], i * 3);
    seed[i] = Math.random();
    size[i] = 0.004 + Math.pow(Math.random(), 3) * 0.016;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uUnit: { value: 1 }, uFocus: { value: 14 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; attribute float aSize;
      uniform float uTime; uniform float uScale; uniform float uUnit; uniform float uFocus;
      varying float vBlur; varying float vTw;
      void main(){
        vec3 p = position;
        float a = uTime * (0.012 + 0.02 * aSeed) * (aSeed > 0.5 ? 1.0 : -1.0); // slow drift along the shoulder
        p.xy = mat2(cos(a), sin(a), -sin(a), cos(a)) * p.xy;
        p.y += sin(uTime * 0.35 + aSeed * 30.0) * 0.012;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = -mv.z;
        vBlur = clamp(abs(dist - uFocus) / (uUnit * 0.9), 0.0, 1.0);
        vTw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0);
        gl_PointSize = aSize * uUnit * uScale / dist * (1.0 + vBlur * 2.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying float vBlur; varying float vTw;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = 1.0 - smoothstep(1.0 - mix(0.3, 0.95, vBlur), 1.0, r);
        gl_FragColor = vec4(vec3(0.78, 0.84, 1.0) * a * mix(0.95, 0.25, vBlur) * vTw * uOpacity, 1.0);
      }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  return pts;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// copy layers: fade/slide in over [inA, inB], out over [outA, outB]
const LAYERS: Record<string, [number, number, number, number]> = {
  a: [-1, 0, 0.06, 0.14],
  b: [0.76, 0.86, 2, 3],
};

export function orbHero(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas.orb3d')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-hero-layer]')];

  // scroll progress across the tall hero, and the copy layers it drives (these run even without WebGL)
  let forceP: number | null = null; // dev screenshots only
  const progress = () => {
    if (forceP !== null) return forceP;
    const r = root.getBoundingClientRect();
    const span = r.height - innerHeight;
    return span > 0 ? clamp01(-r.top / span) : 0;
  };
  let inView = true;
  const dayOf = (p: number) => ss(0.44, 0.6, p);
  function applyCopy(p: number) {
    for (const el of layers) {
      const [ia, ib, oa, ob] = LAYERS[el.dataset.heroLayer!];
      const i = ss(ia, ib, p), o = ss(oa, ob, p);
      const op = i * (1 - o);
      el.style.opacity = op.toFixed(3);
      el.style.transform = `translateY(${((1 - i) * 36 - o * 48).toFixed(1)}px)`;
      el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
    }
    root.style.setProperty('--hero-day', dayOf(p).toFixed(3));
    root.style.setProperty('--hero-end', ss(0.92, 0.99, p).toFixed(3));
    html.classList.toggle('hero-dark', inView && dayOf(p) < 0.5);
  }
  applyCopy(progress());

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    root.classList.add('is-fallback');
    addEventListener('scroll', () => applyCopy(progress()), { passive: true });
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); root.classList.add('is-fallback'); });

  const small = innerWidth < 768;
  const scene = new THREE.Scene();
  // a long lens keeps the core round and calm (little perspective distortion)
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
  camera.position.set(0, 0, 14);
  const bg = makeBackground();
  const bgU = (bg.material as THREE.ShaderMaterial).uniforms;
  bg.renderOrder = -1; bg.frustumCulled = false;
  scene.add(bg);

  const rays = makeRays(small ? 150 : 260);
  const rayU = (rays.material as THREE.ShaderMaterial).uniforms;
  const rayGroup = new THREE.Group();
  rayGroup.add(rays);
  scene.add(rayGroup);

  const world = new THREE.Group(); // at the core's centre, scaled so 1 unit = core radius
  scene.add(world);
  const tilt = new THREE.Group();
  world.add(tilt);
  const orbMat = makeOrbMaterial();
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 192), orbMat);
  tilt.add(orb);
  const motes = makeMotes(small ? 70 : 140);
  const moteU = (motes.material as THREE.ShaderMaterial).uniforms;
  world.add(motes);

  // device 1 (PC / tablet, blue) and device 2 (phone, orange). Their paths mirror each other across x = 0,
  // so the two lights always reach the crossing in front of the core at the same moment.
  const rings = new THREE.Group();
  tilt.add(rings);
  const qA = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.15, 0.35, 0.45));
  const qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.15, -0.35, -0.45));
  const glowA = new THREE.Color(0.25, 0.55, 1.0), glowB = new THREE.Color(1.0, 0.42, 0.08);
  const solidGeo = new THREE.TorusGeometry(RING_R, 0.05, 32, 260);
  const orbitGeo = new THREE.TorusGeometry(RING_R, 0.012, 10, 400);
  const solidA = makeRingMaterial(new THREE.Color(0.72, 0.8, 1.0), glowA, 1), solidB = makeRingMaterial(new THREE.Color(1.0, 0.8, 0.68), glowB, -1);
  const orbitA = makeOrbitMaterial(glowA, 1), orbitB = makeOrbitMaterial(glowB, -1);
  const ringMeshes = [new THREE.Mesh(solidGeo, solidA), new THREE.Mesh(orbitGeo, orbitA), new THREE.Mesh(solidGeo, solidB), new THREE.Mesh(orbitGeo, orbitB)];
  ringMeshes.forEach((m, i) => { m.quaternion.copy(i < 2 ? qA : qB); rings.add(m); });
  const [ringA, orbA, ringB, orbB] = ringMeshes;
  const nA = new THREE.Vector3(0, 0, 1).applyQuaternion(qA), nB = new THREE.Vector3(0, 0, 1).applyQuaternion(qB);
  const cross = new THREE.Vector3().crossVectors(nA, nB).normalize();
  if (cross.z < 0) cross.negate();
  const meetPt = cross.multiplyScalar(RING_R);
  const localA = meetPt.clone().applyQuaternion(qA.clone().invert());
  const angA = Math.atan2(localA.y, localA.x), angB = Math.PI - angA; // mirror pose: B(pi - a) = mirror(A(a))
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: new THREE.Color(1.5, 1.45, 1.35), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  flash.position.copy(meetPt);
  rings.add(flash);

  // render targets with MSAA so the core's silhouette and the rings stay smooth through post-processing
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.6, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let W = 1, H = 1, pxPerUnit = 1, orbScale = 1;
  const visH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function layout() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    composer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    bgU.uAspect.value = W / H;
    pxPerUnit = H / visH();
    const dpr = renderer.getPixelRatio();
    bgU.uPx.value = dpr;
    rayU.uRes.value.set(W * dpr, H * dpr);
    rayU.uWidth.value = 0.75 * dpr;
    moteU.uScale.value = (H * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }

  // core position and size along the scroll (proportions follow PacketGo's main visual):
  // planet at the bottom -> rises -> centred for the day field -> settles above the closing copy
  function place(p: number, intro: number) {
    const s1 = ss(0.18, 0.42, p), s2 = ss(0.48, 0.62, p), s3 = ss(0.66, 0.8, p);
    const mobile = W < 768;
    const r0 = Math.max(250, Math.min(W * 0.37, H * 0.56));
    const cy0 = H * (mobile ? 0.7 : 0.59) + r0;
    const cyMid = H * (mobile ? 0.56 : 0.48) + r0;
    const r1 = Math.min(H * 0.25, W * 0.32), r2 = mobile ? Math.min(H * 0.15, W * 0.27) : Math.min(H * 0.19, W * 0.24);
    let rPx = r0, cy = lerp(cy0, cyMid, s1);
    rPx = lerp(rPx, r1, s2); cy = lerp(cy, H * 0.46, s2);
    rPx = lerp(rPx, r2, s3); cy = lerp(cy, H * (mobile ? 0.33 : 0.38), s3);
    cy += (1 - intro) * H * 0.16; // the core rises in on load
    orbScale = rPx / pxPerUnit;
    world.scale.setScalar(orbScale);
    world.position.set(0, (H / 2 - cy) / pxPerUnit, 0);
    rayGroup.position.copy(world.position);
    rayU.uR0.value = orbScale * 1.9;
    const dpr = renderer.getPixelRatio();
    bgU.uOrb.value.set(0.5, 1 - cy / H);
    bgU.uOrbPx.value.set((W / 2) * dpr, (H - cy) * dpr);
    bgU.uOrbR.value = rPx * dpr;
    moteU.uUnit.value = orbScale;
    moteU.uFocus.value = camera.position.z - orbScale;
  }

  let impactIdx = 0;
  let flashAt = -10;
  function meet(t: number) {
    flashAt = t;
    const d = orb.worldToLocal(rings.localToWorld(meetPt.clone())).normalize();
    (orbMat.uniforms.uImpacts.value as THREE.Vector4[])[impactIdx].set(d.x, d.y, d.z, t);
    impactIdx = (impactIdx + 1) % MAX_IMPACTS;
  }

  let pointerX = 0, pointerY = 0;
  root.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointerY = -(((e.clientY - r.top) / r.height) * 2 - 1);
  }, { passive: true });

  let clock = 0, last = 0, raf = 0, visible = true, pS = progress(), lastLap = -1;
  function tick(nowMs: number) {
    raf = 0;
    const dt = last ? Math.min(0.05, (nowMs - last) / 1000) : 0.016; last = nowMs;
    if (!reduce) clock += dt;
    const target = progress();
    pS = reduce ? target : pS + (target - pS) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - pS) < 0.0005) pS = target;
    const p = pS;
    applyCopy(p);

    const day = dayOf(p);
    const intro = reduce ? 1 : 1 - Math.pow(1 - clamp01(clock / 1.6), 3);
    place(p, intro);

    orbMat.uniforms.uTime.value = clock;
    orbMat.uniforms.uDay.value = day;
    bgU.uDay.value = day; bgU.uTime.value = clock;
    rayU.uTime.value = clock; rayU.uOpacity.value = day * (1 - ss(0.92, 1, p) * 0.5);
    moteU.uTime.value = clock;
    moteU.uOpacity.value = 1 - day;
    bloom.strength = lerp(0.6, 0.3, day);
    bloom.threshold = lerp(0.78, 1.0, day);

    orb.rotation.y += dt * 0.05;
    rayGroup.rotation.z += dt * 0.015;
    if (!reduce) {
      tilt.rotation.x += ((-pointerY * 0.1) - tilt.rotation.x) * (1 - Math.exp(-dt * 3));
      tilt.rotation.z += ((-pointerX * 0.06) - tilt.rotation.z) * (1 - Math.exp(-dt * 3));
      rayGroup.rotation.x += ((pointerY * 0.05) - rayGroup.rotation.x) * (1 - Math.exp(-dt * 2));
      rayGroup.rotation.y += ((pointerX * 0.06) - rayGroup.rotation.y) * (1 - Math.exp(-dt * 2));
    }

    // the two orbits: close to the core at night, widening into solid rings for the day
    rings.scale.setScalar(lerp(NIGHT_RING, 1, ss(0.48, 0.68, p)));
    rings.rotation.y = reduce ? 0 : Math.sin(clock * 0.15) * 0.18;
    const solid = ss(0.52, 0.68, p), orbit = 1 - ss(0.5, 0.62, p);
    solidA.uniforms.uOpacity.value = solidB.uniforms.uOpacity.value = solid;
    orbitA.uniforms.uOpacity.value = orbitB.uniforms.uOpacity.value = orbit;
    ringA.visible = ringB.visible = solid > 0.01;
    orbA.visible = orbB.visible = orbit > 0.01;

    // both lights travel one lap per MEET_PERIOD and meet at the front crossing on every lap
    const laps = (clock - FIRST_MEET) / MEET_PERIOD;
    const travel = laps * Math.PI * 2;
    for (const m of [solidA, orbitA]) m.uniforms.uHead.value = angA + travel;
    for (const m of [solidB, orbitB]) m.uniforms.uHead.value = angB - travel;
    const lap = Math.floor(laps);
    if (!reduce && lap > lastLap && laps >= 0) meet(clock);
    lastLap = Math.max(lastLap, lap);
    const fa = clock - flashAt;
    const fm = flash.material as THREE.SpriteMaterial;
    fm.opacity = fa >= 0 && fa < 1.2 ? (fa < 0.12 ? fa / 0.12 : 1 - (fa - 0.12) / 1.08) : 0;
    flash.scale.setScalar(0.15 + Math.min(fa, 1.2) * 0.3);

    composer.render();
    if (visible && (!reduce || pS !== target)) raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  // dev only: advance frames by hand (background tabs pause rAF, which breaks screenshot checks)
  if (import.meta.env.DEV) (window as unknown as { __heroStep: (n?: number, p?: number) => void }).__heroStep = (n = 90, p?: number) => {
    if (p !== undefined) forceP = p;
    for (let i = 0; i < n; i++) { cancelAnimationFrame(raf); raf = 0; tick(last + 16.7); }
  };

  addEventListener('scroll', () => { if (inView) wake(); }, { passive: true });
  new ResizeObserver(() => { layout(); wake(); }).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting; inView = visible;
    if (visible) wake(); else html.classList.remove('hero-dark');
  }).observe(root);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && inView; if (visible) wake(); });
  layout();
  renderer.compileAsync(scene, camera).finally(() => { root.classList.add('is-ready'); wake(); });
}
