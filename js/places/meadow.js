// Место «Луг»: мир, курочка с гнездом, цыплята, вкусняшки, стрелочка-подсказка и домик зайки снаружи.
import { THREE, V3, G, scene, SKY, setLight, toon, toonNew, basic, mesh, lerpA, tmpV, heartGeo, pushOutRect } from '../core.js';
import { save, persist } from '../save.js';
import { sfx } from '../audio.js';
import { emit, pop } from '../fx.js';
import { B, bunny, bunnyJump } from '../bunny.js';
import { showHint, updateCarrots, updateChickRow, renderChickRow } from '../ui.js';

const group = new THREE.Group(); scene.add(group);
const R = 25;
const obstacles = [];   // круги: деревья, кусты, пруд, гнездо
const rects = [];       // прямоугольники: домик

let seed = 11;
const srnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const dummy = new THREE.Object3D();

// ---------- Земля, холмы, заборчик ----------
const outer = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), toon(0x93cf75));
outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02; outer.receiveShadow = true; group.add(outer);
const ground = new THREE.Mesh(new THREE.CircleGeometry(R + 0.4, 72), toon(0xa6de88));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; group.add(ground);

for (let i = 0; i < 14; i++) {
  const a = i / 14 * Math.PI * 2 + srnd() * 0.3, d = 40 + srnd() * 10, r = 8 + srnd() * 7;
  const h = mesh(new THREE.SphereGeometry(r, 20, 12), toon([0x8fcb72, 0x9fd57f, 0x86c46a][i % 3]), Math.cos(a) * d, -r * 0.55, Math.sin(a) * d, group, false);
  h.scale.y = 0.7;
}

const postCount = Math.floor(Math.PI * 2 * (R + 0.3) / 1.3);
const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), toon(0xfff6ea), postCount);
for (let i = 0; i < postCount; i++) {
  const a = i / postCount * Math.PI * 2;
  dummy.position.set(Math.cos(a) * (R + 0.3), 0.4, Math.sin(a) * (R + 0.3));
  dummy.rotation.set(0, -a, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
  posts.setMatrixAt(i, dummy.matrix);
}
posts.castShadow = true; group.add(posts);
[0.32, 0.6].forEach((y) => {
  mesh(new THREE.TorusGeometry(R + 0.3, 0.05, 4, 180), toon(0xfff6ea), 0, y, 0, group, false).rotation.x = Math.PI / 2;
});

// ---------- Гнездо и курочка в центре ----------
obstacles.push({ x: 0, z: 0, r: 1.7 });
const nestRing = mesh(new THREE.TorusGeometry(1.15, 0.42, 8, 24), toon(0xdcaa5f), 0, 0.3, 0, group);
nestRing.rotation.x = Math.PI / 2; nestRing.receiveShadow = true;
mesh(new THREE.CircleGeometry(1.1, 20), toon(0xb98a4a), 0, 0.28, 0, group, false).rotation.x = -Math.PI / 2;
for (let i = 0; i < 14; i++) {
  const a = i / 14 * Math.PI * 2;
  const s = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 3), toon(0xe9c27a), Math.cos(a) * 1.5, 0.45, Math.sin(a) * 1.5, group, false);
  s.rotation.set(Math.random() - 0.5, a, Math.PI / 2 + (Math.random() - 0.5) * 0.6);
}
const hen = new THREE.Group(); group.add(hen);
const henIn = new THREE.Group(); hen.add(henIn);
mesh(new THREE.SphereGeometry(0.72, 18, 12), toon(0xfffaf2), 0, 0.85, 0, henIn).scale.set(1, 0.85, 1.12);
mesh(new THREE.SphereGeometry(0.4, 16, 12), toon(0xfffaf2), 0, 1.5, 0.48, henIn);
[[0, 1.93, 0.42, 0.11], [0, 1.9, 0.58, 0.09], [0, 1.9, 0.28, 0.09]].forEach(([x, y, z, r]) => mesh(new THREE.SphereGeometry(r, 10, 8), toon(0xff5a5a), x, y, z, henIn));
mesh(new THREE.ConeGeometry(0.1, 0.24, 8), toon(0xffa43c), 0, 1.46, 0.92, henIn).rotation.x = Math.PI / 2;
mesh(new THREE.SphereGeometry(0.07, 8, 6), toon(0xff5a5a), 0, 1.3, 0.82, henIn);
[-1, 1].forEach((s) => {
  mesh(new THREE.SphereGeometry(0.06, 8, 6), toon(0x3b2a3d), s * 0.17, 1.58, 0.8, henIn);
  mesh(new THREE.SphereGeometry(0.07, 8, 6), toon(0xffb6c9), s * 0.25, 1.44, 0.74, henIn).scale.set(1, 0.6, 0.4);
  mesh(new THREE.SphereGeometry(0.4, 12, 8), toon(0xf4ece0), s * 0.62, 0.9, -0.05, henIn).scale.set(0.35, 0.7, 1);
});
[[-0.2, 0.2], [0, 0.35], [0.2, 0.2]].forEach(([x, t]) => {
  mesh(new THREE.ConeGeometry(0.14, 0.6, 6), toon(0xfffaf2), x, 1.35, -0.72, henIn).rotation.x = -0.5 - t;
});
let henHop = 0;

const nestSlots = [];
for (let i = 0; i < 9; i++) {
  const a = Math.PI / 2 + (i - 4) * 0.62;
  nestSlots.push(new V3(Math.cos(a) * 1.2, 0.5, Math.sin(a) * 1.2));
}

// ---------- Домик зайки (снаружи) ----------
const HOUSE = { x: 8, z: -9.5 };
const DOOR = { x: HOUSE.x, z: HOUSE.z + 1.95 };
rects.push({ x0: HOUSE.x - 1.8, x1: HOUSE.x + 1.8, z0: HOUSE.z - 1.6, z1: HOUSE.z + 1.5 });
const house = new THREE.Group(); house.position.set(HOUSE.x, 0, HOUSE.z); group.add(house);
{
  const wall = toon(0xfff1e0);
  mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), wall, 0, 1.1, 0, house).receiveShadow = true;
  const roof = mesh(new THREE.ConeGeometry(2.95, 1.8, 4), toon(0xff8fb0), 0, 3.1, 0, house);
  roof.rotation.y = Math.PI / 4; roof.scale.z = 0.9;
  mesh(new THREE.BoxGeometry(0.45, 1.0, 0.45), toon(0xe8a79a), 0.95, 3.2, -0.5, house);
  mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), toon(0xfff6ea), 0.95, 3.72, -0.5, house);
  const wood = toon(0xc98a5a);
  mesh(new THREE.BoxGeometry(0.95, 1.35, 0.1), wood, 0, 0.68, 1.52, house, false);
  mesh(new THREE.CylinderGeometry(0.475, 0.475, 0.1, 18), wood, 0, 1.35, 1.52, house, false).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.06, 8, 6), toonNew({ color: 0xffcf40, emissive: 0x3a2a00 }), 0.3, 0.75, 1.6, house, false);
  mesh(heartGeo, basic(0xff6f9f), 0, 1.3, 1.585, house, false).scale.setScalar(0.34);
  [-1, 1].forEach((s) => {
    mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 18), basic(0xbfe9ff), s * 1.12, 1.3, 1.5, house, false).rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.36, 0.06, 6, 20), toon(0xffffff), s * 1.12, 1.3, 1.53, house, false);
    mesh(new THREE.BoxGeometry(0.72, 0.05, 0.04), toon(0xffffff), s * 1.12, 1.3, 1.54, house, false);
    mesh(new THREE.BoxGeometry(0.05, 0.72, 0.04), toon(0xffffff), s * 1.12, 1.3, 1.54, house, false);
    // клумбы под окнами
    mesh(new THREE.BoxGeometry(0.9, 0.22, 0.3), toon(0xc98a5a), s * 1.12, 0.11, 1.7, house);
    [0xff8fb8, 0xffe27a, 0xffffff].forEach((c, i) => mesh(new THREE.SphereGeometry(0.1, 8, 6), toon(c), s * 1.12 + (i - 1) * 0.27, 0.3, 1.72, house, false));
  });
  mesh(new THREE.BoxGeometry(1.2, 0.04, 0.7), toon(0xff9fc2), 0, 0.02, 1.95, house, false);
  // дорожка из камушков к гнезду
  for (let i = 1; i <= 5; i++) {
    const k = i / 6, px = -HOUSE.x * k * 0.55, pz = 2.4 + (0 - DOOR.z) * k * 0.55;
    const st = mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.05, 9), toon(0xe6ddd2), px + (i % 2 ? 0.2 : -0.2), 0.025, pz, house, false);
    st.scale.z = 0.8; st.receiveShadow = true;
  }
}
const doorRing = mesh(new THREE.RingGeometry(0.5, 0.66, 28), basic(0xffd45c, { transparent: true, opacity: 0.85 }), DOOR.x, 0.05, DOOR.z + 0.05, group, false);
doorRing.rotation.x = -Math.PI / 2;
let doorArmed = true;

// ---------- Деревья, кусты, грибы, пруд ----------
function addTree(x, z, s, blossom) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = srnd() * 6; group.add(g);
  mesh(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 1.5 * s, 7), toon(0xa0714f), 0, 0.75 * s, 0, g);
  const cols = blossom ? [0xffb6d0, 0xffc8dc, 0xff9fc2] : [0x6cc466, 0x7fd174, 0x5fb85c];
  [[0, 2.0, 0, 1.05], [0.6, 1.7, 0.25, 0.72], [-0.55, 1.75, -0.1, 0.75], [0.1, 2.55, -0.15, 0.68]].forEach(([px, py, pz, pr], i) => {
    mesh(new THREE.IcosahedronGeometry(pr * s, 1), toon(cols[i % 3]), px * s, py * s, pz * s, g);
  });
  obstacles.push({ x, z, r: 0.45 * s + 0.15 });
}
function addBush(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
  [[0, 0.45, 0, 0.62], [0.5, 0.35, 0.1, 0.45], [-0.45, 0.35, -0.05, 0.48]].forEach(([px, py, pz, pr]) => mesh(new THREE.IcosahedronGeometry(pr, 1), toon(0x62bb61), px, py, pz, g));
  for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.07, 6, 5), toon(i % 2 ? 0xff7aa2 : 0xffffff), (srnd() - 0.5) * 1.1, 0.5 + srnd() * 0.4, 0.45 + srnd() * 0.1, g, false);
  obstacles.push({ x, z, r: 0.95 });
}
function addMushroom(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
  mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.28, 8), toon(0xfff3de), 0, 0.14, 0, g);
  mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xff6b6b), 0, 0.26, 0, g);
  [[0.1, 0.4, 0.1], [-0.12, 0.38, 0.05], [0, 0.44, -0.1]].forEach(([a, b, c]) => mesh(new THREE.SphereGeometry(0.04, 6, 5), toon(0xffffff), a, b, c, g, false));
}
const POND = { x: -11, z: 9, r: 3.2 };
mesh(new THREE.CircleGeometry(POND.r, 36), toon(0x8ad7f2), POND.x, 0.03, POND.z, group, false).rotation.x = -Math.PI / 2;
mesh(new THREE.TorusGeometry(POND.r, 0.2, 6, 36), toon(0xdfe6e8), POND.x, 0.05, POND.z, group, false).rotation.x = Math.PI / 2;
[[-1, 0.8], [1.2, -0.6], [0.2, 1.6], [-1.4, -1.2]].forEach(([dx, dz], i) => {
  const lp = mesh(new THREE.CircleGeometry(0.45, 14, 0.3, 5.8), toon(0x5fbf6a), POND.x + dx, 0.06, POND.z + dz, group, false);
  lp.rotation.x = -Math.PI / 2; lp.rotation.z = i;
  if (i % 2 === 0) mesh(new THREE.SphereGeometry(0.14, 8, 6), toon(0xffb3d1), POND.x + dx, 0.13, POND.z + dz, group, false);
});
obstacles.push({ x: POND.x, z: POND.z, r: POND.r + 0.15 });

const nearHouse = (x, z, d) => Math.hypot(x - HOUSE.x, z - (HOUSE.z + 1)) < d;
function freeLayoutSpot(minD, maxD, pad) {
  for (let t = 0; t < 80; t++) {
    const a = srnd() * Math.PI * 2, d = minD + srnd() * (maxD - minD);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x - 0, z - 4) < 4) continue;
    if (nearHouse(x, z, 5.5)) continue;
    if (obstacles.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + pad)) continue;
    return [x, z];
  }
  return null;
}
for (let i = 0; i < 17; i++) { const p = freeLayoutSpot(8, R - 2, 3); if (p) addTree(p[0], p[1], 0.9 + srnd() * 0.5, i % 3 === 0); }
for (let i = 0; i < 9; i++) { const p = freeLayoutSpot(6, R - 2, 2.2); if (p) addBush(p[0], p[1]); }
for (let i = 0; i < 12; i++) { const p = freeLayoutSpot(4, R - 1.5, 0.6); if (p) addMushroom(p[0], p[1]); }

// ---------- Трава, цветы, бабочки ----------
const tuftN = 380;
const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.34, 4), toon(0x7cc466), tuftN);
for (let i = 0; i < tuftN; i++) {
  let x = 0, z = 0;
  for (let k = 0; k < 6; k++) {
    const a = srnd() * Math.PI * 2, d = Math.sqrt(srnd()) * R;
    x = Math.cos(a) * d; z = Math.sin(a) * d;
    if (!nearHouse(x, z - 1, 2.6)) break;
  }
  dummy.position.set(x, 0.15, z);
  dummy.rotation.set((srnd() - 0.5) * 0.4, srnd() * 6, (srnd() - 0.5) * 0.4);
  const s = 0.7 + srnd() * 0.8; dummy.scale.set(s, s, s); dummy.updateMatrix();
  tufts.setMatrixAt(i, dummy.matrix);
}
group.add(tufts);
const flN = 170;
const flowerHeads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 5), toon(0xffffff), flN);
const flowerMid = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 6, 4), toon(0xffd23f), flN);
const flowerStem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 3), toon(0x4fa85a), flN);
const flCols = [0xffffff, 0xffb3d1, 0xffe27a, 0xcdb8ff, 0xff8fa8, 0xffffff].map((c) => new THREE.Color(c));
for (let i = 0; i < flN; i++) {
  let x, z;
  for (let t = 0; t < 20; t++) {
    const a = srnd() * Math.PI * 2, d = 2.2 + Math.sqrt(srnd()) * (R - 2.5);
    x = Math.cos(a) * d; z = Math.sin(a) * d;
    if (Math.hypot(x - POND.x, z - POND.z) > POND.r + 0.4 && !nearHouse(x, z - 1, 2.8)) break;
  }
  dummy.position.set(x, 0.18, z); dummy.rotation.set(0, srnd() * 6, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
  flowerHeads.setMatrixAt(i, dummy.matrix);
  flowerHeads.setColorAt(i, flCols[i % flCols.length]);
  dummy.position.y = 0.21; dummy.updateMatrix(); flowerMid.setMatrixAt(i, dummy.matrix);
  dummy.position.y = 0.08; dummy.updateMatrix(); flowerStem.setMatrixAt(i, dummy.matrix);
}
group.add(flowerHeads, flowerMid, flowerStem);

const butterflies = [];
const wingGeo = new THREE.CircleGeometry(0.18, 14); wingGeo.rotateX(-Math.PI / 2); wingGeo.translate(0.16, 0, 0);
[0xff8fb8, 0xffd45c, 0xb9a4ff, 0x8fd6ff, 0xffffff, 0xffa36b].forEach((c) => {
  const g = new THREE.Group(); group.add(g);
  const m = basic(c, { side: THREE.DoubleSide });
  const wl = new THREE.Mesh(wingGeo, m), wr = new THREE.Mesh(wingGeo, m);
  wr.scale.x = -1; g.add(wl, wr);
  mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 5), toon(0x5b3a5e), 0, 0, 0, g, false).rotation.x = Math.PI / 2;
  const a = srnd() * Math.PI * 2, d = 5 + srnd() * 14;
  butterflies.push({ g, wl, wr, cx: Math.cos(a) * d, cz: Math.sin(a) * d, ph: srnd() * 10, sp: 0.35 + srnd() * 0.3, rad: 2 + srnd() * 3 });
});

// ---------- Стрелочка-подсказка ----------
const arrowPivot = new THREE.Group(); group.add(arrowPivot);
const arrowShape = new THREE.Shape();
arrowShape.moveTo(-0.3, 0); arrowShape.lineTo(0, 0.22); arrowShape.lineTo(0.3, 0); arrowShape.lineTo(0, 0.5); arrowShape.closePath();
const arrowMat = basic(0xff6f9f, { transparent: true, opacity: 0.9, side: THREE.DoubleSide });
const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), arrowMat);
arrow.rotation.x = Math.PI / 2; arrow.position.set(0, 0.05, 1.35); arrowPivot.add(arrow);

// ---------- Свободные места ----------
function collide(p, r) {
  for (const o of obstacles) {
    const dx = p.x - o.x, dz = p.z - o.z, m = o.r + r, d2 = dx * dx + dz * dz;
    if (d2 < m * m) { const d = Math.sqrt(d2) || 0.001; p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; }
  }
  for (const q of rects) pushOutRect(p, r, q);
  const d = Math.hypot(p.x, p.z), lim = R - 0.8;
  if (d > lim) { p.x *= lim / d; p.z *= lim / d; }
}
function freeSpot(pad, minNest) {
  for (let t = 0; t < 80; t++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (R - 2.2);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x, z) < minNest) continue;
    if (obstacles.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + pad)) continue;
    if (nearHouse(x, z, 3.6 + pad)) continue;
    if (Math.hypot(x - B.pos.x, z - B.pos.z) < 2.5) continue;
    return [x, z];
  }
  return null;
}

// ---------- Цыплята ----------
let chicks = [], followers = [], homeCount = 0, slotIdx = 0, winPending = false, winDelay = 0;
let followHintShown = false;
const ringGeo = new THREE.RingGeometry(0.45, 0.6, 26);
function makeChick() {
  const g = new THREE.Group(); group.add(g);
  const inner = new THREE.Group(); g.add(inner);
  const y = toon(0xffdf5e);
  mesh(new THREE.SphereGeometry(0.3, 14, 10), y, 0, 0.3, 0, inner).scale.set(1, 0.95, 1.05);
  mesh(new THREE.SphereGeometry(0.22, 14, 10), y, 0, 0.63, 0.06, inner);
  mesh(new THREE.ConeGeometry(0.04, 0.14, 5), y, 0.02, 0.88, 0.02, inner, false).rotation.z = -0.4;
  mesh(new THREE.ConeGeometry(0.06, 0.14, 6), toon(0xff9a3c), 0, 0.6, 0.3, inner, false).rotation.x = Math.PI / 2;
  [-1, 1].forEach((s) => {
    mesh(new THREE.SphereGeometry(0.035, 6, 5), toon(0x3b2a3d), s * 0.09, 0.68, 0.24, inner, false);
    mesh(new THREE.SphereGeometry(0.045, 6, 5), toon(0xffb3a0), s * 0.15, 0.6, 0.2, inner, false).scale.set(1, 0.6, 0.4);
    mesh(new THREE.SphereGeometry(0.06, 6, 5), toon(0xff9a3c), s * 0.1, 0.03, 0.1, inner, false).scale.set(1, 0.5, 1.4);
  });
  const wings = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 0.26, 0.4, 0); inner.add(p);
    mesh(new THREE.SphereGeometry(0.12, 8, 6), toon(0xffd23f), s * 0.04, -0.06, 0, p).scale.set(0.45, 1, 1.3);
    return { p, s };
  });
  const ring = new THREE.Mesh(ringGeo, basic(0xff6f9f, { transparent: true, opacity: 0.7 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; group.add(ring);
  return { g, inner, wings, ring };
}
function clearChicks() {
  for (const c of chicks) { group.remove(c.m.g); group.remove(c.m.ring); }
  chicks = []; followers = []; homeCount = 0; slotIdx = 0; winPending = false;
}
export function spawnChicks() {
  clearChicks();
  const n = Math.min(2 + save.level, 8);
  for (let i = 0; i < n; i++) {
    const p = freeSpot(1.3, 7 + Math.min(save.level, 6)) || [8, 8];
    const m = makeChick();
    const pos = new V3(p[0], 0, p[1]);
    m.g.position.copy(pos);
    chicks.push({ m, pos, home: pos.clone(), state: 'lost', wt: Math.random() * 2, wdir: null, hop: Math.random() * 6, face: Math.random() * 6, slot: null, delay: 0, peepT: 1 + Math.random() * 4 });
  }
  renderChickRow(chicks.length, 0, 0);
  return n;
}
export const chickCounts = () => ({ total: chicks.length, home: homeCount, follow: followers.length });
const syncRow = () => updateChickRow(homeCount, followers.length);
export const lostChicks = () => chicks.filter((c) => c.state === 'lost').map((c) => [c.pos.x, c.pos.z]);   // для автотестов

// ---------- Вкусняшки ----------
const items = [];
function starShape(ro, ri) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? ri : ro, a = i / 10 * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath(); return s;
}
const starGeo = new THREE.ExtrudeGeometry(starShape(0.42, 0.19), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 });
starGeo.center();
const starMat = toonNew({ color: 0xffd23f, emissive: 0x6a4a00 });
function makeItem(type) {
  const g = new THREE.Group(); group.add(g);
  if (type === 'carrot') {
    mesh(new THREE.ConeGeometry(0.15, 0.55, 10), toon(0xff8a3d), 0, 0, 0, g).rotation.x = Math.PI;
    [-0.5, 0, 0.5].forEach((t) => { mesh(new THREE.ConeGeometry(0.05, 0.26, 4), toon(0x4fb06a), Math.sin(t) * 0.07, 0.38, 0, g).rotation.z = t; });
  } else if (type === 'berry') {
    mesh(new THREE.SphereGeometry(0.22, 12, 10), toon(0xff4d6a), 0, 0, 0, g).scale.set(1, 1.15, 1);
    mesh(new THREE.ConeGeometry(0.16, 0.08, 6), toon(0x4fb06a), 0, 0.24, 0, g).rotation.x = Math.PI;
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 4), toon(0x3c9a57), 0, 0.32, 0, g);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.022, 5, 4), basic(0xffe39a), Math.cos(a) * 0.21, -0.02 + (i % 2) * 0.1, Math.sin(a) * 0.21, g, false); }
  } else {
    mesh(starGeo, starMat, 0, 0, 0, g);
  }
  return g;
}
const ITEM = { carrot: { val: 1, y: 0.6, cls: '' }, berry: { val: 3, y: 0.55, cls: 'pink' }, star: { val: 5, y: 0.85, cls: 'gold' } };
function placeItem(it) {
  const p = freeSpot(0.9, 2.8) || [3, 3];
  it.pos.set(p[0], 0, p[1]); it.alive = true; it.t = Math.random() * 6; it.grow = 0;
  it.g.visible = true; it.g.position.set(p[0], ITEM[it.type].y, p[1]);
  if (it.type === 'star') it.life = 14;
}
function addItem(type) { const it = { type, g: makeItem(type), pos: new V3(), alive: false, respawn: 0 }; items.push(it); placeItem(it); return it; }
for (let i = 0; i < 11; i++) addItem('carrot');
for (let i = 0; i < 3; i++) addItem('berry');
const star = addItem('star'); star.alive = false; star.g.visible = false; star.respawn = 8;

// ---------- Обновление ----------
function updateChicks(dt, t) {
  const playing = G.state === 'play';
  if (winPending && playing) { winDelay -= dt; if (winDelay <= 0) { winPending = false; G.hooks.levelWin(); } }
  if (followers.length && playing && Math.hypot(B.pos.x, B.pos.z) < 3.9) {
    followers.forEach((c, i) => { c.state = 'toNest'; c.delay = i * 0.28; c.slot = nestSlots[slotIdx++ % nestSlots.length]; });
    followers = [];
  }
  chicks.forEach((c) => {
    const m = c.m;
    let mvx = 0, mvz = 0;
    if (c.state === 'lost') {
      c.wt -= dt;
      if (c.wt <= 0) { c.wt = 0.8 + Math.random() * 1.8; c.wdir = Math.random() < 0.4 ? null : Math.random() * Math.PI * 2; }
      if (c.wdir !== null) {
        let ax = Math.sin(c.wdir), az = Math.cos(c.wdir);
        if (c.pos.distanceTo(c.home) > 2.2) { const hx = c.home.x - c.pos.x, hz = c.home.z - c.pos.z, hd = Math.hypot(hx, hz); ax = hx / hd; az = hz / hd; c.wdir = Math.atan2(ax, az); }
        mvx = ax * 1.1; mvz = az * 1.1;
      }
      c.peepT -= dt;
      if (c.peepT <= 0) { c.peepT = 3 + Math.random() * 4; if (playing && Math.hypot(c.pos.x - B.pos.x, c.pos.z - B.pos.z) < 12) pop('пи!', tmpV.set(c.pos.x, 1.2, c.pos.z), 'pink'); }
      m.ring.visible = true;
      m.ring.position.set(c.pos.x, 0.04, c.pos.z);
      const s = 1 + Math.sin(t * 4 + c.hop) * 0.15; m.ring.scale.set(s, s, s);
      if (playing && Math.hypot(c.pos.x - B.pos.x, c.pos.z - B.pos.z) < 1.5) {
        c.state = 'follow'; followers.push(c); m.ring.visible = false;
        sfx.chirp(); emit('heart', tmpV.set(c.pos.x, 1, c.pos.z), 4);
        pop('Пи-пи!', tmpV.set(c.pos.x, 1.3, c.pos.z), 'pink');
        syncRow();
        if (!followHintShown) { followHintShown = true; showHint('Цыплёнок идёт за зайкой! Отведи его к маме-курочке в гнёздышко', 4500); }
      }
    } else if (c.state === 'follow') {
      const idx = followers.indexOf(c);
      const leader = idx <= 0 ? B.pos : followers[idx - 1].pos;
      const lx = leader.x - c.pos.x, lz = leader.z - c.pos.z, d = Math.hypot(lx, lz);
      const gap = idx <= 0 ? 1.1 : 0.9;
      if (d > gap) { const v = Math.min(9, (d - gap) * 6); mvx = lx / d * v; mvz = lz / d * v; }
    } else if (c.state === 'toNest') {
      c.delay -= dt;
      if (c.delay <= 0) {
        const tx = c.slot.x - c.pos.x, tz = c.slot.z - c.pos.z, d = Math.hypot(tx, tz);
        if (d > 0.12) { const v = Math.min(6, d * 5 + 1); c.pos.x += tx / d * v * dt; c.pos.z += tz / d * v * dt; c.face = lerpA(c.face, Math.atan2(tx, tz), Math.min(1, dt * 10)); c.hop += dt * 14; }
        else {
          c.state = 'home'; c.pos.set(c.slot.x, 0, c.slot.z); homeCount++;
          sfx.home(); emit('heart', tmpV.set(c.pos.x, 1.2, c.pos.z), 5);
          pop(homeCount + ' / ' + chicks.length, tmpV.set(c.pos.x, 1.4, c.pos.z), 'pink');
          henHop = 0.35; syncRow();
          // Победа ждёт, пока игрок не вернётся в игру (например, из шкафа).
          if (homeCount === chicks.length) { winPending = true; winDelay = 0.7; }
        }
      }
      const dn = Math.hypot(c.pos.x, c.pos.z);
      const lift = dn < 2.1 ? Math.min(0.5, (2.1 - dn) / 0.9 * 0.5) : 0;
      m.g.position.set(c.pos.x, lift + Math.abs(Math.sin(c.hop)) * 0.2, c.pos.z);
      m.g.rotation.y = c.face;
      return;
    } else if (c.state === 'home') {
      c.face = lerpA(c.face, Math.atan2(c.pos.x, c.pos.z), Math.min(1, dt * 4));
      m.g.position.set(c.pos.x, 0.5 + Math.abs(Math.sin(t * 3 + c.hop)) * 0.05, c.pos.z);
      m.g.rotation.y = c.face;
      m.wings.forEach((w) => { w.p.rotation.z = w.s * (0.2 + Math.max(0, Math.sin(t * 9 + c.hop)) * 0.5); });
      return;
    }
    c.pos.x += mvx * dt; c.pos.z += mvz * dt;
    collide(c.pos, 0.35);
    const sp = Math.hypot(mvx, mvz);
    if (sp > 0.1) { c.face = lerpA(c.face, Math.atan2(mvx, mvz), Math.min(1, dt * 10)); c.hop += dt * (6 + sp * 3); }
    m.g.position.set(c.pos.x, Math.abs(Math.sin(c.hop)) * 0.16 * Math.min(1, sp), c.pos.z);
    m.g.rotation.y = c.face;
    m.wings.forEach((w) => { w.p.rotation.z = w.s * (0.15 + (sp > 0.1 ? Math.abs(Math.sin(t * 16 + c.hop)) * 0.7 : 0)); });
  });
}

function updateItems(dt) {
  for (const it of items) {
    if (!it.alive) {
      it.respawn -= dt;
      if (it.respawn <= 0) { placeItem(it); if (it.type === 'star') emit('spark', tmpV.set(it.pos.x, 1, it.pos.z), 8); }
      continue;
    }
    it.t += dt; it.grow = Math.min(1, it.grow + dt * 3);
    it.g.position.y = ITEM[it.type].y + Math.sin(it.t * 3) * 0.12;
    it.g.rotation.y += dt * (it.type === 'star' ? 3 : 1.6);
    const s = it.grow * (it.type === 'star' ? 1 + Math.sin(it.t * 6) * 0.08 : 1);
    if (it.type === 'star') {
      it.life -= dt;
      it.g.visible = it.life > 3 || Math.floor(it.life * 6) % 2 === 0;
      if (it.life <= 0) { it.alive = false; it.g.visible = false; it.respawn = 12 + Math.random() * 8; continue; }
    }
    it.g.scale.setScalar(Math.max(0.01, s));
    if (G.state === 'play' && Math.hypot(it.pos.x - B.pos.x, it.pos.z - B.pos.z) < 1.15 && B.y < 1.6) {
      const info = ITEM[it.type];
      save.carrots += info.val; persist(); updateCarrots(true);
      pop('+' + info.val, tmpV.set(it.pos.x, 1.4, it.pos.z), info.cls);
      if (it.type === 'carrot') { sfx.pop(); emit('spark', tmpV.set(it.pos.x, 0.7, it.pos.z), 5, 0xff8a3d); }
      else if (it.type === 'berry') { sfx.berry(); emit('heart', tmpV.set(it.pos.x, 0.8, it.pos.z), 4); }
      else { sfx.star(); emit('spark', tmpV.set(it.pos.x, 1, it.pos.z), 14); B.spinT = 0.6; }
      it.alive = false; it.g.visible = false;
      it.respawn = it.type === 'star' ? 14 + Math.random() * 8 : it.type === 'berry' ? 6 + Math.random() * 4 : 2 + Math.random() * 3;
    }
  }
}

function updateGuide(t) {
  let tx = null, tz = null, col = 0xff6f9f;
  if (G.state === 'play') {
    const lost = chicks.filter((c) => c.state === 'lost');
    if (lost.length) {
      let best = null, bd = 1e9;
      for (const c of lost) { const d = Math.hypot(c.pos.x - B.pos.x, c.pos.z - B.pos.z); if (d < bd) { bd = d; best = c; } }
      tx = best.pos.x; tz = best.pos.z;
      if (followers.length && Math.hypot(B.pos.x, B.pos.z) < bd * 0.6) { tx = 0; tz = 0; col = 0xffc53d; }
    } else if (followers.length) { tx = 0; tz = 0; col = 0xffc53d; }
  }
  const show = tx !== null && Math.hypot(tx - B.pos.x, tz - B.pos.z) > 3.5;
  arrowPivot.visible = show;
  if (show) {
    arrowPivot.position.set(B.pos.x, 0, B.pos.z);
    arrowPivot.rotation.y = Math.atan2(tx - B.pos.x, tz - B.pos.z);
    arrow.position.z = 1.35 + Math.sin(t * 5) * 0.12;
    arrowMat.color.setHex(col);
  }
}

function updateWorld(dt, t) {
  butterflies.forEach((b) => {
    const p = t * b.sp + b.ph;
    const x = b.cx + Math.sin(p) * b.rad, z = b.cz + Math.sin(p * 1.7) * b.rad * 0.7, y = 1.3 + Math.sin(p * 2.3) * 0.4;
    const dx = x - b.g.position.x, dz = z - b.g.position.z;
    b.g.position.set(x, y, z);
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) b.g.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    const f = Math.sin(t * 16 + b.ph) * 0.9;
    b.wl.rotation.z = f; b.wr.rotation.z = -f;
  });
  if (henHop > 0) henHop -= dt;
  henIn.position.y = henHop > 0 ? Math.sin((0.4 - henHop) / 0.4 * Math.PI) * 0.35 : Math.abs(Math.sin(t * 1.5)) * 0.03;
  henIn.rotation.y = Math.sin(t * 0.6) * 0.35;
  const s = 1 + Math.sin(t * 4) * 0.14; doorRing.scale.set(s, s, s);
}

function updateDoor() {
  if (G.state !== 'play' || G.busy) return;
  const d = Math.hypot(B.pos.x - DOOR.x, B.pos.z - DOOR.z);
  if (!doorArmed) { if (d > 1.4) doorArmed = true; return; }
  if (d < 0.75) { doorArmed = false; G.hooks.goPlace('home'); return; }
  if (!save.seen.house && Math.hypot(B.pos.x - HOUSE.x, B.pos.z - HOUSE.z) < 8) {
    save.seen.house = 1; persist();
    showHint('Это домик зайки. Подойди к двери, чтобы зайти', 4500);
  }
}

let menuAng = 0.5;
export const meadow = {
  id: 'meadow',
  group,
  enter(from) {
    group.visible = true;
    scene.background.setHex(SKY); scene.fog.color.setHex(SKY); scene.fog.near = 30; scene.fog.far = 62;
    setLight(0.5, 0.2, 0.55, 0x9fd48a);
    if (from === 'home') { B.pos.set(DOOR.x, 0, DOOR.z + 1.6); B.face = 0; doorArmed = true; }
  },
  leave() { group.visible = false; },
  update(dt, t) {
    updateChicks(dt, t);
    updateItems(dt);
    updateGuide(t);
    updateWorld(dt, t);
    updateDoor();
  },
  collide,
  clampTarget(p) {
    const d = Math.hypot(p.x, p.z), lim = R - 1;
    if (d > lim) { p.x *= lim / d; p.z *= lim / d; }
  },
  // Нажатие на зайку или курочку. Возвращает true, если нажатие обработано.
  pointerDown(raycaster) {
    if (raycaster.intersectObject(bunny, true).length) { bunnyJump(true); return true; }
    if (raycaster.intersectObject(hen, true).length) { henHop = 0.4; sfx.cluck(); emit('heart', tmpV.set(0, 2.2, 0), 5); return true; }
    return false;
  },
  camera(dt, desired, look) {
    if (G.state === 'menu' || G.state === 'settings') {
      menuAng += dt * 0.12;
      look.set(B.pos.x * 0.5, 0.9, B.pos.z * 0.5);
      desired.set(look.x + Math.sin(menuAng) * 10, 5.2, look.z + Math.cos(menuAng) * 10);
    } else {
      look.set(B.pos.x, 0.6, B.pos.z);
      desired.set(B.pos.x, G.portrait ? 12.5 : 9.5, B.pos.z + (G.portrait ? 11 : 10));
    }
  },
};
