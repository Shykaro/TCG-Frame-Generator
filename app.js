const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
let state = {fw:300,fh:400,margin:20,gap:10,cols:3,autoFit:true,free:false,snap:true,frame:'slim',color:'#242424',bg:'#f6f1e7',cards:[]};
let selected = new Set(), history = [], drag = null, inspectorMode = false;
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const chosen = () => state.cards.filter(c=>selected.has(c.id));
const rounded = v => +v.toFixed(2);
function bounds(cards=state.cards) {
  if(!cards.length)return {x:0,y:0,r:0,b:0};
  return cards.reduce((b,c)=>({x:Math.min(b.x,c.x),y:Math.min(b.y,c.y),r:Math.max(b.r,c.x+c.w),b:Math.max(b.b,c.y+c.h)}),{x:Infinity,y:Infinity,r:-Infinity,b:-Infinity});
}
function checkpoint(){history.push(JSON.stringify(state));if(history.length>50)history.shift()}
function center(){const b=bounds();state.cards.forEach(c=>{c.x+=(state.fw-b.r-b.x)/2;c.y+=(state.fh-b.b-b.y)/2})}
// Center every row, including incomplete rows and rows with mixed card sizes.
function grid(){
  const rows=[];let width=0;
  for(let i=0;i<state.cards.length;i+=state.cols){const cards=state.cards.slice(i,i+state.cols);const w=cards.reduce((sum,c)=>sum+c.w,0)+(cards.length-1)*state.gap;rows.push({cards,w,h:Math.max(...cards.map(c=>c.h))});width=Math.max(width,w)}
  let y=state.margin;
  for(const row of rows){let x=state.margin+(width-row.w)/2;for(const c of row.cards){c.x=x;c.y=y+(row.h-c.h)/2;x+=c.w+state.gap}y+=row.h+state.gap}
}
function fit(){if(!state.cards.length)return;const b=bounds();state.fw=b.r-b.x+2*state.margin;state.fh=b.b-b.y+2*state.margin;center()}
function layout(){if(!state.free)grid();if(state.autoFit)fit();else if(!state.free)center()}
function act(fn,relayout=true){checkpoint();try{fn();if(relayout)layout();render()}catch(e){state=JSON.parse(history.pop());render();alert(e.message)}}
function readNumber(el,min,integer=false){if(el.value.trim()==='')return null;const n=Number(el.value);if(!Number.isFinite(n)||n<min||(integer&&!Number.isInteger(n)))return null;return n}
function bindNumber(id,min,fn,integer=false){const el=$(id);el.addEventListener('input',()=>{const n=readNumber(el,min,integer);el.setCustomValidity(n===null?'Enter a valid number.':'');if(n!==null)act(()=>fn(n))});el.addEventListener('change',()=>{el.setCustomValidity('');render()})}
function markup(template=false){return `<rect width="${state.fw}" height="${state.fh}" fill="${template?'white':state.bg}"/>`+state.cards.map(c=>`<g class="card" data-id="${c.id}" tabindex="0" role="button" aria-label="${esc(c.name)}" aria-pressed="${selected.has(c.id)}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${template?0:2}" fill="${template?'none':'#285440'}" stroke="${template?'#333':selected.has(c.id)?'#dda74b':'#173e32'}" stroke-width="${template?.25:selected.has(c.id)?1.3:.4}" ${template?'stroke-dasharray="2 1"':''}/><text pointer-events="none" x="${c.x+c.w/2}" y="${c.y+c.h/2-2}" text-anchor="middle" fill="${template?'#333':'#f7efdf'}" font-family="sans-serif" font-size="3.3">${esc(c.name)}</text><text pointer-events="none" x="${c.x+c.w/2}" y="${c.y+c.h/2+5}" text-anchor="middle" fill="${template?'#555':'#b9d2c3'}" font-family="sans-serif" font-size="3">${rounded(c.w)} × ${rounded(c.h)} mm</text></g>`).join('')}
function svg(){return `<svg xmlns="${NS}" width="${state.fw}mm" height="${state.fh}mm" viewBox="0 0 ${state.fw} ${state.fh}">${markup(true)}</svg>`}
function value(id,v){if(document.activeElement!==$(id))$(id).value=v}
function render(){
  selected=new Set([...selected].filter(id=>state.cards.some(c=>c.id===id)));
  for(const k of ['fw','fh','margin','gap','cols','frame','color','bg'])value(k,typeof state[k]==='number'?rounded(state[k]):state[k]);
  for(const k of ['autoFit','free','snap'])$(k).checked=state[k];
  $('fw').disabled=$('fh').disabled=state.autoFit;$('cols').disabled=$('gap').disabled=state.free;
  const f={slim:4,classic:12,box:18,wood:14,gallery:8}[state.frame];
  $('canvas').setAttribute('viewBox',`${-f} ${-f} ${state.fw+2*f} ${state.fh+2*f}`);
  $('canvas').innerHTML=state.cards.length?`<rect x="${-f}" y="${-f}" width="${state.fw+2*f}" height="${state.fh+2*f}" fill="${state.color}"/>`+markup():'';
  $('workspace').classList.toggle('free',state.free);$('empty').hidden=!!state.cards.length;
  $('dimensions').textContent=`${rounded(state.fw/10)} × ${rounded(state.fh/10)} cm`;
  $('summary').textContent=`${state.cards.length} card${state.cards.length===1?'':'s'}`;
  $('mode').textContent=state.free?'Free placement':'Live grid';$('undo').disabled=!history.length;$('selectAll').disabled=!state.cards.length;
  const cards=chosen();if(inspectorMode!==!!cards.length){$('inspectorPanel').scrollTop=0;inspectorMode=!!cards.length} $('general').hidden=!!cards.length;$('selection').hidden=!cards.length;
  $('instruction').textContent=state.free?'Drag to move · Ctrl / Cmd + click to select more · Esc to deselect':'Click to edit · Ctrl / Cmd + click to select more · Esc to deselect';
  if(cards.length){
    $('selectionTitle').textContent=cards.length===1?'Edit card':`Edit ${cards.length} cards`;
    $('nameLabel').hidden=cards.length!==1;value('name',cards[0].name);
    for(const k of ['w','h']){const same=cards.every(c=>c[k]===cards[0][k]);value(k,same?rounded(cards[0][k]):'');$(k).placeholder=same?'':'Mixed'}
    const b=bounds(cards);value('x',rounded(b.x));value('y',rounded(b.y));$('position').hidden=!state.free;$('gridHint').hidden=state.free;
    $('selectedList').innerHTML=cards.map(c=>`<button data-edit="${c.id}"><span>${esc(c.name)}</span><small>${rounded(c.w)} × ${rounded(c.h)}</small></button>`).join('');
  }
  const outside=state.cards.some(c=>c.x<-.001||c.y<-.001||c.x+c.w>state.fw+.001||c.y+c.h>state.fh+.001);
  const overlap=state.cards.some((a,i)=>state.cards.slice(i+1).some(b=>a.x<b.x+b.w-.001&&a.x+a.w>b.x+.001&&a.y<b.y+b.h-.001&&a.y+a.h>b.y+.001));
  $('warning').textContent=[outside?'Some cards extend beyond the frame. Increase the frame size or enable auto-size.':'',overlap?'Some cards overlap.':''].filter(Boolean).join(' ');
  try{localStorage.setItem('card-atelier',JSON.stringify(state))}catch{$('warning').textContent+=' Auto-save unavailable. Download your project to keep changes.'}
}
$('preset').onchange=()=>{if($('preset').value!=='custom'){const [w,h]=$('preset').value.split(',');$('cw').value=w;$('ch').value=h}};
for(const id of ['cw','ch'])$(id).oninput=()=>$('preset').value='custom';
$('add').onclick=()=>{const w=readNumber($('cw'),1),h=readNumber($('ch'),1),n=readNumber($('count'),1,true);if(w===null||h===null||n===null){alert('Enter positive dimensions and a whole-number quantity.');return}act(()=>{const b=bounds(),start=state.cards.length?b.r+state.gap:state.margin;for(let i=0;i<n;i++)state.cards.push({id:crypto.randomUUID(),name:`Card ${state.cards.length+1}`,w,h,x:start+i*(w+state.gap),y:state.margin})})};
for(const k of ['cols','gap','margin','fw','fh'])bindNumber(k,['cols','fw','fh'].includes(k)?1:0,n=>state[k]=n,k==='cols');
for(const k of ['frame','color','bg'])$(k).oninput=()=>act(()=>state[k]=$(k).value,false);
for(const k of ['autoFit','free','snap'])$(k).onchange=()=>act(()=>state[k]=$(k).checked);
for(const k of ['w','h'])bindNumber(k,1,n=>chosen().forEach(c=>c[k]=n));
for(const k of ['x','y'])bindNumber(k,-1000000,n=>{const b=bounds(chosen()),delta=n-b[k];chosen().forEach(c=>c[k]+=delta)});
$('name').oninput=()=>act(()=>{if(chosen().length===1)chosen()[0].name=$('name').value},false);
$('selectionPreset').onchange=()=>{if(!$('selectionPreset').value)return;const [w,h]=$('selectionPreset').value.split(',').map(Number);act(()=>chosen().forEach(c=>{c.w=w;c.h=h}));$('selectionPreset').value=''};
function deselect(){selected.clear();render()}
$('back').onclick=deselect;$('selectAll').onclick=()=>{selected=new Set(state.cards.map(c=>c.id));render()};
$('selectedList').onclick=e=>{const b=e.target.closest('[data-edit]');if(b){selected=new Set([b.dataset.edit]);render()}};
$('delete').onclick=()=>act(()=>{state.cards=state.cards.filter(c=>!selected.has(c.id));selected.clear()});
$('duplicate').onclick=()=>act(()=>{const copies=chosen().map(c=>({...c,id:crypto.randomUUID(),name:c.name+' copy',x:c.x+5,y:c.y+5}));state.cards.push(...copies);selected=new Set(copies.map(c=>c.id))});
$('rotate').onclick=()=>act(()=>chosen().forEach(c=>{c.x+=(c.w-c.h)/2;c.y+=(c.h-c.w)/2;[c.w,c.h]=[c.h,c.w]}));
$('center').onclick=()=>act(center,false);
for(const axis of ['X','Y'])$('mirror'+axis).onclick=()=>act(()=>{state.free=true;state.cards.forEach(c=>{if(axis==='X')c.x=state.fw-c.x-c.w;else c.y=state.fh-c.y-c.h})});
$('undo').onclick=()=>{if(history.length){state=JSON.parse(history.pop());render()}};
$('standard').onclick=()=>act(()=>{const b=bounds(),w=b.r-b.x+2*state.margin,h=b.b-b.y+2*state.margin;const sizes=[[100,150],[130,180],[180,240],[210,297],[200,300],[240,300],[300,400],[400,500],[400,600],[500,700],[600,800],[700,1000]].flatMap(([a,b])=>[[a,b],[b,a]]).filter(([a,b])=>a>=w&&b>=h).sort((a,b)=>a[0]*a[1]-b[0]*b[1]);if(!sizes.length)throw Error('No standard frame in this list fits. Use a custom size.');[state.fw,state.fh]=sizes[0];state.autoFit=false;center()},false);
function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform($('canvas').getScreenCTM().inverse())}
function selectCard(id,toggle){if(toggle){if(selected.has(id))selected.delete(id);else selected.add(id)}else selected=new Set([id]);render()}
$('canvas').onpointerdown=e=>{
  if(e.button!==0)return;const g=e.target.closest('[data-id]');if(!g){deselect();return}
  const id=g.dataset.id,toggle=e.ctrlKey||e.metaKey;
  if(toggle){selectCard(id,true);return}
  if(!state.free||!selected.has(id))selected=new Set([id]);
  if(state.free){const p=point(e);checkpoint();drag={pointer:e.pointerId,start:p,positions:chosen().map(c=>({id:c.id,x:c.x,y:c.y}))};$('canvas').setPointerCapture(e.pointerId)}render();
};
$('canvas').onpointermove=e=>{if(!drag||e.pointerId!==drag.pointer)return;const p=point(e),r=state.snap?Math.round:v=>Math.round(v*10)/10,dx=r(p.x-drag.start.x),dy=r(p.y-drag.start.y);for(const old of drag.positions){const c=state.cards.find(c=>c.id===old.id);c.x=old.x+dx;c.y=old.y+dy}render()};
function endDrag(){if(!drag)return;drag=null;if(state.autoFit)fit();render()}
$('canvas').onpointerup=$('canvas').onpointercancel=endDrag;
$('workspace').onpointerdown=e=>{if(!e.target.closest('[data-id]'))deselect()};
$('canvas').onkeydown=e=>{const g=e.target.closest('[data-id]');if(!g)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCard(g.dataset.id,e.ctrlKey||e.metaKey);$('canvas').querySelector(`[data-id="${g.dataset.id}"]`)?.focus();return}const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d&&state.free){e.preventDefault();if(!selected.has(g.dataset.id))selected=new Set([g.dataset.id]);act(()=>chosen().forEach(c=>{c.x+=d[0]*(e.shiftKey?10:1);c.y+=d[1]*(e.shiftKey?10:1)}));$('canvas').querySelector(`[data-id="${g.dataset.id}"]`)?.focus()}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){endDrag();deselect()}});
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('save').onclick=()=>download('card-atelier-project.json',JSON.stringify(state,null,2),'application/json');$('export').onclick=()=>download('card-template.svg',svg(),'image/svg+xml');$('open').onclick=()=>$('load').click();
function validate(s){
  if(!s||!Array.isArray(s.cards))throw Error('Invalid project.');
  for(const k of ['fw','fh','cols'])if(!Number.isFinite(s[k])||s[k]<=0)throw Error('Invalid dimensions.');
  if(!Number.isInteger(s.cols))throw Error('Invalid columns.');
  for(const k of ['margin','gap'])if(!Number.isFinite(s[k])||s[k]<0)throw Error('Invalid spacing.');
  if(!['slim','classic','box','wood','gallery'].includes(s.frame))throw Error('Invalid frame.');
  for(const k of ['color','bg'])if(!/^#[0-9a-f]{6}$/i.test(s[k]))throw Error('Invalid color.');
  // Preserve legacy hand-positioned projects when upgrading.
  for(const [k,fallback] of [['free',true],['autoFit',false],['snap',true]]){if(s[k]===undefined)s[k]=fallback;if(typeof s[k]!=='boolean')throw Error('Invalid layout options.')}
  s.cards=s.cards.map(c=>{if(![c.x,c.y,c.w,c.h].every(Number.isFinite)||c.w<=0||c.h<=0||typeof c.name!=='string')throw Error('Invalid card.');return {id:crypto.randomUUID(),name:c.name,x:c.x,y:c.y,w:c.w,h:c.h}});return s;
}
$('load').onchange=async e=>{try{if(!e.target.files.length)return;const s=validate(JSON.parse(await e.target.files[0].text()));act(()=>{state=s;selected.clear()},false)}catch(err){alert(err.message)}finally{e.target.value=''}};
$('print').onclick=()=>{const win=window.open('','_blank');if(!win){alert('Allow pop-ups to open the print preview.');return}win.document.write(`<!doctype html><html lang="en"><title>Card template — print at 100%</title><style>@page{size:${state.fw}mm ${state.fh}mm;margin:0}body{margin:0}svg{display:block}@media print{button,p{display:none}}</style><button onclick="window.print()">Print / save as PDF</button><p>Print at actual size / 100%. Paper size: ${rounded(state.fw)} × ${rounded(state.fh)} mm. For tiled A4 output, open the SVG in a suitable printing application.</p>${svg()}</html>`);win.document.close()};
try{const saved=localStorage.getItem('card-atelier');if(saved)state=validate(JSON.parse(saved))}catch{}render();
