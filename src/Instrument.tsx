import {Suspense,useEffect,useMemo,useRef} from 'react';
import {Canvas,ThreeEvent,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mechanism,modelState,TAU,PITCH,State} from './domain';
import {audio} from './platform';
export type View='gallery'|'front'|'top'|'rear'|'sleeve'|'thimble'|'spindle'|'anvil'|'ratchet';
export interface SceneProps{progress:number;view:{name:View;id:number};cameraLocked:boolean;cutaway:boolean;selected:string;onPart:(s:string)=>void;reduced:boolean;onReady:()=>void}
function frameGeometry(){const s=new THREE.Shape();s.moveTo(-38,4);s.lineTo(-29.5,4);s.lineTo(-29.5,-7);s.bezierCurveTo(-29.5,-18,-24,-24,-15,-24);s.bezierCurveTo(-6,-24,0,-18,0,-7);s.lineTo(0,4);s.lineTo(8,4);s.lineTo(8,-9);s.bezierCurveTo(8,-27,-3,-34,-15,-34);s.bezierCurveTo(-29,-34,-38,-24,-38,-9);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:7,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.75,bevelThickness:.65,curveSegments:32});g.translate(0,0,-3.5);return g}
function lines(points:number[]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));return g}
function Label({text,position,rotation=[0,0,0],size=2,color='#273e38'}:{text:string;position:[number,number,number];rotation?:[number,number,number];size?:number;color?:string}){
 const tex=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d')!;x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.font='500 76px Arial';x.fillText(text,256,68);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t},[text,color]);useEffect(()=>()=>tex.dispose(),[tex]);
 return <mesh position={position} rotation={rotation}><planeGeometry args={[size*4,size]}/><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false}/></mesh>
}
function Cylinder({x=0,length,radius,material,children,...rest}:{x?:number;length:number;radius:number;material:THREE.Material;children?:React.ReactNode;[key:string]:unknown}){return <group position={[x,0,0]} {...rest}><mesh rotation={[0,0,-Math.PI/2]} material={material} castShadow receiveShadow><cylinderGeometry args={[radius,radius,length,64]}/></mesh>{children}</group>}
function Model({cutaway,selected,onPart,drag}:{cutaway:boolean;selected:string;onPart:(s:string)=>void;drag:(e:ThreeEvent<PointerEvent>,ratchet:boolean)=>void}){
 const spindle=useRef<THREE.Group>(null),thimble=useRef<THREE.Group>(null),ratchet=useRef<THREE.Group>(null),sleeve=useRef<THREE.Group>(null),lock=useRef<THREE.Group>(null),object=useRef<THREE.Group>(null);
 const mats=useMemo(()=>({steel:new THREE.MeshStandardMaterial({color:'#d0d2cc',metalness:.95,roughness:.26,envMapIntensity:1.55}),polish:new THREE.MeshStandardMaterial({color:'#e2e2d8',metalness:1,roughness:.15,envMapIntensity:1.4}),frame:new THREE.MeshStandardMaterial({color:'#687e6c',metalness:.68,roughness:.3}),grip:new THREE.MeshStandardMaterial({color:'#334b42',metalness:.18,roughness:.58}),gold:new THREE.MeshStandardMaterial({color:'#b9a06a',metalness:.83,roughness:.27}),dark:new THREE.MeshStandardMaterial({color:'#38443e',metalness:.65,roughness:.38}),highlight:new THREE.MeshStandardMaterial({color:'#d6ac70',metalness:.7,roughness:.27})}),[]);
 const geometry=useMemo(frameGeometry,[]);
 const sleeveTicks=useMemo(()=>{const p:number[]=[];for(let n=0;n<=50;n++){const half=n%2!==0;const x=9+n*.5;const start=half?-.35:.35,end=half?-1.6:1.7;for(let j=0;j<8;j++){const a=start+(end-start)*j/8,b=start+(end-start)*(j+1)/8;p.push(x,a,Math.sqrt(3.3**2-a*a)+.025,x,b,Math.sqrt(3.3**2-b*b)+.025)}}p.push(8,0,3.33,37,0,3.33);return lines(p)},[]);
 const thimbleTicks=useMemo(()=>{const p:number[]=[];for(let i=0;i<50;i++){const a=i/50*TAU;const len=i%5===0?4.3:2.65;for(let j=0;j<8;j++){const x1=.25+(len-.25)*j/8,x2=.25+(len-.25)*(j+1)/8;const r1=3.8+x1*.36,r2=3.8+x2*.36;p.push(x1,Math.sin(a)*r1,Math.cos(a)*r1,x2,Math.sin(a)*r2,Math.cos(a)*r2)}}return lines(p)},[]);
 const knurl=useMemo(()=>{const p:number[]=[];for(let i=0;i<100;i++){const a=i/100*TAU;for(let j=0;j<8;j++){const x=10+j*1.45,b=a+j*.024,b2=a+(j+1)*.024;p.push(x,5.82*Math.sin(b),5.82*Math.cos(b),x+1.45,5.82*Math.sin(b2),5.82*Math.cos(b2));p.push(x,5.82*Math.sin(a-j*.024),5.82*Math.cos(a-j*.024),x+1.45,5.82*Math.sin(a-(j+1)*.024),5.82*Math.cos(a-(j+1)*.024))}}return lines(p)},[]);
 const thread=useMemo(()=>{const pts:THREE.Vector3[]=[];for(let i=0;i<=2400;i++){const x=12+i/2400*23;const a=(x-12)/PITCH*TAU;pts.push(new THREE.Vector3(x,2.92*Math.sin(a),2.92*Math.cos(a)))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),2400,.055,4,false)},[]);
 const pick=(id:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onPart(id)};
 const mat=(id:string,normal='steel')=>selected===id?mats.highlight:mats[normal as keyof typeof mats];
 const spec=mechanism.get().specimen,placed=mechanism.get().placed;
 useFrame(()=>{const s=mechanism.get(),m=modelState(s);if(spindle.current){spindle.current.position.x=s.gap;spindle.current.rotation.x=m.spindleAngle}if(thimble.current){thimble.current.position.x=m.thimbleEdge;thimble.current.rotation.x=m.thimbleAngle}if(ratchet.current){ratchet.current.position.x=9+s.gap;ratchet.current.rotation.x=m.ratchetAngle}if(sleeve.current)sleeve.current.position.x=-s.zero;if(lock.current)lock.current.rotation.y=s.locked?Math.PI/2:0});
 useEffect(()=>()=>{geometry.dispose();sleeveTicks.dispose();thimbleTicks.dispose();knurl.dispose();thread.dispose();Object.values(mats).forEach(m=>m.dispose())},[geometry,sleeveTicks,thimbleTicks,knurl,thread,mats]);
 return <group name="micrometer-instrument">
  <mesh name="frame" geometry={geometry} material={mat('frame','frame')} castShadow receiveShadow onClick={pick('frame')}/>
  <mesh position={[-14,-27.5,4.3]} rotation={[0,0,-.04]} onClick={pick('frame')}><boxGeometry args={[18,5.2,.8]}/><meshStandardMaterial color="#344d43" roughness={.6} metalness={.2}/></mesh>
  <Label text="PRECISION LAB" position={[-14,-27.5,4.76]} size={.92} color="#e5ddc4"/>
  <Label text="0—25 mm   0.01 mm" position={[-15,-31.2,4.25]} size={.77} color="#e8e4cf"/>
  {[-34.2,3.9].map(x=><mesh key={x} position={[x,-5,4.28]} rotation={[Math.PI/2,0,0]} material={mats.gold}><cylinderGeometry args={[1,1,.35,24]}/></mesh>)}
  <Cylinder x={-31.2} length={8.4} radius={3.15} material={mat('anvil','polish')} name="fixed-anvil" onClick={pick('anvil')}/>
  <Cylinder x={-27.15} length={.3} radius={3.2} material={mats.dark}/>
  <Cylinder x={5} length={7} radius={5.1} material={mat('lock','polish')} onClick={pick('lock')}/>
  <group name="spindle-lock" position={[5,5.35,0]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();mechanism.setLocked(!mechanism.get().locked);audio.click('lock');onPart('lock')}}>
   <mesh material={mat('lock','gold')}><cylinderGeometry args={[1.3,1.3,2,32]}/></mesh><group ref={lock}><mesh position={[2,.85,0]} material={mats.grip}><boxGeometry args={[5.5,1.2,2]}/></mesh></group>
  </group>
  <Cylinder x={23.25} length={29.5} radius={3.3} material={mat('sleeve')} visible={!cutaway} onClick={pick('sleeve')}/>
  <group ref={sleeve} visible={!cutaway}><lineSegments geometry={sleeveTicks}><lineBasicMaterial color="#253b34"/></lineSegments>{[0,5,10,15,20,25].map(n=><Label key={n} text={String(n)} position={[9+n,2.05,2.69]} size={.94}/>)}</group>
  <group ref={spindle} name="rotating-spindle" onClick={pick('spindle')}>
   <Cylinder x={-9.5} length={35} radius={3.05} material={mat('spindle','polish')}/><Cylinder x={-26.85} length={.3} radius={3.06} material={mats.dark}/>
   <Cylinder x={24} length={24} radius={2.8} material={mat('spindle')}/>
   {cutaway&&<mesh geometry={thread} material={mats.gold} castShadow/>}
  </group>
  {cutaway&&<group position={[16,0,0]}><mesh rotation={[0,Math.PI/2,0]} material={mats.frame}><torusGeometry args={[3.05,.5,12,64]}/></mesh></group>}
  <group ref={thimble} name="rotating-thimble" visible={!cutaway} onPointerDown={e=>drag(e,false)} onClick={pick('thimble')}>
   <mesh position={[2.5,0,0]} rotation={[0,0,-Math.PI/2]} material={mat('thimble')} castShadow><cylinderGeometry args={[5.6,3.8,5,96]}/></mesh>
   <Cylinder x={13.5} length={17} radius={5.8} material={mat('thimble')}/>
   <lineSegments geometry={thimbleTicks}><lineBasicMaterial color="#283e37"/></lineSegments>
   <lineSegments geometry={knurl}><lineBasicMaterial color="#6c756c" transparent opacity={.52}/></lineSegments>
   {[0,5,10,15,20,25,30,35,40,45].map(n=>{const a=n/50*TAU;return <Label key={n} text={String(n)} position={[7.1,Math.sin(a)*5.83,Math.cos(a)*5.83]} rotation={[-a,0,0]} size={1.16}/>})}
   {[10,21.5,22].map(x=><Cylinder key={x} x={x} length={.18} radius={5.87} material={mats.polish}/>)}
  </group>
  <group ref={ratchet} name="ratchet-stop" onPointerDown={e=>drag(e,true)} onClick={pick('ratchet')}>
   <Cylinder x={24.5} length={5} radius={3.1} material={mats.polish}/><Cylinder x={30} length={7} radius={3.65} material={mat('ratchet','dark')}/>
   {Array.from({length:32},(_,i)=>{const a=i/32*TAU;return <mesh key={i} position={[30,3.65*Math.sin(a),3.65*Math.cos(a)]} rotation={[a,0,0]} material={mats.steel}><boxGeometry args={[6.2,.13,.13]}/></mesh>})}
   <Cylinder x={34} length={1.2} radius={3.5} material={mats.gold}/>
  </group>
  {spec&&placed&&<group ref={object} name="measured-specimen" position={[-27+spec.size/2,0,0]}>
   {spec.family==='sphere'?<mesh castShadow><sphereGeometry args={[spec.size/2,48,32]}/><meshStandardMaterial color={spec.color} metalness={.92} roughness={.2}/></mesh>:spec.family==='wire'?<mesh castShadow><cylinderGeometry args={[spec.size/2,spec.size/2,14,48]}/><meshStandardMaterial color={spec.color} metalness={.85} roughness={.28}/></mesh>:<mesh castShadow><boxGeometry args={[spec.size,spec.family==='sheet'?12:9,spec.family==='sheet'?14:8]}/><meshStandardMaterial color={spec.color} metalness={.75} roughness={.27}/></mesh>}
  </group>}
 </group>
}
function Environment(){const {gl,scene}=useThree();useEffect(()=>{const pmrem=new THREE.PMREMGenerator(gl);const room=new RoomEnvironment();const target=pmrem.fromScene(room,.04);scene.environment=target.texture;return()=>{scene.environment=null;target.dispose();pmrem.dispose();room.dispose()}},[gl,scene]);return <><ambientLight intensity={1.3} color="#fff3dd"/><directionalLight position={[-40,70,90]} intensity={3.3} color="#fff8eb" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-90} shadow-camera-right={90} shadow-camera-top={70} shadow-camera-bottom={-70} shadow-normalBias={.12}/><directionalLight position={[70,10,-50]} intensity={2.3} color="#f0ead8"/><directionalLight position={[-80,-5,25]} intensity={.8} color="#d6e3dc"/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-37,0]} receiveShadow><planeGeometry args={[1000,1000]}/><shadowMaterial transparent opacity={.12}/></mesh></>}
function World(props:SceneProps){
 const {camera,gl,size}=useThree();const controls=useRef<OrbitControls|null>(null),dragging=useRef<{y:number;ratchet:boolean;id:number}|null>(null),user=useRef(false);const currentProps=useRef(props);currentProps.current=props;const fromProgress=useRef(-1);const moveRef=useRef(false);
 useEffect(()=>{const c=new OrbitControls(camera,gl.domElement);c.enableDamping=true;c.dampingFactor=.09;c.minDistance=15;c.maxDistance=300;c.maxPolarAngle=Math.PI*.94;c.minPolarAngle=.06;c.enablePan=true;c.target.set(-15,-8,0);controls.current=c;const interaction=()=>{user.current=true;moveRef.current=false};c.addEventListener('start',interaction);props.onReady();return()=>{c.removeEventListener('start',interaction);c.dispose()}},[camera,gl]);
 useEffect(()=>{user.current=false;moveRef.current=true},[props.view.id,props.progress,size.width,size.height]);
 useEffect(()=>{const move=(e:PointerEvent)=>{const d=dragging.current;if(!d||d.id!==e.pointerId)return;const delta=(d.y-e.clientY)/(e.shiftKey?900:65);d.y=e.clientY;const result=mechanism.turn(delta,d.ratchet);if(result==='slip')audio.click('ratchet')};const stop=()=>{dragging.current=null;document.body.classList.remove('turning');if(controls.current)controls.current.enabled=!currentProps.current.cameraLocked};window.addEventListener('pointermove',move);window.addEventListener('pointerup',stop);window.addEventListener('pointercancel',stop);window.addEventListener('blur',stop);gl.domElement.addEventListener('lostpointercapture',stop);return()=>{stop();window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);window.removeEventListener('pointercancel',stop);window.removeEventListener('blur',stop);gl.domElement.removeEventListener('lostpointercapture',stop)}},[gl]);
 useFrame((_,dt)=>{const c=controls.current;if(!c)return;c.enabled=!props.cameraLocked&&!dragging.current;if(!user.current&&!dragging.current){const p=props.progress;let target=new THREE.Vector3(-16+31*p,-8,0);let pos=new THREE.Vector3(-5+20*p,18-13*p,175-8*p);const s=mechanism.get();const named=props.view.name;if(named==='gallery'&&!props.reduced&&p<.4){pos.y+=Math.sin(_.clock.elapsedTime*.3)*.8;pos.x+=Math.sin(_.clock.elapsedTime*.22)*.5}if(named!=='gallery'){
  target.set(15,-9,0);pos.set(15,-9,170);
  if(named==='rear')pos.set(15,-9,-170);
  if(named==='top')pos.set(15,160,.01);
  if(named==='sleeve'){target.set(9+s.gap-3,0,0);pos=target.clone().add(new THREE.Vector3(0,1,32))}
  if(named==='thimble'){target.set(13+s.gap,0,0);pos=target.clone().add(new THREE.Vector3(0,2,34))}
  if(named==='spindle'){target.set(-18+s.gap/2,0,0);pos=target.clone().add(new THREE.Vector3(0,4,38))}
  if(named==='anvil'){target.set(-27,0,0);pos=target.clone().add(new THREE.Vector3(0,3,30))}
  if(named==='ratchet'){target.set(39+s.gap,0,0);pos=target.clone().add(new THREE.Vector3(0,4,35))}
 }
 const aspect=size.width/Math.max(1,size.height);if(aspect<1&&['gallery','front','rear','top'].includes(named)){const dist=Math.max(175,75/aspect);pos=target.clone().add(pos.clone().sub(target).normalize().multiplyScalar(dist))}
 const a=props.reduced?1:1-Math.exp(-Math.min(dt,.05)*5);camera.position.lerp(pos,a);c.target.lerp(target,a);camera.lookAt(c.target);fromProgress.current=p;
 }c.update();});
 const drag=(e:ThreeEvent<PointerEvent>,ratchet:boolean)=>{e.stopPropagation();if(mechanism.get().locked||currentProps.current.cutaway)return;user.current=true;dragging.current={y:e.clientY,ratchet,id:e.pointerId};if(controls.current)controls.current.enabled=false;(e.target as unknown as {setPointerCapture:(n:number)=>void}).setPointerCapture?.(e.pointerId);document.body.classList.add('turning')};
 return <><Environment/><Model cutaway={props.cutaway} selected={props.selected} onPart={props.onPart} drag={drag}/></>
}
export default function Instrument(props:SceneProps){return <Canvas dpr={[1,1.65]} shadows camera={{position:[-5,18,175],fov:34,near:.1,far:1500}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.1;gl.setClearColor('#f7f3e9',0)}}><Suspense fallback={null}><World {...props}/></Suspense></Canvas>}
