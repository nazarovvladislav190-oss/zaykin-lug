// Картинки для каталогов рисуются из самих 3D-моделей, поэтому отдельные иконки не нужны.
import { THREE, renderer } from './core.js';

const SIZE = 256;
const rt = new THREE.WebGLRenderTarget(SIZE, SIZE);
const tScene = new THREE.Scene();
tScene.background = new THREE.Color(0xffffff);
tScene.add(new THREE.HemisphereLight(0xffffff, 0xf2d9c8, 0.55));
tScene.add(new THREE.AmbientLight(0xfff4ea, 0.22));
const tSun = new THREE.DirectionalLight(0xfff1dc, 0.55); tSun.position.set(3, 6, 5); tScene.add(tSun);
const tCam = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
const box = new THREE.Box3(), center = new THREE.Vector3(), size = new THREE.Vector3(), dir = new THREE.Vector3();
const buf = new Uint8Array(SIZE * SIZE * 4);
const cache = {};

// view: 'front' (наряды), 'top' (коврики), по умолчанию три четверти.
export function thumb(key, build, view) {
  if (cache[key]) return cache[key];
  let url = '';
  try {
    const obj = build();
    tScene.add(obj);
    box.setFromObject(obj); box.getCenter(center); box.getSize(size);
    const radius = Math.max(0.2, size.length() / 2);
    if (view === 'front') dir.set(0.3, 0.25, 1); else if (view === 'top') dir.set(0.25, 1, 0.75); else dir.set(0.55, 0.5, 1);
    dir.normalize();
    tCam.position.copy(center).addScaledVector(dir, radius / Math.sin(15 * Math.PI / 180) * 0.92);
    tCam.lookAt(center);
    renderer.setRenderTarget(rt);
    renderer.render(tScene, tCam);
    renderer.readRenderTargetPixels(rt, 0, 0, SIZE, SIZE, buf);
    renderer.setRenderTarget(null);
    tScene.remove(obj);
    const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(SIZE, SIZE);
    for (let y = 0; y < SIZE; y++) {
      const src = (SIZE - 1 - y) * SIZE * 4;
      img.data.set(buf.subarray(src, src + SIZE * 4), y * SIZE * 4);
    }
    ctx.putImageData(img, 0, 0);
    url = cv.toDataURL('image/png');
  } catch (e) { renderer.setRenderTarget(null); }
  cache[key] = url;
  return url;
}
