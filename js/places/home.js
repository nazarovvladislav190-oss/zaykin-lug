// Место «Домик»: комната 8×8 клеток, мебель из сохранения и режим обустройства.
import { THREE, V3, G, scene, camera, setLight, toon, toonNew, basic, mesh, tmpV, pushOutRect } from '../core.js';
import { save, persist } from '../save.js';
import { FURN_BY_ID, WALLS, FLOORS } from '../data.js';
import { sfx } from '../audio.js';
import { emit } from '../fx.js';
import { B, bunny, bunnyJump } from '../bunny.js';
import { showHint, updateCarrots, needText } from '../ui.js';
import { buildFurniture } from '../furniture.js';

const N = 8, HALF = 4, WALL_H = 3.4;
const RESERVED = { x0: 3, x1: 5, z0: 6, z1: 8 };   // клетки у входа всегда свободны
const WALL_Y = { garland: 2.95, clock: 2.15, shelf: 1.9, window: 1.95 };
const EXIT = { x: 0, z: 3.55 };
const BG = 0xf6e3d3;

const group = new THREE.Group(); group.visible = false; scene.add(group);

// ---------- Комната ----------
const texCache = {};
function floorTex(id) {
  if (texCache[id]) return texCache[id];
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  if (id === 'check') {
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { x.fillStyle = (i + j) % 2 ? '#ffd3e0' : '#ffffff'; x.fillRect(i * 64, j * 64, 64, 64); }
  } else if (id === 'carpet') {
    x.fillStyle = '#ffbdd0'; x.fillRect(0, 0, 512, 512);
    x.fillStyle = '#ffd0de';
    for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) { x.beginPath(); x.arc(i * 16 + (j % 2 ? 8 : 0) + 4, j * 16 + 8, 2.4, 0, 7); x.fill(); }
  } else {
    const light = id === 'light';
    x.fillStyle = light ? '#f1dcbc' : '#e3b98a'; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = light ? '#dfc49c' : '#cf9f6c'; x.lineWidth = 3;
    for (let j = 0; j < 16; j++) {
      x.beginPath(); x.moveTo(0, j * 32); x.lineTo(512, j * 32); x.stroke();
      let px = rnd() * 120;
      while (px < 512) { x.beginPath(); x.moveTo(px, j * 32); x.lineTo(px, j * 32 + 32); x.stroke(); px += 110 + rnd() * 120; }
    }
  }
  return (texCache[id] = new THREE.CanvasTexture(c));
}
const floorMat = toonNew({ color: 0xffffff, map: floorTex('wood') });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(N, N), floorMat);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; group.add(floor);
const under = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), basic(BG));
under.rotation.x = -Math.PI / 2; under.position.y = -0.03; group.add(under);

const wallMat = toonNew({ color: 0xfff1e0 });
const trim = toon(0xffffff);
mesh(new THREE.BoxGeometry(N + 0.4, WALL_H, 0.2), wallMat, 0, WALL_H / 2, -HALF - 0.1, group, false).receiveShadow = true;
mesh(new THREE.BoxGeometry(N, 0.2, 0.06), trim, 0, 0.1, -HALF + 0.03, group, false);
mesh(new THREE.BoxGeometry(N + 0.5, 0.12, 0.3), trim, 0, WALL_H + 0.06, -HALF - 0.1, group, false);
[-1, 1].forEach((s) => {
  mesh(new THREE.BoxGeometry(0.2, WALL_H, N + 0.2), wallMat, s * (HALF + 0.1), WALL_H / 2, 0, group, false).receiveShadow = true;
  mesh(new THREE.BoxGeometry(0.06, 0.2, N), trim, s * (HALF - 0.03), 0.1, 0, group, false);
  mesh(new THREE.BoxGeometry(0.3, 0.12, N + 0.3), trim, s * (HALF + 0.1), WALL_H + 0.06, 0, group, false);
});
// коврик у выхода и стрелочка
mesh(new THREE.BoxGeometry(1.5, 0.04, 0.7), toon(0xffd45c), EXIT.x, 0.02, EXIT.z + 0.08, group, false).receiveShadow = true;
const exitShape = new THREE.Shape();
exitShape.moveTo(-0.3, 0); exitShape.lineTo(0, 0.22); exitShape.lineTo(0.3, 0); exitShape.lineTo(0, 0.5); exitShape.closePath();
const exitArrow = new THREE.Mesh(new THREE.ShapeGeometry(exitShape), basic(0xff8a3d, { side: THREE.DoubleSide }));
exitArrow.rotation.x = Math.PI / 2; exitArrow.position.set(EXIT.x, 0.05, EXIT.z - 0.25); group.add(exitArrow);
let exitArmed = false;

const grid = new THREE.GridHelper(N, N, 0x5b3a5e, 0x5b3a5e);
grid.material.transparent = true; grid.material.opacity = 0.22; grid.position.y = 0.012; grid.visible = false; group.add(grid);
const hlMat = basic(0x7fd48a, { transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
const hl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), hlMat); hl.visible = false; group.add(hl);

function applySurfaces() {
  const w = WALLS.find((o) => o.id === save.home.wall) || WALLS[0];
  wallMat.color.setHex(w.hex);
  floorMat.map = floorTex(save.home.floor); floorMat.needsUpdate = true;
}

// ---------- Мебель ----------
let placed = [];   // { rec: запись из сохранения, def: строка каталога, mesh }
let sel = null, drag = null;
let playRects = [];

const dims = (def, r) => (r % 2 ? [def.d, def.w] : [def.w, def.d]);
function span(e) { const [w, d] = dims(e.def, e.rec.r || 0); return { x0: e.rec.x, x1: e.rec.x + w, z0: e.rec.z, z1: e.rec.z + d }; }
const overlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1;

function valid(e) {
  const s = span(e);
  if (e.def.kind === 'wall') {
    if (s.x0 < 0 || s.x1 > N) return false;
    return !placed.some((o) => o !== e && o.def.kind === 'wall' && o.rec.x < s.x1 && s.x0 < o.rec.x + o.def.w);
  }
  if (s.x0 < 0 || s.z0 < 0 || s.x1 > N || s.z1 > N) return false;
  if (overlap(s, RESERVED)) return false;
  return !placed.some((o) => o !== e && o.def.kind === e.def.kind && overlap(s, span(o)));
}

function syncMesh(e) {
  const { rec, def } = e;
  if (def.kind === 'wall') {
    e.mesh.position.set(-HALF + rec.x + def.w / 2, WALL_Y[def.id] || 1.95, -HALF);
  } else {
    const [w, d] = dims(def, rec.r || 0);
    e.mesh.position.x = -HALF + rec.x + w / 2; e.mesh.position.z = -HALF + rec.z + d / 2;
    e.mesh.rotation.y = -(rec.r || 0) * Math.PI / 2;
  }
}
function addEntry(rec) {
  const def = FURN_BY_ID[rec.id];
  if (!def) return null;
  const m = buildFurniture(rec.id);
  const e = { rec, def, mesh: m };
  m.userData.entry = e;
  group.add(m); placed.push(e); syncMesh(e);
  return e;
}
function entryOf(obj) { while (obj && !obj.userData.entry) obj = obj.parent; return obj ? obj.userData.entry : null; }

function rebuildRects() {
  playRects = placed.filter((e) => e.def.kind === 'floor').map((e) => {
    const s = span(e), k = 0.12;
    return { x0: -HALF + s.x0 + k, x1: -HALF + s.x1 - k, z0: -HALF + s.z0 + k, z1: -HALF + s.z1 - k };
  });
}

function loadItems() {
  placed.forEach((e) => group.remove(e.mesh));
  placed = [];
  const keep = [];
  for (const rec of save.home.items) {
    const e = addEntry(rec);
    if (!e) continue;
    if (valid(e)) keep.push(rec); else { group.remove(e.mesh); placed.pop(); }
  }
  save.home.items = keep;
  rebuildRects();
}

function updateHighlight() {
  if (!sel || G.state !== 'decor') { hl.visible = false; return; }
  hl.visible = true;
  hlMat.color.setHex(valid(sel) ? 0x7fd48a : 0xff5a5a);
  if (sel.def.kind === 'wall') {
    hl.rotation.set(0, 0, 0);
    hl.position.set(sel.mesh.position.x, sel.mesh.position.y, -HALF + 0.02);
    hl.scale.set(sel.def.w, 1.5, 1);
  } else {
    const [w, d] = dims(sel.def, sel.rec.r || 0);
    hl.rotation.set(-Math.PI / 2, 0, 0);
    hl.position.set(sel.mesh.position.x, 0.04, sel.mesh.position.z);
    hl.scale.set(w, d, 1);
  }
}
function select(e) {
  sel = e; updateHighlight();
  if (G.hooks.decorChanged) G.hooks.decorChanged();
}

function findSpot(def) {
  const e = { def, rec: { id: def.id, x: 0, z: 0, r: 0 } };
  if (def.kind === 'wall') {
    for (let x = 0; x <= N - def.w; x++) { e.rec.x = x; if (valid(e)) return e.rec; }
    return null;
  }
  const cands = [];
  for (const r of (def.w === def.d ? [0] : [0, 1])) {
    const [w, d] = dims(def, r);
    for (let x = 0; x <= N - w; x++) for (let z = 0; z <= N - d; z++) {
      cands.push({ x, z, r, k: Math.hypot(x + w / 2 - N / 2, z + d / 2 - N / 2 + 0.6) + r * 0.3 });
    }
  }
  cands.sort((a, b) => a.k - b.k);
  for (const c of cands) { e.rec.x = c.x; e.rec.z = c.z; e.rec.r = c.r; if (valid(e)) return e.rec; }
  return null;
}

const groundPlane = new THREE.Plane(new V3(0, 1, 0), 0), wallPlane = new THREE.Plane(new V3(0, 0, 1), HALF), hit = new V3();
const clampI = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Всё, что нужно панели обустройства.
export const decor = {
  selected: () => sel,
  counts(id) {
    const have = save.furn[id] || 0, used = placed.filter((e) => e.def.id === id).length;
    return { have, used, free: Math.max(0, have - used) };
  },
  enter() {
    grid.visible = true; sel = null; drag = null;
    B.pos.set(0, 0, 2.6); B.target = null; B.vel.set(0, 0, 0); exitArmed = false;
    updateHighlight();
  },
  exit() {
    if (sel && !valid(sel) && drag) Object.assign(sel.rec, drag.last);
    drag = null; sel = null; grid.visible = false; hl.visible = false;
    B.pos.set(0, 0, 2.6); exitArmed = false;
    placed.forEach((e) => { if (e.def.kind !== 'wall') e.mesh.position.y = 0; syncMesh(e); });
    rebuildRects(); persist();
  },
  pointerDown(raycaster) {
    const hits = raycaster.intersectObjects(placed.map((e) => e.mesh), true);
    const e = hits.length ? entryOf(hits[0].object) : null;
    if (!e) { select(null); return; }
    select(e);
    const wall = e.def.kind === 'wall';
    if (!raycaster.ray.intersectPlane(wall ? wallPlane : groundPlane, hit)) return;
    drag = { e, offx: hit.x + HALF - e.rec.x, offz: hit.z + HALF - e.rec.z, last: { x: e.rec.x, z: e.rec.z, r: e.rec.r || 0 }, moved: false };
  },
  pointerMove(raycaster) {
    if (!drag) return;
    const e = drag.e, wall = e.def.kind === 'wall';
    if (!raycaster.ray.intersectPlane(wall ? wallPlane : groundPlane, hit)) return;
    const [w, d] = dims(e.def, e.rec.r || 0);
    const nx = clampI(Math.round(hit.x + HALF - drag.offx), 0, N - w);
    const nz = wall ? 0 : clampI(Math.round(hit.z + HALF - drag.offz), 0, N - d);
    if (nx === e.rec.x && nz === e.rec.z) return;
    e.rec.x = nx; e.rec.z = nz; drag.moved = true;
    syncMesh(e); updateHighlight();
  },
  pointerUp() {
    if (!drag) return;
    const e = drag.e;
    if (!valid(e)) { Object.assign(e.rec, drag.last); syncMesh(e); if (drag.moved) { sfx.nope(); showHint('Тут занято', 1500); } }
    else if (drag.moved) { sfx.place(); persist(); }
    drag = null; rebuildRects(); updateHighlight();
  },
  // Берёт вещь из кладовки (или покупает) и ставит на свободное место.
  add(id) {
    const def = FURN_BY_ID[id]; if (!def) return 'none';
    const c = decor.counts(id);
    let bought = false;
    if (c.free <= 0) {
      if (save.carrots < def.price) { sfx.nope(); showHint(needText(def.price - save.carrots), 2500); return 'need'; }
      save.carrots -= def.price; save.furn[id] = c.have + 1; bought = true; updateCarrots(true);
    }
    const rec = findSpot(def);
    if (!rec) {
      persist(); sfx[bought ? 'buy' : 'nope']();
      showHint(bought ? def.name + ' пока в кладовке: в комнате нет места' : 'Нет свободного места. Убери что-нибудь', 3200);
      if (G.hooks.decorChanged) G.hooks.decorChanged();
      return 'full';
    }
    save.home.items.push(rec);
    const e = addEntry(rec);
    persist(); rebuildRects();
    sfx[bought ? 'buy' : 'place']();
    emit('spark', tmpV.set(e.mesh.position.x, def.kind === 'wall' ? e.mesh.position.y : 0.8, e.mesh.position.z + (def.kind === 'wall' ? 0.3 : 0)), 8);
    showHint(bought ? 'Куплено: ' + def.name + '. Перетащи, куда нравится' : 'Перетащи, куда нравится', 2600);
    select(e);
    return 'placed';
  },
  rotate() {
    const e = sel; if (!e) return;
    if (e.def.kind === 'wall') { sfx.nope(); showHint('Это висит на стене, повернуть не получится', 2200); return; }
    const old = { x: e.rec.x, z: e.rec.z, r: e.rec.r || 0 };
    const [w0, d0] = dims(e.def, old.r);
    e.rec.r = (old.r + 1) % 4;
    const [w1, d1] = dims(e.def, e.rec.r);
    const bx = clampI(Math.round(old.x + (w0 - w1) / 2), 0, N - w1), bz = clampI(Math.round(old.z + (d0 - d1) / 2), 0, N - d1);
    let ok = false;
    const tries = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (const [ox, oz] of tries) {
      e.rec.x = clampI(bx + ox, 0, N - w1); e.rec.z = clampI(bz + oz, 0, N - d1);
      if (valid(e)) { ok = true; break; }
    }
    if (!ok) { Object.assign(e.rec, old); sfx.nope(); showHint('Тут не повернуть: что-то мешает рядом', 2200); }
    else { sfx.turn(); persist(); }
    syncMesh(e); rebuildRects(); updateHighlight();
  },
  stow() {
    const e = sel; if (!e) return;
    group.remove(e.mesh);
    placed = placed.filter((o) => o !== e);
    save.home.items = save.home.items.filter((r) => r !== e.rec);
    persist(); rebuildRects(); sfx.stow();
    showHint(e.def.name + ' в кладовке', 1800);
    select(null);
  },
  setSurface(kind, id) {
    const o = (kind === 'wall' ? WALLS : FLOORS).find((s) => s.id === id); if (!o) return false;
    let bought = false;
    if (!save.home.surf.includes(id)) {
      if (save.carrots < o.price) { sfx.nope(); showHint(needText(o.price - save.carrots), 2500); return false; }
      save.carrots -= o.price; save.home.surf.push(id); bought = true; updateCarrots(true);
    }
    save.home[kind] = id; persist(); applySurfaces();
    sfx[bought ? 'buy' : 'tap']();
    return true;
  },
};

function collide(p, r) {
  for (const q of playRects) pushOutRect(p, r, q);
  p.x = clampI(p.x, -HALF + r, HALF - r);
  p.z = clampI(p.z, -HALF + r, HALF - 0.3);
}

export const home = {
  id: 'home',
  group,
  enter() {
    group.visible = true;
    scene.background.setHex(BG); scene.fog.color.setHex(BG); scene.fog.near = 400; scene.fog.far = 500;
    setLight(0.46, 0.2, 0.42, 0xf2d9c8);
    applySurfaces();
    B.pos.set(0, 0, 2.5); B.vel.set(0, 0, 0); B.face = Math.PI; B.target = null;
    exitArmed = false;
    if (!save.seen.home) {
      save.seen.home = 1; persist();
      setTimeout(() => { if (G.place === home && G.state === 'play') showHint('Это домик зайки! Кнопка с креслом наверху поможет его обустроить', 5200); }, 500);
    }
  },
  leave() { group.visible = false; },
  update(dt, t) {
    for (const e of placed) {
      if (e.mesh.userData.anim) e.mesh.userData.anim(t);
      if (e.def.kind !== 'wall') {
        const lift = drag && drag.e === e ? 0.22 : 0;
        e.mesh.position.y += (lift - e.mesh.position.y) * Math.min(1, dt * 14);
      }
    }
    exitArrow.position.z = EXIT.z - 0.25 + Math.sin(t * 5) * 0.08;
    if (G.state === 'play' && !G.busy) {
      const d = Math.hypot(B.pos.x - EXIT.x, B.pos.z - EXIT.z);
      if (!exitArmed) { if (d > 0.95) exitArmed = true; }
      else if (d < 0.55) { exitArmed = false; G.hooks.goPlace('meadow'); }
    }
  },
  collide,
  clampTarget(p) { p.x = clampI(p.x, -HALF + 0.4, HALF - 0.4); p.z = clampI(p.z, -HALF + 0.4, HALF - 0.3); },
  pointerDown(raycaster) {
    if (raycaster.intersectObject(bunny, true).length) { bunnyJump(true); return true; }
    const hits = raycaster.intersectObjects(placed.map((e) => e.mesh), true);
    const e = hits.length ? entryOf(hits[0].object) : null;
    if (e && e.def.id === 'wardrobe') { G.hooks.openWardrobe(); return true; }
    return false;
  },
  camera(dt, desired, look) {
    const dec = G.state === 'decor';
    const eff = (innerHeight - G.bottomInset) / innerHeight;
    const tv = Math.tan(camera.fov * Math.PI / 360), tanV = tv * eff, tanH = tv * camera.aspect;
    const el = (dec ? 62 : 50) * Math.PI / 180;
    const needW = 9.3, needH = N * Math.sin(el) + WALL_H * Math.cos(el) + 1.5;
    const d = Math.max(needW / 2 / tanH, needH / 2 / tanV);
    look.set(dec ? 0 : B.pos.x * 0.1, 1.0, -0.4);
    desired.set(look.x, look.y + Math.sin(el) * d, look.z + Math.cos(el) * d);
  },
};

loadItems();
applySurfaces();
