const fs=require('fs'), vm=require('vm');
const ctx={console, Math, Array, Object, Set, Map, TS:16, SAVE:{}, Plate:{held:()=>false}};
vm.createContext(ctx);
const src=p=>fs.readFileSync(__dirname+'/../../src/'+p,'utf8');
vm.runInContext(src('core.js').match(/function seeded[^\n]*/)[0], ctx);
const w=src('world.js'); vm.runInContext(w.slice(w.indexOf('const RW'), w.indexOf('\n}\n', w.indexOf('function railLine')) + 3).replace(/function buildForest[\s\S]*?\n}\n/,''), ctx);
// capture spec
vm.runInContext(`var SPEC; function arenaStd(){} function bossArena(){} function makeDungeon(s){ SPEC=s; return {}; }`, ctx);
// usage : node extract.js [fichier du donjon] [fonction]   (par défaut : cave.js buildCaveArea)
const FILE=process.argv[2]||'cave.js', FN=process.argv[3]||'buildCaveArea', OUT=process.argv[4]||'rooms.json';
const dsrc=src(FILE); vm.runInContext((dsrc.match(/^const \w+_PAINTED = .*$/m)||[''])[0].replace('const ','var '), ctx); vm.runInContext(dsrc.slice(dsrc.indexOf('function '+FN), dsrc.indexOf('fixed(h)', dsrc.indexOf('function '+FN)))+'});}', ctx);
vm.runInContext(FN+`();
const spec=SPEC;
if (spec.prison !== false && !spec.rooms.prison) { // comme makeDungeon : salle de prison ajoutée au-dessus du boss, sauf prison: false
 for (const k of Object.keys(spec.rooms)) spec.rooms[k]=[spec.rooms[k][0],spec.rooms[k][1]+1];
 spec.rooms.prison=[spec.rooms[spec.boss][0],0]; spec.links=spec.links.concat([['prison',spec.boss]]); }
const names=Object.keys(spec.rooms), links=[];
for (const [a,b] of spec.links){const [ax,ay]=spec.rooms[a],[bx,by]=spec.rooms[b];
 if(ax===bx&&ay===by+1)links.push([ax,ay,'N']); else if(ax===bx&&ay===by-1)links.push([bx,by,'N']);
 else if(ay===by&&ax===bx-1)links.push([ax,ay,'E']); else links.push([bx,by,'E']);}
var G=buildDungeon({cols:4,rows:5,seed:spec.seed,rough:spec.rough,clean:spec.clean,moss:spec.moss,rooms:names.map(n=>spec.rooms[n]),links,exit:spec.rooms.entry,
 decorate(room){spec.tiles(n=>{const [rx,ry]=spec.rooms[n];return room(rx,ry);})}});
var E=spec.rooms.entry;`, ctx);
vm.runInContext("var ROOMS=spec.rooms;",ctx);
const res={};
for (const [n,[rx,ry]] of Object.entries(ctx.ROOMS)){const out=[];for(let y=0;y<17;y++) out.push(ctx.G[ry*17+y].slice(rx*30,rx*30+30).join(''));res[n]={at:[rx,ry],grid:out};}
fs.writeFileSync(OUT,JSON.stringify(res,null,1));
console.log(Object.entries(res).map(([n,r])=>n+' '+r.at).join(' | '));
