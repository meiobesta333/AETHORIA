(()=> {
'use strict';
const canvas=document.getElementById('world');
if(!canvas)return;
const ctx=canvas.getContext('2d');
const cfg=window.AETHORIA_WORLD||{};
const W=18,H=15,TW=64,TH=32,origin={x:480,y:72};
let player={x:Number(cfg.x??8),y:Number(cfg.y??8)};
let saving=false,queued=false;
const blocked=new Set();
const trees=[],rocks=[];
const tile=(x,y)=>({x:origin.x+(x-y)*TW/2,y:origin.y+(x+y)*TH/2});
const key=(x,y)=>x+','+y;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const n=(x*17+y*29+x*y*3)%31;
 if(n===2||n===9||n===21){trees.push({x,y,kind:n===9?'pine':'oak'});blocked.add(key(x,y));}
 if(n===14){rocks.push({x,y});blocked.add(key(x,y));}
}
[[8,8],[8,7],[7,8],[9,8],[8,9],[4,4],[13,10],[3,11]].forEach(([x,y])=>blocked.delete(key(x,y)));
function diamond(p,fill,stroke='#78906b'){
 ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+TW/2,p.y+TH/2);ctx.lineTo(p.x,p.y+TH);ctx.lineTo(p.x-TW/2,p.y+TH/2);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke();
}
function drawTree(o){
 const p=tile(o.x,o.y),pine=o.kind==='pine';
 ctx.fillStyle='#18251b';ctx.fillRect(p.x-3,p.y-19,7,22);
 ctx.fillStyle=pine?'#234a37':'#315b37';
 for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(p.x,p.y-62+i*12);ctx.lineTo(p.x-(pine?13:19)+i*3,p.y-30+i*9);ctx.lineTo(p.x+(pine?13:19)-i*3,p.y-30+i*9);ctx.closePath();ctx.fill();}
 ctx.fillStyle='#80a66b';ctx.fillRect(p.x-3,p.y-48,3,4);
}
function drawRock(o){const p=tile(o.x,o.y);ctx.fillStyle='#59645a';ctx.beginPath();ctx.moveTo(p.x-12,p.y-4);ctx.lineTo(p.x-7,p.y-17);ctx.lineTo(p.x+5,p.y-20);ctx.lineTo(p.x+13,p.y-8);ctx.lineTo(p.x+8,p.y);ctx.closePath();ctx.fill();ctx.fillStyle='#899184';ctx.fillRect(p.x-5,p.y-15,5,3);}
function drawPlayer(){
 const p=tile(player.x,player.y);ctx.fillStyle='#10150f';ctx.beginPath();ctx.ellipse(p.x,p.y+3,12,5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#b58c53';ctx.fillRect(p.x-6,p.y-22,12,18);ctx.fillStyle='#d9c9a5';ctx.fillRect(p.x-5,p.y-32,10,11);ctx.fillStyle='#293b30';ctx.fillRect(p.x-6,p.y-34,12,4);ctx.fillStyle='#e8d9b4';ctx.fillRect(p.x-2,p.y-19,4,11);
 ctx.fillStyle='#f2e7c9';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(cfg.name||'Aventureiro',p.x,p.y-42);
}
function render(){
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
 for(let sum=0;sum<W+H-1;sum++)for(let x=0;x<W;x++){const y=sum-x;if(y<0||y>=H)continue;const p=tile(x,y),n=(x*7+y*11)%6;diamond(p,['#405b40','#3b553c','#456144','#354f39','#4b6545','#3d583e'][n]);if((x*13+y*7)%23===0){ctx.fillStyle='#d4bd77';ctx.fillRect(p.x-2,p.y+13,3,2);}}
 // caminho de pedra atravessando a clareira central
 for(let x=5;x<12;x++){const p=tile(x,8);diamond(p,'#777b69','#a1a38c');}
 for(let y=5;y<11;y++){const p=tile(8,y);diamond(p,'#777b69','#a1a38c');}
 trees.sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawTree);
 rocks.forEach(drawRock);drawPlayer();
 ctx.fillStyle='#e0d4b3';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('ELARION · VALE DO AMANHECER',480,28);
}
async function persist(){
 if(saving){queued=true;return;}saving=true;
 try{
  const response=await fetch('/game/move',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':cfg.csrf},body:JSON.stringify({character:Number(cfg.character),x:player.x,y:player.y})});
  if(!response.ok)throw new Error('Falha ao salvar posição');
  const data=await response.json();if(!data.ok)throw new Error(data.message||'Não foi possível salvar');
  const status=document.getElementById('save-status');if(status)status.textContent='Posição salva';
 }catch(err){const status=document.getElementById('save-status');if(status)status.textContent='Sem sincronização — tente mover novamente';}
 finally{saving=false;if(queued){queued=false;persist();}}
}
function move(dx,dy){
 const nx=player.x+dx,ny=player.y+dy;
 if(nx<0||ny<0||nx>=W||ny>=H||blocked.has(key(nx,ny)))return;
 player={x:nx,y:ny};render();const status=document.getElementById('save-status');if(status)status.textContent='Salvando…';persist();
}
const keys={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{const dir=keys[e.key];if(dir){e.preventDefault();move(...dir);}});
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const [dx,dy]=b.dataset.move.split(',').map(Number);move(dx,dy);}));
render();
})();