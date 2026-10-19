import { useEffect, useRef, useState } from 'react';
import type { Week } from './types';
import GlassSculpture from './GlassSculpture';
import './chapter-cover.css';

const covers = [
 {label:'Issue 01 / The connected universe',title:['No hero','stands alone.'],note:'Every alliance leaves a trace.',action:'Rearrange the network',stamp:'RELATIONSHIPS / NOT SUPERPOWERS'},
 {label:'Experiment 02 / The world machine',title:['Simple rules.','Strange worlds.'],note:'Order is a setting. Chaos is another.',action:'Turn the machine',stamp:'ORDER → CHANCE → EMERGENCE'},
 {label:'Line 03 / The influence express',title:['All roads','lead somewhere.'],note:'Popularity. Reach. The power of being between.',action:'Send a signal',stamp:'YOU ARE HERE / WHERE CAN YOU GO?'},
 {label:'Atlas 04 / Territories of belonging',title:['Where do','we belong?'],note:'Draw a boundary. Discover what it leaves out.',action:'Move the boundary',stamp:'AN ATLAS OF POSSIBLE COMMUNITIES'},
 {label:'Edition 05 / The language press',title:['A world','made of words.'],note:'Take a sentence apart. Find the pattern inside.',action:'Set the type',stamp:'READ / SEPARATE / COUNT / QUESTION'},
 {label:'Expedition 06 / The meaning observatory',title:['Words have','coordinates.'],note:'A journey from a page into a space of meaning.',action:'Rotate the constellation',stamp:'DISTANCE IS A CHOICE OF REPRESENTATION'}
];

function CoverArt({week,reduced,scene}:{week:number;reduced:boolean;scene:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return;
  let w=0,h=0,frame=0,last=0,time=scene*2.5,active=false;const pointer={x:0,y:0},ease={x:0,y:0};
  const paper=week===1||week===4||week===5;
  const ink=paper?'#20252d':'#e8eee9';
  const accent=['#e75042','#ff7c38','#e4ee9b','#395b44','#244cb9','#c1b7ff'][week-1];
  function stroke(points:number[][],color:string,width=1){ctx!.beginPath();points.forEach((p,i)=>i?ctx!.lineTo(p[0],p[1]):ctx!.moveTo(p[0],p[1]));ctx!.strokeStyle=color;ctx!.lineWidth=width;ctx!.stroke()}
  function circle(x:number,y:number,r:number,color:string){ctx!.beginPath();ctx!.arc(x,y,r,0,Math.PI*2);ctx!.fillStyle=color;ctx!.fill()}
  function text(s:string,x:number,y:number,size=11,color=ink,font='Space Grotesk'){ctx!.font=`${size}px "${font}",sans-serif`;ctx!.fillStyle=color;ctx!.fillText(s,x,y)}
  function render(now=0){
   const dt=Math.min(40,Math.max(0,now-last));last=now;if(!reduced)time+=dt*.0004;ease.x+=(pointer.x-ease.x)*.06;ease.y+=(pointer.y-ease.y)*.06;
   ctx!.clearRect(0,0,w,h);ctx!.save();const scale=Math.min(w/740,h/700);ctx!.translate(w*.5,h*.5);ctx!.scale(scale,scale);
   if(week===1){
    ctx!.save();ctx!.rotate(-.09+ease.x*.025);ctx!.strokeStyle='#20252d12';ctx!.lineWidth=1;
    for(let x=-350;x<380;x+=15)for(let y=-300;y<320;y+=15)circle(x,y,1,'#20252d18');
    const names=['SPIDER-MAN','IRON MAN','THOR','HULK','BLACK WIDOW','CAPTAIN AMERICA','WASP','HAWKEYE','VISION'];
    const p=names.map((_,i)=>{const a=i*2.399+scene*.13,r=i===0?0:135+(i%3)*42;return[Math.cos(a)*r+Math.sin(time+i)*5,Math.sin(a)*r+Math.cos(time+i)*7]});
    p.slice(1).forEach((q,i)=>{stroke([p[0],q],'#20252d99',2);if(i%2===0)stroke([q,p[(i+3)%9]],'#20252d33',1.3)});
    p.forEach((q,i)=>{const r=i===0?54:24;circle(q[0]+5,q[1]+6,r,ink);circle(q[0],q[1],r,i===0?accent:'#faf4dc');ctx!.strokeStyle=ink;ctx!.lineWidth=2;ctx!.stroke();if(i===0){ctx!.save();ctx!.translate(q[0],q[1]);ctx!.rotate(Math.sin(time)*.05);ctx!.fillStyle='#fff6de';ctx!.beginPath();ctx!.moveTo(-32,-18);ctx!.quadraticCurveTo(-5,-14,-8,13);ctx!.quadraticCurveTo(-32,12,-32,-18);ctx!.fill();ctx!.beginPath();ctx!.moveTo(32,-18);ctx!.quadraticCurveTo(5,-14,8,13);ctx!.quadraticCurveTo(32,12,32,-18);ctx!.fill();ctx!.restore()}else text(String(i).padStart(2,'0'),q[0]-10,q[1]+5,14);const tw=ctx!.measureText(names[i]).width;ctx!.fillStyle='#f6edcd';ctx!.fillRect(q[0]-tw/2-8,q[1]+r+10,tw+16,21);text(names[i],q[0]-tw/2,q[1]+r+24,10)});
    ctx!.restore();
   }else if(week===2){
    const rot=time*.2+ease.x*.4;const project=(x:number,y:number,z:number)=>{const xx=x*Math.cos(rot)-z*Math.sin(rot),zz=x*Math.sin(rot)+z*Math.cos(rot);return[xx*1.05+(y*.36),y*.66-zz*.42]};
    for(let layer=0;layer<5;layer++){const z=(layer-2)*68;stroke([project(-190,-190,z),project(190,-190,z),project(190,190,z),project(-190,190,z),project(-190,-190,z)],'#ff894135',1)}
    const blocks=Array.from({length:100},(_,i)=>({x:(i%10-4.5)*42,y:(Math.floor(i/10)-4.5)*42,z:Math.sin(i*.73+time)*65}));
    blocks.forEach((p,i)=>{const q=project(p.x,p.y,p.z),r=project(p.x+29,p.y,p.z),s=project(p.x+29,p.y+29,p.z),v=project(p.x,p.y+29,p.z);ctx!.fillStyle=i%7===scene%7?accent:'#282c34';ctx!.beginPath();ctx!.moveTo(...q as [number,number]);[r,s,v].forEach(k=>ctx!.lineTo(k[0],k[1]));ctx!.closePath();ctx!.fill();ctx!.strokeStyle='#b9cbd033';ctx!.stroke();stroke([q,[q[0],q[1]+28],[v[0],v[1]+28],v],i%7===scene%7?'#ff894199':'#61717a33',1)});
    text('MODEL ENGINE',-258,-250,12,accent);text(`SEED / ${String(17+scene).padStart(4,'0')}`,125,270,11,'#a4b2ba');
   }else if(week===3){
    const paths=[[[ -330,140],[-220,140],[-120,40],[35,40],[140,-65],[325,-65]],[[-300,-180],[-170,-180],[-70,-80],[-70,180],[10,260],[290,260]],[[-260,280],[-150,170],[-150,-20],[-30,-140],[210,-140],[300,-230]],[[-280,-60],[-160,-60],[-30,70],[190,70],[290,170]]];
    const colors=['#dfee92','#b0a0ef','#ff8367','#8ec8ed'];
    paths.forEach((points,j)=>{stroke(points,colors[j]+'25',20);stroke(points,colors[j],4);points.forEach((p,i)=>{circle(p[0],p[1],8,'#161321');ctx!.strokeStyle=colors[j];ctx!.lineWidth=3;ctx!.stroke();if(i%2===0)text(['ORIGIN','BROKER','HUB','TRANSFER'][i%4],p[0]+14,p[1]-14,10,colors[j])});const pos=(time*.23+j*.22+scene*.18)%(points.length-1),i=Math.floor(pos),t=pos-i,p=points[i],q=points[i+1];circle(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,12,'#fff7dd');circle(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,5,colors[j])});
    ctx!.save();ctx!.rotate(-.18);text('YOU ARE HERE',-25,0,12,accent);ctx!.restore();
   }else if(week===4){
    const centers=[[-155,-65],[128,-100],[45,150]],colors=['#47735c','#ad6847','#6e7e92'];
    centers.forEach(([cx,cy],j)=>{for(let ring=8;ring>0;ring--){const points=Array.from({length:101},(_,k)=>{const a=k*Math.PI/50,r=ring*18+Math.sin(a*3+j+time*.15)*12+Math.cos(a*5+scene*.4)*7;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r*.75]});stroke(points,colors[j]+(ring===8?'99':'33'),ring===8?2:1)}for(let i=0;i<16;i++){const a=i*2.4,r=20+Math.sqrt(i)*21,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.65;circle(x,y,2.5,colors[j]);if(i>0)stroke([[cx,cy],[x,y]],colors[j]+'44',.7)}text(['THE NEAR','THE BETWEEN','THE FAR'][j],cx-45,cy+5,11,colors[j]);});
    stroke([[-155,-65],[128,-100],[45,150],[-155,-65]],'#283e4566',1);ctx!.setLineDash([5,5]);stroke([[-300,60],[-100,scene%2?100:10],[30,-180],[285,-230]],'#ca4f36',2);ctx!.setLineDash([]);
    circle(270,210,35,'#f0ead9');stroke([[270,178],[270,240],[240,210],[300,210]],ink,1);text('N',266,170,11);text('A PARTITION IS A PROPOSAL',-240,282,11,'#53685a');
   }else if(week===5){
    const words=['THE','world','is','made','of','THE','words','we','keep','THE','and','lose'];
    words.forEach((word,i)=>{const col=i%3,row=Math.floor(i/3),x=-300+col*205,y=-225+row*125;ctx!.save();ctx!.translate(x,y);ctx!.rotate(Math.sin(i*7+time*.2)*.045);const lift=Math.sin(time+i*.8+scene)*6;ctx!.translate(0,lift);ctx!.fillStyle=i%5===0?'#244cb9':'#e7ddc7';ctx!.fillRect(4,8,190,102);ctx!.fillStyle=i%5===0?'#f0ebdc':'#202524';ctx!.font=`${word==='THE'?64:44}px "Instrument Serif",serif`;ctx!.fillText(word,12,70);text(String(i+1).padStart(2,'0'),150,20,9,i%5===0?'#ebe5d7':'#8a8070');ctx!.restore()});
    ctx!.save();ctx!.translate(165,255);ctx!.rotate(-.12);ctx!.fillStyle='#cc4b38';ctx!.fillRect(-110,-25,220,45);text('EVERY WORD COUNTS',-92,4,14,'#fff3de');ctx!.restore();
   }else{
    for(let i=0;i<100;i++){const x=Math.sin(i*39.4)*360,y=Math.cos(i*17.1)*310;circle(x,y,i%7===0?1.6:.7,'#cbd6ff'+(i%7===0?'88':'33'))}
    const words=['meaning','language','context','document','similarity','network','vector','word','topic','space','signal','pattern','distance','weight','corpus','dimension','near','far'];
    const rot=time*.12+ease.x*.32;const pts=words.map((_,i)=>{const yy=1-2*(i+.5)/words.length,r=Math.sqrt(1-yy*yy),a=i*2.4+rot,x=Math.cos(a)*r,z=Math.sin(a)*r;return{x:x*260,y:yy*235+ease.y*z*30,z}});
    ctx!.save();ctx!.scale(1,.34);ctx!.rotate(.3);ctx!.beginPath();ctx!.ellipse(0,0,325,260,0,0,Math.PI*2);ctx!.strokeStyle='#95abff55';ctx!.stroke();ctx!.restore();
    pts.forEach((p,i)=>{const q=pts[(i+3)%pts.length];stroke([[p.x,p.y],[q.x,q.y]],'#a1b5ff'+(p.z>0?'35':'14'),.7)});
    pts.map((p,i)=>({...p,i})).sort((a,b)=>a.z-b.z).forEach(p=>{ctx!.globalAlpha=.3+(p.z+1)*.35;circle(p.x,p.y,3+p.z,accent);text(words[p.i],p.x+10,p.y+5,14+(p.z+1)*6,p.i%4===0?'#f4c49e':'#d1d7fa','Instrument Serif')});ctx!.globalAlpha=1;
    text('ILLUSTRATIVE TERM SPACE',-200,303,10,'#a3b4de');
   }
   ctx!.restore();if(active&&!reduced&&!document.hidden)frame=requestAnimationFrame(render);
  }
  function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=w*dpr;canvas.height=h*dpr;ctx!.setTransform(dpr,0,0,dpr,0,0);cancelAnimationFrame(frame);render(performance.now())}
  function move(e:PointerEvent){const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5}
  function visibility(){cancelAnimationFrame(frame);if(active&&!document.hidden){last=performance.now();render(last)}}
  const ro=new ResizeObserver(resize);ro.observe(canvas);const io=new IntersectionObserver(([e])=>{active=e.isIntersecting;cancelAnimationFrame(frame);if(active){last=performance.now();render(last)}},{threshold:.01});io.observe(canvas);
  canvas.addEventListener('pointermove',move);document.addEventListener('visibilitychange',visibility);
  return()=>{ro.disconnect();io.disconnect();cancelAnimationFrame(frame);canvas.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility)};
 },[week,reduced,scene]);
 return <canvas ref={ref} className="cover-art" aria-hidden="true"/>;
}

export default function ChapterCover({week:w,reduced}:{week:Week;reduced:boolean}){
 const [scene,setScene]=useState(0),c=covers[w.id-1];
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
 return <section className={`chapter-cover cover-${w.id}`}>
  <div className="cover-topline"><span>{c.label}</span><span>DTU 02805 / 2026</span></div>
  <div className="cover-stage"><div className="cover-type"><span className="cover-kicker">{w.title}</span><h1>{c.title.map((line,i)=><span key={line} className={i===1?'cover-title-second':''}>{line}</span>)}</h1><p className="cover-deck">{c.note}</p><div className="cover-direct"><button onClick={()=>jump('lab')}>Enter the laboratory <span>↘</span></button><button className="cover-play" onClick={()=>setScene(v=>v+1)}>{c.action} <span>↻</span></button></div></div><div className="cover-artboard">{w.id===6?<GlassSculpture reduced={reduced} phase={scene}/>:<CoverArt week={w.id} reduced={reduced} scene={scene}/>}<span className="cover-art-label">{w.id===1?'ILLUSTRATIVE MARVEL RELATIONSHIPS / NOT THE COURSE DATASET':'ILLUSTRATIVE SCENE / EXPLORE THE IDEA'}</span></div><span className="cover-edition" aria-hidden="true">0{w.id}</span></div>
  <div className="cover-tear"><span>{c.stamp}</span><span>↓ A CHANGE IN PERSPECTIVE</span></div>
  <div className="cover-question wrap"><span className="eyebrow">The question<br/>worth asking</span><div><h2>{w.question}</h2><p>{w.intro}</p></div></div>
  <nav className="cover-shortcuts wrap" aria-label="Jump within chapter"><button onClick={()=>jump('lab')}>01 / Experiment ↓</button><button onClick={()=>jump('study')}>02 / Study notes ↓</button><button onClick={()=>jump('practice')}>03 / Exercises ↓</button><button onClick={()=>jump('sources')}>04 / Sources ↗</button></nav>
 </section>
}
