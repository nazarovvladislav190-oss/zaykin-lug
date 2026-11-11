// Модели мебели из простых фигур. Каждая строится вокруг центра своих клеток, лицом к камере (+z).
// Если у модели есть g.userData.anim(t), она оживает (огонь в камине, рыбки, стрелки часов).
import { THREE, toon, toonNew, basic, mesh, heartGeo } from './core.js';

const box = (w, h, d, c, x, y, z, g, sh) => mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'number' ? toon(c) : c, x, y, z, g, sh);
const cyl = (rt, rb, h, c, x, y, z, g, seg, sh) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), typeof c === 'number' ? toon(c) : c, x, y, z, g, sh);
const sph = (r, c, x, y, z, g, sh) => mesh(new THREE.SphereGeometry(r, 12, 9), typeof c === 'number' ? toon(c) : c, x, y, z, g, sh);

const WOOD = 0xdcae7c, WOOD_D = 0xc39462, CREAM = 0xfffaf2, PINK = 0xff9fc2, PINK_D = 0xff6f9f, MINT = 0xa9e3c6, LAV = 0xcdb8ff, BUTTER = 0xffd45c;
const BOOKS = [0xff6f9f, 0x7fd0ff, 0xffd45c, 0x8fd9a8, 0xb99cff, 0xff9a6b];

const build = {
  bed(g) {
    box(1.84, 0.34, 2.8, WOOD, 0, 0.19, 0, g);
    box(1.7, 0.24, 2.62, CREAM, 0, 0.46, 0.02, g);
    box(1.74, 0.27, 1.7, PINK, 0, 0.48, 0.5, g);
    box(1.74, 0.275, 0.24, 0xffffff, 0, 0.48, -0.42, g, false);
    sph(0.5, 0xffffff, 0, 0.64, -0.92, g).scale.set(1.25, 0.34, 0.66);
    box(1.84, 1.05, 0.16, WOOD, 0, 0.62, -1.36, g);
    cyl(0.92, 0.92, 0.16, WOOD, 0, 1.12, -1.36, g, 20).rotation.x = Math.PI / 2;
    mesh(heartGeo, basic(PINK_D), 0, 1.3, -1.27, g, false).scale.setScalar(0.5);
    box(1.84, 0.5, 0.12, WOOD, 0, 0.36, 1.36, g);
  },
  wardrobe(g) {
    box(1.8, 2.3, 0.8, WOOD, 0, 1.15, 0, g);
    box(1.9, 0.12, 0.9, WOOD_D, 0, 2.36, 0, g);
    [-1, 1].forEach((s) => {
      box(0.82, 2.0, 0.06, 0xf0cfa3, s * 0.43, 1.2, 0.41, g, false);
      sph(0.06, PINK_D, s * 0.1, 1.2, 0.46, g, false);
    });
    mesh(heartGeo, basic(PINK), 0, 1.95, 0.45, g, false).scale.setScalar(0.3);
    [-0.75, 0.75].forEach((x) => [-0.3, 0.3].forEach((z) => cyl(0.06, 0.05, 0.1, WOOD_D, x, 0.02, z, g, 8, false)));
  },
  chair(g) {
    box(0.62, 0.08, 0.6, MINT, 0, 0.44, 0.02, g);
    [-0.25, 0.25].forEach((x) => [-0.22, 0.26].forEach((z) => cyl(0.04, 0.04, 0.44, CREAM, x, 0.22, z, g, 6)));
    [-0.25, 0.25].forEach((x) => cyl(0.04, 0.04, 0.6, CREAM, x, 0.76, -0.24, g, 6));
    box(0.62, 0.34, 0.07, MINT, 0, 0.9, -0.24, g);
    sph(0.26, PINK, 0, 0.5, 0.02, g, false).scale.set(1, 0.25, 1);
  },
  table(g) {
    cyl(0.46, 0.46, 0.07, CREAM, 0, 0.62, 0, g, 22);
    cyl(0.07, 0.07, 0.6, WOOD, 0, 0.3, 0, g, 8);
    cyl(0.26, 0.3, 0.05, WOOD, 0, 0.025, 0, g, 14);
    cyl(0.1, 0.07, 0.11, 0xffffff, 0.12, 0.72, 0.05, g, 12);
    cyl(0.085, 0.085, 0.01, 0xd98a4a, 0.12, 0.775, 0.05, g, 12, false);
    cyl(0.16, 0.16, 0.02, PINK, -0.16, 0.67, -0.08, g, 14, false);
    sph(0.07, 0xff8a3d, -0.16, 0.72, -0.08, g, false);
  },
  plant(g) {
    cyl(0.28, 0.2, 0.36, 0xe58f6a, 0, 0.18, 0, g, 12);
    cyl(0.3, 0.3, 0.07, 0xf0a580, 0, 0.36, 0, g, 12);
    cyl(0.03, 0.04, 0.6, 0x8a6a4a, 0, 0.66, 0, g, 6);
    [[0, 1.1, 0, 0.36], [0.24, 0.86, 0.1, 0.25], [-0.24, 0.9, -0.05, 0.27], [0.03, 1.4, -0.04, 0.24]].forEach(([x, y, z, r], i) => {
      mesh(new THREE.IcosahedronGeometry(r, 1), toon([0x62bb61, 0x7fd174, 0x55ab58][i % 3]), x, y, z, g);
    });
  },
  crate(g) {
    box(0.8, 0.46, 0.8, WOOD, 0, 0.23, 0, g);
    box(0.84, 0.08, 0.84, WOOD_D, 0, 0.44, 0, g);
    box(0.84, 0.08, 0.84, WOOD_D, 0, 0.1, 0, g);
    [[-0.2, -0.18], [0.2, -0.2], [0, 0.05], [-0.22, 0.2], [0.22, 0.18]].forEach(([x, z], i) => {
      const c = mesh(new THREE.ConeGeometry(0.11, 0.42, 8), toon(0xff8a3d), x, 0.5, z, g); c.rotation.x = Math.PI; c.rotation.z = (i - 2) * 0.08;
      mesh(new THREE.ConeGeometry(0.07, 0.24, 5), toon(0x4fb06a), x, 0.8, z, g, false);
    });
  },
  flowers(g) {
    cyl(0.3, 0.3, 0.06, CREAM, 0, 0.55, 0, g, 16);
    cyl(0.05, 0.05, 0.52, WOOD, 0, 0.27, 0, g, 8);
    cyl(0.2, 0.24, 0.04, WOOD, 0, 0.02, 0, g, 12);
    cyl(0.1, 0.15, 0.3, 0x9fd8f2, 0, 0.73, 0, g, 12);
    [[0, 1.22, 0, PINK_D], [0.14, 1.1, 0.06, BUTTER], [-0.14, 1.12, -0.02, 0xffffff], [0.04, 1.05, -0.12, LAV], [-0.06, 1.0, 0.13, 0xff8fa8]].forEach(([x, y, z, c]) => {
      cyl(0.012, 0.012, y - 0.85, 0x4fa85a, x * 0.6, (y + 0.85) / 2, z * 0.6, g, 4, false);
      sph(0.085, c, x, y, z, g);
      sph(0.035, 0xffd23f, x, y + 0.02, z + 0.07, g, false);
    });
  },
  lamp(g) {
    cyl(0.24, 0.27, 0.06, WOOD_D, 0, 0.03, 0, g, 14);
    cyl(0.03, 0.03, 1.5, CREAM, 0, 0.8, 0, g, 8);
    cyl(0.2, 0.38, 0.42, toonNew({ color: 0xffe9a8, emissive: 0x7a5a10 }), 0, 1.68, 0, g, 16);
    sph(0.1, basic(0xfff6d0), 0, 1.55, 0, g, false);
  },
  armchair(g) {
    box(0.92, 0.34, 0.84, PINK, 0, 0.27, 0.02, g);
    box(0.92, 0.72, 0.24, PINK, 0, 0.72, -0.3, g);
    cyl(0.46, 0.46, 0.24, PINK, 0, 1.08, -0.3, g, 18).rotation.x = Math.PI / 2;
    [-1, 1].forEach((s) => {
      box(0.2, 0.3, 0.84, PINK_D, s * 0.38, 0.55, 0.02, g);
      cyl(0.1, 0.1, 0.84, PINK_D, s * 0.38, 0.7, 0.02, g, 10).rotation.x = Math.PI / 2;
    });
    sph(0.3, CREAM, 0, 0.5, 0.08, g, false).scale.set(0.9, 0.3, 0.9);
    [-0.35, 0.35].forEach((x) => [-0.3, 0.34].forEach((z) => cyl(0.05, 0.04, 0.1, WOOD_D, x, 0.05, z, g, 6, false)));
  },
  teddy(g) {
    const br = 0xc99a6b, li = 0xf0d2a8;
    sph(0.3, br, 0, 0.32, 0, g).scale.set(1, 1.05, 0.9);
    sph(0.17, li, 0, 0.3, 0.2, g, false).scale.set(1, 1.1, 0.5);
    sph(0.24, br, 0, 0.78, 0.02, g);
    sph(0.1, li, 0, 0.73, 0.21, g, false).scale.set(1.1, 0.8, 0.7);
    sph(0.035, 0x3b2a3d, 0, 0.77, 0.29, g, false);
    [-1, 1].forEach((s) => {
      sph(0.09, br, s * 0.19, 0.98, 0, g);
      sph(0.045, li, s * 0.19, 0.98, 0.06, g, false);
      sph(0.03, 0x3b2a3d, s * 0.09, 0.84, 0.22, g, false);
      sph(0.11, br, s * 0.3, 0.42, 0.1, g).scale.set(0.8, 1.3, 0.8);
      sph(0.13, br, s * 0.18, 0.1, 0.24, g).scale.set(0.9, 0.7, 1.3);
    });
    const bw = toon(PINK_D);
    mesh(new THREE.ConeGeometry(0.07, 0.14, 4), bw, -0.07, 0.56, 0.22, g, false).rotation.z = -Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.07, 0.14, 4), bw, 0.07, 0.56, 0.22, g, false).rotation.z = Math.PI / 2;
  },
  bookshelf(g) {
    box(1.8, 1.8, 0.5, WOOD, 0, 0.9, 0, g);
    box(1.6, 1.6, 0.06, WOOD_D, 0, 0.9, 0.2, g, false);
    box(1.9, 0.1, 0.56, WOOD_D, 0, 1.84, 0, g);
    [0.18, 0.72, 1.26].forEach((y, row) => {
      box(1.62, 0.05, 0.44, 0xf0cfa3, 0, y - 0.03, 0.04, g, false);
      let x = -0.74, i = row * 3;
      while (x < 0.6) {
        const w = 0.1 + ((i * 7) % 5) * 0.015, h = 0.3 + ((i * 5) % 4) * 0.035;
        if ((i + row) % 6 !== 5) box(w, h, 0.3, BOOKS[i % BOOKS.length], x + w / 2, y + h / 2, 0.1, g, false);
        x += w + 0.015; i++;
      }
    });
    sph(0.12, MINT, 0.64, 1.38, 0.1, g, false);
  },
  sofa(g) {
    box(1.88, 0.34, 0.84, LAV, 0, 0.27, 0.02, g);
    box(1.88, 0.7, 0.24, LAV, 0, 0.7, -0.3, g);
    [-1, 1].forEach((s) => {
      box(0.2, 0.34, 0.84, 0xb39cf0, s * 0.86, 0.55, 0.02, g);
      cyl(0.1, 0.1, 0.84, 0xb39cf0, s * 0.86, 0.72, 0.02, g, 10).rotation.x = Math.PI / 2;
      sph(0.36, CREAM, s * 0.37, 0.5, 0.08, g, false).scale.set(1, 0.26, 0.9);
    });
    const p = box(0.34, 0.34, 0.12, BUTTER, -0.5, 0.72, -0.12, g); p.rotation.set(-0.25, 0, 0.2);
    [-0.8, 0.8].forEach((x) => [-0.3, 0.34].forEach((z) => cyl(0.05, 0.04, 0.1, WOOD_D, x, 0.05, z, g, 6, false)));
  },
  aquarium(g) {
    box(1.8, 0.6, 0.7, WOOD, 0, 0.3, 0, g);
    box(1.86, 0.06, 0.76, WOOD_D, 0, 0.62, 0, g);
    box(1.6, 0.1, 0.56, 0xf3e2b8, 0, 0.7, 0, g, false);
    [[-0.5, 0.86, 0.1], [0.55, 0.84, -0.1]].forEach(([x, y, z]) => {
      cyl(0.02, 0.03, 0.34, 0x4fb06a, x, y + 0.05, z, g, 5, false); cyl(0.02, 0.03, 0.24, 0x62bb61, x + 0.08, y, z + 0.05, g, 5, false);
    });
    sph(0.1, 0xdfe6e8, 0.1, 0.78, 0.1, g, false);
    const fish = [[0xff8a3d, 1.02, 0.1, 0], [0xff6f9f, 1.22, -0.08, 2.1], [0xffd45c, 0.92, -0.02, 4.2]].map(([c, y, z, ph]) => {
      const f = new THREE.Group(); g.add(f);
      sph(0.08, c, 0, 0, 0, f, false).scale.set(1.4, 1, 0.6);
      mesh(new THREE.ConeGeometry(0.07, 0.12, 4), toon(c), -0.15, 0, 0, f, false).rotation.z = -Math.PI / 2;
      sph(0.018, 0x3b2a3d, 0.07, 0.02, 0.04, f, false);
      return { f, y, z, ph };
    });
    mesh(new THREE.BoxGeometry(1.64, 0.82, 0.6), basic(0x8ad7f2, { transparent: true, opacity: 0.38, depthWrite: false }), 0, 1.06, 0, g, false);
    box(1.7, 0.06, 0.66, CREAM, 0, 1.5, 0, g, false);
    g.userData.anim = (t) => fish.forEach(({ f, y, z, ph }) => {
      const a = t * 0.7 + ph, x = Math.sin(a) * 0.55;
      f.position.set(x, y + Math.sin(t * 1.3 + ph) * 0.05, z);
      f.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI;
    });
  },
  fireplace(g) {
    const brick = 0xf0b5a8;
    box(1.8, 1.4, 0.6, brick, 0, 0.7, -0.1, g);
    box(1.94, 0.12, 0.74, CREAM, 0, 1.46, -0.06, g);
    box(1.0, 1.8, 0.4, brick, 0, 2.4, -0.2, g);
    box(1.0, 0.8, 0.1, 0x5b3a5e, 0, 0.45, 0.17, g, false);
    cyl(0.5, 0.5, 0.1, 0x5b3a5e, 0, 0.85, 0.17, g, 18, false).rotation.x = Math.PI / 2;
    [-0.2, 0.2].forEach((x) => cyl(0.07, 0.07, 0.6, 0xa0714f, x * 0.6, 0.1, 0.26, g, 7, false).rotation.z = Math.PI / 2 + x);
    const flames = [[0, 0.24, 0.42, 0xff8a3d], [-0.18, 0.18, 0.3, 0xffb23d], [0.18, 0.18, 0.32, 0xffb23d], [0, 0.16, 0.24, 0xffe27a]].map(([x, r, h, c], i) => {
      const f = mesh(new THREE.ConeGeometry(r * 0.7, h, 7), basic(c), x, 0.16 + h / 2, 0.26 + (i === 3 ? 0.04 : 0), g, false);
      return { f, h, ph: i * 1.7 };
    });
    sph(0.07, PINK_D, -0.6, 1.59, 0, g, false); cyl(0.06, 0.08, 0.2, MINT, 0.6, 1.62, 0, g, 8, false);
    g.userData.anim = (t) => flames.forEach(({ f, h, ph }) => {
      const s = 1 + Math.sin(t * 9 + ph) * 0.16 + Math.sin(t * 15.3 + ph * 2) * 0.08;
      f.scale.set(1, s, 1); f.position.y = 0.16 + h * s / 2;
    });
  },

  rug_round(g) {
    const a = cyl(0.95, 0.95, 0.03, PINK, 0, 0.02, 0, g, 30, false); a.receiveShadow = true;
    cyl(0.68, 0.68, 0.032, 0xffc4d8, 0, 0.022, 0, g, 30, false).receiveShadow = true;
    cyl(0.36, 0.36, 0.034, CREAM, 0, 0.024, 0, g, 24, false).receiveShadow = true;
  },
  rug_stripe(g) {
    box(2.8, 0.03, 1.8, CREAM, 0, 0.02, 0, g, false).receiveShadow = true;
    [-1.05, -0.35, 0.35, 1.05].forEach((x, i) => { box(0.36, 0.034, 1.8, [MINT, PINK, BUTTER, LAV][i], x, 0.021, 0, g, false).receiveShadow = true; });
    [-1, 1].forEach((s) => { for (let i = 0; i < 7; i++) box(0.05, 0.02, 0.14, CREAM, s * 1.42, 0.015, -0.78 + i * 0.26, g, false).rotation.y = Math.PI / 2; });
  },
  rug_heart(g) {
    const h = mesh(heartGeo, toon(PINK_D), 0, 0.022, 0.05, g, false); h.rotation.x = -Math.PI / 2; h.scale.setScalar(2.15); h.receiveShadow = true;
    const h2 = mesh(heartGeo, toon(0xffc4d8), 0, 0.03, 0.05, g, false); h2.rotation.x = -Math.PI / 2; h2.scale.setScalar(1.35); h2.receiveShadow = true;
  },

  // Настенное: центр на высоте полки, спиной к стене (z = 0 — плоскость стены).
  pic_carrot(g) {
    box(0.8, 0.8, 0.07, WOOD, 0, 0, 0.035, g);
    box(0.64, 0.64, 0.02, 0xdff3ff, 0, 0, 0.075, g, false);
    const c = mesh(new THREE.ConeGeometry(0.11, 0.38, 8), toon(0xff8a3d), 0.02, -0.05, 0.1, g, false); c.rotation.z = Math.PI + 0.35; c.scale.z = 0.3;
    mesh(new THREE.ConeGeometry(0.07, 0.18, 5), toon(0x4fb06a), -0.07, 0.2, 0.1, g, false).scale.z = 0.3;
  },
  pic_heart(g) {
    box(0.8, 0.8, 0.07, CREAM, 0, 0, 0.035, g);
    box(0.64, 0.64, 0.02, 0xffe3ec, 0, 0, 0.075, g, false);
    mesh(heartGeo, basic(PINK_D), 0, 0, 0.09, g, false).scale.setScalar(0.5);
  },
  clock(g) {
    cyl(0.4, 0.4, 0.07, PINK_D, 0, 0, 0.035, g, 24).rotation.x = Math.PI / 2;
    cyl(0.33, 0.33, 0.02, CREAM, 0, 0, 0.075, g, 24, false).rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; sph(i % 3 ? 0.014 : 0.026, 0x8f7291, Math.sin(a) * 0.27, Math.cos(a) * 0.27, 0.09, g, false); }
    const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = 0.095; g.add(hh, mh);
    box(0.035, 0.16, 0.012, 0x5b3a5e, 0, 0.07, 0, hh, false); box(0.025, 0.24, 0.012, PINK_D, 0, 0.11, 0, mh, false);
    sph(0.03, 0x5b3a5e, 0, 0, 0.1, g, false);
    [-1, 1].forEach((s) => sph(0.1, PINK_D, s * 0.24, 0.36, 0.03, g).scale.set(1, 1, 0.5));
    g.userData.anim = (t) => { mh.rotation.z = -t * 0.5; hh.rotation.z = -t * 0.5 / 12; };
  },
  shelf(g) {
    box(1.7, 0.07, 0.3, WOOD, 0, -0.2, 0.15, g);
    [-0.7, 0.7].forEach((x) => box(0.06, 0.2, 0.22, WOOD_D, x, -0.32, 0.11, g, false));
    cyl(0.1, 0.08, 0.14, 0xe58f6a, -0.55, -0.09, 0.16, g, 10);
    mesh(new THREE.IcosahedronGeometry(0.14, 1), toon(0x62bb61), -0.55, 0.1, 0.16, g);
    [0xff6f9f, 0x7fd0ff, 0xffd45c].forEach((c, i) => box(0.08, 0.26 + i * 0.03, 0.2, c, -0.12 + i * 0.1, -0.03 + i * 0.015, 0.14, g, false));
    sph(0.1, 0xffd84d, 0.5, -0.07, 0.16, g); sph(0.07, 0xffd84d, 0.5, 0.07, 0.19, g);
    mesh(new THREE.ConeGeometry(0.025, 0.06, 5), toon(0xff9a3c), 0.5, 0.06, 0.27, g, false).rotation.x = Math.PI / 2;
  },
  window(g) {
    box(1.76, 1.26, 0.08, 0xffffff, 0, 0, 0.04, g);
    box(1.56, 1.06, 0.02, basic(0xbfe4f7), 0, 0, 0.085, g, false);
    sph(0.2, basic(0xffffff), -0.3, 0.2, 0.08, g, false).scale.set(1.6, 0.7, 0.2);
    sph(0.15, basic(0xffffff), 0.35, -0.02, 0.08, g, false).scale.set(1.5, 0.7, 0.2);
    cyl(0.5, 0.5, 0.02, basic(0xa6de88), 0.2, -0.75, 0.09, g, 20, false).rotation.x = Math.PI / 2;
    box(1.56, 0.3, 0.03, basic(0xa6de88), 0, -0.4, 0.088, g, false);
    box(0.06, 1.1, 0.04, 0xffffff, 0, 0, 0.1, g, false); box(1.6, 0.06, 0.04, 0xffffff, 0, 0, 0.1, g, false);
    box(1.9, 0.08, 0.2, 0xffffff, 0, -0.66, 0.1, g);
    [-1, 1].forEach((s) => { const c = box(0.34, 1.2, 0.06, PINK, s * 0.78, 0.02, 0.14, g); c.rotation.z = s * 0.05; });
    cyl(0.03, 0.03, 2.0, WOOD_D, 0, 0.68, 0.14, g, 6, false).rotation.z = Math.PI / 2;
  },
  garland(g) {
    const cols = [PINK_D, BUTTER, 0x7fd0ff, 0x8fd9a8, LAV];
    const n = 11, w = 3.7;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), x = (k - 0.5) * w, y = -0.34 * Math.sin(k * Math.PI);
      const f = mesh(new THREE.ConeGeometry(0.15, 0.3, 3), toon(cols[i % cols.length]), x, y - 0.15, 0.04, g, false);
      f.rotation.set(0, Math.PI, Math.PI); f.scale.z = 0.25;
      if (i < n - 1) {
        const k2 = (i + 1) / (n - 1), x2 = (k2 - 0.5) * w, y2 = -0.34 * Math.sin(k2 * Math.PI);
        const s = cyl(0.012, 0.012, Math.hypot(x2 - x, y2 - y), 0xffffff, (x + x2) / 2, (y + y2) / 2, 0.03, g, 4, false);
        s.rotation.z = Math.atan2(y2 - y, x2 - x) + Math.PI / 2;
      }
    }
  },
};

export function buildFurniture(id) {
  const g = new THREE.Group();
  if (build[id]) build[id](g);
  return g;
}
