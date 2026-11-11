// Зайка: модель, наряды, движение и анимация.
import { THREE, V3, G, scene, toon, toonNew, basic, mesh, lerpA, heartGeo, tmpV } from './core.js';
import { save } from './save.js';
import { COLORS, SLOTS } from './data.js';
import { sfx } from './audio.js';
import { emit } from './fx.js';

const furMat = toonNew({ color: 0xfdfbff });
export const bunny = new THREE.Group(); scene.add(bunny);
const bIn = new THREE.Group(); bunny.add(bIn);
const bBody = mesh(new THREE.SphereGeometry(0.55, 20, 14), furMat, 0, 0.58, 0, bIn); bBody.scale.set(1, 0.92, 0.95);
mesh(new THREE.SphereGeometry(0.34, 14, 10), toon(0xfff6f8), 0, 0.55, 0.3, bIn).scale.set(1, 1.1, 0.6);
const bHead = new THREE.Group(); bHead.position.set(0, 1.25, 0.08); bIn.add(bHead);
mesh(new THREE.SphereGeometry(0.5, 20, 14), furMat, 0, 0, 0, bHead).scale.set(1.05, 0.95, 0.95);
const ears = [];
[-1, 1].forEach((s) => {
  const pivot = new THREE.Group(); pivot.position.set(s * 0.2, 0.36, -0.04); pivot.rotation.z = -s * 0.16; bHead.add(pivot);
  mesh(new THREE.SphereGeometry(0.15, 12, 10), furMat, 0, 0.42, 0, pivot).scale.set(1, 3, 0.6);
  mesh(new THREE.SphereGeometry(0.09, 10, 8), toon(0xffb3c8), 0, 0.43, 0.06, pivot, false).scale.set(1, 3.3, 0.4);
  ears.push({ pivot, s });
});
const eyes = [];
[-1, 1].forEach((s) => {
  const e = new THREE.Group(); e.position.set(s * 0.19, 0.06, 0.43); bHead.add(e);
  mesh(new THREE.SphereGeometry(0.075, 10, 8), toon(0x3b2a3d), 0, 0, 0, e, false);
  mesh(new THREE.SphereGeometry(0.026, 6, 5), basic(0xffffff), 0.025, 0.03, 0.06, e, false);
  eyes.push(e);
  mesh(new THREE.SphereGeometry(0.09, 10, 8), toon(0xffa3c0), s * 0.31, -0.1, 0.36, bHead, false).scale.set(1, 0.6, 0.4);
});
mesh(new THREE.SphereGeometry(0.055, 8, 6), toon(0xff7aa2), 0, -0.06, 0.48, bHead, false).scale.set(1.2, 0.8, 1);
const feet = [];
[-1, 1].forEach((s) => {
  const f = mesh(new THREE.SphereGeometry(0.17, 10, 8), furMat, s * 0.26, 0.1, 0.22, bIn); f.scale.set(1, 0.6, 1.4); feet.push(f);
  mesh(new THREE.SphereGeometry(0.12, 10, 8), furMat, s * 0.44, 0.72, 0.3, bIn);
});
mesh(new THREE.SphereGeometry(0.2, 10, 8), toon(0xffffff), 0, 0.5, -0.55, bIn);

// Наряды для головы и лица крепятся к голове, для шеи и спинки — к телу.
const headAnchor = new THREE.Group(); bHead.add(headAnchor);
const bodyAnchor = new THREE.Group(); bIn.add(bodyAnchor);
let animated = [];

const DS = THREE.DoubleSide;
export function buildPiece(id) {
  const g = new THREE.Group();
  if (id === 'bow') {
    const m = toon(0xff4f8b);
    mesh(new THREE.ConeGeometry(0.15, 0.3, 4), m, -0.15, 0, 0, g).rotation.z = -Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.15, 0.3, 4), m, 0.15, 0, 0, g).rotation.z = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.08, 8, 6), toon(0xff7aa2), 0, 0, 0, g);
    g.position.set(0.3, 0.36, 0.14); g.rotation.set(0.2, 0, -0.35);
  } else if (id === 'wreath') {
    mesh(new THREE.TorusGeometry(0.36, 0.05, 6, 28), toon(0x4fb06a), 0, 0, 0, g).rotation.x = Math.PI / 2;
    const fc = [0xff8fb8, 0xffe27a, 0xffffff, 0xcdb8ff];
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      mesh(new THREE.SphereGeometry(0.075, 8, 6), toon(fc[i % 4]), Math.cos(a) * 0.36, 0.03, Math.sin(a) * 0.36, g);
    }
    g.position.set(0, 0.3, 0.02); g.rotation.x = 0.18;
  } else if (id === 'beret') {
    mesh(new THREE.SphereGeometry(0.33, 16, 10), toon(0xe8476a), 0, 0, 0, g).scale.set(1, 0.42, 1);
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 5), toon(0xc9365a), 0, 0.15, 0, g);
    g.position.set(0.1, 0.43, 0.03); g.rotation.set(0.12, 0, -0.28);
  } else if (id === 'straw') {
    mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.035, 22), toon(0xf3d58a), 0, 0, 0, g);
    mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.2, 18), toon(0xf3d58a), 0, 0.11, 0, g);
    mesh(new THREE.CylinderGeometry(0.275, 0.275, 0.07, 18), toon(0xff6f9f), 0, 0.055, 0, g, false);
    mesh(new THREE.SphereGeometry(0.06, 8, 6), toon(0xffffff), 0.2, 0.07, 0.2, g, false);
    mesh(new THREE.SphereGeometry(0.03, 6, 5), toon(0xffd23f), 0.215, 0.07, 0.25, g, false);
    g.position.set(0, 0.41, 0.02); g.rotation.x = 0.14;
  } else if (id === 'party') {
    mesh(new THREE.ConeGeometry(0.2, 0.52, 18), toon(0xb99cff), 0, 0.26, 0, g);
    mesh(new THREE.TorusGeometry(0.15, 0.025, 5, 18), toon(0xffe27a), 0, 0.12, 0, g).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.08, 8, 6), toon(0xffd23f), 0, 0.54, 0, g);
    g.position.set(0.02, 0.42, 0.14); g.rotation.set(0.25, 0, -0.1);
  } else if (id === 'crown') {
    const gold = toonNew({ color: 0xffcf40, side: DS, emissive: 0x3a2a00 });
    mesh(new THREE.CylinderGeometry(0.26, 0.23, 0.17, 12, 1, true), gold, 0, 0, 0, g);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      mesh(new THREE.ConeGeometry(0.055, 0.15, 5), gold, Math.cos(a) * 0.25, 0.15, Math.sin(a) * 0.25, g);
      mesh(new THREE.SphereGeometry(0.03, 6, 5), toon(i % 2 ? 0xff4f8b : 0x7fd0ff), Math.cos(a) * 0.25, 0.23, Math.sin(a) * 0.25, g, false);
    }
    g.position.set(0, 0.46, 0.06); g.rotation.x = 0.12;
  } else if (id === 'glasses') {
    const m = toon(0xff4f8b);
    [-1, 1].forEach((s) => {
      mesh(new THREE.TorusGeometry(0.13, 0.03, 6, 20), m, s * 0.19, 0.06, 0.5, g, false);
      mesh(new THREE.CircleGeometry(0.12, 18), basic(0xff9fc2, { transparent: true, opacity: 0.35 }), s * 0.19, 0.06, 0.5, g, false);
    });
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.13, 5), m, 0, 0.09, 0.52, g, false).rotation.z = Math.PI / 2;
  } else if (id === 'hearts') {
    const m = basic(0xff3f7f, { transparent: true, opacity: 0.88, side: DS });
    [-1, 1].forEach((s) => {
      const h = mesh(heartGeo, m, s * 0.2, 0.06, 0.5, g, false); h.scale.setScalar(0.34); h.rotation.y = s * 0.25;
    });
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 5), toon(0xc9365a), 0, 0.1, 0.53, g, false).rotation.z = Math.PI / 2;
  } else if (id === 'bowtie') {
    const m = toon(0xb99cff);
    mesh(new THREE.ConeGeometry(0.1, 0.22, 4), m, -0.11, 0, 0, g).rotation.z = -Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.1, 0.22, 4), m, 0.11, 0, 0, g).rotation.z = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.055, 8, 6), toon(0x8f6fe0), 0, 0, 0, g);
    g.position.set(0, 0.88, 0.47);
  } else if (id === 'scarf') {
    const m = toon(0xff6f9f);
    mesh(new THREE.TorusGeometry(0.39, 0.09, 8, 24), m, 0, 0.93, 0.04, g).rotation.x = Math.PI / 2;
    const end = mesh(new THREE.BoxGeometry(0.17, 0.36, 0.07), m, 0.2, 0.72, 0.43, g); end.rotation.set(-0.25, 0, -0.15);
    const tip = mesh(new THREE.BoxGeometry(0.175, 0.08, 0.075), toon(0xffd45c), 0.215, 0.6, 0.47, g, false); tip.rotation.set(-0.25, 0, -0.15);
  } else if (id === 'bell') {
    mesh(new THREE.TorusGeometry(0.39, 0.04, 6, 24), toon(0xff5a5a), 0, 0.93, 0.04, g).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.085, 10, 8), toonNew({ color: 0xffcf40, emissive: 0x3a2a00 }), 0, 0.86, 0.45, g);
    mesh(new THREE.SphereGeometry(0.025, 6, 5), toon(0x8a6a00), 0, 0.79, 0.47, g, false);
  } else if (id === 'beads') {
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      mesh(new THREE.SphereGeometry(0.052, 8, 6), toon(i % 2 ? 0xffb3d1 : 0xffffff),
        Math.sin(a) * 0.41, 0.93 - Math.cos(a) * 0.07, 0.04 + Math.cos(a) * 0.41, g);
    }
  } else if (id === 'backpack') {
    mesh(new THREE.BoxGeometry(0.52, 0.5, 0.28), toon(0x7fd0ff), 0, 0.86, -0.56, g);
    mesh(new THREE.BoxGeometry(0.54, 0.18, 0.3), toon(0x5fb6ec), 0, 1.03, -0.56, g);
    mesh(new THREE.BoxGeometry(0.3, 0.2, 0.06), toon(0xffd45c), 0, 0.78, -0.72, g);
    mesh(new THREE.SphereGeometry(0.035, 6, 5), toon(0xff6f9f), 0, 0.95, -0.72, g, false);
  } else if (id === 'cape') {
    const m = toonNew({ color: 0xff5a7d, side: DS });
    mesh(new THREE.CylinderGeometry(0.47, 0.7, 0.85, 16, 1, true, Math.PI / 2, Math.PI), m, 0, 0.5, 0, g);
    mesh(new THREE.TorusGeometry(0.4, 0.06, 6, 24), toon(0xffd45c), 0, 0.93, 0.04, g).rotation.x = Math.PI / 2;
  } else if (id === 'wings') {
    const m1 = basic(0xbfe9ff, { transparent: true, opacity: 0.75, side: DS, depthWrite: false });
    const m2 = basic(0xffc9e3, { transparent: true, opacity: 0.75, side: DS, depthWrite: false });
    const geo = new THREE.CircleGeometry(0.3, 18);
    const pivots = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.1, 0.92, -0.47); g.add(p);
      const up = mesh(geo, m1, s * 0.42, 0.3, 0, p, false); up.scale.set(1.25, 1.7, 1); up.rotation.z = -s * 0.55;
      const lo = mesh(geo, m2, s * 0.34, -0.22, 0, p, false); lo.scale.set(0.9, 1.1, 1); lo.rotation.z = s * 0.5;
      return { p, s };
    });
    g.userData.anim = (t) => pivots.forEach(({ p, s }) => { p.rotation.y = s * (0.35 + Math.sin(t * 9) * 0.3); });
  } else if (id === 'balloon') {
    const p = new THREE.Group(); p.position.set(0.22, 0.9, -0.42); g.add(p);
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 4), toon(0xffffff), 0, 0.72, 0, p, false);
    mesh(new THREE.SphereGeometry(0.3, 16, 12), toon(0xff6f9f), 0, 1.75, 0, p).scale.set(1, 1.15, 1);
    mesh(new THREE.ConeGeometry(0.05, 0.08, 6), toon(0xdf4f80), 0, 1.4, 0, p, false);
    mesh(new THREE.SphereGeometry(0.06, 6, 5), basic(0xffffff, { transparent: true, opacity: 0.7 }), -0.11, 1.88, 0.2, p, false);
    g.userData.anim = (t) => { p.rotation.z = Math.sin(t * 1.6) * 0.09 - 0.05; p.rotation.x = -0.12 + Math.sin(t * 1.1) * 0.05; };
  }
  return g;
}

export function applyLook() {
  const c = COLORS.find((c) => c.id === save.color) || COLORS[0];
  furMat.color.setHex(c.hex);
  [headAnchor, bodyAnchor].forEach((a) => { while (a.children.length) a.remove(a.children[0]); });
  animated = [];
  SLOTS.forEach((s) => {
    const id = save.outfit[s.id];
    if (!id || id === 'none') return;
    const piece = buildPiece(id);
    (s.id === 'head' || s.id === 'face' ? headAnchor : bodyAnchor).add(piece);
    if (piece.userData.anim) animated.push(piece.userData.anim);
  });
}
applyLook();

export const B = { pos: new V3(0, 0, 4), vel: new V3(), target: null, face: 0, hop: 0, y: 0, vy: 0, blinkT: 2, blinkD: 0, spinT: 0, spin: 0, stuckT: 0, happyT: 0 };

export function bunnyJump(happy) {
  if (B.y > 0.02) return;
  B.vy = 7.2; sfx.jump();
  if (happy) { B.spinT = 0.5; sfx.giggle(); emit('heart', tmpV.set(B.pos.x, 1.8, B.pos.z), 6); }
}

// input: {dx, dz} с клавиатуры; dragging — палец ещё на экране (тогда не считаем, что зайка застряла).
export function updateBunny(dt, t, input, dragging) {
  let dx = 0, dz = 0;
  const canMove = G.state === 'play' && !G.busy;
  if (canMove) {
    dx = input.dx; dz = input.dz;
    if (dx || dz) B.target = null;
    else if (B.target) {
      const tx = B.target.x - B.pos.x, tz = B.target.z - B.pos.z, d = Math.hypot(tx, tz);
      if (d > 0.2) { const f = Math.min(1, d); dx = tx / d * f; dz = tz / d * f; } else B.target = null;
    }
  }
  const l = Math.hypot(dx, dz); if (l > 1) { dx /= l; dz /= l; }
  const sp = 5.4, k = Math.min(1, dt * 10);
  B.vel.x += (dx * sp - B.vel.x) * k; B.vel.z += (dz * sp - B.vel.z) * k;
  const ox = B.pos.x, oz = B.pos.z;
  B.pos.x += B.vel.x * dt; B.pos.z += B.vel.z * dt;
  if (G.place) G.place.collide(B.pos, 0.5);
  const real = Math.hypot(B.pos.x - ox, B.pos.z - oz) / Math.max(dt, 1e-4);
  if (B.target && !dragging && real < 1.2) { B.stuckT += dt; if (B.stuckT > 0.35) B.target = null; } else B.stuckT = 0;
  const spd = Math.hypot(B.vel.x, B.vel.z);
  if (spd > 0.4) B.face = lerpA(B.face, Math.atan2(B.vel.x, B.vel.z), Math.min(1, dt * 12));
  else if (G.state !== 'play' && G.state !== 'win') B.face = lerpA(B.face, 0, Math.min(1, dt * 5));
  B.hop += dt * (4 + spd * 2.2);
  const amt = Math.min(1, spd / 3);
  const hopY = Math.abs(Math.sin(B.hop)) * 0.28 * amt;
  B.vy -= 20 * dt; B.y += B.vy * dt;
  if (B.y <= 0) {
    if (B.vy < -5) emit('spark', tmpV.set(B.pos.x, 0.1, B.pos.z), 4, 0xffffff);
    B.y = 0; B.vy = 0;
  }
  if (B.spinT > 0) { B.spinT -= dt; B.spin += dt * Math.PI * 2 / 0.6; if (B.spinT <= 0) B.spin = 0; }
  if (B.happyT > 0) { B.happyT -= dt; if (B.y === 0 && Math.random() < dt * 2.5) B.vy = 5; }
  bunny.position.set(B.pos.x, B.y + hopY, B.pos.z);
  bunny.rotation.y = B.face + B.spin;
  const squash = amt * Math.cos(B.hop * 2) * 0.06;
  const breathe = Math.sin(t * 2.4) * 0.015;
  bIn.scale.set(1 - squash + breathe, 1 + squash - breathe, 1 - squash + breathe);
  ears.forEach(({ pivot, s }, i) => {
    pivot.rotation.x = -0.15 - amt * Math.sin(B.hop * 2) * 0.25 - (B.vy > 0 ? 0.3 : 0) + Math.sin(t * 1.3 + i) * 0.04;
    pivot.rotation.z = -s * (0.16 + Math.max(0, Math.sin(t * 0.7 + i * 2)) * 0.12 * (1 - amt));
  });
  feet.forEach((f, i) => { f.position.z = 0.22 + (i ? -1 : 1) * Math.sin(B.hop) * 0.08 * amt; });
  B.blinkT -= dt;
  if (B.blinkT <= 0) { B.blinkD = 0.12; B.blinkT = 2 + Math.random() * 3; }
  B.blinkD -= dt;
  const eyeY = B.blinkD > 0 ? 0.15 : 1;
  eyes.forEach((e) => { e.scale.y = eyeY; });
  for (const a of animated) a(t);
}
