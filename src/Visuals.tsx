import { useEffect, useRef, useState } from 'react';
import './story-experience.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function Mark(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m5 23 11-18 11 18H5l11 5 11-5" fill="none" stroke="currentColor" strokeWidth="1.3"/>{[[5,23],[16,5],[27,23],[16,28]].map(([x,y])=><circle key={x+','+y} cx={x} cy={y} r="2.6" fill="currentColor"/>)}</svg>}

export function Orb({reduced=false}:{reduced?:boolean}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=canvas.current!; const ctx=el.getContext('2d'); if(!ctx)return;
    let width=0,height=0,raf=0,visible=true,time=0,last=0;
    const n=window.innerWidth<600?105:170;
    const pts=Array.from({length:n},(_,i)=>{const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.399963;return{x:Math.cos(a)*r,y,z:Math.sin(a)*r}});
    const links: [number,number][]=[];
    pts.forEach((p,i)=>pts.slice(i+1).forEach((q,j)=>{if(Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)<.42)links.push([i,i+j+1])}));
    function draw(now=0){if(!ctx)return; const dt=Math.min(now-last,50);last=now;if(!reduced)time+=dt*.00007;
      ctx.clearRect(0,0,width,height);const scale=Math.min(width,height)*.39;
      const pp=pts.map(p=>{const x=p.x*Math.cos(time)+p.z*Math.sin(time),z=p.z*Math.cos(time)-p.x*Math.sin(time);return{x:width*.5+x*scale*(1+z*.12),y:height*.5+p.y*scale*(1+z*.12),z}});
      const glow=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,scale*1.2);glow.addColorStop(0,'rgba(58,126,107,.1)');glow.addColorStop(1,'rgba(58,126,107,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      ctx.lineWidth=.7;links.forEach(([a,b])=>{ctx.strokeStyle=`rgba(162,218,201,${.045+(pp[a].z+pp[b].z+2)*.055})`;ctx.beginPath();ctx.moveTo(pp[a].x,pp[a].y);ctx.lineTo(pp[b].x,pp[b].y);ctx.stroke()});
      pp.map((p,i)=>({...p,i})).sort((a,b)=>a.z-b.z).forEach(p=>{ctx.globalAlpha=.32+(p.z+1)*.34;ctx.fillStyle=p.i%17===0?'#f5a17f':'#b1e9d5';ctx.beginPath();ctx.arc(p.x,p.y,(1.3+(p.z+1)*1.2)*(p.i%17===0?1.65:1),0,Math.PI*2);ctx.fill();if(p.i%31===0){ctx.strokeStyle='#a0d5c0';ctx.beginPath();ctx.arc(p.x,p.y,7+(p.z+1)*2,0,Math.PI*2);ctx.stroke()}});ctx.globalAlpha=1;
      if(visible&&!reduced&&!document.hidden)raf=requestAnimationFrame(draw);
    }
    function resize(){const rect=el.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);el.width=width*dpr;el.height=height*dpr;ctx!.setTransform(dpr,0,0,dpr,0,0);cancelAnimationFrame(raf);draw()}
    const ro=new ResizeObserver(resize);ro.observe(el);
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;cancelAnimationFrame(raf);if(visible){last=performance.now();draw(last)}},{threshold:.01});io.observe(el);
    const visibility=()=>{cancelAnimationFrame(raf);if(!document.hidden&&visible){last=performance.now();draw(last)}};
    document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility)};
  },[reduced]);
  return <canvas ref={canvas} className="orb" aria-hidden="true"/>;
}

type ScenePoint = { x: number; y: number };
type SceneEdge = [number, number];
type SceneAct = { title: string; body: string; label: string; reading: string };
const sceneActs: SceneAct[][] = [
 [
  {title:'Nothing is|alone.',body:'Six things. Seven relationships. Begin with the space between them.',label:'Find the relationships',reading:'06 nodes / 07 edges'},
  {title:'A connection.|Two entries.',body:'Every undirected edge appears twice: once from each end. Follow the nodes into their rows.',label:'Change the representation',reading:'A ↔ B means A,B + B,A'},
  {title:'New language.|Same world.',body:'The picture becomes a matrix. The fourteen ones preserve every one of the seven connections.',label:'Read the matrix',reading:'36 cells / 14 ones'},
 ],
 [
  {title:'Around.|And around.',body:'On this degree-four ring, reaching the opposite node takes five edges. Local order has a price.',label:'Start with local order',reading:'0 → 10 / 5 hops'},
  {title:'One link.|A new world.',body:'A connection across the ring changes the journey. The long way round is suddenly optional.',label:'Open a shortcut',reading:'One new edge: 0 ↔ 10'},
  {title:'Closer than|you thought.',body:'Five hops become one. This is an edge-addition illustration; the laboratory below uses actual Watts–Strogatz rewiring.',label:'Take the shorter route',reading:'0 → 10 / 1 hop'},
 ],
 [
  {title:'Begin|with one.',body:'A starts at distance zero. The rest of the graph waits to be discovered.',label:'Choose the source',reading:'Source A / distance 0'},
  {title:'The next|possible step.',body:'Breadth-first search reaches every node in one layer before moving to the next. Equal routes share a layer.',label:'Expand the frontier',reading:'A → {B,C} → D → E'},
  {title:'Distance,|revealed.',body:'H is five hops from A. Each discovery layer gives the exact shortest-path distance from the source.',label:'Read the distances',reading:'8 reached / farthest 5 hops'},
 ],
 [
  {title:'A crowd.|Or two circles?',body:'The relationships are already there. Their arrangement can make them difficult to see.',label:'Look at the whole',reading:'10 nodes / 21 edges'},
  {title:'Let the space|make sense.',body:'Two five-node cliques move apart. Every edge follows both of its endpoints. The graph itself stays fixed.',label:'Separate the communities',reading:'Same graph / new layout'},
  {title:'Belonging is|a hypothesis.',body:'One bridge joins the two groups. Their modularity is 19/42, but a good score is a starting point for interpretation.',label:'Question the partition',reading:'Two groups / Q = 0.4524'},
 ],
 [
  {title:'Language,|in the wild.',body:'A thought arrives as a stream. Before measuring it, decide where one piece ends and another begins.',label:'Read the sentence',reading:'the network is a story…'},
  {title:'Make room|for every word.',body:'Our simple whitespace rule separates this punctuation-free sentence into twelve occurrences.',label:'Choose the boundaries',reading:'12 tokens / order retained'},
  {title:'Twelve pieces.|Ten identities.',body:'“the” appears three times. Those are three tokens but one type. A small distinction changes what you count.',label:'Count what repeats',reading:'12 tokens / 10 types / the ×3'},
 ],
 [
  {title:'Words carry|the evidence.',body:'Three tiny documents contain only “star” and “light”. Each word will contribute to a coordinate.',label:'Read three documents',reading:'A: star star light'},
  {title:'Give the words|somewhere to go.',body:'Count “star” along the horizontal axis and “light” vertically. The documents acquire exact positions.',label:'Build the coordinates',reading:'A (2,1) / B (1,2) / C (0,3)'},
  {title:'Meaning needs|a frame.',body:'A and B have cosine similarity 0.800 in this count space. These are chosen coordinates, not trained semantic embeddings.',label:'Inspect the geometry',reading:'cos(A,B) = 0.800'},
 ],
];
const stageTitles=['The relationship chamber','The shortcut observatory','The reachability scanner','The community lens','The language workshop','The coordinate room'];
const matrixEdges: SceneEdge[]=[[0,1],[0,2],[0,3],[1,2],[2,3],[3,4],[4,5]];
const bfsEdges: SceneEdge[]=[[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[4,6],[6,7]];
const bfsLayers=[0,1,1,2,3,4,4,5];
const bfsPoints:ScenePoint[]=[{x:75,y:250},{x:180,y:155},{x:180,y:345},{x:290,y:250},{x:405,y:250},{x:520,y:155},{x:520,y:345},{x:640,y:250}];
const circlePoints=(n:number,cx=360,cy=250,r=160):ScenePoint[]=>Array.from({length:n},(_,i)=>({x:cx+Math.cos(i*Math.PI*2/n-Math.PI/2)*r,y:cy+Math.sin(i*Math.PI*2/n-Math.PI/2)*r}));
const communityEdges:SceneEdge[]=[0,5].flatMap(o=>Array.from({length:5},(_,i)=>Array.from({length:4-i},(_,j)=>[o+i,o+i+j+1] as SceneEdge)).flat()).concat([[4,5]]);
const communityEnd=circlePoints(5,210,250,99).concat(circlePoints(5,510,250,99));
const sentenceWords=['the','network','is','a','story','of','the','people','and','the','world','between'];
const sentencePoints:ScenePoint[]=[{x:85,y:145},{x:225,y:145},{x:365,y:145},{x:430,y:145},{x:535,y:145},{x:105,y:250},{x:195,y:250},{x:345,y:250},{x:505,y:250},{x:135,y:355},{x:290,y:355},{x:475,y:355}];
const tokenDestination=(i:number)=>({x:135+(i%4)*150,y:150+Math.floor(i/4)*105});
// Equal screen units on both axes preserve the angle used by cosine similarity.
const vectorEndpoints:ScenePoint[]=[{x:385,y:290},{x:280,y:185},{x:175,y:80}];
const vectorWords=[['star','star','light'],['star','light','light'],['light','light','light']];

function SceneNode({point,label,className='',secondary=false,small=false}:{point:ScenePoint;label:string;className?:string;secondary?:boolean;small?:boolean}){
 return <g className={`scene-node ${secondary?'secondary-node':''} ${className}`} transform={`translate(${point.x} ${point.y})`}>
  <circle className="node-orbit" r={small?13:29}/><circle className="node-core" r={small?6:19}/>
  {!small&&<text className="node-label" y="4" textAnchor="middle">{label}</text>}
 </g>;
}

function MatrixScene({still}:{still:boolean}){
 const points=circlePoints(6,350,245,153);
 return <>
  <text className="scene-watermark matrix-watermark" x="360" y="285" textAnchor="middle" opacity={still?0:1}>together.</text>
  <g className="matrix-source" opacity={still?0:1}>{matrixEdges.map(([a,b])=><line key={`${a}-${b}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className="scene-connection"/>)}<circle cx="350" cy="245" r="190" className="scene-orbit-guide"/></g>
  <g className="matrix-cells" opacity={still?1:0}>
   <text x="150" y="74" className="scene-label">FROM ↓</text><text x="444" y="70" className="scene-label">TO →</text>
   {Array.from({length:6},(_,i)=><text key={i} x={278+i*53} y="100" textAnchor="middle" className="scene-label">{'ABCDEF'[i]}</text>)}
   {Array.from({length:36},(_,i)=>{const row=Math.floor(i/6),col=i%6,on=matrixEdges.some(([a,b])=>a===row&&b===col||a===col&&b===row);return <g key={i} className={`matrix-cell ${on?'matrix-on':''}`}><rect x={255+col*53} y={117+row*48} width="46" height="41" rx="9"/><text x={278+col*53} y={143+row*48} textAnchor="middle">{on?'1':'0'}</text></g>})}
   <path d="M240 110H229V409H240 M583 110H594V409H583" className="matrix-bracket"/>
   <text x="415" y="451" className="scene-annotation" textAnchor="middle">one relationship · two symmetric entries</text>
  </g>
  {points.map((point,i)=><SceneNode key={i} point={still?{x:192,y:138+i*48}:point} label={'ABCDEF'[i]} className="matrix-traveller" secondary={i===0}/>)}
 </>;
}

function ShortcutScene({still}:{still:boolean}){
 const points=circlePoints(20,360,250,157);
 const edges:SceneEdge[]=Array.from({length:20},(_,i)=>[[i,(i+1)%20],[i,(i+2)%20]] as SceneEdge[]).flat();
 const longPath=[0,2,4,6,8,10].map(i=>`${points[i].x},${points[i].y}`).join(' ');
 return <>
  <g className="shortcut-map"><ellipse cx="360" cy="250" rx="219" ry="204" className="scene-orbit-guide"/><ellipse cx="360" cy="250" rx="193" ry="178" className="scene-orbit-guide"/>
   {edges.map(([a,b],i)=><line key={i} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className="scene-connection ring-edge"/>)}
   <polyline points={longPath} fill="none" className="long-route" opacity={still?.25:1}/>
   {points.map((point,i)=><SceneNode key={i} point={point} label={String(i)} small={i!==0&&i!==10} secondary={i===10}/>)}
  </g>
  <path className="shortcut-shadow" d="M360 93C640 150 640 350 360 407"/>
  <path className="shortcut-flyover" d="M360 93C640 150 640 350 360 407" pathLength="1" strokeDasharray="1" strokeDashoffset={still?0:1}/>
  <g className="shortcut-ship" opacity={still?0:1} transform="translate(360 93)"><circle r="16" fill="var(--secondary)" opacity=".16"/><circle r="5" fill="var(--secondary)"/></g>
  <g className="shortcut-before" opacity={still?0:1}><text x="360" y="248" className="scene-big-number" textAnchor="middle">5</text><text x="360" y="277" className="scene-label" textAnchor="middle">HOPS AROUND</text></g>
  <g className="shortcut-after" opacity={still?1:0}><text x="360" y="248" className="scene-big-number" textAnchor="middle">1</text><text x="360" y="277" className="scene-label" textAnchor="middle">HOP ACROSS</text></g>
  <text x="360" y="467" className="scene-annotation" textAnchor="middle">a new edge changes distance, even when it looks longer</text>
 </>;
}

function BfsScene({still}:{still:boolean}){
 return <>
  <g className="bfs-guides">{[75,180,290,405,520,640].map((x,i)=><g key={i}><line x1={x} y1="85" x2={x} y2="411"/><text x={x} y="66" textAnchor="middle" className="scene-label">{i===0?'SOURCE':`HOP ${i}`}</text></g>)}</g>
  {[1,2,3,4,5].map(i=><ellipse key={i} className={`bfs-wave bfs-wave-${i}`} cx="75" cy="250" rx={i*114} ry={i*65+60} opacity={still?.12:0}/>)}
  {bfsEdges.map(([a,b],i)=><line key={i} className={`scene-connection bfs-link bfs-depth-${Math.max(bfsLayers[a],bfsLayers[b])}`} x1={bfsPoints[a].x} y1={bfsPoints[a].y} x2={bfsPoints[b].x} y2={bfsPoints[b].y} opacity={still?1:.14}/>)}
  {bfsPoints.map((point,i)=><g key={i} className={`bfs-node bfs-depth-${bfsLayers[i]}`} opacity={still||i===0?1:.16}><SceneNode point={point} label={'ABCDEFGH'[i]} secondary={i===0}/><text x={point.x} y={point.y+49} textAnchor="middle" className="scene-distance">d = {bfsLayers[i]}</text></g>)}
  <g className="bfs-result" opacity={still?1:0}><rect x="205" y="427" width="310" height="35" rx="18"/><text x="360" y="450" textAnchor="middle" className="scene-annotation">A → B or C → D → E → G → H</text></g>
 </>;
}

function CommunityScene({still}:{still:boolean}){
 const points=still?communityEnd:circlePoints(10,360,250,165);
 return <>
  <g className="community-fields" opacity={still?1:0}><ellipse cx="210" cy="250" rx="137" ry="153"/><ellipse cx="510" cy="250" rx="137" ry="153" className="second-field"/><text x="210" y="66" textAnchor="middle" className="scene-label">GROUP 01 / 5 NODES</text><text x="510" y="66" textAnchor="middle" className="scene-label">GROUP 02 / 5 NODES</text></g>
  {communityEdges.map(([a,b],i)=><line key={i} className={`scene-connection community-link ${i===20?'community-bridge':''}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y}/>)}
  {points.map((point,i)=><SceneNode key={i} point={point} label={'ABCDEFGHIJ'[i]} secondary={i>=5} className="community-traveller"/>)}
  <g className="community-result" opacity={still?1:0}><text x="360" y="442" textAnchor="middle" className="scene-formula">Q = 19 / 42 = 0.4524</text><text x="360" y="470" textAnchor="middle" className="scene-annotation">a scored partition · not a discovered social truth</text></g>
 </>;
}

function LanguageScene({still}:{still:boolean}){
 return <>
  <text className="scene-label language-origin" x="360" y="65" textAnchor="middle">ONE SENTENCE / MANY CHOICES</text>
  <path className="language-thread" d="M55 161C230 98 430 200 635 160M65 266C235 220 455 310 620 260M70 371C230 326 490 402 645 365" fill="none" opacity={still?0:.3}/>
  {sentenceWords.map((word,i)=>{const p=still?tokenDestination(i):sentencePoints[i];return <g className={`language-tile ${word==='the'?'repeated-tile':''}`} key={i} transform={`translate(${p.x} ${p.y})`}>
   <rect className="language-tile-glass" x="-65" y="-45" width="130" height="78" rx="14" opacity={still?1:0}/>
   <text className="language-word" textAnchor="middle" y="0">{word}</text><text className="language-index" x="-49" y="23" opacity={still?1:0}>{String(i+1).padStart(2,'0')}</text>
   {word==='the'&&<circle className="repeat-mark" cx="47" cy="20" r="3" opacity={still?1:0}/>}
  </g>})}
  <g className="language-result" opacity={still?1:0}><text x="360" y="451" textAnchor="middle" className="scene-annotation">12 occurrences · 10 distinct forms · 3 × “the”</text></g>
 </>;
}

function VectorScene({still}:{still:boolean}){
 const origin={x:175,y:395};
 return <>
  <g className="vector-coordinates" opacity={still?1:0}>
   {[0,1,2,3].map(i=><g key={i} className="vector-grid"><line x1={175+i*105} y1="55" x2={175+i*105} y2="395"/><line x1="175" y1={395-i*105} x2="535" y2={395-i*105}/><text x={175+i*105} y="419" textAnchor="middle">{i}</text><text x="154" y={400-i*105} textAnchor="end">{i}</text></g>)}
   <path d="M175 55V395H550" className="vector-axes"/><text x="545" y="443" textAnchor="end" className="scene-label">STAR COUNT →</text><text x="175" y="39" className="scene-label">LIGHT COUNT ↑</text>
  </g>
  <g className="vector-document-labels" opacity={still?0:1}>{['A','B','C'].map((label,i)=><text key={label} x="80" y={153+i*110} className="scene-label">{label}</text>)}</g>
  {vectorWords.flatMap((words,d)=>words.map((word,t)=><g key={`${d}-${t}`} className={`vector-word vector-word-${d}`} opacity={still?0:1} transform={`translate(${195+t*170} ${150+d*110})`}><rect x="-68" y="-37" width="136" height="67" rx="14"/><text textAnchor="middle" y="7">{word}</text></g>))}
  {vectorEndpoints.map((p,i)=><g key={i} className={`vector-destination vector-color-${i}`} opacity={still?1:0}><line className="vector-ray" x1={origin.x} y1={origin.y} x2={p.x} y2={p.y} pathLength="1" strokeDasharray="1" strokeDashoffset={still?0:1}/><circle cx={p.x} cy={p.y} r="8"/><circle cx={p.x} cy={p.y} r="17" className="vector-point-orbit"/><text x={p.x+24} y={p.y+5} className="scene-label">{['A (2,1)','B (1,2)','C (0,3)'][i]}</text></g>)}
  <g className="vector-angle" opacity={still?1:0}><path d="M237.61 363.7A70 70 0 0 0 206.3 332.39"/><text x="260" y="370" className="scene-annotation">cos(A,B) = 0.800</text></g>
  <text x="360" y="465" className="scene-annotation vector-caption" opacity={still?1:0} textAnchor="middle">exact word-count coordinates · no learned embeddings</text>
 </>;
}

export function Story({week,reduced}:{week:number;reduced:boolean}){
 const root=useRef<HTMLDivElement>(null);
 const [act,setAct]=useState(reduced?2:0);
 const acts=sceneActs[week-1];
 useEffect(()=>{
  const el=root.current!;
  if(reduced){setAct(2);return;}
  setAct(0);
  let lastAct=0;
  const context=gsap.context(()=>{
   const q=(selector:string)=>el.querySelectorAll(selector);
   const timeline=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:el,start:'top top+=125',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true,onUpdate:self=>{const next=Math.min(2,Math.floor(self.progress*3));if(next!==lastAct){lastAct=next;setAct(next);}}}});
   const camera=[
    {rotationY:-34,rotationX:18,rotationZ:-5,z:-110,y:35,scale:.92},
    {rotationY:-22,rotationX:44,rotationZ:16,z:-100,y:30,scale:.9},
    {rotationY:0,rotationX:52,rotationZ:-3,z:-110,y:40,scale:1.08},
    {rotationY:32,rotationX:8,rotationZ:-8,z:-100,y:25,scale:.92},
    {rotationY:-25,rotationX:32,rotationZ:7,z:100,y:35,scale:.9},
    {rotationY:-11,rotationX:7,rotationZ:0,z:0,y:28,scale:1}
   ][week-1];
   // Travel into the model, then arrive at an undistorted reading plane.
   timeline.fromTo(q('.story-glass-front'),camera,{rotationY:0,rotationX:0,rotationZ:0,z:0,y:0,scale:1,duration:1.55},0)
    .fromTo(q('.story-glass-back'),{x:75,y:55,z:-180,rotationY:25,rotationZ:14},{x:-22,y:-22,z:-20,rotationY:0,rotationZ:-3,duration:2.5},0)
    .fromTo(q('.story-glass-middle'),{x:-60,y:30,z:-90,rotationY:-20,rotationZ:-12},{x:16,y:16,z:-8,rotationY:0,rotationZ:2,duration:2.3},0)
    .fromTo(q('.story-ghost-number'),{y:75},{y:-80,duration:3,ease:'none'},0)
    .fromTo(q('.story-progress-fill'),{scaleX:0},{scaleX:1,duration:3,ease:'none'},0)
    .fromTo(q('.story-glass-sheen'),{xPercent:-130},{xPercent:130,duration:3,ease:'none'},0);
   if(week===2||week===3)timeline.fromTo(q('.story-orbit-cage'),{rotationZ:-45,scale:.7,opacity:.2},{rotationZ:115,scale:1.12,opacity:.65,duration:3,ease:'none'},0);
   if(week===1){
    timeline.to(q('.matrix-source'),{opacity:0,duration:.6},.55).to(q('.matrix-watermark'),{opacity:0,duration:.6},.55)
     .to(q('.matrix-traveller'),{attr:{transform:(i:number)=>`translate(192 ${138+i*48})`},duration:1.2,stagger:.045},.65)
     .to(q('.matrix-cells'),{opacity:1,duration:.7},1.45).from(q('.matrix-cell'),{opacity:0,scale:.8,transformOrigin:'center',stagger:.012,duration:.35},1.4);
   }
   if(week===2){
    timeline.to(q('.long-route'),{opacity:.15,duration:.6},1).to(q('.shortcut-flyover'),{attr:{'stroke-dashoffset':0},duration:1.1,ease:'power1.inOut'},.9)
     .to(q('.shortcut-before'),{opacity:0,y:-18,duration:.4},1.25).fromTo(q('.shortcut-after'),{opacity:0,y:18},{opacity:1,y:0,duration:.5},1.6);
    const ship=q('.shortcut-ship')[0];const travel={t:0};
    timeline.to(travel,{t:1,duration:1.2,ease:'none',onUpdate:()=>{const t=travel.t,u=1-t;ship.setAttribute('transform',`translate(${360*u*u*u+3*640*u*u*t+3*640*u*t*t+360*t*t*t} ${93*u*u*u+3*150*u*u*t+3*350*u*t*t+407*t*t*t})`)}},1.4);
   }
   if(week===3){
    for(let layer=1;layer<=5;layer++){
     const time=.22+layer*.38;
     timeline.to(q(`.bfs-depth-${layer}`),{opacity:1,duration:.3},time)
      .to(q(`.bfs-wave-${layer}`),{opacity:.5,duration:.22},time-.1).to(q(`.bfs-wave-${layer}`),{opacity:.08,duration:.5},time+.18);
    }
    timeline.to(q('.bfs-result'),{opacity:1,duration:.5},2.5);
   }
   if(week===4){
    timeline.to(q('.community-traveller'),{attr:{transform:(i:number)=>`translate(${communityEnd[i].x} ${communityEnd[i].y})`},duration:1.6},.55)
     .to(q('.community-link'),{attr:{x1:(i:number)=>communityEnd[communityEdges[i][0]].x,y1:(i:number)=>communityEnd[communityEdges[i][0]].y,x2:(i:number)=>communityEnd[communityEdges[i][1]].x,y2:(i:number)=>communityEnd[communityEdges[i][1]].y},duration:1.6},.55)
     .to(q('.community-fields'),{opacity:1,duration:1},1).to(q('.community-result'),{opacity:1,duration:.6},2.2);
   }
   if(week===5){
    timeline.to(q('.language-thread'),{opacity:0,duration:.6},.3)
     .to(q('.language-tile'),{attr:{transform:(i:number)=>{const p=tokenDestination(i);return `translate(${p.x} ${p.y})`}},duration:1.2,stagger:.035},.55)
     .to(q('.language-tile-glass'),{opacity:1,duration:.6,stagger:.03},1.1)
     .to(q('.language-index'),{opacity:1,duration:.4,stagger:.03},1.5)
     .to(q('.repeat-mark'),{opacity:1,duration:.4,stagger:.12},2)
     .to(q('.language-result'),{opacity:1,duration:.6},2.3);
   }
   if(week===6){
    timeline.to(q('.vector-document-labels'),{opacity:0,duration:.4},.55).to(q('.vector-coordinates'),{opacity:1,duration:.7},.8);
    for(let i=0;i<3;i++){const p=vectorEndpoints[i];timeline.to(q(`.vector-word-${i}`),{attr:{transform:`translate(${p.x} ${p.y})`},opacity:0,duration:1.1,stagger:.07},.55+i*.16);}
    timeline.to(q('.vector-destination'),{opacity:1,duration:.5,stagger:.12},1.65)
     .to(q('.vector-ray'),{attr:{'stroke-dashoffset':0},duration:.8,stagger:.12},1.6)
     .to(q('.vector-angle'),{opacity:1,duration:.5},2.35).to(q('.vector-caption'),{opacity:1,duration:.5},2.5);
   }
  },el);
  return()=>{context.revert();const ship=el.querySelector('.shortcut-ship');ship?.setAttribute('transform','translate(360 93)');};
 },[week,reduced]);
 return <div ref={root} className={`story cinematic-story story-${week} ${reduced?'static':''}`} data-act={act}>
  <div className="story-sticky cinematic-sticky">
   <div className="story-atmosphere" aria-hidden="true"/><div className="story-ghost-number" aria-hidden="true">0{week}</div>
   <div className="story-topline"><span><i/> A change in perspective</span><span>SCENE 0{week} / 06</span></div>
   <div className="story-composition">
    <div className="cinematic-copy"><p className="eyebrow">{['Representation','Small worlds','Distance & reach','Community structure','Tokens & types','Vector spaces'][week-1]}</p>
     <div className="story-act-stack">{acts.map((item,i)=><div key={item.label} className={`story-act ${act===i?'is-current':''}`} aria-hidden={act!==i}><h2>{item.title.split('|').map((line,j)=><span key={line}>{j===1?<em>{line}</em>:line}</span>)}</h2><p>{item.body}</p></div>)}</div>
     <div className="story-readout"><span className="readout-icon" aria-hidden="true">⌁</span><div><span className="readout-label">The observation</span><p>{acts[act].reading}</p></div></div>
    </div>
    <div className="story-stage-perspective">{(week===2||week===3)&&<div className="story-orbit-cage" aria-hidden="true"><i/><i/><i/><i/></div>}<div className="story-glass-back" aria-hidden="true"/><div className="story-glass-middle" aria-hidden="true"/>
     <div className="story-glass-front"><div className="story-glass-sheen" aria-hidden="true"/><div className="story-stage-header"><span className="stage-dot"/><span>{stageTitles[week-1]}</span><span className="stage-coordinate">FIG. 0{week}</span></div>
      <svg className="cinematic-svg" viewBox="0 0 720 500" role="img" aria-label={`${stageTitles[week-1]}. ${acts[2].body}`}><title>{stageTitles[week-1]}</title>
       {week===1?<MatrixScene still={reduced}/>:week===2?<ShortcutScene still={reduced}/>:week===3?<BfsScene still={reduced}/>:week===4?<CommunityScene still={reduced}/>:week===5?<LanguageScene still={reduced}/>:<VectorScene still={reduced}/>}
      </svg><div className="story-stage-footer"><span>SYNTHETIC TEACHING EXAMPLE</span><span>{week===2?'EDGE ADDITION · NOT WS REWIRING':week===6?'COUNT SPACE · NOT A TRAINED MODEL':'EXACT RELATIONSHIPS · ILLUSTRATIVE MOTION'}</span></div>
     </div>
     <div className="story-floating-label" aria-hidden="true"><span>0{week}</span><i/>{['relationships','shortcuts','reach','belonging','language','meaning'][week-1]}</div>
    </div>
   </div>
   <div className="story-bottomline"><div className="story-acts" aria-label="Three acts in this visual explanation">{acts.map((item,i)=><div key={item.label} className={i===act?'is-current':''}><span>0{i+1}</span><p>{item.label}</p></div>)}</div><span className="story-scroll-note">{reduced?'STILL VIEW / MOTION REDUCED':'SCROLL TO CHANGE PERSPECTIVE'} <span aria-hidden="true">↓</span></span></div>
   <div className="cinematic-progress" aria-hidden="true"><span className="story-progress-fill"/></div>
  </div>
 </div>;
}

export function Miniature({week}:{week:number}){
 const ps=Array.from({length:22},(_,i)=>{const a=i*2.4,r=10+Math.sqrt(i/22)*55;return[90+Math.cos(a)*r,70+Math.sin(a)*r*.75]});
 return <svg viewBox="0 0 180 140" aria-hidden="true" className={`miniature mini-${week}`}>
  {week===5?<><text x="30" y="65" fill="currentColor" fontFamily="Instrument Serif" fontSize="36">words</text><text x="55" y="99" fill="var(--accent)" fontFamily="Instrument Serif" fontSize="25" fontStyle="italic">→ worlds</text></>:week===6?<g stroke="var(--accent)" fill="none"><path d="M25 110H155M25 110V20M25 110 110 35M25 110 145 70"/><circle cx="110" cy="35" r="4" fill="var(--accent)"/><circle cx="145" cy="70" r="4" fill="var(--accent)"/><path d="M60 96Q70 80 58 73"/></g>:<>{ps.map((p,i)=><path key={i} d={`M${p}L${ps[(i+3)%ps.length]}`} stroke="var(--accent)" opacity=".3"/>)}{ps.map((p,i)=><circle key={i} cx={p[0]+(week===4?(i%2===0?-15:15):0)} cy={p[1]} r={week===3?2+i%4:2.7} fill={i%5===0?'var(--secondary)':'var(--accent)'}/>)}</>}
 </svg>
}
