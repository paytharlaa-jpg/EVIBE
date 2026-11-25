import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// ── Brand palette ────────────────────────────────────────────
export const C = {
  navy: '#071B3C',
  deep: '#05245F',
  teal: '#12DDC6',
  blue: '#0A82FF',
  green: '#88EE15',
  platinum: '#E6E9EE',
};

// The three blades of the EVIBE symbol (from the official SVG artwork).
const SYMBOL_SVG = `<svg xmlns="http://www.w3.org/2000/svg">
<path d="M402.461 74.815 C396.146 102.841 379.865 132.912 356.447 132.912 L204.724 132.912 C168.054 132.912 133.365 142.571 117.121 163.778 C127.835 117.589 155.898 74.815 189.721 74.815 L402.461 74.815 Z"/>
<path d="M360.877 151.171 C354.011 180.386 337.529 205.255 312.393 205.255 L185.062 205.255 C149.838 205.255 114.939 212.947 98.134 231.839 C109.143 188.055 142.436 151.171 172.377 151.171 L360.877 151.171 Z"/>
<path d="M370.067 223.055 C360.406 250.639 346.488 279.709 323.141 279.709 L82.578 279.709 C100.783 238.946 130.092 223.055 159.782 223.055 L370.067 223.055 Z"/>
</svg>`;

// Pillar side profile (z = depth, y = height): the front leans forward like the logo.
const H = 2.3;
const D0 = 0.3;
const LEAN = 0.07;
const W = 0.86;
const FRONT_ANGLE = Math.atan2(LEAN, H);

function useBodyGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-D0, 0);
    s.lineTo(D0, 0);
    s.lineTo(D0 + LEAN, H);
    s.lineTo(-D0 + 0.04, H - 0.16);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: W - 0.08,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 5,
      curveSegments: 4,
    });
    g.translate(0, 0, -(W - 0.08) / 2);
    g.rotateY(-Math.PI / 2);
    g.computeVertexNormals();
    return g;
  }, []);
}

function useBladeGeometries() {
  return useMemo(() => {
    const data = new SVGLoader().parse(SYMBOL_SVG);
    return data.paths.map((p) => {
      const g = new THREE.ExtrudeGeometry(p.toShapes(true), {
        depth: 10,
        bevelEnabled: true,
        bevelThickness: 2.5,
        bevelSize: 2,
        bevelSegments: 3,
        curveSegments: 18,
      });
      g.translate(-242, -177, 0);
      return g;
    });
  }, []);
}

// ── Live charging screen drawn to a canvas ───────────────────
function useScreenTexture() {
  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, ctx, texture };
  }, []);

  const last = useRef(-1);
  const draw = (level) => {
    const pct = Math.round(level * 100);
    if (pct === last.current) return;
    last.current = pct;
    const w = canvas.width;
    const h = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#04122a');
    bg.addColorStop(1, '#010814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(18,221,198,0.08)';
    for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 1);

    ctx.fillStyle = '#E6E9EE';
    ctx.font = '900 40px "Red Hat Display", sans-serif';
    ctx.fillText('EVIBE', 40, 74);
    ctx.fillStyle = pct >= 100 ? C.green : C.teal;
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(pct >= 100 ? '● READY TO GO' : '● CHARGING', 40, 118);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 168px "Red Hat Display", sans-serif';
    const label = `${pct}`;
    ctx.fillText(label, 36, 310);
    const tw = ctx.measureText(label).width;
    ctx.font = '700 56px "Red Hat Display", sans-serif';
    ctx.fillStyle = C.teal;
    ctx.fillText('%', 44 + tw, 300);

    const bx = 40;
    const by = 352;
    const bw = w - 80;
    const bh = 44;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(bx, by, bw, bh);
    const fill = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    fill.addColorStop(0, C.teal);
    fill.addColorStop(0.7, C.blue);
    fill.addColorStop(1, C.green);
    ctx.fillStyle = fill;
    ctx.fillRect(bx, by, Math.max(4, bw * level), bh);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 1; i < 10; i++) ctx.fillRect(bx + (bw / 10) * i, by, 2, bh);

    ctx.fillStyle = 'rgba(230,233,238,0.55)';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    const kw = (7.4 + level * 52.6).toFixed(1);
    const mins = Math.max(0, Math.round((1 - level) * 42));
    ctx.fillText(`${kw} kW`, 40, 460);
    ctx.fillText(pct >= 100 ? 'Unplug & drive' : `${mins} min left`, 40, 496);
    ctx.textAlign = 'right';
    ctx.fillText('CCS2 · TYPE 2', w - 40, 460);
    ctx.fillText('evibemobility.com', w - 40, 496);
    ctx.textAlign = 'left';
    ctx.fillStyle = C.teal;
    ctx.fillRect(40, 540, 80, 4);
    texture.needsUpdate = true;
  };

  useEffect(() => {
    draw(0.12);
    document.fonts?.ready.then(() => {
      last.current = -1;
      draw(0.12);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { texture, draw };
}

// ── Energy cable shader: pulses travel from pillar to connector ──
const cableVert = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const cableFrag = /* glsl */ `
uniform float uTime; uniform float uGlow; uniform vec3 uA; uniform vec3 uB;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.0);
  float l = max(dot(vN, normalize(vec3(0.4,0.8,0.5))), 0.0);
  vec3 base = vec3(0.025,0.05,0.1) + vec3(0.12,0.16,0.22) * l;
  float p = fract(vUv.x * 4.0 - uTime * 0.9);
  float pulse = smoothstep(0.0, 0.08, p) * (1.0 - smoothstep(0.08, 0.32, p));
  vec3 energy = mix(uA, uB, vUv.x) * pulse * uGlow * 2.2;
  gl_FragColor = vec4(base + energy + uA * fres * 0.35 * uGlow, 1.0);
}`;

function Cable({ glowRef }) {
  const mat = useRef();
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.46, 1.32, -0.12),
      new THREE.Vector3(0.62, 0.9, -0.05),
      new THREE.Vector3(0.86, 0.26, 0.18),
      new THREE.Vector3(0.76, 0.08, 0.58),
      new THREE.Vector3(0.54, 0.16, 0.66),
      new THREE.Vector3(0.6, 0.6, 0.36),
      new THREE.Vector3(0.6, 0.92, 0.12),
    ]);
    return new THREE.TubeGeometry(curve, 160, 0.03, 12, false);
  }, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGlow: { value: 1 },
      uA: { value: new THREE.Color(C.teal) },
      uB: { value: new THREE.Color(C.blue) },
    }),
    [],
  );
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uGlow.value = glowRef.current;
  });
  return (
    <mesh geometry={geo}>
      <shaderMaterial ref={mat} vertexShader={cableVert} fragmentShader={cableFrag} uniforms={uniforms} />
    </mesh>
  );
}

// ── Rising energy motes ──────────────────────────────────────
function Motes({ count }) {
  const ref = useRef();
  const { geo, uniforms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 1.1;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 2.8;
      pos[i * 3 + 2] = Math.sin(a) * r;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const uniforms = { uTime: { value: 0 }, uGlow: { value: 1 }, uPx: { value: Math.min(window.devicePixelRatio, 2) } };
    return { geo, uniforms };
  }, [count]);
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA; varying float vS;
          void main(){
            vec3 p = position;
            float t = fract(aSeed + uTime * (0.04 + aSeed * 0.05));
            p.y = mod(p.y + t * 2.8, 2.8);
            p.x += sin(uTime * 0.6 + aSeed * 20.0) * 0.08;
            vA = sin(t * 3.14159) * (0.35 + aSeed * 0.65);
            vS = aSeed;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_PointSize = (6.0 + aSeed * 10.0) * uPx * (1.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`}
        fragmentShader={/* glsl */ `
          uniform float uGlow; varying float vA; varying float vS;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA * uGlow;
            vec3 c = mix(vec3(0.07,0.87,0.78), vec3(0.53,0.93,0.08), step(0.82, vS));
            gl_FragColor = vec4(c, a);
          }`}
      />
    </points>
  );
}

function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(0,6,18,0.75)');
    r.addColorStop(0.5, 'rgba(0,6,18,0.3)');
    r.addColorStop(1, 'rgba(0,6,18,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

// ── The charger model ────────────────────────────────────────
// Pure model: whoever renders it drives it through refs.
//   chargeRef.current  0..1  battery level shown on the screen
//   glowRef.current    0..2  light bar / edge / cable energy
//   dynamicCable       true = no built-in cable or connector (the story scene draws its own)
export const CABLE_START = new THREE.Vector3(0.46, 1.44, -0.12); // where the cable leaves the pillar (model space)
export const HOLSTER = new THREE.Vector3(0.6, 1.1, 0.1); // connector resting point (model space)

export default function ChargerModel({ tier = 2, chargeRef, glowRef, dynamicCable = false, motes = true, ring = true }) {
  const parts = { ring: useRef() };
  const localGlow = useRef(1);
  const bodyGeo = useBodyGeometry();
  const bladeGeos = useBladeGeometries();
  const shadowTex = useShadowTexture();
  const { texture: screenTex, draw } = useScreenTexture();

  const mats = useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({ color: C.platinum, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18 }),
      panel: new THREE.MeshPhysicalMaterial({ color: C.navy, roughness: 0.28, metalness: 0.35, clearcoat: 0.6 }),
      alu: new THREE.MeshStandardMaterial({ color: '#9aa4b2', roughness: 0.35, metalness: 0.9 }),
      dark: new THREE.MeshStandardMaterial({ color: '#0b1426', roughness: 0.5, metalness: 0.4 }),
      light: new THREE.MeshBasicMaterial({ color: new THREE.Color(C.teal).multiplyScalar(2.2), toneMapped: false }),
      status: new THREE.MeshBasicMaterial({ color: new THREE.Color(C.green).multiplyScalar(2), toneMapped: false }),
      ring: new THREE.MeshBasicMaterial({ color: new THREE.Color(C.teal).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.6 }),
      blades: [
        new THREE.MeshPhysicalMaterial({ color: '#05E1C7', emissive: '#05E1C7', emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.3, clearcoat: 1, side: THREE.DoubleSide }),
        new THREE.MeshPhysicalMaterial({ color: '#0A82FF', emissive: '#0770F6', emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.3, clearcoat: 1, side: THREE.DoubleSide }),
        new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', emissive: '#DCE4F0', emissiveIntensity: 0.15, roughness: 0.25, metalness: 0.2, clearcoat: 1, side: THREE.DoubleSide }),
      ],
    }),
    [],
  );
  const lightBase = useMemo(() => new THREE.Color(C.teal).multiplyScalar(2.2), []);
  const statusBase = useMemo(() => new THREE.Color(C.green).multiplyScalar(2), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = glowRef ? glowRef.current : 1;
    localGlow.current = g;
    const pulse = 0.75 + Math.sin(t * 2.4) * 0.25;
    mats.light.color.copy(lightBase).multiplyScalar(0.15 + g * pulse);
    mats.status.color.copy(statusBase).multiplyScalar(0.15 + g * (0.8 + Math.sin(t * 5) * 0.2));
    if (parts.ring.current) {
      const rs = 1 + ((t * 0.5) % 1) * 0.6;
      parts.ring.current.scale.set(rs, rs, rs);
      mats.ring.opacity = (1 - ((t * 0.5) % 1)) * 0.55 * Math.min(1, g);
    }
    draw(Math.min(1, Math.max(0, chargeRef ? chargeRef.current : 0.12)));
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} scale={[2.6, 2.2, 1]} renderOrder={-1}>
        <planeGeometry />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
      {ring && (
        <mesh ref={parts.ring} rotation-x={-Math.PI / 2} position-y={0.02} material={mats.ring}>
          <ringGeometry args={[0.78, 0.8, 96]} />
        </mesh>
      )}
      <RoundedBox args={[1.08, 0.12, 0.86]} radius={0.04} smoothness={3} position-y={0.06} material={mats.alu} />
      <group position-y={0.12}>
        <mesh geometry={bodyGeo} material={mats.shell} />
        <mesh position={[-W / 2 - 0.005, 1.08, D0 + 0.02]} rotation-x={FRONT_ANGLE} material={mats.light}>
          <boxGeometry args={[0.018, 1.9, 0.018]} />
        </mesh>
        <mesh position={[W / 2 + 0.005, 1.08, D0 + 0.02]} rotation-x={FRONT_ANGLE} material={mats.light}>
          <boxGeometry args={[0.018, 1.9, 0.018]} />
        </mesh>
        <group position={[0, 0, D0]} rotation-x={FRONT_ANGLE}>
          <RoundedBox args={[0.7, 1.62, 0.04]} radius={0.018} smoothness={3} position={[0, 1.36, 0.06]} material={mats.panel} />
          <mesh position={[0, 1.66, 0.09]}>
            <planeGeometry args={[0.54, 0.633]} />
            <meshBasicMaterial map={screenTex} toneMapped={false} />
          </mesh>
          <group position={[0, 1.08, 0.085]} scale={[0.00105, -0.00105, 0.00105]}>
            {bladeGeos.map((geo, i) => (
              <mesh key={i} geometry={geo} material={mats.blades[i]} />
            ))}
          </group>
          <mesh position={[0, 2.08, 0.07]} material={mats.status}>
            <boxGeometry args={[0.5, 0.022, 0.02]} />
          </mesh>
          <mesh position={[0, 0.74, 0.085]} material={mats.dark}>
            <boxGeometry args={[0.2, 0.12, 0.012]} />
          </mesh>
          <mesh position={[0, 0.74, 0.092]} material={mats.light}>
            <ringGeometry args={[0.026, 0.032, 32]} />
          </mesh>
        </group>
        <RoundedBox args={[0.1, 0.24, 0.18]} radius={0.02} position={[W / 2 + 0.06, 1.02, 0.08]} material={mats.dark} />
        {!dynamicCable && (
          <>
            <group position={[0.6, 0.98, 0.1]}>
              <mesh material={mats.dark} position-y={0.02}>
                <cylinderGeometry args={[0.05, 0.045, 0.18, 24]} />
              </mesh>
              <mesh material={mats.light} position-y={0.115} rotation-x={-Math.PI / 2}>
                <torusGeometry args={[0.046, 0.006, 8, 32]} />
              </mesh>
            </group>
            <Cable glowRef={localGlow} />
          </>
        )}
        {motes && tier >= 2 && <Motes count={tier === 3 ? 200 : 90} />}
      </group>
    </group>
  );
}
