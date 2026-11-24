import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import ChargerModel, { CABLE_START, HOLSTER } from '../three/Charger';
import { S } from './state';
import { BAY_X, CHARGER_X, STATION_Z, worldZ, carPose, plug, charging, stationLights, battery, sstep } from './timeline';

const CS = 0.56; // charger scale relative to cars
const TEAL = new THREE.Color('#12DDC6');

// Model space of a charger rotated to face −x (towards the bay) → world.
function chargerToWorld(v, cx, cz, out) {
  return out.set(cx + -v.z * CS, v.y * CS, cz + v.x * CS);
}

function useImageTexture(draw, w = 1024, h = 256) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    draw(c.getContext('2d'), c, () => (tex.needsUpdate = true));
    return tex;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

function loadImg(src, cb) {
  const im = new Image();
  im.onload = () => cb(im);
  im.src = src;
}

/** A cable that runs from a charger to wherever its connector is. */
function DynamicCable({ chargerZ, getPlug, getTarget, getFx, lightning = true, tier }) {
  const mesh = useRef();
  const conn = useRef();
  const bolts = [useRef(), useRef(), useRef()];
  const arc = useRef();
  const motes = useRef();
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), h: new THREE.Vector3(), t: new THREE.Vector3(), e: new THREE.Vector3(), m: new THREE.Vector3(), a2: new THREE.Vector3(), dir: new THREE.Vector3() }), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0d1626', roughness: 0.45, metalness: 0.3, emissive: TEAL, emissiveIntensity: 0.15 }), []);
  const connMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111a2b', roughness: 0.35, metalness: 0.6 }), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: TEAL.clone().multiplyScalar(2.5), toneMapped: false }), []);
  const last = useRef({ key: '', curve: null, boltT: 0 });
  const N_MOTE = 46;
  const moteGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_MOTE * 3), 3));
    return g;
  }, []);
  const seeds = useMemo(() => Array.from({ length: N_MOTE }, () => Math.random()), []);

  useEffect(() => () => mesh.current?.geometry?.dispose(), []);

  useFrame((state) => {
    const zS = worldZ(S.p) - STATION_Z;
    const cz = zS + chargerZ;
    const u = getPlug();
    const fx = getFx();
    chargerToWorld(CABLE_START, CHARGER_X, cz, tmp.a);
    chargerToWorld(HOLSTER, CHARGER_X, cz, tmp.h);
    getTarget(tmp.t);
    const e = u * u * (3 - 2 * u);
    // connector travels on an arc from holster to port
    tmp.e.lerpVectors(tmp.h, tmp.t, e);
    tmp.e.y += Math.sin(e * Math.PI) * 0.5;
    tmp.dir.subVectors(tmp.t, tmp.h).normalize();
    if (conn.current) {
      conn.current.position.copy(tmp.e);
      if (u > 0.01) conn.current.lookAt(tmp.e.x + tmp.dir.x, tmp.e.y + tmp.dir.y * (1 - e) - (1 - e) * 0.8, tmp.e.z + tmp.dir.z);
      else conn.current.rotation.set(-Math.PI / 2, 0, 0);
    }
    // rebuild the tube only when the cable actually moves
    const key = `${tmp.a.x.toFixed(2)},${tmp.a.z.toFixed(2)},${tmp.e.x.toFixed(3)},${tmp.e.y.toFixed(3)},${tmp.e.z.toFixed(3)}`;
    if (key !== last.current.key) {
      last.current.key = key;
      tmp.a2.set(tmp.a.x - 0.04, tmp.a.y - 0.32, tmp.a.z + 0.06);
      const back = tmp.e.clone().addScaledVector(tmp.dir, u > 0.01 ? -0.12 : 0).add(new THREE.Vector3(0, u > 0.01 ? 0 : -0.08, 0));
      tmp.m.lerpVectors(tmp.a2, back, 0.5);
      const sag = 0.18 + (1 - e) * 0.42;
      tmp.m.y = Math.max(0.05, Math.min(tmp.a2.y, back.y) - sag);
      const curve = new THREE.CatmullRomCurve3([tmp.a.clone(), tmp.a2.clone(), tmp.m.clone(), back]);
      last.current.curve = curve;
      const g = new THREE.TubeGeometry(curve, 56, 0.026, 8, false);
      mesh.current.geometry.dispose();
      mesh.current.geometry = g;
    }
    const curve = last.current.curve;
    const t = state.clock.elapsedTime;
    mat.emissiveIntensity = 0.15 + fx * (1.4 + Math.sin(t * 18) * 0.5);
    ringMat.color.copy(TEAL).multiplyScalar(1 + u * 2 + fx * 2);

    // lightning: jagged polylines hugging the cable, re-rolled ~16×/s
    if (lightning && curve) {
      const show = fx > 0.02;
      if (show && t - last.current.boltT > 0.06) {
        last.current.boltT = t;
        bolts.forEach((b, bi) => {
          if (!b.current) return;
          const pts = [];
          const n = 26;
          for (let i = 0; i <= n; i++) {
            const p = curve.getPointAt(i / n);
            const amp = (bi === 0 ? 0.17 : 0.1) * Math.sin((i / n) * Math.PI) + 0.015;
            pts.push(p.x + (Math.random() - 0.5) * amp, p.y + (Math.random() - 0.5) * amp, p.z + (Math.random() - 0.5) * amp);
          }
          b.current.geometry.setPositions(pts);
        });
        if (arc.current) {
          const pts = [];
          for (let i = 0; i <= 8; i++) {
            const p = tmp.e.clone().lerp(tmp.t, i / 8);
            pts.push(p.x + (Math.random() - 0.5) * 0.08, p.y + (Math.random() - 0.5) * 0.12, p.z + (Math.random() - 0.5) * 0.08);
          }
          arc.current.geometry.setPositions(pts);
        }
      }
      bolts.forEach((b, bi) => {
        if (!b.current) return;
        b.current.visible = show && Math.random() > 0.25 - bi * 0.05;
        b.current.material.opacity = fx;
      });
      if (arc.current) {
        arc.current.visible = show && Math.random() > 0.5;
        arc.current.material.opacity = fx;
      }
      // energy motes streaming from charger to car
      if (motes.current) {
        const arr = moteGeo.attributes.position.array;
        for (let i = 0; i < N_MOTE; i++) {
          const k = (seeds[i] + t * (0.35 + seeds[i] * 0.3)) % 1;
          const p = curve.getPointAt(k);
          arr[i * 3] = p.x + Math.sin(t * 7 + i) * 0.025;
          arr[i * 3 + 1] = p.y + Math.cos(t * 6 + i) * 0.025;
          arr[i * 3 + 2] = p.z;
        }
        moteGeo.attributes.position.needsUpdate = true;
        motes.current.visible = show;
        motes.current.material.opacity = fx;
      }
    }
  });

  return (
    <>
      <mesh ref={mesh} material={mat}>
        <bufferGeometry />
      </mesh>
      <group ref={conn}>
        <mesh material={connMat} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.042, 0.2, 20]} />
        </mesh>
        <mesh material={ringMat} position-z={0.1}>
          <torusGeometry args={[0.044, 0.007, 8, 28]} />
        </mesh>
      </group>
      {lightning &&
        bolts.map((b, i) => (
          <Line
            key={i}
            ref={b}
            points={[
              [0, 0, 0],
              [0, 0.01, 0],
            ]}
            color={i === 0 ? new THREE.Color(2.6, 3.4, 3.6) : new THREE.Color(0.4, 2.6, 2.4)}
            lineWidth={i === 0 ? 3 : 1.8}
            transparent
            toneMapped={false}
            visible={false}
          />
        ))}
      {lightning && (
        <Line ref={arc} points={[[0, 0, 0], [0, 0.01, 0]]} color={new THREE.Color(3, 3.6, 3.8)} lineWidth={1.8} transparent toneMapped={false} visible={false} />
      )}
      {lightning && tier >= 2 && (
        <points ref={motes} geometry={moteGeo} frustumCulled={false}>
          <pointsMaterial size={0.06} color={new THREE.Color(0.6, 3, 2.6)} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </points>
      )}
    </>
  );
}

// Rings radiating on the ground under the charging car.
function ChargeRings() {
  const refs = [useRef(), useRef(), useRef()];
  const mats = useMemo(() => refs.map(() => new THREE.MeshBasicMaterial({ color: TEAL.clone().multiplyScalar(2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((state) => {
    const fx = charging(S.p);
    const car = carPose(S.p);
    const t = state.clock.elapsedTime;
    refs.forEach((r, i) => {
      if (!r.current) return;
      const k = (t * 0.6 + i / 3) % 1;
      r.current.position.set(car.x, 0.02, car.z);
      r.current.scale.setScalar(0.6 + k * 3.2);
      mats[i].opacity = (1 - k) * 0.7 * fx;
      r.current.visible = fx > 0.01;
    });
  });
  return refs.map((r, i) => (
    <mesh key={i} ref={r} rotation-x={-Math.PI / 2} material={mats[i]}>
      <ringGeometry args={[0.95, 1, 64]} />
    </mesh>
  ));
}

export default function Station({ tier }) {
  const root = useRef();
  const charge = useRef(0.08);
  const glow = useRef(0.2);
  const glowB = useRef(0.8);
  const chargeB = useRef(0.64);
  const canopyLight = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), []);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: TEAL.clone(), toneMapped: false }), []);
  const lamp1 = useRef();
  const lamp2 = useRef();

  const fascia = useImageTexture((g, c, done) => {
    g.fillStyle = '#071B3C';
    g.fillRect(0, 0, c.width, c.height);
    loadImg('/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg', (im) => {
      const h = 150;
      const w = (im.width / im.height) * h;
      g.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
      done();
    });
  });
  const totem = useImageTexture(
    (g, c, done) => {
      const grd = g.createLinearGradient(0, 0, 0, c.height);
      grd.addColorStop(0, '#0a2550');
      grd.addColorStop(1, '#071B3C');
      g.fillStyle = grd;
      g.fillRect(0, 0, c.width, c.height);
      loadImg('/brand/EVIBE_Stacked_no_Tagline_Reverse.svg', (im) => {
        const w = 300;
        const h = (im.height / im.width) * w;
        g.drawImage(im, (c.width - w) / 2, 70, w, h);
        g.fillStyle = '#12DDC6';
        g.font = '800 46px "Red Hat Display", sans-serif';
        g.textAlign = 'center';
        g.fillText('EV CHARGING', c.width / 2, 120 + h + 40);
        g.fillStyle = '#E6E9EE';
        g.font = '600 34px "Plus Jakarta Sans", sans-serif';
        g.fillText('AC  ·  DC FAST', c.width / 2, 120 + h + 100);
        g.fillStyle = '#88EE15';
        g.fillRect(c.width / 2 - 70, 120 + h + 140, 140, 8);
        done();
      });
    },
    400,
    1000,
  );
  const bayMark = useImageTexture(
    (g, c) => {
      g.clearRect(0, 0, c.width, c.height);
      g.strokeStyle = 'rgba(18,221,198,0.9)';
      g.lineWidth = 10;
      g.strokeRect(10, 10, c.width - 20, c.height - 20);
      g.fillStyle = 'rgba(18,221,198,0.85)';
      g.beginPath();
      const cx = c.width / 2;
      const cy = c.height / 2;
      g.moveTo(cx + 30, cy - 110);
      g.lineTo(cx - 50, cy + 10);
      g.lineTo(cx - 2, cy + 10);
      g.lineTo(cx - 30, cy + 110);
      g.lineTo(cx + 50, cy - 10);
      g.lineTo(cx + 2, cy - 10);
      g.closePath();
      g.fill();
    },
    256,
    512,
  );

  useFrame((state) => {
    const p = S.p;
    const zS = worldZ(p) - STATION_Z;
    root.current.position.z = zS;
    root.current.visible = zS > -260;
    const L = stationLights(p);
    const t = state.clock.elapsedTime;
    canopyLight.color.setRGB(0.85, 0.97, 1).multiplyScalar(0.04 + L * 0.5);
    edge.color.copy(TEAL).multiplyScalar(0.1 + L * (2.2 + Math.sin(t * 2) * 0.3));
    if (lamp1.current) lamp1.current.intensity = L * 16;
    if (lamp2.current) lamp2.current.intensity = L * 12;
    const fx = charging(p);
    charge.current = battery(p);
    glow.current = 0.2 + L * 0.6 + fx * 1.2;
    glowB.current = 0.3 + L * 0.9;
    chargeB.current = 0.64 + ((t * 0.01) % 0.3);
    fascia.needsUpdate = fascia.needsUpdate || false;
  });

  const heroTarget = (out) => {
    const c = carPose(S.p);
    return out.set(c.x + 1.0, 0.86, c.z + 1.55);
  };
  const vanTarget = (out) => out.set(BAY_X + 1.0, 0.86, -9.6 + 1.55);

  return (
    <>
      <group ref={root}>
        {/* service area pad + bay marks */}
        <mesh rotation-x={-Math.PI / 2} position={[CHARGER_X - 2.4, 0.006, -4]}>
          <planeGeometry args={[10, 34]} />
          <meshStandardMaterial color="#141d2e" roughness={0.38} metalness={0.5} />
        </mesh>
        {[0.2, -9.6].map((z) => (
          <mesh key={z} rotation-x={-Math.PI / 2} position={[BAY_X, 0.012, z]}>
            <planeGeometry args={[3, 5.8]} />
            <meshBasicMaterial map={bayMark} transparent depthWrite={false} toneMapped={false} opacity={0.75} />
          </mesh>
        ))}

        {/* canopy */}
        <mesh position={[CHARGER_X - 1.6, 4.15, -4.6]}>
          <boxGeometry args={[7.6, 0.42, 18.4]} />
          <meshStandardMaterial color="#0b1730" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[CHARGER_X - 1.6, 3.93, -4.6]} rotation-x={Math.PI / 2} material={canopyLight}>
          <planeGeometry args={[6.4, 16.6]} />
        </mesh>
        <mesh position={[CHARGER_X - 1.6, 4.38, 4.62]} material={edge}>
          <boxGeometry args={[7.62, 0.05, 0.05]} />
        </mesh>
        <mesh position={[CHARGER_X - 5.42, 4.15, -4.6]} material={edge}>
          <boxGeometry args={[0.05, 0.05, 18.4]} />
        </mesh>
        <mesh position={[CHARGER_X - 1.6, 4.15, 4.62]}>
          <planeGeometry args={[5.4, 1.35]} />
          <meshBasicMaterial map={fascia} toneMapped={false} />
        </mesh>
        {[4.3, -13.4].map((z) => (
          <mesh key={z} position={[CHARGER_X + 1.7, 2, z]}>
            <cylinderGeometry args={[0.16, 0.16, 4, 16]} />
            <meshStandardMaterial color="#c9d1dc" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <pointLight ref={lamp1} position={[BAY_X, 3.6, 0.4]} distance={13} decay={1.6} color="#e9fbff" />
        <pointLight ref={lamp2} position={[BAY_X, 3.4, -9.4]} distance={12} decay={1.6} color="#bff6ff" />

        {/* totem sign before the entrance */}
        <group position={[8.8, 0, 20]}>
          <mesh position-y={3.2}>
            <boxGeometry args={[1.5, 6.4, 0.5]} />
            <meshStandardMaterial color="#0a1a36" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.3, 0.26]}>
            <planeGeometry args={[1.36, 3.4]} />
            <meshBasicMaterial map={totem} toneMapped={false} />
          </mesh>
          <mesh position={[0, 6.45, 0]} material={edge}>
            <boxGeometry args={[1.52, 0.06, 0.52]} />
          </mesh>
        </group>

        {/* chargers */}
        <group position={[CHARGER_X, 0, 1.5]} rotation-y={-Math.PI / 2} scale={CS}>
          <ChargerModel tier={tier} chargeRef={charge} glowRef={glow} dynamicCable motes={false} ring={false} />
        </group>
        <group position={[CHARGER_X, 0, -8.1]} rotation-y={-Math.PI / 2} scale={CS}>
          <ChargerModel tier={tier} chargeRef={chargeB} glowRef={glowB} dynamicCable motes={false} ring={false} />
        </group>
      </group>

      {/* cables live in world space (they connect to the cars) */}
      <DynamicCable tier={tier} chargerZ={1.5} getPlug={() => plug(S.p)} getTarget={heroTarget} getFx={() => charging(S.p)} />
      <DynamicCable
        tier={tier}
        chargerZ={-8.1}
        lightning={false}
        getPlug={() => 1}
        getTarget={(o) => vanTarget(o).setZ(worldZ(S.p) - STATION_Z - 8.05)}
        getFx={() => stationLights(S.p) * 0.25}
      />
      <ChargeRings />
    </>
  );
}

export { sstep };
