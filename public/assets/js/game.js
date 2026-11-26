(()=>{
'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const ctx=canvas.getContext('2d'),cfg=window.AETHORIA_WORLD||{};
const TILE=48,VIEW_W=canvas.width,VIEW_H=canvas.height;
let player={x:Number(cfg.x??8),y:Number(cfg.y??8)},saving=false,queued=false;
let walkUntil=0,animationTime=0,facing='down',stepPhase=0;
const creatures=(cfg.creatures||[]).map(e=>({...e})),npcs=cfg.npcs||[];
const status=id=>document.getElementById(id);
const setStatus=(id,msg)=>{const el=status(id);if(el)el.textContent=msg;};
const positiveMod=(n,m)=>((n%m)+m)%m;
function terrainAt(x,y){
 const v=positiveMod(x*17+y*29+x*y*3,31);
 if([2,9,21].includes(v))return 'tree';
 if(v===14)return 'rock';
 const path=positiveMod(x*3+y*5+Math.floor(Math.sin(x/8)*5),37)<3;
 if(path)return 'path';
 const patch=positiveMod(x*11+y*7+x*y,97);
 if(patch<5)return 'flower';
 if(patch>90)return 'moss';
 return 'grass';
}
function blocked(x,y){
 const v=positiveMod(x*17+y*29+x*y*3,31);
 if(['8,8','8,7','7,8','9,8','8,9','4,4','13,10','3,11'].includes(x+','+y))return false;
 return [2,9,21,14].includes(v);
}
function worldToScreen(x,y,camera){
 return {x:(x-camera.x)*TILE+VIEW_W/2,y:(y-camera.y)*TILE+VIEW_H/2};
}
function roundedRect(x,y,w,h,r,fill,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function ellipse(x,y,rx,ry,fill){
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
}
function drawGround(x,y,wx,wy,type){
 const seed=positiveMod(wx*37+wy*71+wx*wy*3,11);
 let base=type==='path'?'#887653':type==='moss'?'#496c45':'#52794a';
 const grad=ctx.createLinearGradient(x,y,x+TILE,y+TILE);
 grad.addColorStop(0,base);grad.addColorStop(1,type==='path'?'#756849':'#3d643e');
 ctx.fillStyle=grad;ctx.fillRect(x,y,TILE+1,TILE+1);
 ctx.strokeStyle='#a9b88a18';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,TILE,TILE);
 if(type==='grass'||type==='moss'){
  for(let i=0;i<3;i++){
   const gx=x+7+positiveMod(seed*7+i*13,34),gy=y+8+positiveMod(seed*11+i*9,32);
   ctx.strokeStyle=i===0?'#9bb66b55':'#294e3155';ctx.lineWidth=1.3;
   ctx.beginPath();ctx.moveTo(gx,gy+3);ctx.quadraticCurveTo(gx-3,gy-2,gx-2,gy-5);ctx.moveTo(gx,gy+3);ctx.quadraticCurveTo(gx+4,gy-1,gx+3,gy-5);ctx.stroke();
  }
 }
 if(type==='flower'){
  const fx=x+10+positiveMod(seed*9,27),fy=y+10+positiveMod(seed*5,28);
  ellipse(fx,fy+3,2,3,'#38633b');ellipse(fx-2,fy,2.3,2.3,'#e4d3a0');ellipse(fx+2,fy,2.3,2.3,'#e4d3a0');ellipse(fx,fy-2,2.3,2.3,'#f0e4bd');ellipse(fx,fy,1.4,1.4,'#d5ad58');
 }
 if(type==='path'){
  ctx.strokeStyle='#b8a47735';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4,y+TILE-8);ctx.quadraticCurveTo(x+20,y+16,x+TILE-5,y+7);ctx.stroke();
 }
}
function drawTree(x,y,t){
 const sway=Math.sin(animationTime/1100+t.x*.7+t.y)*1.8;
 ellipse(x+TILE/2,y+TILE*.78,15,6,'#17261a99');
 // tronco e raízes
 ctx.fillStyle='#694a30';ctx.beginPath();ctx.moveTo(x+21,y+27);ctx.lineTo(x+29,y+27);ctx.lineTo(x+31,y+48);ctx.lineTo(x+19,y+48);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#a57a4c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+24,y+30);ctx.lineTo(x+25,y+44);ctx.stroke();
 // copa orgânica com camadas suaves
 const cx=x+24+sway,cy=y+20;
 const g=ctx.createRadialGradient(cx-8,cy-10,3,cx,cy,27);g.addColorStop(0,'#79a966');g.addColorStop(.55,'#477b4c');g.addColorStop(1,'#244d34');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx,cy-26);ctx.bezierCurveTo(cx+24,cy-23,cx+29,cy+2,cx+21,cy+17);ctx.quadraticCurveTo(cx,cy+28,cx-21,cy+15);ctx.bezierCurveTo(cx-31,cy-3,cx-19,cy-23,cx,cy-26);ctx.fill();
 ellipse(cx-9,cy-8,6,8,'#8bb57555');ellipse(cx+9,cy+1,5,7,'#285a3a88');ellipse(cx-2,cy+10,4,5,'#9bbd7655');
}
function drawRock(x,y){
 ellipse(x+24,y+39,15,5,'#1c2b1e99');
 const g=ctx.createLinearGradient(x+8,y+15,x+37,y+43);g.addColorStop(0,'#a5ad96');g.addColorStop(.45,'#747f70');g.addColorStop(1,'#465548');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x+8,y+34);ctx.lineTo(x+11,y+19);ctx.lineTo(x+22,y+11);ctx.lineTo(x+36,y+18);ctx.lineTo(x+41,y+33);ctx.lineTo(x+31,y+40);ctx.lineTo(x+14,y+40);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#c4cbb055';ctx.lineWidth=1.2;ctx.stroke();
}
function drawCharacter(x,y,kind,variant=''){
 const t=animationTime/1000,walking=performance.now()<walkUntil;
 const swing=walking?Math.sin(performance.now()/85)*5:Math.sin(t*2.2)*.8;
 const bob=walking?Math.abs(Math.sin(performance.now()/85))*2:Math.sin(t*1.7)*.8;
 const robe=kind==='npc',cx=x+TILE/2,base=y+TILE*.76+bob;
 // sombra suave
 ctx.save();ctx.globalAlpha=.32;ellipse(cx,base+2,17,6,'#07110a');ctx.restore();
 // capa com contorno curvo
 const cloak=robe?'#315a43':'#315b47',cloakLight=robe?'#52785a':'#54836a';
 const cg=ctx.createLinearGradient(cx-15,base-36,cx+16,base);cg.addColorStop(0,cloakLight);cg.addColorStop(.5,cloak);cg.addColorStop(1,'#1d3b30');
 ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(cx-10,base-34);ctx.quadraticCurveTo(cx-20,base-17,cx-17+swing*.25,base-3);ctx.quadraticCurveTo(cx,base+4,cx+17-swing*.25,base-3);ctx.quadraticCurveTo(cx+19,base-18,cx+10,base-34);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#a2b58a66';ctx.lineWidth=1;ctx.stroke();
 // braços e mãos
 ctx.strokeStyle=robe?'#b89c75':'#b58b61';ctx.lineWidth=5;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(cx-10,base-27);ctx.lineTo(cx-15-swing*.35,base-13);ctx.moveTo(cx+10,base-27);ctx.lineTo(cx+15+swing*.35,base-13);ctx.stroke();
 // botas e pernas
 ctx.strokeStyle='#493629';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(cx-5,base-9);ctx.lineTo(cx-7-swing*.35,base);ctx.moveTo(cx+5,base-9);ctx.lineTo(cx+7+swing*.35,base);ctx.stroke();
 roundedRect(cx-13,base-5,9,6,2,'#382a22');roundedRect(cx+4,base-5,9,6,2,'#382a22');
 // peitoral / túnica
 const armor=ctx.createLinearGradient(cx-12,base-34,cx+12,base-8);armor.addColorStop(0,robe?'#547b57':'#b28a51');armor.addColorStop(1,robe?'#203e31':'#725333');
 ctx.fillStyle=armor;ctx.beginPath();ctx.moveTo(cx-10,base-33);ctx.quadraticCurveTo(cx,base-39,cx+10,base-33);ctx.lineTo(cx+12,base-11);ctx.quadraticCurveTo(cx,base-5,cx-12,base-11);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#d0b77d88';ctx.lineWidth=1;ctx.stroke();
 // gola, cabeça e cabelo
 const skin=ctx.createRadialGradient(cx-4,base-45,1,cx,base-40,12);skin.addColorStop(0,'#f1d7b4');skin.addColorStop(1,'#b9825d');
 ellipse(cx,base-40,9,11,skin);
 ctx.fillStyle=robe?'#d0d0c4':'#4a3024';ctx.beginPath();ctx.moveTo(cx-10,base-43);ctx.quadraticCurveTo(cx-11,base-56,cx,base-55);ctx.quadraticCurveTo(cx+12,base-54,cx+10,base-42);ctx.quadraticCurveTo(cx+4,base-48,cx-4,base-46);ctx.closePath();ctx.fill();
 if(robe){ctx.fillStyle='#d8d4c4';ctx.beginPath();ctx.moveTo(cx-6,base-35);ctx.quadraticCurveTo(cx,base-24,cx+6,base-35);ctx.lineTo(cx+4,base-28);ctx.lineTo(cx-4,base-28);ctx.fill();}
 // olhos e detalhes faciais
 ellipse(cx-3,base-40,1.1,1.3,'#30251e');ellipse(cx+3,base-40,1.1,1.3,'#30251e');
 ctx.strokeStyle='#e4cb8d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,base-30);ctx.lineTo(cx,base-12);ctx.stroke();
 if(!robe){ // espada na mão direita
  ctx.strokeStyle='#d7d5c5';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx+16,base-15);ctx.lineTo(cx+22,base-35);ctx.stroke();
  ctx.strokeStyle='#b18b4e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+12,base-20);ctx.lineTo(cx+20,base-18);ctx.stroke();
 }else{ // cajado do ancião
  ctx.strokeStyle='#795532';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+16,base-5);ctx.lineTo(cx+19,base-51);ctx.stroke();
  ellipse(cx+19,base-53,4,4,'#d8bd73');ellipse(cx+19,base-53,2,2,'#fff0b1');
 }
}
function drawCreature(e,x,y){
 const cx=x+24,cy=y+27+Math.sin(animationTime/260+Number(e.id))*2;
 ellipse(cx,y+43,16,5,'#14221999');
 const code=e.code||'';
 if(code==='wolf_young'){
  const g=ctx.createLinearGradient(cx-15,cy-12,cx+15,cy+15);g.addColorStop(0,'#c0bca0');g.addColorStop(1,'#626f60');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,16,10,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(cx-11,cy-5);ctx.lineTo(cx-14,cy-19);ctx.lineTo(cx-4,cy-11);ctx.fill();ctx.beginPath();ctx.moveTo(cx+11,cy-5);ctx.lineTo(cx+14,cy-19);ctx.lineTo(cx+4,cy-11);ctx.fill();
  ellipse(cx+6,cy-1,2,2,'#e5cf82');ellipse(cx-5,cy-1,2,2,'#e5cf82');
 }else if(code==='thorn_beetle'){
  const g=ctx.createRadialGradient(cx-5,cy-6,2,cx,cy,19);g.addColorStop(0,'#c7a966');g.addColorStop(1,'#56432a');
  ellipse(cx,cy,15,12,g);ctx.strokeStyle='#dfc47b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,15,12,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*10,cy+Math.sin(a)*7);ctx.lineTo(cx+Math.cos(a)*20,cy+Math.sin(a)*14);ctx.stroke();}
 }else{
  const g=ctx.createRadialGradient(cx-6,cy-8,2,cx,cy,20);g.addColorStop(0,'#a7d17c');g.addColorStop(.6,'#659a55');g.addColorStop(1,'#315b39');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-15,cy+7);ctx.quadraticCurveTo(cx-20,cy-11,cx-8,cy-15);ctx.quadraticCurveTo(cx+10,cy-21,cx+15,cy-5);ctx.quadraticCurveTo(cx+21,cy+10,cx+10,cy+13);ctx.quadraticCurveTo(cx-7,cy+18,cx-15,cy+7);ctx.fill();
  ellipse(cx-5,cy-3,2,3,'#172719');ellipse(cx+6,cy-3,2,3,'#172719');
 }
}
function drawName(text,x,y){
 ctx.font='600 12px "DM Sans",Arial';ctx.textAlign='center';
 const w=ctx.measureText(text).width+14;
 roundedRect(x-w/2,y-17,w,18,4,'#101711dd','#a99a6b88');
 ctx.fillStyle='#f0e8d2';ctx.fillText(text,x,y-5);
}
function render(){
 const camera={x:player.x,y:player.y};
 ctx.clearRect(0,0,VIEW_W,VIEW_H);
 const sky=ctx.createLinearGradient(0,0,0,VIEW_H);sky.addColorStop(0,'#17271c');sky.addColorStop(1,'#0c160f');ctx.fillStyle=sky;ctx.fillRect(0,0,VIEW_W,VIEW_H);
 const cols=Math.ceil(VIEW_W/TILE/2)+2,rows=Math.ceil(VIEW_H/TILE/2)+2;
 const sx=Math.floor(camera.x)-cols,ex=Math.floor(camera.x)+cols,sy=Math.floor(camera.y)-rows,ey=Math.floor(camera.y)+rows;
 for(let wy=sy;wy<=ey;wy++)for(let wx=sx;wx<=ex;wx++){
  const p=worldToScreen(wx,wy,camera),type=terrainAt(wx,wy);drawGround(p.x,p.y,wx,wy,type);
  if(type==='tree')drawTree(p.x,p.y,{x:wx,y:wy});
  else if(type==='rock')drawRock(p.x,p.y);
 }
 // elementos e entidades usam coordenadas persistentes do mundo
 const visible=(x,y)=>Math.abs(Number(x)-camera.x)<cols&&Math.abs(Number(y)-camera.y)<rows;
 npcs.filter(n=>visible(n.tile_x,n.tile_y)).forEach(n=>{const p=worldToScreen(Number(n.tile_x),Number(n.tile_y),camera);drawCharacter(p.x,p.y,'npc');drawName(n.name,p.x+24,p.y-3);});
 creatures.filter(e=>Number(e.health)>0&&visible(e.tile_x,e.tile_y)).forEach(e=>{const p=worldToScreen(Number(e.tile_x),Number(e.tile_y),camera);drawCreature(e,p.x,p.y);drawName(e.name,p.x+24,p.y-3);});
 const pp=worldToScreen(player.x,player.y,camera);drawCharacter(pp.x,pp.y,'player');drawName(cfg.name||'Aventureiro',pp.x+24,pp.y-3);
 // HUD discreto e coordenadas reais
 roundedRect(14,14,300,42,6,'#101912dd','#9d916455');
 ctx.fillStyle='#e8dfc7';ctx.font='bold 13px Georgia';ctx.textAlign='left';ctx.fillText('AETHORIA · ELARION',27,32);
 ctx.fillStyle='#b8c6a8';ctx.font='11px Arial';ctx.fillText('Região '+Math.floor(player.x/64)+', '+Math.floor(player.y/64),27,47);
 roundedRect(VIEW_W-155,14,140,42,6,'#101912dd','#9d916455');
 ctx.fillStyle='#e7d9b8';ctx.textAlign='center';ctx.font='11px Arial';ctx.fillText('X '+player.x+'  ·  Y '+player.y,VIEW_W-85,39);
 // névoa periférica suave
 const vignette=ctx.createRadialGradient(VIEW_W/2,VIEW_H/2,VIEW_H*.25,VIEW_W/2,VIEW_H/2,VIEW_W*.68);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#07100966');ctx.fillStyle=vignette;ctx.fillRect(0,0,VIEW_W,VIEW_H);
}
async function persist(){
 if(saving){queued=true;return;}saving=true;
 try{const r=await fetch('/game/move',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),x:player.x,y:player.y})});if(!r.ok)throw new Error();const d=await r.json();if(!d.ok)throw new Error();setStatus('save-status','Posição salva no mundo');}
 catch(e){setStatus('save-status','Não foi possível sincronizar a posição');}
 finally{saving=false;if(queued){queued=false;persist();}}
}
function move(dx,dy){
 const nx=player.x+dx,ny=player.y+dy;
 if(nx<0||ny<0||nx>65535||ny>65535||blocked(nx,ny)||creatures.some(e=>Number(e.health)>0&&Number(e.tile_x)===nx&&Number(e.tile_y)===ny))return;
 player={x:nx,y:ny};walkUntil=performance.now()+260;facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';stepPhase++;render();setStatus('save-status','Salvando posição…');persist();
}
const keys={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{const d=keys[e.key];if(d){e.preventDefault();move(...d);}});
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.move.split(',').map(Number);move(d[0],d[1]);}));
document.querySelectorAll('[data-creature]').forEach(b=>b.addEventListener('click',async()=>{
 setStatus('combat-status','Atacando…');
 try{const r=await fetch('/game/attack',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),creature:Number(b.dataset.creature)})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Falha no ataque');
 const e=creatures.find(o=>Number(o.id)===Number(b.dataset.creature));if(e)e.health=d.remaining;
 b.textContent=d.defeated?'✓ '+d.creature+' derrotado · +'+d.experience+' XP':'⚔ '+d.creature+' · '+d.remaining+' PV';if(d.defeated){b.disabled=true;const q=(cfg.quests||[]).find(o=>o.status==='accepted'&&o.target_creature_code==='slime_green');if(q)q.status='completed';const xp=status('experience-value');if(xp)xp.textContent=(Number(cfg.experience||0)+Number(d.experience))+' XP';cfg.experience=Number(cfg.experience||0)+Number(d.experience);}
 setStatus('combat-status',d.defeated?'Vitória! +'+d.experience+' XP':'Dano causado: '+d.damage);render();
 }catch(e){setStatus('combat-status',e.message);}
}));
document.querySelectorAll('[data-npc]').forEach(b=>b.addEventListener('click',async()=>{
 const id=Number(b.dataset.npc),npc=npcs.find(n=>Number(n.id)===id),q=(cfg.quests||[]).find(o=>o);
 if(!npc||!q){setStatus('quest-status','Nenhuma missão disponível.');return;}
 const state=q.status||'',action=state==='completed'?'claim':state==='claimed'||state==='accepted'?'':'accept';
 if(!action){setStatus('quest-status',state==='claimed'?'Missão concluída.':'Missão em andamento: derrote o Limo Verde.');return;}
 try{const r=await fetch('/game/quest',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),npc:id,action})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Falha na interação');
 if(action==='accept')q.status='accepted';if(action==='claim'){q.status='claimed';cfg.experience=Number(cfg.experience||0)+Number(d.reward||0);const xp=status('experience-value');if(xp)xp.textContent=cfg.experience+' XP';}
 setStatus('quest-status',(npc.dialogue||'')+' '+d.message);
 }catch(e){setStatus('quest-status',e.message);}
}));
function animate(t){animationTime=t;render();requestAnimationFrame(animate);}
requestAnimationFrame(animate);
})();