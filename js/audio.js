// Звуки синтезируются через WebAudio, файлов нет.
import { save } from './save.js';

let actx = null;
export function ensureAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (actx && actx.state === 'suspended') actx.resume();
}
function tone(f, d, type, v, when, f2) {
  if (save.muted || !actx) return;
  const t = actx.currentTime + (when || 0);
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v || 0.15, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + d + 0.05);
}
export const sfx = {
  pop: () => tone(620, 0.13, 'sine', 0.2, 0, 1150),
  berry: () => { tone(700, 0.1, 'sine', 0.18, 0, 1000); tone(1000, 0.14, 'sine', 0.16, 0.08, 1500); },
  star: () => [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, i * 0.06)),
  chirp: () => { tone(1500, 0.07, 'square', 0.04, 0, 2000); tone(1600, 0.08, 'square', 0.04, 0.11, 2200); },
  home: () => [523, 659, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.14, i * 0.08)),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.18, 'triangle', 0.15, i * 0.13)),
  jump: () => tone(380, 0.16, 'sine', 0.13, 0, 820),
  giggle: () => [900, 1100, 950, 1200].forEach((f, i) => tone(f, 0.07, 'sine', 0.1, i * 0.07)),
  cluck: () => { tone(420, 0.09, 'square', 0.05, 0, 300); tone(460, 0.12, 'square', 0.05, 0.13, 320); },
  buy: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.15, 'sine', 0.15, i * 0.07)),
  nope: () => tone(300, 0.18, 'triangle', 0.12, 0, 220),
  tap: () => tone(800, 0.06, 'sine', 0.08),
  door: () => { tone(330, 0.12, 'triangle', 0.12, 0, 440); tone(494, 0.2, 'triangle', 0.12, 0.1, 660); },
  place: () => { tone(260, 0.09, 'sine', 0.16, 0, 180); tone(700, 0.05, 'sine', 0.05, 0.02); },
  turn: () => tone(540, 0.07, 'triangle', 0.1, 0, 760),
  stow: () => tone(520, 0.14, 'sine', 0.1, 0, 300),
};
