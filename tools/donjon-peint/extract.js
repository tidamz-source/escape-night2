const fs=require('fs'), vm=require('vm');
const ctx={console, Math, Array, Object, Set, Map, TS:16, SAVE:{}, Plate:{held:()=>false}};
vm.createContext(ctx);
const src=p=>fs.readFileSync(__dirname+'/../../src/'+p,'utf8');
vm.runInContext(src('core.js').match(/function seeded[^\n]*/)[0], ctx);
const w=src('world.js'); vm.runInContext(w.slice(w.indexOf('const RW'), w.indexOf('function railLine')).replace(/function buildForest[\s\S]*?\n}\n/,''), ctx);
// capture spec
vm.runInContext(`var SPEC; function arenaStd(){} function bossArena(){} function makeDungeon(s){ SPEC=s; return {}; }`, ctx);
const cave=src('cave.js'); vm.runInContext(cave.slice(0, cave.indexOf('fixed(h)'))+'});}', ctx);
vm.runInContext(`buildCaveArea();
const spec=SPEC;
for (const k of Object.keys(spec.rooms)) spec.rooms[k]=[spec.rooms[k][0],spec.rooms[k][1]+1];
spec.rooms.prison=[spec.rooms[spec.boss][0],0]; spec.links=spec.links.concat([['prison',spec.boss]]);
const names=Object.keys(spec.rooms), links=[];
for (const [a,b] of spec.links){const [ax,ay]=spec.rooms[a],[bx,by]=spec.rooms[b];
 if(ax===bx&&ay===by+1)links.push([ax,ay,'N']); else if(ax===bx&&ay===by-1)links.push([bx,by,'N']);
 else if(ay===by&&ax===bx-1)links.push([ax,ay,'E']); else links.push([bx,by,'E']);}
var G=buildDungeon({cols:4,rows:5,seed:spec.seed,rough:spec.rough,moss:spec.moss,rooms:names.map(n=>spec.rooms[n]),links,exit:spec.rooms.entry,
 decorate(room){spec.tiles(n=>{const [rx,ry]=spec.rooms[n];return room(rx,ry);})}});
var E=spec.rooms.entry;`, ctx);
vm.runInContext("var ROOMS=spec.rooms;",ctx);
const res={};
for (const [n,[rx,ry]] of Object.entries(ctx.ROOMS)){const out=[];for(let y=0;y<17;y++) out.push(ctx.G[ry*17+y].slice(rx*30,rx*30+30).join(''));res[n]={at:[rx,ry],grid:out};}
fs.writeFileSync('rooms.json',JSON.stringify(res,null,1));
for(const [n,r] of Object.entries(res)) console.log(n, r.at.join(','), '\n'+r.grid.join('\n'));
