import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CABLE_START } from '../three/Charger';
import { Car } from '../story/Cars';
import { SS } from './state';
import { SIG_X, FLAG_X, sigCar, sigCharge, sigPlug, flagCar, flagCharge, flagPlug, flagBolts } from './timeline';
import { toWorld, portOf, PlugCable, Pedestal, useRefFn, canvasTex } from './parts';
import { Gate, PEOPLE, Person, Prop, useProps, useWood, signTex, Coffee } from './Cafe';

// ── 02 EVIBE Signature (blue) and 03 EVIBE Flagship (gold) ─────────────────────
// Built from the same kit as the Starter café so the three read as one family:
// a branded DC charging canopy in front, a glass pavilion behind with F&B,
// seating, amenities and real people. DC charging only.
const BLUE = new THREE.Color('#2f8dff');
const GOLD = new THREE.Color('#e8b44c');
const WARM = '#ffc98a';

// ── shared pieces ─────────────────────────────────────────────
function Ground({ cx }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[cx, 0, 0]}>
      <planeGeometry args={[52, 52]} />
      <meshStandardMaterial color="#101826" roughness={0.68} metalness={0.15} />
    </mesh>
  );
}

function Bays({ xs, color }) {
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(0.22), toneMapped: false, transparent: true, opacity: 0.6 }), [color]);
  return xs.map((x) => (
    <group key={x}>
      {[-1.45, 1.45].map((dx) => (
        <mesh key={dx} rotation-x={-Math.PI / 2} position={[x + dx, 0.024, 0.4]}>
          <planeGeometry args={[0.08, 5.6]} />
          <meshBasicMaterial color="#cfd8e3" />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[x, 0.018, 0.3]} material={fill}>
        <planeGeometry args={[2.8, 5.6]} />
      </mesh>
    </group>
  ));
}

// A premium branded canopy: deep fascia, glowing underside, tier-colour light lines.
function Canopy({ cx, w, color, sign, h = 4.3, d = 6.6, pillars = 2 }) {
  const strip = useMemo(() => new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(2.6), toneMapped: false }), [color]);
  const xs = pillars === 2 ? [-w / 2 + 0.4, w / 2 - 0.4] : [-w / 2 + 0.4, 0, w / 2 - 0.4];
  return (
    <group position={[cx, 0, 0.6]}>
      <mesh position-y={h}>
        <boxGeometry args={[w, 0.5, d]} />
        <meshStandardMaterial color="#0b1730" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position-y={h - 0.26} rotation-x={Math.PI / 2}>
        <planeGeometry args={[w - 0.6, d - 0.6]} />
        <meshBasicMaterial color={new THREE.Color('#e4f6ff').multiplyScalar(0.42)} toneMapped={false} />
      </mesh>
      {/* tier-colour light lines: front, back and a halo under the edge */}
      <mesh position={[0, h + 0.27, d / 2 + 0.01]} material={strip}>
        <boxGeometry args={[w, 0.045, 0.045]} />
      </mesh>
      <mesh position={[0, h - 0.27, d / 2 + 0.01]} material={strip}>
        <boxGeometry args={[w, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, h + 0.27, -d / 2 - 0.01]} material={strip}>
        <boxGeometry args={[w, 0.045, 0.045]} />
      </mesh>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, h, 0]} material={strip}>
          <boxGeometry args={[0.045, 0.045, d]} />
        </mesh>
      ))}
      <mesh position={[0, h, d / 2 + 0.02]}>
        <planeGeometry args={[Math.min(7.2, w * 0.4), 0.46]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {xs.map((x) => (
        <group key={x} position={[x, 0, -d / 2 + 0.6]}>
          <mesh position-y={h / 2}>
            <boxGeometry args={[0.34, h, 0.34]} />
            <meshStandardMaterial color="#c9d1dc" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, h / 2, 0.175]} material={strip}>
            <boxGeometry args={[0.04, h - 0.4, 0.01]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Glass pavilion: wood floor, slatted ceiling, glass front with an open door.
function Pavilion({ cx, w, zF, zB, h = 3.6, door = 0, sign, color }) {
  const wood = useWood();
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#a9d6e6', transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0.1, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const strip = useMemo(() => new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(2.2), toneMapped: false }), [color]);
  const depth = zF - zB;
  const zc = (zF + zB) / 2;
  const mull = [];
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 1.8) mull.push(x);
  return (
    <group position-x={cx}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, zc]}>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial map={wood} roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[0, h / 2, zB]}>
        <boxGeometry args={[w + 0.3, h, 0.2]} />
        <meshStandardMaterial color="#1c2331" roughness={0.8} />
      </mesh>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, h / 2, zc]}>
          <boxGeometry args={[0.2, h, depth]} />
          <meshStandardMaterial color="#232b3a" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.17, zc + 0.3]}>
        <boxGeometry args={[w + 0.6, 0.34, depth + 0.9]} />
        <meshStandardMaterial color="#0d1422" roughness={0.6} metalness={0.3} />
      </mesh>
      {Array.from({ length: Math.floor(w / 0.66) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.35 + i * 0.66, h - 0.06, zc]}>
          <boxGeometry args={[0.1, 0.08, depth - 0.2]} />
          <meshStandardMaterial color="#6b4a2f" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.17, zF + 0.17]}>
        <planeGeometry args={[6.4, 0.8]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 0.36, zF + 0.18]} material={strip}>
        <boxGeometry args={[w + 0.6, 0.035, 0.035]} />
      </mesh>
      {mull.map((mx) => (
        <mesh key={mx} position={[mx, h / 2, zF]}>
          <boxGeometry args={[0.06, h, 0.08]} />
          <meshStandardMaterial color="#1a2232" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {mull.slice(0, -1).map((mx) =>
        Math.abs(mx - door) < 0.01 ? null : (
          <mesh key={`g${mx}`} position={[mx + 0.9, h / 2, zF]} material={glass}>
            <planeGeometry args={[1.74, h]} />
          </mesh>
        ),
      )}
      <mesh position={[0, 0.05, zF]}>
        <boxGeometry args={[w, 0.08, 0.14]} />
        <meshStandardMaterial color="#1a2232" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function menuTex(label, items, color) {
  return canvasTex(512, 256, (g, c) => {
    g.fillStyle = '#0a1426';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, 8);
    g.font = '900 64px "Red Hat Display", sans-serif';
    g.textAlign = 'center';
    g.fillText(label, c.width / 2, 98);
    g.fillStyle = 'rgba(238,242,247,0.82)';
    g.font = '600 30px "Plus Jakarta Sans", sans-serif';
    g.fillText(items, c.width / 2, 170);
    g.fillStyle = 'rgba(238,242,247,0.35)';
    g.fillRect(c.width / 2 - 60, 206, 120, 3);
  });
}

// A food & beverage outlet: counter, glowing menu board, warm light.
function Outlet({ x, z, w = 4, label, items, color }) {
  const tex = useMemo(() => menuTex(label, items, `#${color.getHexString()}`), [label, items, color]);
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.52}>
        <boxGeometry args={[w, 1.04, 0.7]} />
        <meshStandardMaterial color="#4d3322" roughness={0.55} />
      </mesh>
      <mesh position-y={1.06}>
        <boxGeometry args={[w + 0.2, 0.05, 0.84]} />
        <meshPhysicalMaterial color="#ece7df" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0.36]}>
        <boxGeometry args={[w, 0.025, 0.02]} />
        <meshBasicMaterial color={color.clone().multiplyScalar(2)} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.45, -1.15]}>
        <planeGeometry args={[Math.min(w - 0.4, 3.2), 1.6]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {Array.from({ length: Math.floor(w / 0.5) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.3 + i * 0.5, 1.6 + (i % 2) * 0.05, -1.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.16 + (i % 3) * 0.05, 12]} />
          <meshStandardMaterial color={['#e9e4dc', '#2b3647', '#b8865a'][i % 3]} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, -1.2]}>
        <boxGeometry args={[w, 0.05, 0.3]} />
        <meshStandardMaterial color="#3a2a1d" />
      </mesh>
    </group>
  );
}

function iconTex(lines, color) {
  return canvasTex(512, 320, (g, c) => {
    g.fillStyle = '#0a1426';
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = color;
    g.lineWidth = 4;
    g.strokeRect(10, 10, c.width - 20, c.height - 20);
    g.textAlign = 'left';
    lines.forEach((l, i) => {
      g.fillStyle = color;
      g.beginPath();
      g.arc(54, 78 + i * 82, 12, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#eef2f7';
      g.font = '800 40px "Red Hat Display", sans-serif';
      g.fillText(l, 86, 92 + i * 82);
    });
  });
}

// EVIBE Miles: the membership & rewards wall in the Flagship lounge.
function milesTex() {
  return canvasTex(1024, 440, (g, c, done) => {
    const gr = g.createLinearGradient(0, 0, c.width, c.height);
    gr.addColorStop(0, '#071b3c');
    gr.addColorStop(1, '#0b2a5a');
    g.fillStyle = gr;
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = 'rgba(255,255,255,0.1)';
    g.lineWidth = 26;
    g.beginPath();
    g.arc(800, 220, 130, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#e8b44c';
    g.beginPath();
    g.arc(800, 220, 130, -Math.PI / 2, Math.PI * 1.1);
    g.stroke();
    g.fillStyle = '#fff';
    g.font = '900 64px "Red Hat Display", sans-serif';
    g.textAlign = 'center';
    g.fillText('MILES', 800, 240);
    g.textAlign = 'left';
    g.fillStyle = '#e8b44c';
    g.font = '800 30px "Red Hat Display", sans-serif';
    g.fillText('EVIBE MILES', 70, 120);
    g.fillStyle = '#fff';
    g.font = '900 62px "Red Hat Display", sans-serif';
    g.fillText('Charge. Dine.', 70, 200);
    g.fillText('Earn rewards.', 70, 270);
    g.fillStyle = 'rgba(238,242,247,0.7)';
    g.font = '600 28px "Plus Jakarta Sans", sans-serif';
    g.fillText('Membership & rewards across EVIBE destinations', 70, 340);
    const im = new Image();
    im.onload = () => {
      g.drawImage(im, 70, 30, (im.width / im.height) * 46, 46);
      done();
    };
    im.src = '/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg';
  });
}

function Umbrella({ x, z, color }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={1.2}>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial color="#cfd5dc" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={2.35}>
        <coneGeometry args={[1.35, 0.45, 8, 1, true]} />
        <meshStandardMaterial color="#efe9df" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position-y={2.13} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.33, 0.02, 6, 32]} />
        <meshBasicMaterial color={color.clone().multiplyScalar(2)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Festoon lights strung over the terrace (one instanced draw call)
function StringLights({ x0, x1, z, y = 3.2, n = 26 }) {
  const setRef = (m) => {
    if (!m || m.userData.done) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      o.position.set(x0 + (x1 - x0) * t, y - Math.sin(t * Math.PI * 3) ** 2 * 0.35, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.userData.done = true;
  };
  return (
    <instancedMesh ref={setRef} args={[undefined, undefined, n]} frustumCulled={false}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={new THREE.Color('#ffd59c').multiplyScalar(2.4)} toneMapped={false} />
    </instancedMesh>
  );
}

function Pendant({ get, x, z, h }) {
  return (
    <group>
      <Prop get={get} name="modern_ceiling_lamp_01" position={[x, h - 1.0, z]} />
      <mesh position={[x, h - 0.98, z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color={new THREE.Color('#ffd59c').multiplyScalar(3)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// A table for two; `who` sits in the chair facing +z rotated by `rot`.
function Table({ get, x, z, rot = 0, who, clip = 'sit', offset = 0, cup = true }) {
  const f = [Math.sin(rot), Math.cos(rot)];
  return (
    <group>
      <Prop get={get} name="round_wooden_table_01" position={[x + f[0] * 0.77, 0, z + f[1] * 0.77]} scale={0.62} />
      <Prop get={get} name="dining_chair_02" position={[x - f[0] * 0.08, 0, z - f[1] * 0.08]} rotation={rot} />
      <Prop get={get} name="dining_chair_02" position={[x + f[0] * 1.55, 0, z + f[1] * 1.55]} rotation={rot + Math.PI} />
      {cup && <Coffee position={[x + f[0] * 0.6, 0.628, z + f[1] * 0.6]} rotation={rot} />}
      {who && <Person url={who} clip={clip} position={[x, 0, z]} rotation={rot} offset={offset} />}
    </group>
  );
}

// ── 02 EVIBE Signature ────────────────────────────────────────
function Signature({ tier }) {
  const get = useProps();
  const X = SIG_X;
  const canopySign = useMemo(() => signTex('SIGNATURE', '', 1024, 160, '#5aa7ff'), []);
  const fascia = useMemo(() => signTex('SIGNATURE', 'CAFÉ · F&B · LOUNGE · DC CHARGING', 1024, 256, '#5aa7ff'), []);
  const amen = useMemo(() => iconTex(['Restrooms', 'Customer desk', 'Lounge'], '#5aa7ff'), []);
  const xs = [X - 6.9, X - 2.3, X + 2.3, X + 6.9];
  const hero = xs[1];
  const charge = useRefFn(() => sigCharge(SS.p));
  const glow = useRefFn(() => 0.3 + sigPlug(SS.p) * 1.1);
  const busy = useRef(0.7);
  const full = useRef(1);
  const gIdle = useRef(0.8);
  const H = 3.6;
  return (
    <Gate from={0.37} to={0.705}>
      <Ground cx={X} />
      <Bays xs={xs} color={BLUE} />
      <Canopy cx={X} w={19.6} color={BLUE} sign={canopySign} />
      <Pavilion cx={X} w={20} zF={-5.5} zB={-14} h={H} door={-1} sign={fascia} color={BLUE} />
      {/* café + F&B on the left */}
      <Outlet x={X - 6.6} z={-12.4} w={4.4} label="CAFÉ" items="Espresso · Cappuccino · Cold brew" color={BLUE} />
      <Outlet x={X - 2.2} z={-12.4} w={3.4} label="F&B" items="Snacks · Juices · Bakery" color={BLUE} />
      {[-7.6, -6.6, -5.6].map((dx) => (
        <Prop key={dx} get={get} name="bar_chair_round_01" position={[X + dx, 0, -11.7]} scale={1.12} />
      ))}
      <Person url={PEOPLE.barista} clip="idle" position={[X - 6.2, 0, -13.25]} rotation={0} offset={3} />
      {/* indoor seating */}
      <Table get={get} x={X - 4.6} z={-9.4} who={PEOPLE.a} offset={4} />
      <Table get={get} x={X - 0.6} z={-9.4} who={PEOPLE.c} offset={2} />
      <Table get={get} x={X - 2.6} z={-7.2} rot={Math.PI / 2} cup={false} />
      {[
        [-4.6, -8.6],
        [-0.6, -8.6],
        [-6.6, -12.4],
        [-2.2, -12.4],
      ].map(([dx, z]) => (
        <Pendant key={`${dx}${z}`} get={get} x={X + dx} z={z + 0.4} h={H} />
      ))}
      {/* amenities + lounge on the right */}
      <mesh position={[X + 3.4, H / 2, -11.3]}>
        <boxGeometry args={[0.16, H, 5.4]} />
        <meshStandardMaterial color="#202938" roughness={0.8} />
      </mesh>
      <mesh position={[X + 6.6, 1.95, -13.88]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshBasicMaterial map={amen} toneMapped={false} />
      </mesh>
      <Prop get={get} name="sofa_03" position={[X + 8.8, 0, -10]} rotation={-Math.PI / 2} scale={0.9} />
      <Prop get={get} name="modern_coffee_table_01" position={[X + 7.4, 0, -10]} />
      <Prop get={get} name="modern_arm_chair_01" position={[X + 5.6, 0, -10]} rotation={Math.PI / 2} />
      <Person url={PEOPLE.b} clip="sit" position={[X + 5.6, 0, -10]} rotation={Math.PI / 2} offset={6} />
      <Prop get={get} name="potted_plant_01" position={[X + 9.2, 0, -6.3]} />
      <Prop get={get} name="potted_plant_02" position={[X - 9.2, 0, -6.3]} />
      <Prop get={get} name="planter_box_01" position={[X - 4.6, 0, -3.8]} />
      <Prop get={get} name="planter_box_01" position={[X + 4.6, 0, -3.8]} />
      {/* chargers + cars */}
      {xs.map((x, i) => (
        <Pedestal key={x} tier={tier} x={x + 1.95} z={1.5} scale={0.5} charge={i === 1 ? charge : i === 0 ? busy : full} glow={i === 1 ? glow : gIdle} />
      ))}
      <Car model="amg" paint="#e9edf2" drive={() => ({ x: xs[0], z: 0, dist: 0, glow: 0.35, port: 1, beam: 0 })} beams={false} port underglow tailBar={false} />
      <PlugCable from={toWorld(CABLE_START, xs[0] + 1.95, 1.5, 0.5)} to={portOf(xs[0], 0)} reveal={() => 1} glow={() => 0.8} />
      <Car model="mustang" paint="#20262f" drive={() => ({ x: xs[3], z: 0, dist: 0, glow: 0.3, port: 1, beam: 0 })} beams={false} port underglow />
      <PlugCable from={toWorld(CABLE_START, xs[3] + 1.95, 1.5, 0.5)} to={portOf(xs[3], 0)} reveal={() => 1} glow={() => 0.6} />
      <Car
        model="challenger"
        paint="#b3121c"
        drive={() => {
          const c = sigCar(SS.p);
          return { visible: c.z < 12.5, x: hero, z: c.z, dist: c.dist, brake: SS.p > 0.47 && SS.p < 0.51, glow: 0.2 + sigPlug(SS.p) * 0.7, port: SS.p > 0.49 ? 1 : 0, beam: 1 - sigPlug(SS.p) * 0.8 };
        }}
        port
        underglow
      />
      <PlugCable from={toWorld(CABLE_START, hero + 1.95, 1.5, 0.5)} to={portOf(hero, 0)} reveal={() => sigPlug(SS.p)} glow={() => sigPlug(SS.p)} />
    </Gate>
  );
}

// ── 03 EVIBE Flagship ─────────────────────────────────────────
function Pylon({ x, z }) {
  const tex = useMemo(
    () =>
      canvasTex(256, 1024, (g, c, done) => {
        g.fillStyle = '#071b3c';
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#e8b44c';
        g.fillRect(0, 0, c.width, 10);
        g.fillRect(0, c.height - 10, c.width, 10);
        g.font = '900 44px "Red Hat Display", sans-serif';
        g.textAlign = 'center';
        g.fillText('FLAGSHIP', c.width / 2, 520);
        g.fillStyle = 'rgba(238,242,247,0.85)';
        g.font = '700 26px "Plus Jakarta Sans", sans-serif';
        ['DC CHARGING', 'CAFÉ & F&B', 'LOUNGE', 'EVIBE MILES'].forEach((t, i) => g.fillText(t, c.width / 2, 640 + i * 70));
        const im = new Image();
        im.onload = () => {
          const w = 200;
          g.drawImage(im, (c.width - w) / 2, 330, w, (im.height / im.width) * w);
          done();
        };
        im.src = '/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg';
      }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={3.6}>
        <boxGeometry args={[1.5, 7.2, 0.5]} />
        <meshStandardMaterial color="#0b1730" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.6, 0.26]}>
        <planeGeometry args={[1.3, 5.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.6, -0.26]} rotation-y={Math.PI}>
        <planeGeometry args={[1.3, 5.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {[-0.77, 0.77].map((dx) => (
        <mesh key={dx} position={[dx, 3.6, 0]}>
          <boxGeometry args={[0.04, 7.2, 0.52]} />
          <meshBasicMaterial color={GOLD.clone().multiplyScalar(2.6)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Flagship({ tier }) {
  const get = useProps();
  const X = FLAG_X;
  const canopySign = useMemo(() => signTex('FLAGSHIP', '', 1024, 160, '#e8b44c'), []);
  const fascia = useMemo(() => signTex('FLAGSHIP', 'CHARGE · DINE · DISCOVER · EXPERIENCE', 1024, 256, '#e8b44c'), []);
  const miles = useMemo(milesTex, []);
  const xs = [X - 11.5, X - 6.9, X - 2.3, X + 2.3, X + 6.9, X + 11.5];
  const hero = xs[3];
  const charge = useRefFn(() => flagCharge(SS.p));
  const glow = useRefFn(() => 0.4 + flagPlug(SS.p) * 1.4);
  const busy = useRef(0.55);
  const full = useRef(1);
  const gIdle = useRef(0.8);
  const H = 4;
  const ZF = -7.2;
  const ZB = -17;
  return (
    <Gate from={0.68} to={1.01}>
      <Ground cx={X} />
      <Bays xs={xs} color={GOLD} />
      <Canopy cx={X} w={28.6} color={GOLD} sign={canopySign} h={4.6} pillars={3} />
      <Pylon x={X + 16} z={5} />
      {/* terrace: outdoor seating under umbrellas and festoon lights */}
      {[-10, -4.2, 4.2, 10].map((dx) => (
        <group key={dx}>
          <Prop get={get} name="outdoor_table_chair_set_01" position={[X + dx, 0, -5.1]} rotation={Math.PI / 2} />
          <Umbrella x={X + dx} z={-5.1} color={GOLD} />
        </group>
      ))}
      <StringLights x0={X - 15} x1={X + 15} z={-4} y={3.4} n={34} />
      {[-15, 15].map((dx) => (
        <mesh key={dx} position={[X + dx, 1.75, -4]}>
          <cylinderGeometry args={[0.05, 0.05, 3.5, 8]} />
          <meshStandardMaterial color="#cfd5dc" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {[-13, -1.2, 1.2, 13].map((dx) => (
        <Prop key={dx} get={get} name="planter_box_01" position={[X + dx, 0, -3.3]} />
      ))}
      <Pavilion cx={X} w={32} zF={ZF} zB={ZB} h={H} door={2} sign={fascia} color={GOLD} />
      {/* three F&B outlets */}
      <Outlet x={X - 12.2} z={-15.4} w={4.6} label="CAFÉ" items="Espresso · Tea · Cold brew" color={GOLD} />
      <Outlet x={X - 6.9} z={-15.4} w={4.6} label="KITCHEN" items="Bowls · Wraps · Sandwiches" color={GOLD} />
      <Outlet x={X - 1.6} z={-15.4} w={4.6} label="DESSERTS" items="Ice cream · Cakes · Shakes" color={GOLD} />
      <Person url={PEOPLE.barista} clip="idle" position={[X - 12, 0, -16.25]} rotation={0} offset={1} />
      {/* indoor dining */}
      <Table get={get} x={X - 10.5} z={-11.6} who={PEOPLE.a} offset={3} />
      <Table get={get} x={X - 6.5} z={-11.6} who={PEOPLE.c} offset={7} />
      <Table get={get} x={X - 2.5} z={-11.6} cup={false} />
      <Table get={get} x={X - 8.5} z={-9.2} rot={Math.PI / 2} cup={false} />
      {[
        [-10.5, -10.8],
        [-6.5, -10.8],
        [-2.5, -10.8],
        [-12.2, -15.4],
        [-6.9, -15.4],
        [-1.6, -15.4],
      ].map(([dx, z]) => (
        <Pendant key={`${dx}${z}`} get={get} x={X + dx} z={z + 0.3} h={H} />
      ))}
      {/* premium lounge + EVIBE Miles wall */}
      <mesh position={[X + 9.5, 2.2, ZB + 0.14]}>
        <planeGeometry args={[7.4, 3.2]} />
        <meshBasicMaterial map={miles} toneMapped={false} />
      </mesh>
      <mesh position={[X + 9.5, 2.2, ZB + 0.12]}>
        <planeGeometry args={[7.7, 3.5]} />
        <meshBasicMaterial color={GOLD.clone().multiplyScalar(0.7)} toneMapped={false} />
      </mesh>
      <Prop get={get} name="sofa_03" position={[X + 9.5, 0, -14.6]} rotation={0} />
      <Prop get={get} name="modern_coffee_table_01" position={[X + 9.5, 0, -12.9]} rotation={Math.PI / 2} />
      <Prop get={get} name="modern_arm_chair_01" position={[X + 7.2, 0, -11.6]} rotation={Math.PI * 0.75} />
      <Person url={PEOPLE.b} clip="sit" position={[X + 7.2, 0, -11.6]} rotation={Math.PI * 0.75} offset={2} />
      <Prop get={get} name="mid_century_lounge_chair" position={[X + 11.8, 0, -11.6]} rotation={-Math.PI * 0.75} scale={0.9} />
      <Prop get={get} name="modern_arm_chair_01" position={[X + 5.2, 0, -14.2]} rotation={Math.PI / 2} />
      <Person url={PEOPLE.driver} clip="sit" position={[X + 5.2, 0, -14.2]} rotation={Math.PI / 2} offset={5} />
      <Prop get={get} name="potted_plant_01" position={[X + 15.2, 0, -8]} />
      <Prop get={get} name="potted_plant_01" position={[X - 15.2, 0, -8]} />
      <Prop get={get} name="potted_plant_02" position={[X + 14.8, 0, -16.2]} />
      {/* chargers + cars */}
      {xs.map((x, i) => (
        <Pedestal key={x} tier={tier} x={x + 1.95} z={1.5} scale={0.6} charge={i === 3 ? charge : i % 2 ? busy : full} glow={i === 3 ? glow : gIdle} />
      ))}
      <Car model="amg" paint="#e9edf2" drive={() => ({ x: xs[0], z: 0, dist: 0, glow: 0.35, port: 1, beam: 0 })} beams={false} port underglow tailBar={false} />
      <PlugCable from={toWorld(CABLE_START, xs[0] + 1.95, 1.5, 0.6)} to={portOf(xs[0], 0)} reveal={() => 1} glow={() => 0.8} />
      <Car model="mustang" paint="#20262f" drive={() => ({ x: xs[1], z: 0, dist: 0, glow: 0.3, port: 1, beam: 0 })} beams={false} port underglow />
      <PlugCable from={toWorld(CABLE_START, xs[1] + 1.95, 1.5, 0.6)} to={portOf(xs[1], 0)} reveal={() => 1} glow={() => 0.6} />
      <Car model="challenger" paint="#b3121c" drive={() => ({ x: xs[4], z: 0, dist: 0, glow: 0.3, port: 1, beam: 0 })} beams={false} port underglow />
      <PlugCable from={toWorld(CABLE_START, xs[4] + 1.95, 1.5, 0.6)} to={portOf(xs[4], 0)} reveal={() => 1} glow={() => 0.6} />
      <Car
        model="amg"
        paint="#111418"
        drive={() => {
          const c = flagCar(SS.p);
          return { visible: c.z < 12.5, x: hero, z: c.z, dist: c.dist, brake: SS.p > 0.78 && SS.p < 0.82, glow: 0.2 + flagBolts(SS.p) * 0.8, port: SS.p > 0.8 ? 1 : 0, beam: 1 - flagPlug(SS.p) * 0.7 };
        }}
        port
        underglow
        tailBar={false}
      />
      <PlugCable from={toWorld(CABLE_START, hero + 1.95, 1.5, 0.6)} to={portOf(hero, 0)} reveal={() => flagPlug(SS.p)} glow={() => flagPlug(SS.p) * 1.4} bolts={() => flagBolts(SS.p)} />
    </Gate>
  );
}

export default function Formats({ tier }) {
  return (
    <>
      <Signature tier={tier} />
      <Flagship tier={tier} />
    </>
  );
}
