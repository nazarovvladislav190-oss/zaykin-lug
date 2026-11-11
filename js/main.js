// Точка входа: состояния игры, переходы между местами, управление, камера и главный цикл.
import { $, THREE, V3, G, isTouch, setBottomInset, scene, camera, renderer, canvas, sun, basic, mesh, tmpV, plural } from './core.js';
import { save, persist, exportSave, importSave } from './save.js';
import { ensureAudio, sfx } from './audio.js';
import { emit, updateParts } from './fx.js';
import { B, bunnyJump, updateBunny } from './bunny.js';
import { el, setUI, showHint, hideHint, updateCarrots, renderSound, renderWardrobe } from './ui.js';
import { meadow, spawnChicks, chickCounts, lostChicks } from './places/meadow.js';
import { home, decor } from './places/home.js';
import { renderDecor, layoutDecor } from './decor-ui.js';

const places = { meadow, home };
const fade = $('#fade');
let snapCamera = true;

// ---------- Места ----------
function setPlace(id, from) {
  if (G.place) G.place.leave();
  G.place = places[id];
  G.place.enter(from);
  B.target = null; marker.material.opacity = 0; markerT = 0;
  snapCamera = true;
  setUI();
}
G.hooks.goPlace = (id) => {
  if (G.busy || !places[id]) return;
  G.busy = true; B.target = null; pointerId = null;
  sfx.door(); hideHint();
  fade.classList.add('on');
  setTimeout(() => {
    const from = G.place.id;
    setPlace(id, from);
    setTimeout(() => { fade.classList.remove('on'); G.busy = false; }, 90);
  }, 240);
};

// ---------- Состояния ----------
let movedOnce = false;
function startLevel() {
  const n = spawnChicks();
  G.state = 'play'; setUI();
  if (!movedOnce) showHint(isTouch ? 'Нажми на травку, и зайка туда поскачет' : 'Нажми на травку или жми стрелки');
  else showHint('Луг ' + save.level + ': найди ' + n + ' ' + plural(n, 'цыплёнка', 'цыплят', 'цыплят'), 3200);
}
function openWardrobe() {
  if (G.state === 'wardrobe' || G.state === 'decor' || G.busy) return;
  ensureAudio();
  G.prevState = G.state; G.state = 'wardrobe'; B.target = null;
  el.note.textContent = '';
  renderWardrobe(); setUI(); G.hooks.wardLayout();
  setTimeout(() => $('#doneBtn').focus({ preventScroll: true }), 50);
}
function closeWardrobe() { G.state = G.prevState; setUI(); setBottomInset(0); snapCamera = G.place === home; }
// Картинка сдвигается вверх на высоту шкафа, чтобы зайку было видно целиком.
G.hooks.wardLayout = () => { if (G.state === 'wardrobe') setBottomInset(el.sheet.offsetHeight); };
G.hooks.openWardrobe = openWardrobe;

G.hooks.levelWin = () => {
  G.state = 'win'; setUI();
  save.carrots += 10; save.level += 1; persist();
  sfx.win();
  B.spinT = 0.7; B.vy = 7; B.happyT = 2;
  emit('conf', tmpV.set(B.pos.x, 1, B.pos.z), 70);
  emit('conf', tmpV.set(0, 1.5, 0), 50);
  emit('heart', tmpV.set(0, 2, 0), 12);
  setTimeout(() => {
    updateCarrots(true);
    const n = chickCounts().home;
    $('#winText').textContent = n + ' ' + plural(n, 'цыплёнок', 'цыплёнка', 'цыплят') + ' дома. Мама-курочка очень рада!';
    // Если в этот момент открыт шкаф, карточка победы появится после него.
    if (G.state === 'wardrobe') G.prevState = 'winPanel'; else { G.state = 'winPanel'; setUI(); }
  }, 1400);
};

function openDecor() {
  if (G.place !== home || G.state !== 'play' || G.busy) return;
  ensureAudio(); sfx.tap();
  G.state = 'decor'; decor.enter();
  setUI(); renderDecor(); layoutDecor();
  showHint('Перетаскивай вещи по комнате. Новые бери из каталога внизу', 4500);
}
function closeDecor() {
  decor.exit();
  G.state = 'play'; setUI(); layoutDecor();
}

$('#playBtn').addEventListener('click', () => { ensureAudio(); sfx.tap(); startLevel(); });
$('#startWard').addEventListener('click', openWardrobe);
$('#winWard').addEventListener('click', openWardrobe);
$('#wardBtn').addEventListener('click', openWardrobe);
$('#doneBtn').addEventListener('click', () => { sfx.tap(); closeWardrobe(); });
$('#nextBtn').addEventListener('click', () => { sfx.tap(); startLevel(); });
$('#soundBtn').addEventListener('click', () => { ensureAudio(); save.muted = !save.muted; persist(); renderSound(); sfx.tap(); });
$('#decorBtn').addEventListener('click', openDecor);
$('#decorDone').addEventListener('click', () => { sfx.tap(); closeDecor(); });

// Сохранение в файл и загрузка
const sNote = $('#settingsNote');
$('#settingsBtn').addEventListener('click', () => { ensureAudio(); sfx.tap(); sNote.textContent = ''; G.state = 'settings'; setUI(); });
$('#settingsBack').addEventListener('click', () => { sfx.tap(); G.state = 'menu'; setUI(); });
$('#exportBtn').addEventListener('click', () => { sfx.tap(); persist(); exportSave(); sNote.textContent = 'Файл zaykin-lug-save.json сохранён'; });
$('#importBtn').addEventListener('click', () => { sfx.tap(); $('#importFile').click(); });
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (await importSave(f)) location.reload();
  else { sfx.nope(); sNote.textContent = 'Этот файл не подошёл'; e.target.value = ''; }
});

// ---------- Управление ----------
const jumpBtn = el.jump;
jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); ensureAudio(); jumpBtn.classList.add('on'); bunnyJump(false); });
['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => jumpBtn.addEventListener(t, () => jumpBtn.classList.remove('on')));
jumpBtn.addEventListener('click', (e) => { if (e.detail === 0) bunnyJump(false); });

const marker = mesh(new THREE.RingGeometry(0.26, 0.4, 28), basic(0xffffff, { transparent: true, opacity: 0 }), 0, 0.04, 0, scene, false);
marker.rotation.x = -Math.PI / 2;
let markerT = 0;

const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const groundPlane = new THREE.Plane(new V3(0, 1, 0), 0), hitP = new V3();
function setRay(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
}
function firstMove() {
  if (movedOnce) return;
  movedOnce = true;
  if (G.place === meadow) showHint('Ищи цыплят! Стрелочка у зайки покажет дорогу', 4200);
}
function setTarget(e) {
  setRay(e);
  if (!raycaster.ray.intersectPlane(groundPlane, hitP)) return;
  G.place.clampTarget(hitP);
  B.target = hitP.clone(); B.stuckT = 0;
  marker.position.set(hitP.x, 0.04, hitP.z); markerT = 0.6;
  firstMove();
}
let pointerId = null;
canvas.addEventListener('pointerdown', (e) => {
  ensureAudio();
  if (G.busy) return;
  if (G.state === 'decor') {
    e.preventDefault(); setRay(e);
    pointerId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    decor.pointerDown(raycaster);
    return;
  }
  if (G.state !== 'play') return;
  e.preventDefault();
  setRay(e);
  if (G.place.pointerDown(raycaster)) return;
  pointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  setTarget(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== pointerId || G.busy) return;
  if (G.state === 'decor') { setRay(e); decor.pointerMove(raycaster); }
  else if (G.state === 'play') setTarget(e);
});
const endPtr = (e) => {
  if (e.pointerId !== pointerId) return;
  pointerId = null;
  if (G.state === 'decor') decor.pointerUp();
};
canvas.addEventListener('pointerup', endPtr);
canvas.addEventListener('pointercancel', endPtr);

const keys = {};
addEventListener('keydown', (e) => {
  if (G.state === 'play') {
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    keys[e.code] = true;
    if (e.code === 'Space' && !e.repeat) { ensureAudio(); bunnyJump(false); }
    if (/^(Arrow|Key[WASD])/.test(e.code)) firstMove();
  }
  if (e.code === 'Escape') {
    if (G.state === 'wardrobe') closeWardrobe();
    else if (G.state === 'decor') closeDecor();
    else if (G.state === 'settings') { G.state = 'menu'; setUI(); }
  }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('resize', () => G.hooks.wardLayout());
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const input = { dx: 0, dz: 0 };
function readKeys() {
  input.dx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  input.dz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
}

// ---------- Камера ----------
const camLook = new V3(0, 0.8, 4), desired = new V3(), lookGoal = new V3();
camera.position.set(6, 5, 12);
function updateCamera(dt) {
  if (G.state === 'wardrobe') {
    const eff = Math.max(0.25, (innerHeight - G.bottomInset) / innerHeight), tv = Math.tan(camera.fov * Math.PI / 360);
    const d = Math.max(4.4, 3.0 / (2 * tv * eff), 2.2 / (2 * tv * camera.aspect));
    lookGoal.set(B.pos.x, 1.15, B.pos.z);
    desired.set(B.pos.x, 1.15 + d * 0.2, B.pos.z + d);
  } else {
    G.place.camera(dt, desired, lookGoal);
  }
  if (snapCamera) { camera.position.copy(desired); camLook.copy(lookGoal); snapCamera = false; }
  else {
    camera.position.lerp(desired, 1 - Math.exp(-dt * 3.5));
    camLook.lerp(lookGoal, 1 - Math.exp(-dt * 6));
  }
  camera.lookAt(camLook);
  sun.position.set(B.pos.x + 8, 20, B.pos.z + 6);
  sun.target.position.set(B.pos.x, 0, B.pos.z);
}

// ---------- Запуск и цикл ----------
renderSound();
updateCarrots(false);
home.leave();
setPlace('meadow');
snapCamera = false;          // в меню камера плавно подлетает к лугу
spawnChicks();
setUI();

let prev = performance.now(), t = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
  readKeys();
  updateBunny(dt, t, input, pointerId !== null);
  G.place.update(dt, t);
  if (markerT > 0) {
    markerT -= dt;
    marker.material.opacity = Math.max(0, markerT / 0.6) * 0.9;
    const s = 0.6 + (1 - markerT / 0.6) * 0.8; marker.scale.set(s, s, s);
  } else marker.material.opacity = 0;
  updateParts(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

// Для проверок из консоли и автотестов.
window.__zl = { G, B, save, decor, lostChicks, goPlace: G.hooks.goPlace, openDecor, closeDecor };

// Офлайн-режим и установка на экран «Домой»
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
