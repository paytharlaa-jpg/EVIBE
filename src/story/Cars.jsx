import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CARS, dressCar } from './carMaterials';

// Real car models (exported from the supplied .blend files, badges and
// exhausts removed). Models face +z, length ≈ 4.75–5 m, wheels are separate
// nodes: wheel-front-left, wheel-front-right, wheel-back-left, wheel-back-right.
const DRACO = '/draco/';
Object.values(CARS).forEach((c) => useGLTF.preload(c.url, DRACO));

export const PORT_LOCAL = new THREE.Vector3(-1.0, 0.86, -1.55); // rear right quarter (model space)
const WHEEL_R = 0.38;

// Cabin per model (model space, front = +z): the source files have no
// interior, so seats, dashboard and steering wheel are added here. Driver sits
// on the right (Indian right-hand drive).
const CABINS = {
  mustang: { z: -0.15, w: 1.36, floor: 0.32, seatY: 0.42, dashZ: 0.72, dashY: 0.86, rear: true },
  challenger: { z: -0.1, w: 1.42, floor: 0.34, seatY: 0.44, dashZ: 0.78, dashY: 0.9, rear: true },
  amg: { z: -0.05, w: 1.4, floor: 0.32, seatY: 0.42, dashZ: 0.82, dashY: 0.88, rear: true },
};
const leather = new THREE.MeshStandardMaterial({ color: '#1a1b1f', roughness: 0.62, metalness: 0.05 });
const trimMat = new THREE.MeshStandardMaterial({ color: '#0c0d10', roughness: 0.5, metalness: 0.2 });
const accent = new THREE.MeshBasicMaterial({ color: new THREE.Color('#12DDC6').multiplyScalar(1.4), toneMapped: false });

function Seat({ x, z, y, back = 0.6, w = 0.52 }) {
  return (
    <group position={[x, y, z]}>
      <mesh material={leather} position={[0, 0.05, 0]}>
        <boxGeometry args={[w, 0.12, 0.52]} />
      </mesh>
      <mesh material={leather} position={[0, 0.05 + back / 2, -0.27]} rotation-x={-0.18}>
        <boxGeometry args={[w * 0.95, back, 0.12]} />
      </mesh>
      <mesh material={leather} position={[0, 0.12 + back, -0.33]} rotation-x={-0.18}>
        <boxGeometry args={[w * 0.5, 0.18, 0.1]} />
      </mesh>
    </group>
  );
}

function Interior({ model }) {
  const c = CABINS[model];
  if (!c) return null;
  const hw = c.w / 2;
  const drv = -0.36; // right-hand drive (model −x is the car's right)
  return (
    <group position-z={c.z}>
      {/* floor tub */}
      <mesh material={trimMat} position={[0, c.floor, 0]}>
        <boxGeometry args={[c.w, 0.06, 2.3]} />
      </mesh>
      {/* dashboard with a thin ambient light strip */}
      <mesh material={trimMat} position={[0, c.dashY - 0.08, c.dashZ - c.z]}>
        <boxGeometry args={[c.w, 0.26, 0.42]} />
      </mesh>
      <mesh material={accent} position={[0, c.dashY + 0.02, c.dashZ - c.z - 0.21]}>
        <boxGeometry args={[c.w * 0.9, 0.012, 0.012]} />
      </mesh>
      {/* steering wheel + column */}
      <group position={[drv, c.dashY - 0.02, c.dashZ - c.z - 0.3]} rotation-x={-0.35}>
        <mesh material={trimMat}>
          <torusGeometry args={[0.17, 0.022, 10, 28]} />
        </mesh>
        <mesh material={trimMat} rotation-x={Math.PI / 2} position-z={0.12}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 10]} />
        </mesh>
      </group>
      {/* centre console */}
      <mesh material={trimMat} position={[0, c.floor + 0.16, 0.15]}>
        <boxGeometry args={[0.2, 0.26, 1.0]} />
      </mesh>
      {/* seats */}
      <Seat x={drv} y={c.seatY - 0.05} z={-0.05} />
      <Seat x={-drv} y={c.seatY - 0.05} z={-0.05} />
      {c.rear && <Seat x={0} y={c.seatY - 0.02} z={-0.95} w={hw * 1.7} back={0.5} />}
    </group>
  );
}

const beamVert = /* glsl */ `varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const beamFrag = /* glsl */ `uniform float uI; uniform vec3 uC; varying float vY; void main(){ gl_FragColor = vec4(uC, pow(vY, 3.0) * 0.07 * uI); }`;

function useBeamMaterial(color = '#cfefff') {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVert,
        fragmentShader: beamFrag,
        uniforms: { uI: { value: 1 }, uC: { value: new THREE.Color(color) } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [color],
  );
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(18,221,198,1)');
  r.addColorStop(1, 'rgba(18,221,198,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/**
 * A real car driven every frame by `drive(state)` →
 * { x, z, yaw, dist, brake, indicator, glow, port, beam, visible }.
 */
export function Car({ model: key, paint, drive, beams = true, port = false, underglow = false, tailBar = true }) {
  const spec = CARS[key];
  const { scene } = useGLTF(spec.url, DRACO);
  const { model, wheels } = useMemo(() => {
    const d = dressCar(scene, spec, paint);
    const w = d.wheels.filter((o) => /^wheel-(front|back)-(left|right)$/.test(o.name));
    w.forEach((o) => (o.rotation.order = 'YXZ'));
    return { model: d.model, wheels: w };
  }, [scene, spec, paint]);

  const root = useRef();
  const tail = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a3d'), toneMapped: false }), []);
  const ind = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffae1a').multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 }), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false }), []);
  const portMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#12DDC6').multiplyScalar(2), toneMapped: false }), []);
  const beamMat = useBeamMaterial();
  const flap = useRef();
  const spin = useRef({ angle: 0, last: null });

  useFrame((state) => {
    const s = drive(state);
    const g = root.current;
    if (!g || !s) return;
    if (s.x !== undefined) g.position.x = s.x;
    if (s.z !== undefined) g.position.z = s.z;
    g.rotation.y = Math.PI + (s.yaw || 0);
    g.visible = s.visible !== false;
    // Spin from the distance actually travelled since last frame, capped at
    // ~20°/frame: scroll-driven travel can be metres per frame, which would
    // alias (wagon-wheel effect) and make the wheels look like they reverse.
    const d = s.dist || 0;
    const delta = spin.current.last === null ? 0 : (d - spin.current.last) / WHEEL_R;
    spin.current.last = d;
    spin.current.angle += Math.max(-0.35, Math.min(0.35, delta));
    const roll = spin.current.angle;
    wheels.forEach((w) => {
      w.rotation.x = roll;
      w.rotation.y = w.name.includes('front') ? (s.yaw || 0) * 1.4 : 0;
    });
    tail.color.setRGB(1, 0.16, 0.24).multiplyScalar(s.brake ? 3.4 : 1.2);
    ind.opacity = s.indicator ? (Math.sin(state.clock.elapsedTime * 9) > 0 ? 1 : 0) : 0;
    glowMat.opacity = s.glow || 0;
    beamMat.uniforms.uI.value = s.beam ?? 1;
    if (flap.current) flap.current.rotation.y = -(s.port || 0) * 1.6;
    portMat.color.setRGB(0.07, 0.87, 0.78).multiplyScalar(0.6 + (s.port || 0) * 2.2 + (s.glow || 0) * 2);
  });

  return (
    <group ref={root}>
      <primitive object={model} />
      <Interior model={key} />
      {beams &&
        [-0.68, 0.68].map((x) => (
          <mesh key={x} position={[x, 0.66, 2.4 + 5]} rotation-x={-Math.PI / 2} material={beamMat}>
            <coneGeometry args={[1.5, 10, 24, 1, true]} />
          </mesh>
        ))}
      {tailBar && (
        <mesh position={[0, 0.86, -2.43]} material={tail}>
          <boxGeometry args={[1.35, 0.045, 0.03]} />
        </mesh>
      )}
      {/* right indicators (model −x is the car's right side) */}
      <mesh position={[-0.82, 0.84, -2.4]} material={ind}>
        <boxGeometry args={[0.16, 0.08, 0.04]} />
      </mesh>
      <mesh position={[-0.82, 0.7, 2.38]} material={ind}>
        <boxGeometry args={[0.16, 0.06, 0.04]} />
      </mesh>
      {underglow && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.03} scale={[3.4, 6.2, 1]} material={glowMat}>
          <planeGeometry />
        </mesh>
      )}
      {port && (
        <group position={PORT_LOCAL}>
          <mesh rotation-y={-Math.PI / 2} material={portMat}>
            <ringGeometry args={[0.06, 0.09, 32]} />
          </mesh>
          <group ref={flap} position={[0, 0, 0.12]}>
            <mesh position={[0, 0, -0.12]}>
              <boxGeometry args={[0.012, 0.2, 0.24]} />
              <meshStandardMaterial color="#cdd3db" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
