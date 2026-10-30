'use strict';
// Héros : choix de l'enfant, petits bonus, dessin depuis les planches Aseprite
const Heroes = {
  def(id = SAVE.hero) { return DATA.heroes[id]; },
  order() { return DATA.heroes.order; },
  // les deux enfants non choisis, dans l'ordre Sacha, Cam, Rox
  captive(n, hero = SAVE.hero) { return this.order().filter(h => h !== hero)[n - 1]; },
  name(id) { return this.def(id).name; },
};
function sheetHas(sh, name) { return sh && sh.meta.frameTags.some(g => g.name === name); }
function sheetFrame(sh, name, t, still) {
  const tag = sh.meta.frameTags.find(g => g.name === name); if (!tag) return null;
  const list = []; for (let i = 0; i <= tag.to - tag.from; i++) list.push(sh.frames[name + i]);
  if (still || list.length === 1) return list[0].frame;
  const total = list.reduce((s, f) => s + f.duration, 0); let ms = (t * 1000) % total;
  for (const f of list) { if (ms < f.duration) return f.frame; ms -= f.duration; }
  return list[0].frame;
}
function heroHasDir(id, d) { const def = DATA.heroes && DATA.heroes[id], sh = def && SHEETS[def.sheet]; return sheetHas(sh, 'idle_' + d); }
function drawHero(id, x, y, dir, moving, t, scale = 1, alpha = 1) {
  const def = DATA.heroes && DATA.heroes[id], sh = def && SHEETS[def.sheet], im = def && IMG['hero_' + def.sheet];
  if (!sh || !im) { R(x - 6, y - 24, 12, 24, '#eee'); return; }
  let name = (moving ? 'walk_' : 'idle_') + dir, still = false;
  if (!sheetHas(sh, name)) {
    if (!moving && sheetHas(sh, 'walk_' + dir)) { name = 'walk_' + dir; still = true; }        // pas d'idle dans cette direction
    else if (dir === 'up' && sheetHas(sh, 'walk_up')) { name = 'walk_up'; still = !moving; }
    else name = moving ? 'walk_down' : 'idle_down';                                             // profils absents : vue de face
  }
  const f = sheetFrame(sh, name, t, still); if (!f) return;
  const k = scale / Number(sh.meta.scale || 1), w = f.w * k, h = f.h * k, foot = sh.meta.foot != null ? sh.meta.foot * k : sh.meta.scale === '1' || !sh.meta.scale ? scale : 0; // foot : marge transparente sous les pieds, pour poser les pieds sur l'ombre
  ctx.globalAlpha = alpha;
  ctx.drawImage(im, f.x, f.y, f.w, f.h, half(x - w / 2), half(y - h + foot), w, h);
  ctx.globalAlpha = 1;
}
function drawFace(who, mood, x, y, s = 1) {
  const im = IMG[`face_${who}_${mood}`] || IMG[`face_${who}_smile`];
  if (im) ctx.drawImage(im, half(x), half(y), im.width * s, im.height * s);
  return !!im;
}
