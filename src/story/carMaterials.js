import * as THREE from 'three';

// Real-car look: the Blender files use Cycles/EEVEE shader node setups that
// don't survive glTF export, so every material is rebuilt here by role:
// clear-coated metallic paint, tinted glass, chrome, satin/gloss black trim,
// rubber, and emissive head/tail lights.
export const CARS = {
  mustang: {
    url: '/models/mustang.glb',
    roles: {
      paint: ['Gloss Red'],
      glass: ['Windows.001', 'Glass.001', 'Glass.002'],
      chrome: ['Mirror', 'Material.007'],
      black: ['Gloss Black', 'Material.002', 'Material.006'],
      satin: ['Matte Black', 'Material.001'],
      tire: ['Material'],
      head: ['White Light.001', 'White Light.003', 'Material.005'],
    },
  },
  challenger: {
    url: '/models/challenger.glb',
    roles: {
      paint: ['Material'],
      glass: ['Cam', 'Material.009'],
      chrome: ['Material.006', 'Material.007'],
      black: ['Material.001', 'Material.004'],
      satin: ['Material.002', 'Material.005'],
      tire: ['Material.003'],
      head: ['Material.008'],
    },
  },
  amg: {
    url: '/models/amg.glb',
    roles: {
      paint: ['bodypaint'],
      glass: ['Window', 'Glass(headlights)'],
      chrome: ['Alloy'],
      black: ['Trim'],
      tire: ['Tires'],
      head: ['Headlight(Emission)'],
      tail: ['Brake lights'],
    },
  },
};

const cache = new Map();
function make(role, paint) {
  const key = `${role}|${paint}`;
  if (cache.has(key)) return cache.get(key);
  let m;
  switch (role) {
    case 'paint':
      m = new THREE.MeshPhysicalMaterial({
        color: paint,
        metalness: 0.62,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.6,
      });
      break;
    case 'glass':
      m = new THREE.MeshPhysicalMaterial({
        color: '#05080d',
        metalness: 0.25,
        roughness: 0.02,
        transparent: true,
        opacity: 0.8,
        envMapIntensity: 2.2,
        clearcoat: 1,
        depthWrite: false,
      });
      break;
    case 'chrome':
      m = new THREE.MeshStandardMaterial({ color: '#d7dce3', metalness: 1, roughness: 0.14, envMapIntensity: 1.8 });
      break;
    case 'black':
      m = new THREE.MeshPhysicalMaterial({ color: '#07090d', metalness: 0.3, roughness: 0.18, clearcoat: 0.8, envMapIntensity: 1.2 });
      break;
    case 'satin':
      m = new THREE.MeshStandardMaterial({ color: '#15181d', metalness: 0.4, roughness: 0.55 });
      break;
    case 'tire':
      m = new THREE.MeshStandardMaterial({ color: '#111214', metalness: 0, roughness: 0.92 });
      break;
    case 'head':
      m = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#eaf6ff'), emissiveIntensity: 3.2, toneMapped: false });
      break;
    case 'tail':
      m = new THREE.MeshStandardMaterial({ color: '#400008', emissive: new THREE.Color('#ff1a2e'), emissiveIntensity: 2.2, toneMapped: false });
      break;
    default:
      m = new THREE.MeshStandardMaterial({ color: '#2a2e35', metalness: 0.5, roughness: 0.4 });
  }
  cache.set(key, m);
  return m;
}

/** Clone a loaded car scene and give it real materials in the chosen paint. */
export function dressCar(scene, car, paint) {
  const lookup = {};
  Object.entries(car.roles).forEach(([role, names]) => names.forEach((n) => (lookup[n] = role)));
  const model = scene.clone(true);
  const wheels = [];
  model.traverse((o) => {
    if (o.name.startsWith('wheel-')) wheels.push(o);
    if (!o.isMesh) return;
    o.castShadow = false;
    o.receiveShadow = false;
    const swap = (mat) => make(lookup[mat.name] || 'other', paint);
    o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
  });
  return { model, wheels };
}
