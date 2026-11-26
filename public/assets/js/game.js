(()=> {
'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const ctx=canvas.getContext('2d'),cfg=window.AETHORIA_WORLD||{};
const W=18,H=15,S=32,OX=192,OY=56;
let player={x:Number(cfg.x??8),y:Number(cfg.y??8)},saving=false,queued=false;
let walkUntil=0,animationFrame=0;
let walkUntil=0,lastStep=0,animationFrame=0;
let facing='down';
const creatures=(cfg.creatures||[]).map(e=>({...e})),npcs=cfg.npcs||[];
const key=(x,y)=>x+','+y,blocked=new Set(),trees=[],rocks=[],grass=[];
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const n=(x*17+y*29+x*y*3)%31;
 if([2,9,21].includes(n)){trees.push({x,y,type:n===9?'pine':'oak'});blocked.add(key(x,y));}
 if(n===14){rocks.push({x,y});blocked.add(key(x,y));}
 if((x*13+y*7)%7===0)grass.push({x,y});
}
[[8,8],[8,7],[7,8],[9,8],[8,9],[4,4],[13,10],[3,11]].forEach(([x,y])=>blocked.delete(key(x,y)));
const px=x=>OX+x*S,py=y=>OY+y*S;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function tile(x,y,type){
 const colors=type==='path'?['#887b5b','#938567','#817654']:['#567747','#5b7d4b','#527343','#60804e'];
 const n=(x*7+y*13+x*y)%colors.length;
 rect(px(x),py(y),S,S,colors[n]);
 // pequenos pixels de textura, sem contorno de tabuleiro
 const seed=(x*31+y*17)%5;
 rect(px(x)+4+seed*4,py(y)+7,2,2,'#91a66a44');
 rect(px(x)+21-seed*2,py(y)+23,3,2,'#263f2b55');
 if((x+y)%4===0)rect(px(x)+14,py(y)+12,2,2,'#c0b77a55');
}
function tree(o){
 const x=px(o.x),y=py(o.y),sway=Math.sin(animationFrame/850+o.x*1.7+o.y)*1.2;
 // copa vista de cima, tronco visível no limite inferior
 rect(x+13,y+18,7,13,'#60452c');rect(x+15,y+20,2,9,'#98714a');
 rect(x+4+sway,y+3,24,22,'#203f2b');rect(x+2+sway,y+5,28,17,'#2d5938');
 rect(x+6+sway,y+1,20,23,'#376a42');rect(x+9+sway,y+4,14,15,'#477b4b');
 rect(x+7+sway,y+5,5,4,'#5c8c55');rect(x+19+sway,y+8,5,4,'#285437');
 rect(x+11+sway,y+15,4,3,'#6b9554');rect(x+22+sway,y+16,3,3,'#315e3b');
}
function rock(o){
 const x=px(o.x),y=py(o.y);
 rect(x+7,y+15,18,11,'#344638');rect(x+5,y+11,21,12,'#687565');
 rect(x+9,y+7,13,12,'#879180');rect(x+12,y+8,8,4,'#aab09a');
 rect(x+6,y+17,4,5,'#4b5c4d');rect(x+22,y+15,4,6,'#4b5c4d');
}
function label(t,x,y){
 ctx.font='bold 10px Arial';ctx.textAlign='center';
 const w=ctx.measureText(t).width+8;rect(x-w/2,y-13,w,14,'#111a13dd');
 ctx.fillStyle='#eee8d1';ctx.fillText(t,x,y-3);
}
function spritePlayer(x,y){
 const moving=performance.now()<walkUntil,step=moving?Math.sin(performance.now()/75)*3:0,bob=moving?Math.abs(Math.sin(performance.now()/75))*1.5:Math.sin(performance.now()/420)*.6;
 rect(x+8,y+25,17,4,'#18201899');
 rect(x+10-step,y+22+Math.max(0,step),5,6,'#49352a');rect(x+19+step,y+22+Math.max(0,-step),5,6,'#49352a');
 rect(x+10,y+14-bob,14,11,'#8e633c');rect(x+8,y+13-bob,18,10,'#a77a43');
 rect(x+6-step,y+14-bob,5,9,'#b18b55');rect(x+24+step,y+14-bob,5,9,'#b18b55');
 rect(x+11,y+5-bob,12,10,'#d8c19a');rect(x+9,y+3-bob,16,5,'#77704a');
 rect(x+12,y+1-bob,10,4,'#b49a60');rect(x+14,y+8-bob,2,2,'#30291e');rect(x+19,y+8-bob,2,2,'#30291e');
 rect(x+15,y+15-bob,4,8,'#e0c27d');rect(x+26+step,y+11-bob,2,12,'#b7a16d');
}
function spriteNpc(n){
 const x=px(Number(n.tile_x)),y=py(Number(n.tile_y)),breathe=Math.sin(performance.now()/520+Number(n.id||0))*1.1;
 rect(x+8,y+25,17,4,'#17201899');
 rect(x+10,y+14-breathe,14,11,'#67533b');rect(x+8,y+12-breathe,18,12,'#80694b');
 rect(x+11,y+4-breathe,12,10,'#c6b38b');rect(x+8,y+2-breathe,18,5,'#b39455');
 rect(x+13,y+8-breathe,2,2,'#34291d');rect(x+19,y+8-breathe,2,2,'#34291d');
 rect(x+12,y+12-breathe,10,5,'#d0d0c0');rect(x+14,y+17-breathe,6,3,'#b8b9a8');
 rect(x+26,y+12,2,15,'#735b39');rect(x+24,y+11,6,3,'#d0b36f');
 label(n.name,x+16,y-1);
}
function spriteCreature(e){
 const x=px(Number(e.tile_x)),y=py(Number(e.tile_y)),code=e.code||'',pulse=Math.sin(performance.now()/230+Number(e.id||0))*1.2;
 rect(x+7,y+25,19,4,'#17201899');
 if(code==='wolf_young'){
  rect(x+5,y+11,23,13,'#777d69');rect(x+9,y+7,16,14,'#96977d');
  rect(x+8,y+4,5,8,'#777d69');rect(x+21,y+4,5,8,'#777d69');
  rect(x+12,y+12,3,3,'#e1c77e');rect(x+21,y+12,3,3,'#e1c77e');
  rect(x+13,y+20,3,5,'#4f5948');rect(x+21,y+20,3,5,'#4f5948');
 }else if(code==='thorn_beetle'){
  rect(x+5,y+11,23,13,'#463b27');rect(x+8,y+8,17,15,'#9c8046');
  rect(x+11,y+9,10,10,'#c0a15b');rect(x+7,y+5,4,7,'#c0a15b');
  rect(x+21,y+5,4,7,'#c0a15b');rect(x+12,y+13,3,3,'#30291e');
  rect(x+20,y+13,3,3,'#30291e');
 }else{
  rect(x+6,y+11-pulse,21,13+pulse,'#315a37');rect(x+9,y+6-pulse,16,16+pulse,'#6d9a59');
  rect(x+11,y+8,4,4,'#a8c57a');rect(x+20,y+8,4,4,'#a8c57a');
  rect(x+12,y+14,3,3,'#172719');rect(x+20,y+14,3,3,'#172719');
 }
 label(e.name,x+16,y+2);
}
function render(){
 ctx.clearRect(0,0,960,600);ctx.imageSmoothingEnabled=false;
 rect(0,0,960,600,'#151c17');
 // moldura e fundo da área de jogo
 rect(12,12,936,576,'#101711');rect(16,16,928,568,'#273329');
 // campo de tiles quadrados
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)tile(x,y,((x>=4&&x<=12&&y===8)||(x===8&&y>=5&&y<=10))?'path':'grass');
 // vegetação baixa animada pelo vento
 grass.forEach(o=>{const x=px(o.x),y=py(o.y),wind=Math.sin(animationFrame/360+o.x+o.y)*1.5;rect(x+5+wind,y+20,2,4,'#345b37');rect(x+7+wind,y+18,2,3,'#85a45b');});
 // flores, cogumelos e detalhes naturais
 for(let i=0;i<22;i++){const gx=(i*7+3)%W,gy=(i*11+2)%H,x=px(gx),y=py(gy);if(i%3===0){rect(x+13,y+18,3,3,'#d7c18a');rect(x+14,y+17,2,2,'#e7d8b5');}else if(i%5===0){rect(x+20,y+18,4,3,'#8d574e');rect(x+21,y+16,2,3,'#c18a70');}}
 rocks.forEach(rock);
 // ordenar objetos por linha para sobreposição natural
 const objects=[...trees.map(o=>({y:o.y,draw:()=>tree(o)})),...npcs.map(o=>({y:Number(o.tile_y),draw:()=>spriteNpc(o)})),...creatures.filter(e=>Number(e.health)>0).map(o=>({y:Number(o.tile_y),draw:()=>spriteCreature(o)})),{y:player.y,draw:()=>spritePlayer(px(player.x),py(player.y))}];
 objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 // HUD interno inspirado em RPGs clássicos, sem reproduzir interface de terceiros
 rect(20,20,920,27,'#151d18');ctx.strokeStyle='#6b7653';ctx.strokeRect(20.5,20.5,919,26);
 ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillStyle='#e1d5b5';ctx.fillText('AETHORIA  ·  ELARION',31,38);
 ctx.font='11px Arial';ctx.fillStyle='#b7c4a7';ctx.textAlign='right';ctx.fillText((cfg.name||'Aventureiro')+'  ·  Nível 1',929,38);
 // painel de minimapa
 rect(790,500,145,76,'#101812');ctx.strokeStyle='#7d7957';ctx.strokeRect(790.5,500.5,144,75);
 for(let y=0;y<7;y++)for(let x=0;x<12;x++)rect(798+x*10,508+y*8,9,7,((x*5+y*3)%4===0)?'#3d603e':'#526e48');
 rect(798+(player.x/W)*115,508+(player.y/H)*55,4,4,'#f0d47b');
 // vaga-lumes com brilho pulsante
 for(let i=0;i<9;i++){const fx=px((i*5+2)%W)+12+Math.sin(animationFrame/600+i)*7,fy=py((i*3+4)%H)+10+Math.cos(animationFrame/730+i)*5;ctx.globalAlpha=.35+Math.sin(animationFrame/240+i)*.25;rect(fx,fy,2,2,'#f3e7a0');}ctx.globalAlpha=1;
 // rodapé
 rect(20,554,920,23,'#121a14');ctx.fillStyle='#b9c4a9';ctx.font='10px Arial';ctx.textAlign='left';ctx.fillText('WASD / SETAS: MOVER     CLIQUE EM UMA CRIATURA: ATACAR     CLIQUE NO NPC: INTERAGIR',30,569);
}
async function persist(){
 if(saving){queued=true;return;}saving=true;
 try{const r=await fetch('/game/move',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),x:player.x,y:player.y})});if(!r.ok)throw new Error();const d=await r.json();if(!d.ok)throw new Error();const s=document.getElementById('save-status');if(s)s.textContent='Posição salva no mundo';}
 catch(e){const s=document.getElementById('save-status');if(s)s.textContent='Não foi possível sincronizar a posição';}
 finally{saving=false;if(queued){queued=false;persist();}}
}
function move(dx,dy){
 const nx=player.x+dx,ny=player.y+dy;
 if(nx<0||ny<0||nx>=W||ny>=H||blocked.has(key(nx,ny))||creatures.some(e=>Number(e.health)>0&&Number(e.tile_x)===nx&&Number(e.tile_y)===ny))return;
 player={x:nx,y:ny};walkUntil=performance.now()+230;lastStep=performance.now();facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';render();const s=document.getElementById('save-status');if(s)s.textContent='Salvando posição…';persist();
}
const keys={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{const d=keys[e.key];if(d){e.preventDefault();move(...d);}});
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.move.split(',').map(Number);move(d[0],d[1]);}));
document.querySelectorAll('[data-creature]').forEach(b=>b.addEventListener('click',async()=>{
 const s=document.getElementById('combat-status');if(s)s.textContent='Atacando…';
 try{const r=await fetch('/game/attack',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),creature:Number(b.dataset.creature)})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Falha no ataque');
 const e=creatures.find(o=>Number(o.id)===Number(b.dataset.creature));if(e)e.health=d.remaining;
 b.textContent=d.defeated?'✓ '+d.creature+' derrotado · +'+d.experience+' XP':'⚔ '+d.creature+' · '+d.remaining+' PV';if(d.defeated){b.disabled=true;const q=(cfg.quests||[]).find(o=>o.status==='accepted'&&o.target_creature_code==='slime_green');if(q)q.status='completed';const xp=document.getElementById('experience-value');if(xp)xp.textContent=(Number(cfg.experience||0)+Number(d.experience))+' XP';cfg.experience=Number(cfg.experience||0)+Number(d.experience);}
 if(s)s.textContent=d.defeated?'Vitória! +'+d.experience+' XP':'Dano causado: '+d.damage;render();
 }catch(e){if(s)s.textContent=e.message;}
}));
document.querySelectorAll('[data-npc]').forEach(b=>b.addEventListener('click',async()=>{
 const s=document.getElementById('quest-status'),id=Number(b.dataset.npc),npc=npcs.find(n=>Number(n.id)===id),q=(cfg.quests||[]).find(o=>o);
 if(!npc||!q){if(s)s.textContent='Nenhuma missão disponível.';return;}
 const state=q.status||'',action=state==='completed'?'claim':state==='claimed'?'':state==='accepted'?'':'accept';
 if(!action){if(s)s.textContent=state==='claimed'?'Missão concluída.':'Missão em andamento: derrote o Limo Verde.';return;}
 try{const r=await fetch('/game/quest',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),npc:id,action})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Falha na interação');
 if(action==='accept')q.status='accepted';if(action==='claim'){q.status='claimed';cfg.experience=Number(cfg.experience||0)+Number(d.reward||0);const xp=document.getElementById('experience-value');if(xp)xp.textContent=cfg.experience+' XP';}
 if(s)s.textContent=(npc.dialogue||'')+' '+d.message;
 }catch(e){if(s)s.textContent=e.message;}
}));
function animate(t){animationFrame=t;render();requestAnimationFrame(animate);}
requestAnimationFrame(animate);
})();