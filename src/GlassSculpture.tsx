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
vec3 space(vec3 p){p.yz=turn(.65+pointer.y*.45)*p.yz;p.xz=turn(time*.16+pointer.x*.7+phase*.6)*p.xz;p.xy=turn(.2)*p.xy;return p;}
float surface(vec3 p){
 p=space(p);
 p.xy=turn(p.z*.85+.25*sin(time*.24))*p.xy;
 float theta=atan(p.z,p.x);
 float radius=.86+.09*cos(theta*3.+time*.16);
 float thick=.225+.025*sin(theta*6.-time*.4);
 return length(vec2(length(p.xz)-radius,p.y)) - thick;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(surface(p+e.xyy)-surface(p-e.xyy),surface(p+e.yxy)-surface(p-e.yxy),surface(p+e.yyx)-surface(p-e.yyx)));}
vec3 world(vec3 d){
 vec3 col=vec3(.025,.033,.085);
 float soft=pow(max(0.,dot(d,normalize(vec3(-.5,1.,1.)))),8.);
 float strip=pow(max(0.,1.-abs(dot(d,normalize(vec3(.7,.3,.65))))),30.);
 float edge=pow(max(0.,dot(d,normalize(vec3(1.,-.5,.3)))),18.);
 col+=vec3(.75,.55,1.45)*soft*2.4;
 col+=vec3(.55,.9,1.4)*strip*1.8;
 col+=vec3(1.4,.55,.26)*edge*2.4;
 col+=vec3(.18,.24,.65)*pow(max(d.z,0.),4.);
 return col;
}
vec3 backdrop(vec3 p, vec3 d){
 vec2 q=p.xy+d.xy*(2.8+p.z)/max(.3,-d.z);
 vec3 col=vec3(.025,.035,.09);
 float wave=.5+.5*sin(q.x*2.2+q.y*.8+time*.12);
 col+=vec3(.2,.12,.5)*wave*.5;
 float line=pow(max(0.,1.-abs(sin(q.y*3.4+sin(q.x*.8)))),19.);
 col+=vec3(.4,.5,.9)*line*.24;
 return col;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-resolution*.5)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,0.,3.8),rd=normalize(vec3(uv*2.75,-3.3));
 vec3 bg=vec3(.055,.063,.145)+vec3(.035,.025,.09)*exp(-length(uv)*2.);
 float t=2.3,hit=0.;
 for(int i=0;i<72;i++){float d=surface(ro+rd*t);if(d<.0018){hit=1.;break;}t+=d*.75;if(t>5.8)break;}
 vec3 col=bg;
 if(hit>.5){
  vec3 p=ro+rd*t,n=normalAt(p);
  float facing=max(0.,dot(-rd,n)),fresnel=.07+.93*pow(1.-facing,4.);
  vec3 reflection=world(reflect(rd,n));
  vec3 rr=refract(rd,n,1./1.42),rg=refract(rd,n,1./1.46),rb=refract(rd,n,1./1.51);
  vec3 transmitted=vec3(backdrop(p,rr).r,backdrop(p,rg).g,backdrop(p,rb).b);
  vec3 film=.6+.4*cos(vec3(0.,2.,4.)+facing*7.+p.y*2.);
  float highlight=pow(max(0.,dot(reflect(rd,n),normalize(vec3(-.6,1.,1.)))),64.);
  col=transmitted*1.6+reflection*(.33+fresnel*.9)+film*.15+vec3(1.2)*highlight;
  col*=.75+.25*facing;
  col=col/(1.+col*.65);
  col=pow(col,vec3(.75));
 }
 gl_FragColor=vec4(col,1.);
}`;

export default function GlassSculpture({reduced,phase=0}:{reduced:boolean;phase?:number}){
 const ref=useRef<HTMLCanvasElement>(null),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  const canvas=ref.current!;let gl:WebGLRenderingContext|null=null;
  try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false})}catch{setUnavailable(true);return}
  if(!gl){setUnavailable(true);return}const gpu=gl;
  const compile=(type:number,code:string)=>{const s=gpu.createShader(type)!;gpu.shaderSource(s,code);gpu.compileShader(s);if(!gpu.getShaderParameter(s,gpu.COMPILE_STATUS)){gpu.deleteShader(s);throw new Error('Sculpture shader unavailable')}return s};
  let vs:WebGLShader|null=null,fs:WebGLShader|null=null,program:WebGLProgram|null=null;
  try{vs=compile(gpu.VERTEX_SHADER,vertex);fs=compile(gpu.FRAGMENT_SHADER,fragment);program=gpu.createProgram()!;gpu.attachShader(program,vs);gpu.attachShader(program,fs);gpu.linkProgram(program);if(!gpu.getProgramParameter(program,gpu.LINK_STATUS))throw new Error('Sculpture shader unavailable')}catch{if(vs)gpu.deleteShader(vs);if(fs)gpu.deleteShader(fs);if(program)gpu.deleteProgram(program);setUnavailable(true);return}
  const buffer=gpu.createBuffer();gpu.bindBuffer(gpu.ARRAY_BUFFER,buffer);gpu.bufferData(gpu.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gpu.STATIC_DRAW);gpu.useProgram(program);const position=gpu.getAttribLocation(program,'position');gpu.enableVertexAttribArray(position);gpu.vertexAttribPointer(position,2,gpu.FLOAT,false,0,0);
  const res=gpu.getUniformLocation(program,'resolution'),clock=gpu.getUniformLocation(program,'time'),mouse=gpu.getUniformLocation(program,'pointer'),seed=gpu.getUniformLocation(program,'phase');
  let raf=0,active=false,lost=false,last=0,elapsed=4,frames=0,total=0,quality=1;const target={x:0,y:0},pointer={x:0,y:0};
  const size=()=>{if(lost)return;const rect=canvas.getBoundingClientRect(),factor=Math.min(1.25,devicePixelRatio||1,Math.sqrt(390000/Math.max(1,rect.width*rect.height)))*quality;canvas.width=Math.max(1,Math.floor(rect.width*factor));canvas.height=Math.max(1,Math.floor(rect.height*factor));gpu.viewport(0,0,canvas.width,canvas.height)};
  const draw=(now:number)=>{if(lost)return;const dt=Math.min(60,Math.max(0,now-last));last=now;if(!reduced)elapsed+=dt*.001;pointer.x+=(target.x-pointer.x)*.05;pointer.y+=(target.y-pointer.y)*.05;gpu.uniform2f(res,canvas.width,canvas.height);gpu.uniform1f(clock,elapsed);gpu.uniform2f(mouse,pointer.x,pointer.y);gpu.uniform1f(seed,phase);gpu.drawArrays(gpu.TRIANGLES,0,3);if(!reduced){frames++;total+=dt;if(frames===90&&total/frames>25&&quality===1){quality=.7;size()}}if(active&&!document.hidden&&!reduced)raf=requestAnimationFrame(draw)};
  const resize=()=>{if(lost)return;size();cancelAnimationFrame(raf);draw(performance.now())};
  const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();target.x=((e.clientX-b.left)/b.width-.5)*2;target.y=((e.clientY-b.top)/b.height-.5)*2};
  const visibility=()=>{cancelAnimationFrame(raf);if(active&&!document.hidden){last=performance.now();draw(last)}};
  const loss=(e:Event)=>{e.preventDefault();lost=true;active=false;cancelAnimationFrame(raf);setUnavailable(true)};
  const observer=new IntersectionObserver(([e])=>{active=e.isIntersecting;cancelAnimationFrame(raf);if(active){last=performance.now();draw(last)}});observer.observe(canvas);const ro=new ResizeObserver(resize);ro.observe(canvas);canvas.addEventListener('pointermove',move);canvas.addEventListener('webglcontextlost',loss);document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();ro.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('webglcontextlost',loss);document.removeEventListener('visibilitychange',visibility);gpu.deleteBuffer(buffer);gpu.deleteProgram(program);gpu.deleteShader(vs);gpu.deleteShader(fs)};
 },[reduced,phase]);
 return <div className={`glass-sculpture ${unavailable?'glass-fallback':''}`}><canvas ref={ref} aria-hidden="true"/>{unavailable&&<div className="glass-fallback-ring"/>}<div className="sculpture-coordinate" aria-hidden="true"><span>LANGUAGE</span><span>CONTEXT</span><span>MEANING</span></div></div>;
}
