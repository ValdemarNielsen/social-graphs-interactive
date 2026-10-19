import { useEffect, useRef, useState } from 'react';
/** Opt-in local QA instrument. Never enabled in the ordinary visitor flow. */
export default function Diagnostics(){
 const out=useRef<HTMLOutputElement>(null),[run,setRun]=useState(0);
 useEffect(()=>{
  let raf=0,last=0,start=performance.now(),count=0,cls=0,lcp=0,longTasks=0;const frames:number[]=[];
  const observers:PerformanceObserver[]=[];
  for(const type of ['layout-shift','largest-contentful-paint','longtask']){
   try{const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries()){
    const e=entry as PerformanceEntry & {hadRecentInput?:boolean;value?:number};
    if(type==='layout-shift'&&!e.hadRecentInput)cls+=e.value??0;
    if(type==='largest-contentful-paint')lcp=e.startTime;
    if(type==='longtask')longTasks++;
   }});observer.observe({type,buffered:run===0});observers.push(observer)}catch{/* Unsupported measurement stays unavailable in the report. */}
  }
  const tick=(now:number)=>{if(last){frames.push(now-last);if(frames.length>1200)frames.shift()}last=now;count++;
   if(count%30===0&&out.current){const sorted=[...frames].sort((a,b)=>a-b);const p95=sorted[Math.floor(sorted.length*.95)]||0;out.current.textContent=JSON.stringify({seconds:+((now-start)/1000).toFixed(1),samples:frames.length,medianFrameMs:+(sorted[Math.floor(sorted.length*.5)]||0).toFixed(1),p95FrameMs:+p95.toFixed(1),framesOver50ms:frames.filter(v=>v>50).length,CLS:+cls.toFixed(4),LCPms:Math.round(lcp),longTasks,viewport:`${innerWidth}×${innerHeight}`,domNodes:document.getElementsByTagName('*').length,canvasCount:document.querySelectorAll('canvas').length,assets:performance.getEntriesByType('resource').length});}
   raf=requestAnimationFrame(tick);
  };raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);observers.forEach(o=>o.disconnect())};
 },[run]);
 return <aside className="qa-diagnostics"><strong>QA measurement</strong><output id="qa-metrics" ref={out}>Collecting browser measurements…</output><button onClick={()=>setRun(v=>v+1)}>Reset measurement</button><span>Frame timing measures this browser session, not guaranteed device FPS.</span></aside>
}
