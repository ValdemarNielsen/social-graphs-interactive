import { lazy, Suspense, useState } from 'react';
import type { Week } from './types';
import ExperimentBoundary from './ExperimentBoundary';
import './chapter-cover.css';

const GlassSculpture = lazy(() => import('./GlassSculpture'));
const MatterSculpture = lazy(() => import('./MatterSculpture'));
const ParticleTheatre = lazy(() => import('./ParticleTheatre'));
const covers = [
 {label:'Issue 01 / The connected universe',title:['No hero','stands alone.'],note:'Every alliance leaves a trace.',action:['Unravel the web','Weave it together'],stamp:'RELATIONSHIPS / NOT SUPERPOWERS',caption:'A WEB BECOMES A WORLD',result:['Filaments weave into an intricate knot.','The knot opens into a spherical field of connections.']},
 {label:'Experiment 02 / The world machine',title:['Simple rules.','Strange worlds.'],note:'Order is a setting. Chaos is another.',action:['Explode the machine','Rebuild the machine'],stamp:'ORDER → CHANCE → EMERGENCE',caption:'ONE RULE. AN ENTIRE WORLD.',result:['A compact kinetic mechanism.','The mechanism separates into orbiting parts.']},
 {label:'Line 03 / The influence express',title:['All roads','lead somewhere.'],note:'Popularity. Reach. The power of being between.',action:['Bend the route','Straighten the route'],stamp:'YOU ARE HERE / WHERE CAN YOU GO?',caption:'FOLLOW THE SIGNAL INTO THE NETWORK',result:['Signals travel through the route tunnel.','The tunnel twists into an alternate path.']},
 {label:'Atlas 04 / Territories of belonging',title:['Where do','we belong?'],note:'Draw a boundary. Discover what it leaves out.',action:['Separate the swarm','Bring it together'],stamp:'AN ATLAS OF POSSIBLE COMMUNITIES',caption:'SEPARATE FORMS. SHARED BOUNDARIES.',result:['Liquid forms share a continuous surface.','The forms separate into a loose constellation.']},
 {label:'Edition 05 / The language press',title:['A world','made of words.'],note:'Take a sentence apart. Find the pattern inside.',action:['Scatter the type','Reform the word'],stamp:'READ / SEPARATE / COUNT / QUESTION',caption:'LANGUAGE, SUSPENDED IN SPACE',result:['Particles assemble into WORDS.','The letters disperse through space and reassemble as LANGUAGE.']},
 {label:'Expedition 06 / The meaning observatory',title:['Words have','coordinates.'],note:'A journey from a page into a space of meaning.',action:['Rotate the constellation','Rotate the constellation'],stamp:'DISTANCE IS A CHOICE OF REPRESENTATION',caption:'THROUGH A DIFFERENT LENS',result:['An illustrative glass sculpture.','The glass sculpture turns to a different orientation.']}
];

export default function ChapterCover({week:w,reduced}:{week:Week;reduced:boolean}){
 const [scene,setScene]=useState(0),c=covers[w.id-1],alternate=scene%2===1;
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
 return <section className={`chapter-cover cover-${w.id} sculptural-cover`} data-cover-state={alternate?'expanded':'rest'}>
  <div className="cover-topline"><span>{c.label}</span><span>DTU 02805 / 2026</span></div>
  <div className="cover-stage">
   <div className="cover-type"><span className="cover-kicker">{w.title}</span><h1>{c.title.map((line,i)=><span key={line} className={i===1?'cover-title-second':''}>{line}</span>)}</h1><p className="cover-deck">{c.note}</p><div className="cover-direct"><button onClick={()=>jump('lab')}>Enter the laboratory <span>↘</span></button><button className="cover-play" aria-pressed={w.id===6?undefined:alternate} onClick={()=>setScene(v=>v+1)}>{c.action[alternate?1:0]} <span>↻</span></button></div><p className="cover-live-status" role="status">{scene>0?c.result[alternate?1:0]:''}</p></div>
   <div className="cover-artboard"><ExperimentBoundary fallback={<div className="cover-loading-orbit" role="img" aria-label="Static orbital sculpture"/>}><Suspense fallback={<div className="cover-loading-orbit" aria-hidden="true"/>}>
    {w.id===6?<GlassSculpture reduced={reduced} phase={scene}/>:w.id===2||w.id===4?<MatterSculpture week={w.id} reduced={reduced} active={alternate}/>:<ParticleTheatre week={w.id as 1|3|5} reduced={reduced} active={alternate}/>}
   </Suspense></ExperimentBoundary><div className="cover-art-caption" aria-hidden="true"><span>0{w.id} / IN MOTION</span><strong>{c.caption}</strong></div><span className="cover-art-label">ILLUSTRATIVE SCULPTURE / CALCULATIONS IN THE LABORATORY</span></div><span className="cover-edition" aria-hidden="true">0{w.id}</span>
  </div>
  <div className="cover-tear"><span>{c.stamp}</span><span>↓ A CHANGE IN PERSPECTIVE</span></div>
  <div className="cover-question wrap"><span className="eyebrow">The question<br/>worth asking</span><div><h2>{w.question}</h2><p>{w.intro}</p></div></div>
  <nav className="cover-shortcuts wrap" aria-label="Jump within chapter"><button onClick={()=>jump('lab')}>01 / Experiment ↓</button><button onClick={()=>jump('study')}>02 / Study notes ↓</button><button onClick={()=>jump('practice')}>03 / Exercises ↓</button><button onClick={()=>jump('sources')}>04 / Sources ↗</button></nav>
 </section>
}
