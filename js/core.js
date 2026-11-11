// Общая основа: рендерер, сцена, камера, свет, материалы и мелкие помощники.
export const $ = (s) => document.querySelector(s);
export const THREE = window.THREE;
export const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');

function fail() { $('#fail').hidden = false; throw new Error('3D недоступно'); }
if (!THREE) fail();

export const V3 = THREE.Vector3;
export const tmpV = new V3();

// Общее состояние игры. hooks заполняет main.js, чтобы модули не зависели друг от друга по кругу.
export const G = {
  state: 'menu',       // menu | play | win | winPanel | wardrobe | decor | settings
  prevState: 'menu',
  place: null,         // текущее место (объект из js/places)
  busy: false,         // идёт переход между местами
  portrait: false,
  bottomInset: 0,      // высота нижней панели, под которую сдвигается картинка
  hooks: {},
};

let r;
try { r = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { fail(); }
export const renderer = r;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#stage').appendChild(renderer.domElement);
export const canvas = renderer.domElement;

export const SKY = 0xbfe4f7;
export const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 30, 62);
export const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

export function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  G.portrait = w < h;
  camera.fov = G.portrait ? 58 : 48;
  if (G.bottomInset > 0) camera.setViewOffset(w, h, 0, G.bottomInset / 2, w, h);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
export function setBottomInset(px) { G.bottomInset = px; resize(); }

export const hemi = new THREE.HemisphereLight(0xffffff, 0x9fd48a, 0.5); scene.add(hemi);
export const amb = new THREE.AmbientLight(0xfff4ea, 0.2); scene.add(amb);
export const sun = new THREE.DirectionalLight(0xfff1dc, 0.55);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
sun.shadow.bias = -0.0008;
scene.add(sun); scene.add(sun.target);
// Свет под место: на улице ярче, в домике мягче (иначе светлые стены и пол выгорают в белое).
export function setLight(h, a, s, ground) { hemi.intensity = h; amb.intensity = a; sun.intensity = s; hemi.groundColor.setHex(ground); }

// Мультяшные материалы. Важно: RGBFormat, иначе в r128 всё красится в красный.
export const grad = new THREE.DataTexture(new Uint8Array([150, 150, 150, 205, 205, 205, 255, 255, 255]), 3, 1, THREE.RGBFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
const matCache = {};
export const toon = (c) => matCache[c] || (matCache[c] = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }));
export const toonNew = (opts) => new THREE.MeshToonMaterial(Object.assign({ gradientMap: grad }, opts));
export const basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

export function mesh(geo, mat, x, y, z, parent, shadow) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (shadow !== false) m.castShadow = true;
  if (parent) parent.add(m);
  return m;
}

export const lerpA = (a, b, t) => {
  const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
};
export function plural(n, a, b, c) {
  const m = n % 10, h = n % 100;
  if (m === 1 && h !== 11) return a;
  if (m >= 2 && m <= 4 && (h < 12 || h > 14)) return b;
  return c;
}

// Сердечко для частиц, ковриков и картин.
const hs = new THREE.Shape();
hs.moveTo(0, 0.25); hs.bezierCurveTo(0, 0.3, -0.05, 0.4, -0.2, 0.4); hs.bezierCurveTo(-0.45, 0.4, -0.45, 0.12, -0.45, 0.12);
hs.bezierCurveTo(-0.45, -0.05, -0.3, -0.2, 0, -0.4); hs.bezierCurveTo(0.3, -0.2, 0.45, -0.05, 0.45, 0.12);
hs.bezierCurveTo(0.45, 0.12, 0.45, 0.4, 0.2, 0.4); hs.bezierCurveTo(0.05, 0.4, 0, 0.3, 0, 0.25);
export const heartGeo = new THREE.ShapeGeometry(hs); heartGeo.center();

// Выталкивает круг радиуса r из прямоугольника q = {x0, x1, z0, z1}.
export function pushOutRect(p, r, q) {
  const cx = Math.max(q.x0, Math.min(p.x, q.x1)), cz = Math.max(q.z0, Math.min(p.z, q.z1));
  const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return;
  if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; return; }
  const l = p.x - q.x0, rt = q.x1 - p.x, t = p.z - q.z0, b = q.z1 - p.z, m = Math.min(l, rt, t, b);
  if (m === l) p.x = q.x0 - r; else if (m === rt) p.x = q.x1 + r; else if (m === t) p.z = q.z0 - r; else p.z = q.z1 + r;
}
