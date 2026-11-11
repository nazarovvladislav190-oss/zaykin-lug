// Сохранение: версия 2. Старый прогресс «Зайкина луга» (v1) переносится автоматически.
const KEY = 'zaykin-dolina-v2';
const OLD_KEY = 'zaykin-lug-v1';

function defaults() {
  return {
    v: 2,
    carrots: 0,
    level: 1,
    muted: false,
    color: 'white',
    outfit: { head: 'none', face: 'none', neck: 'none', back: 'none' },
    owned: [],                                   // купленные наряды
    furn: { bed: 1, wardrobe: 1, rug_round: 1 }, // сколько штук каждой мебели есть
    home: {
      wall: 'cream', floor: 'wood', surf: ['cream', 'wood'],
      items: [
        { id: 'bed', x: 0, z: 0, r: 0 },
        { id: 'wardrobe', x: 5, z: 0, r: 0 },
        { id: 'rug_round', x: 3, z: 3, r: 0 },
      ],
    },
    seen: {},                                    // какие подсказки уже показывали
  };
}

function fromV1(o) {
  const s = defaults();
  if (typeof o.carrots === 'number') s.carrots = o.carrots;
  if (typeof o.level === 'number') s.level = o.level;
  s.muted = !!o.muted;
  if (typeof o.color === 'string') s.color = o.color;
  if (Array.isArray(o.owned)) s.owned = o.owned.filter((id) => id !== 'none');
  if (o.hat && o.hat !== 'none') s.outfit[o.hat === 'glasses' ? 'face' : 'head'] = o.hat;
  return s;
}

function normalize(o) {
  const d = defaults();
  if (!o || typeof o !== 'object') return d;
  if (o.v !== 2) return fromV1(o);
  const s = Object.assign(d, o);
  s.outfit = Object.assign(defaults().outfit, o.outfit || {});
  s.home = Object.assign(defaults().home, o.home || {});
  if (!Array.isArray(s.home.items)) s.home.items = defaults().home.items;
  if (!Array.isArray(s.home.surf)) s.home.surf = ['cream', 'wood'];
  if (!Array.isArray(s.owned)) s.owned = [];
  if (!s.furn || typeof s.furn !== 'object') s.furn = defaults().furn;
  if (!s.seen || typeof s.seen !== 'object') s.seen = {};
  s.carrots = Math.max(0, Math.floor(Number(s.carrots) || 0));
  s.level = Math.max(1, Math.floor(Number(s.level) || 1));
  return s;
}

function read() {
  try {
    const cur = localStorage.getItem(KEY);
    if (cur) return normalize(JSON.parse(cur));
    const old = localStorage.getItem(OLD_KEY);
    if (old) return fromV1(JSON.parse(old));
  } catch (e) {}
  return defaults();
}

export const save = read();
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }

export function exportSave() {
  const blob = new Blob([JSON.stringify(save, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'zaykin-lug-save.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Возвращает true, если файл подошёл (после этого страницу нужно перезагрузить).
export async function importSave(file) {
  try {
    const o = JSON.parse(await file.text());
    if (!o || typeof o !== 'object' || typeof o.carrots !== 'number') return false;
    const s = normalize(o);
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch (e) { return false; }
}
