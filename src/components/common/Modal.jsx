import { useState } from 'react';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';

export function Modal({title,children,onClose,wide}){
  return <div style={St.overlay} onClick={onClose}>
    <div style={{...St.modal,...(wide?{maxWidth:560}:{})}} className="fade" onClick={e=>e.stopPropagation()}>
      <div style={St.modalHead}><span style={St.modalTitle}>{title}</span>
        <button style={St.iconBtn} onClick={onClose} aria-label="Close"><Ic.x style={ic(18)}/></button></div>
      {children}
    </div>
  </div>;
}

export function Field({label,children}){
  return <div style={{flex:1,marginBottom:14}}><div style={St.fieldLabel}>{label}</div>{children}</div>;
}

export function FormSheet({title,fields,onSave,onClose,initial={}}){
  const init={}; fields.forEach(f=>{init[f.k]=initial[f.k]!=null?initial[f.k]:(f.def!=null?f.def:(f.type==="bool"?false:""));});
  const [v,setV]=useState(init);
  const submit=()=>{const bad=fields.find(f=>f.req&&!String(v[f.k]).trim());if(bad)return;onSave(v);};
  return (
    <Modal title={title} onClose={onClose}>
      {fields.map(f=>(
        <Field key={f.k} label={f.label}>
          {(f.type==="text"||f.type==="number") &&
            <input style={St.input} type={f.type==="number"?"number":"text"} value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}/>}
          {f.type==="select" &&
            <select style={St.input} value={v[f.k]} onChange={e=>setV({...v,[f.k]:e.target.value})}>
              {f.allowEmpty && <option value="">—</option>}
              {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>}
          {f.type==="bool" &&
            <button style={{...St.toggle,...(v[f.k]?St.toggleOn:{})}} onClick={()=>setV({...v,[f.k]:!v[f.k]})}>
              <span style={{...St.toggleKnob,...(v[f.k]?St.toggleKnobOn:{})}}/>{v[f.k]?"Yes":"No"}</button>}
        </Field>
      ))}
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} onClick={submit}><Ic.check style={ic(15)}/> Save</button>
      </div>
    </Modal>
  );
}

export function Contours(){
  return <svg style={St.contours} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
    {[0,1,2,3,4,5,6,7].map(i=>(<path key={i} fill="none" stroke="var(--sage)" strokeWidth="1"
      d={`M-20 ${80+i*95} C 80 ${40+i*95}, 160 ${140+i*95}, 240 ${70+i*95} S 380 ${30+i*95}, 440 ${100+i*95}`}/>))}
  </svg>;
}
