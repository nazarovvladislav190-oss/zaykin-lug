// Интерфейс поверх игры: счётчики, подсказки, шкаф с нарядами, видимость панелей.
import { $, G, tmpV, plural } from './core.js';
import { save, persist } from './save.js';
import { COLORS, SLOTS, OUTFITS } from './data.js';
import { sfx } from './audio.js';
import { emit } from './fx.js';
import { B, applyLook, buildPiece } from './bunny.js';
import { thumb } from './thumbs.js';

export const el = {
  hud: $('#hud'), carrotNum: $('#carrotNum'), carrotChip: $('#carrotChip'), lvl: $('#lvlName'), row: $('#chickRow'),
  hint: $('#hint'), jump: $('#jumpBtn'), overlay: $('#overlay'), pStart: $('#panelStart'), pWin: $('#panelWin'), pSettings: $('#panelSettings'),
  sheet: $('#sheet'), sheetCarrots: $('#sheetCarrots'), wardTabs: $('#wardTabs'), swatches: $('#swatches'), items: $('#items'), note: $('#note'),
  decor: $('#decor'), selActions: $('#selActions'), decorBtn: $('#decorBtn'),
};

export const CARROT_SVG = '<svg aria-hidden="true"><use href="#i-carrot"/></svg>';
export function needText(n) { return 'Нужно ещё ' + n + ' ' + plural(n, 'морковка', 'морковки', 'морковок'); }
export function shake(node) { node.classList.remove('shake'); void node.offsetWidth; node.classList.add('shake'); }

export function updateCarrots(bump) {
  el.carrotNum.textContent = save.carrots; el.sheetCarrots.textContent = save.carrots;
  if (bump) { el.carrotChip.classList.remove('bump'); void el.carrotChip.offsetWidth; el.carrotChip.classList.add('bump'); }
}

// Ряд цыплят в шапке: потерян — серый, идёт за зайкой — полупрозрачный, дома — яркий.
export function renderChickRow(total, home, follow) {
  el.row.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 32 32'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<use href="#i-chick"/>';
    el.row.appendChild(s);
  }
  updateChickRow(home, follow);
}
export function updateChickRow(home, follow) {
  const icons = el.row.children;
  for (let i = 0; i < icons.length; i++) {
    const cls = i < home ? 'home' : i < home + follow ? 'follow' : 'lost';
    if (icons[i].getAttribute('class') !== cls) icons[i].setAttribute('class', cls);
  }
  el.row.setAttribute('aria-label', 'Дома ' + home + ' из ' + icons.length);
}

let hintTimer = null;
export function showHint(text, ms) {
  clearTimeout(hintTimer);
  el.hint.textContent = text; el.hint.hidden = false;
  el.hint.style.animation = 'none'; void el.hint.offsetWidth; el.hint.style.animation = '';
  if (ms) hintTimer = setTimeout(() => { el.hint.hidden = true; }, ms);
}
export function hideHint() { clearTimeout(hintTimer); el.hint.hidden = true; }

export function renderSound() {
  $('#soundOn').style.display = save.muted ? 'none' : '';
  $('#soundOff').style.display = save.muted ? '' : 'none';
  $('#soundBtn').setAttribute('aria-label', save.muted ? 'Включить звук' : 'Выключить звук');
}

// Показывает и прячет панели по текущему состоянию и месту.
export function setUI() {
  const s = G.state, inHome = !!G.place && G.place.id === 'home';
  const playing = s === 'play';
  el.hud.hidden = !(playing || s === 'win' || s === 'decor');
  el.lvl.textContent = inHome ? 'Домик' : 'Луг ' + save.level;
  el.row.hidden = inHome;
  el.decorBtn.hidden = !(inHome && playing);
  el.jump.hidden = !playing;
  el.overlay.hidden = !(s === 'menu' || s === 'winPanel' || s === 'settings');
  el.pStart.hidden = s !== 'menu';
  el.pWin.hidden = s !== 'winPanel';
  el.pSettings.hidden = s !== 'settings';
  el.sheet.hidden = s !== 'wardrobe';
  el.decor.hidden = s !== 'decor';
  if (s !== 'decor') el.selActions.hidden = true;
  if (!playing && s !== 'decor') hideHint();
}

// ---------- Шкаф ----------
const NONE_ICON = '<svg class="ic" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="14" fill="none" stroke="#c9b3c9" stroke-width="4"/><path d="M14 34L34 14" stroke="#c9b3c9" stroke-width="4" stroke-linecap="round"/></svg>';
let wardTab = 'fur';

export function renderWardrobe() {
  const tabs = [{ id: 'fur', name: 'Шубка' }].concat(SLOTS);
  el.wardTabs.innerHTML = '';
  tabs.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tab' + (wardTab === t.id ? ' sel' : '');
    b.id = 'wtab-' + t.id;
    b.textContent = t.name;
    b.addEventListener('click', () => { wardTab = t.id; el.note.textContent = ''; sfx.tap(); renderWardrobe(); });
    el.wardTabs.appendChild(b);
  });

  el.swatches.hidden = wardTab !== 'fur';
  el.items.hidden = wardTab === 'fur';
  el.swatches.innerHTML = ''; el.items.innerHTML = '';

  if (wardTab === 'fur') {
    COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'sw' + (save.color === c.id ? ' sel' : '');
      b.id = 'sw-' + c.id;
      b.style.background = c.css;
      b.setAttribute('aria-label', 'Шубка: ' + c.name);
      b.addEventListener('click', () => {
        save.color = c.id; persist(); applyLook(); sfx.tap();
        emit('heart', tmpV.set(B.pos.x, 1.6, B.pos.z), 4); renderWardrobe();
      });
      el.swatches.appendChild(b);
    });
  } else {
    const slot = wardTab;
    const list = [{ id: 'none', slot, name: 'Ничего', price: 0 }].concat(OUTFITS.filter((o) => o.slot === slot));
    list.forEach((h) => {
      const owned = h.id === 'none' || save.owned.includes(h.id), sel = save.outfit[slot] === h.id;
      const b = document.createElement('button');
      b.id = 'fit-' + slot + '-' + h.id;
      b.className = 'item' + (sel ? ' sel' : '') + (owned ? '' : ' locked');
      const st = sel ? 'Надето' : owned ? 'Надеть' : CARROT_SVG + h.price;
      const pic = h.id === 'none' ? NONE_ICON : '<img class="ic" alt="" src="' + thumb('fit-' + h.id, () => buildPiece(h.id), 'front') + '">';
      b.innerHTML = pic + '<span class="nm">' + h.name + '</span><span class="st">' + st + '</span>';
      b.addEventListener('click', () => {
        if (owned) {
          save.outfit[slot] = h.id; persist(); applyLook(); sfx.tap(); el.note.textContent = '';
        } else if (save.carrots >= h.price) {
          save.carrots -= h.price; save.owned.push(h.id); save.outfit[slot] = h.id; persist(); applyLook();
          sfx.buy(); emit('heart', tmpV.set(B.pos.x, 1.8, B.pos.z), 10); emit('spark', tmpV.set(B.pos.x, 2, B.pos.z), 10);
          B.spinT = 0.6; updateCarrots(true);
          el.note.textContent = h.name + ': теперь твоё!';
        } else {
          sfx.nope();
          el.note.textContent = needText(h.price - save.carrots);
          shake(b);
          return;
        }
        renderWardrobe();
      });
      el.items.appendChild(b);
    });
  }
  updateCarrots(false);
  if (G.hooks.wardLayout) G.hooks.wardLayout();
}
