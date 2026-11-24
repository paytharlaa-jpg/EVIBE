import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { S } from './state';
import { worldZ } from './timeline';

// Wrap a repeating object so it always sits between `near` and `far` (z),
// moving toward the camera as the hero drives forward.
const wrapZ = (z0, travel, period, near = 40) => {
  const span = period;
  // The car drives toward −z, so roadside objects must stream toward +z
  // (toward and past the camera behind the car) as travel increases.
  const z = (((z0 + travel) % span) + span) % span; // 0..span, grows with travel
  return near - span + z; // near-span … near
};

function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => r.addColorStop(o, col));
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vP; void main(){
          float h = vP.y;
          vec3 top = vec3(0.008,0.02,0.06);
          vec3 hor = vec3(0.02,0.09,0.2);
          vec3 glow = vec3(0.03,0.35,0.42);
          vec3 c = mix(hor, top, smoothstep(0.0, 0.5, h));
          c += glow * exp(-abs(h) * 18.0) * 0.55;
          gl_FragColor = vec4(c, 1.0);
        }`,
      }),
    [],
  );
  const stars = useMemo(() => {
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * 0.45 + 0.05;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 400;
      pos[i * 3 + 1] = Math.sin(ph) * 400;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 400;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const ref = useRef();
  useFrame((st) => ref.current && ref.current.position.copy(st.camera.position));
  return (
    <group ref={ref}>
      <mesh material={mat}>
        <sphereGeometry args={[450, 32, 16]} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial size={1.2} sizeAttenuation={false} color="#bfe9ff" transparent opacity={0.7} fog={false} />
      </points>
    </group>
  );
}

// Instanced repeating props: lane dashes, light poles, light pools, reflector posts.
function Repeaters({ tier }) {
  const dashes = useRef();
  const dashesOpp = useRef();
  const poles = useRef();
  const lamps = useRef();
  const pools = useRef();
  const posts = useRef();
  const N_DASH = 34;
  const N_POLE = 12;
  const N_POST = 40;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const poolTex = useMemo(() => radialTexture([[0, 'rgba(170,240,255,0.55)'], [0.5, 'rgba(120,210,255,0.16)'], [1, 'rgba(0,0,0,0)']]), []);

  useFrame(() => {
    const travel = worldZ(S.p);
    for (let i = 0; i < N_DASH; i++) {
      const z = wrapZ(i * 10, travel, N_DASH * 10);
      dummy.position.set(3.75, 0.012, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      dashes.current.setMatrixAt(i, dummy.matrix);
      dummy.position.x = -4.6;
      dummy.updateMatrix();
      dashesOpp.current.setMatrixAt(i, dummy.matrix);
    }
    dashes.current.instanceMatrix.needsUpdate = true;
    dashesOpp.current.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < N_POLE; i++) {
      const z = wrapZ(i * 32, travel, N_POLE * 32);
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(-0.6, 4.2, z);
      dummy.updateMatrix();
      poles.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(-0.6, 8.35, z);
      dummy.updateMatrix();
      lamps.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(1.6, 0.02, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      pools.current.setMatrixAt(i * 2, dummy.matrix);
      dummy.position.set(-2.8, 0.02, z);
      dummy.updateMatrix();
      pools.current.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    poles.current.instanceMatrix.needsUpdate = true;
    lamps.current.instanceMatrix.needsUpdate = true;
    pools.current.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < N_POST; i++) {
      const z = wrapZ(i * 8, travel, N_POST * 8);
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(7.9, 0.45, z);
      dummy.updateMatrix();
      posts.current.setMatrixAt(i, dummy.matrix);
    }
    posts.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={dashes} args={[null, null, N_DASH]} frustumCulled={false}>
        <planeGeometry args={[0.16, 3.2]} />
        <meshBasicMaterial color="#c9d3df" />
      </instancedMesh>
      <instancedMesh ref={dashesOpp} args={[null, null, N_DASH]} frustumCulled={false}>
        <planeGeometry args={[0.16, 3.2]} />
        <meshBasicMaterial color="#8792a3" />
      </instancedMesh>
      <instancedMesh ref={poles} args={[null, null, N_POLE]} frustumCulled={false}>
        <cylinderGeometry args={[0.09, 0.14, 8.4, 8]} />
        <meshStandardMaterial color="#3a4352" metalness={0.8} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={lamps} args={[null, null, N_POLE]} frustumCulled={false}>
        <boxGeometry args={[5.2, 0.12, 0.34]} />
        <meshBasicMaterial color={new THREE.Color('#d9fbff').multiplyScalar(2.4)} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[null, null, N_POLE * 2]} frustumCulled={false}>
        <planeGeometry args={[7, 9]} />
        <meshBasicMaterial map={poolTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={posts} args={[null, null, N_POST]} frustumCulled={false}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshStandardMaterial color="#cfd6df" emissive="#ff8a1f" emissiveIntensity={tier >= 2 ? 0.35 : 0.2} />
      </instancedMesh>
    </>
  );
}

// Distant city: parallax-shifted towers with lit windows.
function Skyline() {
  const ref = useRef();
  const { geo, mat, count, base } = useMemo(() => {
    const count = 70;
    const base = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      base.push({ x: side * (70 + Math.random() * 90), z: -Math.random() * 520, h: 14 + Math.random() * 60, w: 8 + Math.random() * 14 });
    }
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#060d1e';
    g.fillRect(0, 0, 64, 128);
    for (let y = 4; y < 128; y += 8)
      for (let x = 4; x < 64; x += 8) {
        if (Math.random() < 0.26) {
          g.fillStyle = Math.random() < 0.2 ? '#12ddc6' : Math.random() < 0.5 ? '#ffd9a0' : '#9fc6ff';
          g.fillRect(x, y, 4, 4);
        }
      }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.75, 0.75, 0.8), toneMapped: false });
    return { geo: new THREE.BoxGeometry(1, 1, 1), mat, count, base };
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const shift = worldZ(S.p) * 0.35;
    base.forEach((b, i) => {
      let z = ((b.z + shift + 520) % 560) - 520;
      dummy.position.set(b.x, b.h / 2, z - 60);
      dummy.scale.set(b.w, b.h, b.w);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

export default function World({ tier }) {
  return (
    <>
      <Sky />
      {/* road surface (both carriageways) */}
      <mesh rotation-x={-Math.PI / 2} position={[-0.5, 0, -220]}>
        <planeGeometry args={[17.4, 560]} />
        {tier >= 3 ? (
          <MeshReflectorMaterial
            resolution={512}
            mirror={0.55}
            mixBlur={6}
            mixStrength={4}
            blur={[260, 80]}
            roughness={0.75}
            metalness={0.4}
            color="#0b1220"
            depthScale={0.4}
          />
        ) : (
          <meshStandardMaterial color="#0c1322" roughness={0.42} metalness={0.55} />
        )}
      </mesh>
      {/* shoulders and verge */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -220]}>
        <planeGeometry args={[600, 560]} />
        <meshStandardMaterial color="#050a14" roughness={1} />
      </mesh>
      {/* edge lines + median */}
      <mesh rotation-x={-Math.PI / 2} position={[7.55, 0.011, -220]}>
        <planeGeometry args={[0.14, 560]} />
        <meshBasicMaterial color="#d9e1ea" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.15, 0.011, -220]}>
        <planeGeometry args={[0.14, 560]} />
        <meshBasicMaterial color="#e8b84a" />
      </mesh>
      <mesh position={[-0.6, 0.4, -220]}>
        <boxGeometry args={[0.5, 0.8, 560]} />
        <meshStandardMaterial color="#2a3240" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-0.6, 0.82, -220]}>
        <boxGeometry args={[0.08, 0.05, 560]} />
        <meshBasicMaterial color={new THREE.Color('#12DDC6').multiplyScalar(1.4)} toneMapped={false} />
      </mesh>
      <Repeaters tier={tier} />
      {tier >= 2 && <Skyline />}
    </>
  );
}
