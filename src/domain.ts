export const PITCH = .5;
export const DIVISIONS = 50;
export const LC = PITCH / DIVISIONS;
export const RANGE = 25;
export const TAU = Math.PI * 2;
export const round = (x:number) => Math.round(x*1e8)/1e8;
export const clamp = (x:number,a:number,b:number) => Math.min(b,Math.max(a,x));
export type Family = 'wire'|'sphere'|'sheet'|'block';
export interface Specimen { id:number; family:Family; name:string; size:number; color:string }
export interface State { gap:number; zero:number; locked:boolean; specimen:Specimen|null; placed:boolean; ratchetTurns:number; contactClicks:number }
export function readScale(gap:number,zero=0) {
 const indication=round(gap+zero);
 const sleeve=round(Math.floor((indication+1e-9)/PITCH)*PITCH);
 const division=round((indication-sleeve)/LC);
 const exact=Math.abs(division-Math.round(division))<1e-6;
 return {indication,sleeve,division,exact,contribution:round(division*LC),corrected:round(indication-zero),estimate:round(Math.round(indication/LC)*LC)};
}
export const modelState=(s:State)=>({anvilFace:-27,spindleFace:-27+s.gap,thimbleEdge:9+s.gap,sleeveZero:9-s.zero,spindleAngle:s.gap/PITCH*TAU,thimbleAngle:(s.gap+s.zero)/PITCH*TAU,ratchetAngle:s.ratchetTurns*TAU});
export const inContact=(s:State)=>s.placed&&!!s.specimen&&Math.abs(s.gap-s.specimen.size)<1e-7;
export const families:{family:Family;name:string;caption:string;color:string}[]=[{family:'wire',name:'Copper wire',caption:'Outside diameter',color:'#bb8262'},{family:'sphere',name:'Steel sphere',caption:'Diameter',color:'#aab8b1'},{family:'sheet',name:'Metal sheet',caption:'Thickness',color:'#c0aa78'},{family:'block',name:'Gauge block',caption:'Parallel faces',color:'#8ba798'}];
export function specimen(seed:number,family:Family):Specimen {
 const meta=families.find(f=>f.family===family)!;
 let n=(Math.imul(seed,1664525)+1013904223)>>>0; n=(Math.imul(n^(n>>>16),2246822507))>>>0;
 const bounds:Record<Family,[number,number]>={wire:[.4,3.5],sphere:[4,14],sheet:[.1,1.8],block:[3,18]};
 const [lo,hi]=bounds[family];const size=Math.round((lo+(n/4294967296)*(hi-lo))*100)/100;
 return {id:seed,family,name:meta.name,size,color:meta.color};
}
export class Mechanism {
 private state:State={gap:10.37,zero:0,locked:false,specimen:null,placed:false,ratchetTurns:20.74,contactClicks:0};
 private listeners=new Set<()=>void>();
 get=()=>this.state;
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}};
 private update(p:Partial<State>){this.state={...this.state,...p};for(const f of this.listeners)f()}
 setGap=(value:number)=>{
  if(this.state.locked||!Number.isFinite(value))return false;
  const min=this.state.placed&&this.state.specimen?this.state.specimen.size:0;
  const gap=round(clamp(value,min,RANGE));
  if(gap===this.state.gap)return false;
  this.update({gap,ratchetTurns:this.state.ratchetTurns+(gap-this.state.gap)/PITCH});return true;
 };
 turn=(revolutions:number,ratchet=false)=>{
  if(this.state.locked||!Number.isFinite(revolutions))return 'locked';
  const previous=this.state;const requested=previous.gap+revolutions*PITCH;
  const min=previous.placed&&previous.specimen?previous.specimen.size:0;
  const gap=round(clamp(requested,min,RANGE));
  const slip=ratchet&&revolutions<0&&requested<min;
  this.update({gap,ratchetTurns:previous.ratchetTurns+(ratchet?revolutions:(gap-previous.gap)/PITCH),contactClicks:previous.contactClicks+(slip?1:0)});
  return slip?'slip':gap===min?'contact':'move';
 };
 setLocked=(locked:boolean)=>this.update({locked});
 setZero=(zero:number)=>{if(Number.isFinite(zero))this.update({zero:round(clamp(Math.round(zero/LC)*LC,-.1,.1))})};
 select=(s:Specimen)=>this.update({specimen:s,placed:false,locked:false,gap:round(s.size+2),zero:this.state.zero});
 place=()=>{if(!this.state.specimen||this.state.gap<this.state.specimen.size-1e-8)return false;this.update({placed:true});return true};
 remove=()=>this.update({placed:false});
 reset=()=>this.update({gap:10.37,zero:0,locked:false,specimen:null,placed:false,ratchetTurns:20.74,contactClicks:0});
}
export const mechanism=new Mechanism();
export interface Draft { sleeve:string;division:string;zero:string;result:string }
export function verify(s:State,d:Draft){
 const r=readScale(s.gap,s.zero);const errors:{field:string;message:string}[]=[];
 if(!inContact(s))errors.push({field:'technique',message:'Establish contact first: place a specimen, then gently close with the ratchet until both faces touch.'});
 if(!r.exact)errors.push({field:'scale',message:'The reference lies between graduations. Use the fine buttons to settle on a 0.01 mm graduation before submitting this exercise.'});
 const near=(text:string,value:number,tolerance=.00001)=>text.trim()!==''&&Number.isFinite(Number(text))&&Math.abs(Number(text)-value)<tolerance;
 if(!near(d.sleeve,r.sleeve))errors.push({field:'sleeve',message:'Read the last exposed sleeve graduation before the thimble edge. Remember the lower half-millimetre marks.'});
 if(!near(d.division,r.division))errors.push({field:'division',message:'Follow the horizontal reference line to the thimble. Enter the division number, not its millimetre contribution.'});
 if(!near(d.zero,s.zero))errors.push({field:'zero',message:'Enter the signed zero error. Positive error is subtracted; subtracting negative error adds its magnitude.'});
 if(!near(d.result,r.corrected,.005-1e-7))errors.push({field:'result',message:'Corrected measurement = sleeve + (thimble division × 0.01 mm) − signed zero error.'});
 return {ok:errors.length===0,errors,reading:r,reference:s.specimen?.size??null,snapshot:{...s}};
}
