import { useEffect, useRef, useState } from 'react';

// Original implicit-surface shader. The sculpture is visual metaphor, not a
// projection of the word vectors or an optical measurement of physical glass.
const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float phase;
mat2 turn(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 space(vec3 p){p.xy=turn(-.35)*p.xy;p.yz=turn(.72+pointer.y*.3)*p.yz;p.xz=turn(time*.12+pointer.x*.5+phase*.6)*p.xz;return p;}
float surface(vec3 p){
 p=space(p);
 float theta=atan(p.z,p.x);
 // A bevelled optical ribbon, with a half-turn around a precise circular spine.
 vec2 q=vec2(length(p.xz)-.84,p.y);
 q=turn(theta*.5+.15)*q;
 vec2 edge=abs(q)-vec2(.21,.055);
 return length(max(edge,0.))+min(max(edge.x,edge.y),0.)-.045;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(surface(p+e.xyy)-surface(p-e.xyy),surface(p+e.yxy)-surface(p-e.yxy),surface(p+e.yyx)-surface(p-e.yyx)));}
vec3 world(vec3 d){
 vec3 col=vec3(.018,.023,.045);
 float soft=pow(max(0.,dot(d,normalize(vec3(-.6,1.,.8)))),9.);
 float strip=smoothstep(.88,.94,d.y)*(1.-smoothstep(.3,.62,abs(d.x)));
 float rim=pow(max(0.,dot(d,normalize(vec3(1.,-.2,.5)))),48.);
 col+=vec3(.82,.9,1.)*soft*1.9;
 col+=vec3(1.,.94,.83)*strip*2.8;
 col+=vec3(.51,.64,.95)*rim*1.4;
 return col;
}
vec3 backdrop(vec3 p, vec3 d){
 vec2 q=p.xy+d.xy*(2.2+p.z)/max(.35,abs(d.z));
 vec3 col=mix(vec3(.026,.032,.067),vec3(.19,.23,.33),smoothstep(-1.6,2.,q.y));
 float panel=exp(-pow((q.x+.45)*1.3,2.))*smoothstep(-.8,1.6,q.y);
 col+=vec3(.62,.68,.76)*panel*.62;
 float line=1.-smoothstep(.012,.032,abs(q.x*.55+q.y*.32-.3));
 col+=vec3(.7,.64,.54)*line*.35;
 return col;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-resolution*.5)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,0.,3.8),rd=normalize(vec3(uv*2.75,-3.3));
 vec3 bg=vec3(.055,.063,.145)+vec3(.018,.022,.04)*exp(-length(uv)*3.);
 float t=2.3,hit=0.;
 for(int i=0;i<80;i++){float d=surface(ro+rd*t);if(d<.0012){hit=1.;break;}t+=d*.7;if(t>5.8)break;}
 vec3 col=bg;
 if(hit>.5){
  vec3 p=ro+rd*t,n=normalAt(p);
  float facing=max(0.,dot(-rd,n)),fresnel=.04+.96*pow(1.-facing,5.);
  vec3 reflection=world(reflect(rd,n));
  vec3 inside=refract(rd,n,1./1.46);
  float depth=.012,exited=0.;
  for(int i=0;i<24;i++){float d=surface(p+inside*depth);if(d>0.&&depth>.025){exited=1.;break;}depth+=max(.006,abs(d)*.8);}
  vec3 exitPoint=p+inside*depth;
  // Grazing rays can exhaust the bounded march. Fall back to a single-interface
  // approximation instead of inventing an exit normal inside the solid.
  vec3 outgoing=inside;
  if(exited>.5){
   vec3 exitNormal=-normalAt(exitPoint);
   outgoing=refract(inside,exitNormal,1.46);
   if(dot(outgoing,outgoing)<.01)outgoing=reflect(inside,exitNormal);
  }else{exitPoint=p;}
  vec3 rr=normalize(outgoing+vec3(.004,0.,0.)),rb=normalize(outgoing-vec3(.004,0.,0.));
  vec3 transmitted=vec3(backdrop(exitPoint,rr).r,backdrop(exitPoint,outgoing).g,backdrop(exitPoint,rb).b);
  transmitted*=exp(-depth*vec3(.18,.09,.025));
  float edge=pow(1.-facing,2.);
  col=mix(transmitted,reflection,fresnel*.85)+reflection*.24;
  col+=vec3(.12,.17,.24)*edge;
  col=pow(col/(1.+col*.5),vec3(.82));
 }
 gl_FragColor=vec4(col,1.);
}`;

export default function GlassSculpture({reduced,phase=0}:{reduced:boolean;phase?:number}){
 const ref=useRef<HTMLCanvasElement>(null),phaseRef=useRef(phase),redraw=useRef<()=>void>(()=>{}),[unavailable,setUnavailable]=useState(false);
 phaseRef.current=phase;
 useEffect(()=>{
  const canvas=ref.current!;let gl:WebGLRenderingContext|null=null;
  try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false})}catch{setUnavailable(true);return}
  if(!gl){setUnavailable(true);return}const gpu=gl;
  const compile=(type:number,code:string)=>{const s=gpu.createShader(type)!;gpu.shaderSource(s,code);gpu.compileShader(s);if(!gpu.getShaderParameter(s,gpu.COMPILE_STATUS)){gpu.deleteShader(s);throw new Error('Sculpture shader unavailable')}return s};
  let vs:WebGLShader|null=null,fs:WebGLShader|null=null,program:WebGLProgram|null=null;
  try{vs=compile(gpu.VERTEX_SHADER,vertex);fs=compile(gpu.FRAGMENT_SHADER,fragment);program=gpu.createProgram()!;gpu.attachShader(program,vs);gpu.attachShader(program,fs);gpu.linkProgram(program);if(!gpu.getProgramParameter(program,gpu.LINK_STATUS))throw new Error('Sculpture shader unavailable')}catch{if(vs)gpu.deleteShader(vs);if(fs)gpu.deleteShader(fs);if(program)gpu.deleteProgram(program);setUnavailable(true);return}
  const buffer=gpu.createBuffer();gpu.bindBuffer(gpu.ARRAY_BUFFER,buffer);gpu.bufferData(gpu.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gpu.STATIC_DRAW);gpu.useProgram(program);const position=gpu.getAttribLocation(program,'position');gpu.enableVertexAttribArray(position);gpu.vertexAttribPointer(position,2,gpu.FLOAT,false,0,0);
  const res=gpu.getUniformLocation(program,'resolution'),clock=gpu.getUniformLocation(program,'time'),mouse=gpu.getUniformLocation(program,'pointer'),seed=gpu.getUniformLocation(program,'phase');
  let raf=0,active=false,lost=false,last=0,elapsed=4,frames=0,total=0,quality=1,rotation=phaseRef.current;const target={x:0,y:0},pointer={x:0,y:0};
  const size=()=>{if(lost)return;const rect=canvas.getBoundingClientRect(),factor=Math.min(1.35,devicePixelRatio||1,Math.sqrt(720000/Math.max(1,rect.width*rect.height)))*quality;canvas.width=Math.max(1,Math.floor(rect.width*factor));canvas.height=Math.max(1,Math.floor(rect.height*factor));gpu.viewport(0,0,canvas.width,canvas.height)};
  const draw=(now:number)=>{if(lost)return;const dt=Math.min(60,Math.max(0,now-last));last=now;if(!reduced)elapsed+=dt*.001;const ease=1-Math.exp(-dt*.004);pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease;rotation=reduced?phaseRef.current:rotation+(phaseRef.current-rotation)*ease;gpu.uniform2f(res,canvas.width,canvas.height);gpu.uniform1f(clock,elapsed);gpu.uniform2f(mouse,pointer.x,pointer.y);gpu.uniform1f(seed,rotation);gpu.drawArrays(gpu.TRIANGLES,0,3);canvas.dataset.renderFrames=String(++frames);canvas.dataset.rotation=rotation.toFixed(3);if(!reduced){total+=dt;if(frames===90&&total/frames>25&&quality===1){quality=.85;size()}}if(active&&!document.hidden&&!reduced)raf=requestAnimationFrame(draw)};
  const resize=()=>{if(lost)return;size();cancelAnimationFrame(raf);draw(performance.now())};
  const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();target.x=((e.clientX-b.left)/b.width-.5)*2;target.y=((e.clientY-b.top)/b.height-.5)*2};
  const visibility=()=>{cancelAnimationFrame(raf);if(active&&!document.hidden){last=performance.now();draw(last)}};
  redraw.current=visibility;
  const loss=(e:Event)=>{e.preventDefault();lost=true;active=false;cancelAnimationFrame(raf);setUnavailable(true)};
  const observer=new IntersectionObserver(([e])=>{active=e.isIntersecting;cancelAnimationFrame(raf);if(active){last=performance.now();draw(last)}});observer.observe(canvas);const ro=new ResizeObserver(resize);ro.observe(canvas);canvas.addEventListener('pointermove',move);canvas.addEventListener('webglcontextlost',loss);document.addEventListener('visibilitychange',visibility);
  return()=>{redraw.current=()=>{};cancelAnimationFrame(raf);observer.disconnect();ro.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('webglcontextlost',loss);document.removeEventListener('visibilitychange',visibility);gpu.deleteBuffer(buffer);gpu.deleteProgram(program);gpu.deleteShader(vs);gpu.deleteShader(fs)};
 },[reduced]);
 useEffect(()=>{redraw.current()},[phase]);
 return <div className={`glass-sculpture ${unavailable?'glass-fallback':''}`}><canvas ref={ref} aria-hidden="true"/>{unavailable&&<div className="glass-fallback-ring"/>}<div className="sculpture-coordinate" aria-hidden="true"><span>LANGUAGE</span><span>CONTEXT</span><span>MEANING</span></div></div>;
}
