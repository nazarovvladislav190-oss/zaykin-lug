// Каталоги: шубки, наряды, мебель, отделка. Чтобы добавить вещь, допишите строку здесь
// и её модель в bunny.js (наряды) или furniture.js (мебель).

export const COLORS = [
  { id: 'white', name: 'Белая', hex: 0xfdfbff, css: '#fdfbff' },
  { id: 'pink', name: 'Розовая', hex: 0xffc4d8, css: '#ffc4d8' },
  { id: 'lav', name: 'Лавандовая', hex: 0xd9c9ff, css: '#d9c9ff' },
  { id: 'peach', name: 'Персиковая', hex: 0xffd3b0, css: '#ffd3b0' },
  { id: 'mint', name: 'Мятная', hex: 0xc2f0da, css: '#c2f0da' },
  { id: 'choco', name: 'Шоколадная', hex: 0xb89280, css: '#b89280' },
];

export const SLOTS = [
  { id: 'head', name: 'Голова' },
  { id: 'face', name: 'Лицо' },
  { id: 'neck', name: 'Шея' },
  { id: 'back', name: 'Спинка' },
];

export const OUTFITS = [
  { id: 'bow', slot: 'head', name: 'Бантик', price: 5 },
  { id: 'wreath', slot: 'head', name: 'Веночек', price: 15 },
  { id: 'beret', slot: 'head', name: 'Беретик', price: 18 },
  { id: 'straw', slot: 'head', name: 'Шляпка', price: 20 },
  { id: 'party', slot: 'head', name: 'Колпачок', price: 25 },
  { id: 'crown', slot: 'head', name: 'Корона', price: 40 },

  { id: 'glasses', slot: 'face', name: 'Очки', price: 10 },
  { id: 'hearts', slot: 'face', name: 'Очки-сердечки', price: 22 },

  { id: 'bowtie', slot: 'neck', name: 'Бабочка', price: 10 },
  { id: 'scarf', slot: 'neck', name: 'Шарфик', price: 12 },
  { id: 'bell', slot: 'neck', name: 'Колокольчик', price: 14 },
  { id: 'beads', slot: 'neck', name: 'Бусы', price: 16 },

  { id: 'balloon', slot: 'back', name: 'Шарик', price: 20 },
  { id: 'backpack', slot: 'back', name: 'Рюкзачок', price: 25 },
  { id: 'cape', slot: 'back', name: 'Плащик', price: 30 },
  { id: 'wings', slot: 'back', name: 'Крылышки', price: 35 },
];

// kind: floor — мебель (занимает клетки, зайка её обходит), rug — коврик (лежит под мебелью),
// wall — вешается на дальнюю стену. w, d — размер в клетках (ширина и глубина).
export const FURN = [
  { id: 'bed', kind: 'floor', name: 'Кроватка', price: 30, w: 2, d: 3 },
  { id: 'wardrobe', kind: 'floor', name: 'Шкаф', price: 30, w: 2, d: 1 },
  { id: 'chair', kind: 'floor', name: 'Стульчик', price: 8, w: 1, d: 1 },
  { id: 'table', kind: 'floor', name: 'Столик', price: 12, w: 1, d: 1 },
  { id: 'plant', kind: 'floor', name: 'Фикус', price: 10, w: 1, d: 1 },
  { id: 'crate', kind: 'floor', name: 'Ящик морковки', price: 10, w: 1, d: 1 },
  { id: 'flowers', kind: 'floor', name: 'Цветы в вазе', price: 12, w: 1, d: 1 },
  { id: 'lamp', kind: 'floor', name: 'Торшер', price: 15, w: 1, d: 1 },
  { id: 'armchair', kind: 'floor', name: 'Кресло', price: 18, w: 1, d: 1 },
  { id: 'teddy', kind: 'floor', name: 'Мишка', price: 20, w: 1, d: 1 },
  { id: 'bookshelf', kind: 'floor', name: 'Книжная полка', price: 25, w: 2, d: 1 },
  { id: 'sofa', kind: 'floor', name: 'Диванчик', price: 30, w: 2, d: 1 },
  { id: 'aquarium', kind: 'floor', name: 'Аквариум', price: 40, w: 2, d: 1 },
  { id: 'fireplace', kind: 'floor', name: 'Камин', price: 45, w: 2, d: 1 },

  { id: 'rug_round', kind: 'rug', name: 'Круглый коврик', price: 10, w: 2, d: 2 },
  { id: 'rug_stripe', kind: 'rug', name: 'Полосатый ковёр', price: 15, w: 3, d: 2 },
  { id: 'rug_heart', kind: 'rug', name: 'Коврик-сердце', price: 20, w: 2, d: 2 },

  { id: 'pic_carrot', kind: 'wall', name: 'Картина с морковкой', price: 8, w: 1, d: 1 },
  { id: 'pic_heart', kind: 'wall', name: 'Картина с сердцем', price: 8, w: 1, d: 1 },
  { id: 'clock', kind: 'wall', name: 'Часики', price: 15, w: 1, d: 1 },
  { id: 'shelf', kind: 'wall', name: 'Полочка', price: 18, w: 2, d: 1 },
  { id: 'window', kind: 'wall', name: 'Окошко', price: 20, w: 2, d: 1 },
  { id: 'garland', kind: 'wall', name: 'Гирлянда', price: 25, w: 4, d: 1 },
];
export const FURN_BY_ID = Object.fromEntries(FURN.map((f) => [f.id, f]));

export const WALLS = [
  { id: 'cream', name: 'Кремовые', price: 0, hex: 0xfff1e0, css: '#fff1e0' },
  { id: 'pink', name: 'Розовые', price: 20, hex: 0xffd3e0, css: '#ffd3e0' },
  { id: 'mint', name: 'Мятные', price: 20, hex: 0xcfeedd, css: '#cfeedd' },
  { id: 'lav', name: 'Лавандовые', price: 20, hex: 0xddd3fa, css: '#ddd3fa' },
  { id: 'sky', name: 'Небесные', price: 20, hex: 0xcfe8f7, css: '#cfe8f7' },
];
export const FLOORS = [
  { id: 'wood', name: 'Тёплое дерево', price: 0, css: 'repeating-linear-gradient(90deg,#e3b98a 0 12px,#d8ab7a 12px 14px)' },
  { id: 'light', name: 'Светлое дерево', price: 15, css: 'repeating-linear-gradient(90deg,#f1dcbc 0 12px,#e5cba6 12px 14px)' },
  { id: 'check', name: 'Шашечки', price: 25, css: 'conic-gradient(#fff 25%,#ffc9d9 0 50%,#fff 0 75%,#ffc9d9 0) 0 0/27px 27px' },
  { id: 'carpet', name: 'Розовый ковролин', price: 25, css: 'radial-gradient(#ffd0de 2px,#ffb3c9 3px) 0 0/10px 10px' },
];
