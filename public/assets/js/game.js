(()=> {
'use strict';
const canvas=document.getElementById('world');
if(!canvas)return;
const ctx=canvas.getContext('2d');
const cfg=window.AETHORIA_WORLD||{};
const W=18,H=15,TW=64,TH=32,origin={x:480,y:72};
let player={x:Number(cfg.x??8),y:Number(cfg.y??8)};
let saving=false,queued=false;
const creatures=(cfg.creatures||[]).map(e=>({...e}));
const trees=[],rocks=[],flowers=[];
const blocked=new Set();
const tile=(x,y)=>({x:origin.x+(x-y)*TW/2,y:origin.y+(x+y)*TH/2});
const key=(x,y)=>x+','+y;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const n=(x*17+y*29+x*y*3)%31;
 if(n===2||n===9||n===21){trees.push({x,y,kind:n===9?'pine':'oak'});blocked.add(key(x,y));}
 if(n===14){rocks.push({x,y});blocked.add(key(x,y));}
 if((x*13+y*7)%13===0)flowers.push({x,y,c:(x+y)%3});
}
[[8,8],[8,7],[7,8],[9,8],[8,9],[4,4],[13,10],[3,11]].forEach(([x,y])=>blocked.delete(key(x,y)));
function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function diamond(p,fill,edge='#78906b'){
 poly([[p.x,p.y],[p.x+32,p.y+16],[p.x,p.y+32],[p.x-32,p.y+16]],fill,edge);
 ctx.strokeStyle='#b1c08b20';ctx.beginPath();ctx.moveTo(p.x-23,p.y+16);ctx.lineTo(p.x,p.y+28);ctx.lineTo(p.x+23,p.y+16);ctx.stroke();
}
function shadow(x,y,rx=15,ry=5){ctx.fillStyle='#07100988';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function drawTree(o){
 const p=tile(o.x,o.y),pine=o.kind==='pine';
 shadow(p.x,p.y+1,15,5);
 ctx.fillStyle='#241f16';ctx.fillRect(p.x-4,p.y-30,8,31);
 ctx.fillStyle='#59452b';ctx.fillRect(p.x-2,p.y-29,3,24);
 if(pine){
  for(let i=0;i<4;i++){const yy=p.y-78+i*13,w=13+i*4;poly([[p.x,yy],[p.x-w,yy+25],[p.x-w+5,yy+25],[p.x,yy+34],[p.x+w-5,yy+25],[p.x+w,yy+25]],['#244b36','#2e5a3c','#386844','#244b36'][i]);}
 }else{
  ctx.fillStyle='#23442e';ctx.beginPath();ctx.arc(p.x,p.y-51,21,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#315d3c';ctx.beginPath();ctx.arc(p.x-11,p.y-55,15,0,Math.PI*2);ctx.arc(p.x+10,p.y-58,16,0,Math.PI*2);ctx.arc(p.x,p.y-69,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4c7950';ctx.fillRect(p.x-9,p.y-69,5,5);ctx.fillRect(p.x+7,p.y-58,4,4);ctx.fillRect(p.x-17,p.y-54,4,4);
  ctx.fillStyle='#172f23';ctx.fillRect(p.x-14,p.y-39,8,5);
 }
}
function drawRock(o){
 const p=tile(o.x,o.y);shadow(p.x,p.y+1,14,5);
 poly([[p.x-13,p.y-4],[p.x-10,p.y-17],[p.x-2,p.y-23],[p.x+10,p.y-18],[p.x+14,p.y-7],[p.x+7,p.y],[p.x-8,p.y]],'#515f54','#263b2e');
 poly([[p.x-9,p.y-13],[p.x-2,p.y-21],[p.x+5,p.y-17],[p.x+1,p.y-9]],'#899483');
 ctx.fillStyle='#aab09a';ctx.fillRect(p.x-4,p.y-17,4,2);
}
function drawFlowers(){
 flowers.forEach(o=>{const p=tile(o.x,o.y);if((o.x+o.y)%2===0){ctx.fillStyle='#c5b778';ctx.fillRect(p.x+7,p.y+11,2,2);ctx.fillStyle='#668b55';ctx.fillRect(p.x+7,p.y+13,1,3);}});
}
function label(text,x,y){
 ctx.font='600 11px DM Sans, sans-serif';ctx.textAlign='center';
 const w=ctx.measureText(text).width+14;
 ctx.fillStyle='#0b160fce';ctx.fillRect(x-w/2,y-13,w,17);
 ctx.fillStyle='#eee4c9';ctx.fillText(text,x,y-1);
}
function drawElder(n){
 const p=tile(Number(n.tile_x),Number(n.tile_y));shadow(p.x,p.y+2,14,5);
 ctx.fillStyle='#443b2a';ctx.fillRect(p.x-7,p.y-27,14,25);
 ctx.fillStyle='#c8b58a';ctx.fillRect(p.x-6,p.y-39,12,13);
 ctx.fillStyle='#ded0a8';ctx.fillRect(p.x-5,p.y-34,10,3);
 ctx.fillStyle='#b89a5c';ctx.fillRect(p.x-8,p.y-42,16,5);
 ctx.fillStyle='#7e6844';ctx.fillRect(p.x+8,p.y-26,2,28);
 ctx.fillStyle='#e4c77d';ctx.fillRect(p.x+6,p.y-29,6,5);
 label(n.name,p.x,p.y-47);
}
function drawCreature(e){
 const p=tile(Number(e.tile_x),Number(e.tile_y)),type=e.code||'';
 shadow(p.x,p.y+2,14,5);
 if(type==='wolf_young'){
  ctx.fillStyle='#777e69';poly([[p.x-13,p.y-9],[p.x-11,p.y-22],[p.x-4,p.y-19],[p.x+2,p.y-25],[p.x+12,p.y-18],[p.x+15,p.y-8],[p.x+7,p.y-3],[p.x-8,p.y-3]],'#898e78');
  poly([[p.x-5,p.y-19],[p.x-10,p.y-29],[p.x-1,p.y-23]],'#666e5e');poly([[p.x+6,p.y-19],[p.x+12,p.y-28],[p.x+13,p.y-17]],'#666e5e');
  ctx.fillStyle='#d7c987';ctx.fillRect(p.x+7,p.y-17,2,2);
 }else if(type==='thorn_beetle'){
  ctx.fillStyle='#5b4930';ctx.beginPath();ctx.ellipse(p.x,p.y-12,13,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#a58a4d';ctx.beginPath();ctx.ellipse(p.x,p.y-14,10,7,0,0,Math.PI*2);ctx.fill();
  for(let i=-1;i<=1;i++){poly([[p.x+i*7,p.y-18],[p.x+i*7-3,p.y-28],[p.x+i*7+4,p.y-20]],'#c3a665');}
  ctx.fillStyle='#332c20';for(let i=-1;i<=1;i++)ctx.fillRect(p.x+i*8-1,p.y-5,3,6);
 }else{
  ctx.fillStyle='#3e583b';ctx.beginPath();ctx.ellipse(p.x,p.y-12,12,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#75a96d';ctx.beginPath();ctx.arc(p.x,p.y-15,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b4d18a';ctx.fillRect(p.x-5,p.y-20,4,3);ctx.fillRect(p.x+3,p.y-18,3,3);
 }
 label(e.name,p.x,p.y-31);
}
function drawPlayer(){
 const p=tile(player.x,player.y);shadow(p.x,p.y+3,15,5);
 // capa e corpo
 poly([[p.x-8,p.y-28],[p.x+8,p.y-28],[p.x+12,p.y-7],[p.x,p.y-2],[p.x-12,p.y-7]],'#713e2d');
 ctx.fillStyle='#b18a50';ctx.fillRect(p.x-7,p.y-30,14,20);
 ctx.fillStyle='#d7c7a2';ctx.fillRect(p.x-5,p.y-43,10,13);
 ctx.fillStyle='#293b30';ctx.fillRect(p.x-7,p.y-46,14,5);
 ctx.fillStyle='#e3d2a8';ctx.fillRect(p.x-2,p.y-28,4,16);
 ctx.fillStyle='#8e7045';ctx.fillRect(p.x-11,p.y-24,4,12);
 ctx.fillStyle='#c6a96b';ctx.fillRect(p.x+9,p.y-25,3,17);
 ctx.fillStyle='#e7d8b7';ctx.fillRect(p.x+10,p.y-34,2,12);
 label(cfg.name||'Aventureiro',p.x,p.y-51);
}
function render(){
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
 // fundo profundo e mosaico de terreno
 ctx.fillStyle='#09130e';ctx.fillRect(0,0,960,600);
 for(let sum=0;sum<W+H-1;sum++)for(let x=0;x<W;x++){
  const y=sum-x;if(y<0||y>=H)continue;
  const p=tile(x,y),n=(x*7+y*11)%6;
  diamond(p,['#3e5b40','#405e42','#496746','#38553b','#4a6746','#3c593e'][n]);
  if((x*13+y*7)%23===0){ctx.fillStyle='#a7b77c';ctx.fillRect(p.x-2,p.y+12,2,2);}
 }
 // trilha de terra batida com bordas irregulares
 for(let x=4;x<13;x++){const p=tile(x,8);diamond(p,(x%3===0)?'#817c62':'#77745c','#a49a76');}
 for(let y=5;y<11;y++){const p=tile(8,y);diamond(p,(y%2===0)?'#817c62':'#77745c','#a49a76');}
 // pequenas manchas de musgo nas bordas da trilha
 for(let i=0;i<26;i++){const x=(i*7+2)%W,y=(i*11+3)%H,p=tile(x,y);ctx.fillStyle='#66825455';ctx.fillRect(p.x-5,p.y+8,7,2);}
 drawFlowers();
 trees.sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawTree);
 rocks.forEach(drawRock);
 (cfg.npcs||[]).forEach(drawElder);
 creatures.filter(e=>Number(e.health)>0).forEach(drawCreature);
 drawPlayer();
 // moldura e cabeçalho dentro da área do mapa
 const g=ctx.createLinearGradient(0,0,960,0);g.addColorStop(0,'#bca66b');g.addColorStop(.5,'#e4d3a0');g.addColorStop(1,'#bca66b');
 ctx.strokeStyle=g;ctx.lineWidth=1;ctx.strokeRect(9,9,942,582);
 ctx.fillStyle='#0b160fdd';ctx.fillRect(310,12,340,29);
 ctx.fillStyle='#e6d8b5';ctx.font='600 12px Cinzel, serif';ctx.textAlign='center';ctx.fillText('ELARION  ·  VALE DO AMANHECER',480,31);
 ctx.fillStyle='#aab99b';ctx.font='10px DM Sans';ctx.textAlign='left';ctx.fillText('EXPLORAÇÃO  /  E L A R I O N',25,572);
}
async function persist(){
 if(saving){queued=true;return;}saving=true;
 try{
  const response=await fetch('/game/move',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),x:player.x,y:player.y})});
  if(!response.ok)throw new Error('Falha ao salvar posição');
  const data=await response.json();if(!data.ok)throw new Error(data.message||'Não foi possível salvar');
  const status=document.getElementById('save-status');if(status)status.textContent='Posição salva no mundo';
 }catch(err){const status=document.getElementById('save-status');if(status)status.textContent='Sem sincronização — tente mover novamente';}
 finally{saving=false;if(queued){queued=false;persist();}}
}
function move(dx,dy){
 const nx=player.x+dx,ny=player.y+dy;
 if(nx<0||ny<0||nx>=W||ny>=H||blocked.has(key(nx,ny))||creatures.some(e=>Number(e.health)>0&&Number(e.tile_x)===nx&&Number(e.tile_y)===ny))return;
 player={x:nx,y:ny};render();const status=document.getElementById('save-status');if(status)status.textContent='Salvando posição…';persist();
}
const keys={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{const dir=keys[e.key];if(dir){e.preventDefault();move(...dir);}});
document.querySelectorAll('[data-creature]').forEach(b=>b.addEventListener('click',async()=>{
 const status=document.getElementById('combat-status');status.textContent='Atacando…';
 try{const response=await fetch('/game/attack',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),creature:Number(b.dataset.creature)})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'Falha no ataque');
 const enemy=creatures.find(e=>Number(e.id)===Number(b.dataset.creature));if(enemy)enemy.health=data.remaining;
 b.textContent=data.defeated?'✓ '+data.creature+' derrotado · +'+data.experience+' XP':'⚔ '+data.creature+' · '+data.remaining+' PV';if(data.defeated){b.disabled=true;const activeQuest=(cfg.quests||[]).find(q=>q.status==='accepted'&&q.target_creature_code==='slime_green');if(activeQuest){activeQuest.status='completed';const qs=document.getElementById('quest-status');if(qs)qs.textContent='Objetivo concluído! Volte ao Ancião Aldren para receber sua recompensa.';}const xp=document.getElementById('experience-value');if(xp)xp.textContent=(Number((cfg.experience||0))+Number(data.experience))+' XP';cfg.experience=Number(cfg.experience||0)+Number(data.experience);}
 status.textContent=data.defeated?'Vitória! Você ganhou '+data.experience+' XP.':'Você causou '+data.damage+' de dano.';render();
 }catch(err){status.textContent=err.message;}
}));
document.querySelectorAll('[data-npc]').forEach(b=>b.addEventListener('click',async()=>{
 const status=document.getElementById('quest-status');const npcId=Number(b.dataset.npc);const npc=(cfg.npcs||[]).find(n=>Number(n.id)===npcId);const quest=(cfg.quests||[]).find(q=>q);
 if(!npc||!quest){status.textContent='Não há missão disponível.';return;}
 const state=quest.status||'';const action=state==='completed'?'claim':state==='claimed'?'':state==='accepted'?'':'accept';
 if(!action){status.textContent=state==='claimed'?'Você já concluiu esta missão.':'Missão em andamento: derrote o Limo Verde.';return;}
 status.textContent='Falando com '+npc.name+'…';
 try{const response=await fetch('/game/quest',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),npc:npcId,action})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'Não foi possível interagir');
 if(action==='accept')quest.status='accepted';if(action==='claim'){quest.status='claimed';cfg.experience=Number(cfg.experience||0)+Number(data.reward||0);const xp=document.getElementById('experience-value');if(xp)xp.textContent=cfg.experience+' XP';}
 status.textContent=(npc.dialogue||'')+' '+data.message;b.textContent=quest.status==='claimed'?'✓ '+npc.name+' · Missão concluída':'✧ '+npc.name+' · Conversar';
 }catch(err){status.textContent=err.message;}
}));
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const [dx,dy]=b.dataset.move.split(',').map(Number);move(dx,dy);}));
render();
})();