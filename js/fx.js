// Частицы (сердечки, конфетти, искры) и всплывающие надписи.
import { THREE, V3, scene, camera, basic, heartGeo, tmpV, $ } from './core.js';

const confGeo = new THREE.PlaneGeometry(0.2, 0.12);
const sparkGeo = new THREE.OctahedronGeometry(0.09, 0);
const pMats = {};
const pMat = (c) => pMats[c] || (pMats[c] = basic(c, { side: THREE.DoubleSide }));
const parts = [];
const CONF = [0xff6f9f, 0xffd45c, 0xb9a4ff, 0x8fd6ff, 0x7fd48a, 0xffa36b];

export function emit(kind, pos, n, color) {
  for (let i = 0; i < n; i++) {
    let p = parts.find((q) => !q.alive && q.kind === kind);
    if (!p) {
      if (parts.length > 260) return;
      const geo = kind === 'heart' ? heartGeo : kind === 'conf' ? confGeo : sparkGeo;
      p = { kind, mesh: new THREE.Mesh(geo, pMat(0xffffff)), vel: new V3(), spin: new V3() };
      scene.add(p.mesh); parts.push(p);
    }
    const c = color || (kind === 'heart' ? 0xff6f9f : 0xffd23f);
    p.mesh.material = pMat(kind === 'conf' ? CONF[(Math.random() * CONF.length) | 0] : c);
    p.alive = true; p.mesh.visible = true;
    p.mesh.position.copy(pos);
    if (kind === 'heart') {
      p.life = p.max = 1.1 + Math.random() * 0.5;
      p.vel.set((Math.random() - 0.5) * 2, 2 + Math.random() * 1.5, (Math.random() - 0.5) * 2);
      p.size = 0.45 + Math.random() * 0.35;
    } else if (kind === 'conf') {
      p.life = p.max = 2 + Math.random();
      p.vel.set((Math.random() - 0.5) * 7, 6 + Math.random() * 5, (Math.random() - 0.5) * 7);
      p.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      p.size = 1;
    } else {
      p.life = p.max = 0.6 + Math.random() * 0.4;
      p.vel.set((Math.random() - 0.5), Math.random() * 0.8 + 0.4, (Math.random() - 0.5)).normalize().multiplyScalar(3 + Math.random() * 2);
      p.spin.set(3, 5, 0);
      p.size = 1;
    }
    p.mesh.scale.setScalar(p.size);
  }
}

export function clearParts() { for (const p of parts) { p.alive = false; p.mesh.visible = false; } }

export function updateParts(dt) {
  for (const p of parts) {
    if (!p.alive) continue;
    p.life -= dt;
    if (p.life <= 0) { p.alive = false; p.mesh.visible = false; continue; }
    const m = p.mesh;
    if (p.kind === 'heart') {
      p.vel.multiplyScalar(1 - dt * 1.5); p.vel.y += dt * 0.6;
      m.position.addScaledVector(p.vel, dt);
      m.quaternion.copy(camera.quaternion);
      m.scale.setScalar(p.size * Math.min(1, p.life / 0.4));
    } else if (p.kind === 'conf') {
      p.vel.y -= 12 * dt; p.vel.multiplyScalar(1 - dt * 1.2);
      if (p.vel.y < -2.5) p.vel.y = -2.5;
      m.position.addScaledVector(p.vel, dt);
      if (m.position.y < 0.05) { m.position.y = 0.05; p.vel.set(0, 0, 0); }
      else { m.rotation.x += p.spin.x * dt; m.rotation.y += p.spin.y * dt; }
      m.scale.setScalar(Math.min(1, p.life / 0.5));
    } else {
      p.vel.y -= 9 * dt; m.position.addScaledVector(p.vel, dt);
      m.rotation.y += dt * 8;
      m.scale.setScalar(Math.min(1, p.life / p.max * 1.5));
    }
  }
}

const pops = $('#pops');
const pv = new V3();
export function pop(text, pos, cls) {
  pv.copy(pos).project(camera);
  if (pv.z > 1) return;
  const d = document.createElement('div');
  d.className = 'pop ' + (cls || '');
  d.textContent = text;
  d.style.left = ((pv.x + 1) / 2 * innerWidth) + 'px';
  d.style.top = ((1 - pv.y) / 2 * innerHeight) + 'px';
  pops.appendChild(d);
  setTimeout(() => d.remove(), 1100);
}
export { tmpV };
