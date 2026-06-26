import { useState } from 'react';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';
import { Modal, Field } from '../common/Modal.jsx';
import PinPicker from '../common/PinPicker.jsx';

export default function TripForm({onSave,onClose}){
  const [f,setF]=useState({name:"",location:"",start:"",end:"",campLat:"",campLng:"",campLabel:""});
  const [pick,setPick]=useState(false);
  return (
    <Modal title="New trip" onClose={onClose}>
      <Field label="Trip name"><input style={St.input} autoFocus value={f.name}
        placeholder="Dolly Sods Overlander" onChange={e=>setF({...f,name:e.target.value})}/></Field>
      <Field label="Location"><input style={St.input} value={f.location}
        placeholder="Wilderness area, state" onChange={e=>setF({...f,location:e.target.value})}/></Field>
      <div style={{display:"flex",gap:10}}>
        <Field label="Start"><input type="date" style={St.input} value={f.start} onChange={e=>setF({...f,start:e.target.value})}/></Field>
        <Field label="End"><input type="date" style={St.input} value={f.end} onChange={e=>setF({...f,end:e.target.value})}/></Field>
      </div>
      <Field label="Campsite name (optional)"><input style={St.input} value={f.campLabel}
        placeholder="e.g. Bear Rocks site" onChange={e=>setF({...f,campLabel:e.target.value})}/></Field>
      <div style={{display:"flex",gap:10}}>
        <Field label="Camp latitude"><input style={St.input} value={f.campLat} onChange={e=>setF({...f,campLat:e.target.value})}/></Field>
        <Field label="Camp longitude"><input style={St.input} value={f.campLng} onChange={e=>setF({...f,campLng:e.target.value})}/></Field>
      </div>
      <button style={{...St.smallBtn,marginBottom:6}} onClick={()=>setPick(true)}><Ic.map style={ic(14)}/> Pick campsite on map</button>
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} disabled={!f.name.trim()} onClick={()=>f.name.trim()&&onSave(f)}><Ic.check style={ic(15)}/> Create trip</button>
      </div>
      {pick && <PinPicker startLat={f.campLat} startLng={f.campLng} title="Pin the campsite"
        onClose={()=>setPick(false)} onPick={(la,ln)=>{setF({...f,campLat:la.toFixed(6),campLng:ln.toFixed(6)});setPick(false);}}/>}
    </Modal>
  );
}
