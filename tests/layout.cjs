const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const elements={};const context={crypto:require('node:crypto').webcrypto,console,alert(m){throw Error(m)},localStorage:{getItem(){return null},setItem(){}},document:{activeElement:null,addEventListener(){},getElementById(id){return elements[id]??={value:'',checked:false,style:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},setCustomValidity(){},querySelector(){return null}}}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
function run(code){return vm.runInContext(code,context)}
run(`state.cards=Array.from({length:6},(_,i)=>({id:String(i),name:'Card '+i,w:63,h:88,x:0,y:0}));layout()`);
assert.equal(run('state.fw'),249);assert.equal(run('state.fh'),226);
run('state.gap=15;state.cols=2;layout()');assert.equal(run('state.fw'),181);assert.equal(run('state.fh'),334);
run(`selectCard('0',false);selectCard('1',true);act(()=>chosen().forEach(c=>c.w=70))`);assert.equal(run('chosen().length'),2);assert.equal(run('state.fw'),195);assert.equal(run('state.cards[2].w'),63);
run(`$('undo').onclick()`);assert.equal(run('state.cards[0].w'),63);
run(`selectCard('1',true)`);assert.equal(run('chosen().length'),1);
run('state.autoFit=false;state.fw=400;state.fh=500;state.margin=30;layout()');assert.equal(run('state.fw'),400);assert.equal(run('(bounds().x+bounds().r)/2'),200);
run('state.autoFit=true;state.margin=25;layout()');assert.equal(run('bounds().x'),25);assert.equal(run('bounds().y'),25);
run('state.free=true;state.cards[0].x=-50;layout()');assert.equal(run('bounds().x'),25);
assert.ok(run(`svg().includes('mm" height=')`));
assert.equal(run(`(()=>{const old=JSON.parse(JSON.stringify(state));delete old.autoFit;delete old.free;return validate(old).autoFit})()`),false);
assert.throws(()=>run('validate({...state,cols:1.5})'),/Invalid columns/);
run(`selected=new Set(state.cards.map(c=>c.id));$('delete').onclick()`);assert.equal(run('state.cards.length'),0);assert.ok(Number.isFinite(run('state.fw')));
console.log('PASS: live layout, automatic and fixed frame sizing, batch resize, selection, undo, legacy import, SVG dimensions, empty layout');
