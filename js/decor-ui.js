// Нижняя панель обустройства домика: вкладки каталога и карточки вещей.
import { $, G, setBottomInset } from './core.js';
import { save } from './save.js';
import { FURN, WALLS, FLOORS } from './data.js';
import { sfx } from './audio.js';
import { decor } from './places/home.js';
import { buildFurniture } from './furniture.js';
import { thumb } from './thumbs.js';
import { el, CARROT_SVG, shake } from './ui.js';

const TABS = [
  { id: 'floor', name: 'Мебель' },
  { id: 'rug', name: 'Коврики' },
  { id: 'wall', name: 'На стену' },
  { id: 'surf', name: 'Стены и пол' },
];
let tab = 'floor';
const tabsEl = $('#decorTabs'), strip = $('#decorStrip');

function card(id, pic, name, st, cls, onClick) {
  const b = document.createElement('button');
  b.className = 'card-it ' + cls; b.id = id;
  b.innerHTML = pic + '<span class="nm">' + name + '</span><span class="st">' + st + '</span>';
  b.addEventListener('click', () => onClick(b));
  strip.appendChild(b);
}

export function renderDecor() {
  tabsEl.innerHTML = '';
  TABS.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tab' + (tab === t.id ? ' sel' : ''); b.id = 'dtab-' + t.id; b.textContent = t.name;
    b.addEventListener('click', () => { tab = t.id; sfx.tap(); strip.scrollLeft = 0; renderDecor(); });
    tabsEl.appendChild(b);
  });

  const keep = strip.scrollLeft;
  strip.innerHTML = '';
  if (tab === 'surf') {
    [['wall', WALLS], ['floor', FLOORS]].forEach(([kind, list]) => list.forEach((o) => {
      const owned = save.home.surf.includes(o.id), on = save.home[kind] === o.id;
      const st = on ? 'Выбрано' : owned ? 'Выбрать' : CARROT_SVG + o.price;
      card('surf-' + o.id, '<span class="swatch" style="background:' + o.css + '"></span>', o.name, st, (on ? 'sel' : '') + (owned ? '' : ' buy'),
        (b) => { if (decor.setSurface(kind, o.id)) renderDecor(); else shake(b); });
    }));
  } else {
    const selId = decor.selected() ? decor.selected().def.id : null;
    FURN.filter((f) => f.kind === tab).forEach((f) => {
      const c = decor.counts(f.id);
      const st = c.free > 0 ? 'Есть: ' + c.free : CARROT_SVG + f.price;
      const view = f.kind === 'rug' ? 'top' : f.kind === 'wall' ? 'front' : undefined;
      const pic = '<img alt="" src="' + thumb('furn-' + f.id, () => buildFurniture(f.id), view) + '">';
      card('furn-' + f.id, pic, f.name, st, (selId === f.id ? 'sel' : '') + (c.free > 0 ? '' : ' buy'),
        (b) => { const r = decor.add(f.id); if (r === 'need') shake(b); });
    });
  }
  strip.scrollLeft = keep;
  el.selActions.hidden = !decor.selected() || G.state !== 'decor';
}

// Картинка сдвигается вверх на высоту панели, чтобы комнату не закрывало.
export function layoutDecor() {
  const h = el.decor.hidden ? 0 : el.decor.offsetHeight;
  setBottomInset(h);
  el.selActions.style.bottom = (h + 14) + 'px';
}

G.hooks.decorChanged = () => { if (G.state === 'decor') renderDecor(); };
$('#rotBtn').addEventListener('click', () => decor.rotate());
$('#stowBtn').addEventListener('click', () => decor.stow());
addEventListener('resize', () => { if (G.state === 'decor') layoutDecor(); });
