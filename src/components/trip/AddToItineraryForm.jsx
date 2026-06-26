import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal, Field } from '../common/Modal.jsx';

export default function AddToItineraryForm({waypoint,tripDays,members,onClose,onSave}){
  const [v,setV]=useState({title:waypoint.name,day:tripDays[0]?.v||"",time:"",type:"Activity",notes:"",waypointId:waypoint.id,assignee:""});
  const submit=()=>{if(!v.title.trim()||!v.day) return; onSave(v);};
  return (
    <Modal title="Add to Itinerary" onClose={onClose}>
      <Field label="Event name"><input style={St.input} type="text" value={v.title} onChange={e=>setV({...v,title:e.target.value})} autoFocus/></Field>
      <Field label="Day"><select style={St.input} value={v.day} onChange={e=>setV({...v,day:e.target.value})}>
        {tripDays.map(d=><option key={d.v} value={d.v}>{d.l}</option>)}
      </select></Field>
      <Field label="Time (optional)"><input style={St.input} type="time" value={v.time} onChange={e=>setV({...v,time:e.target.value})}/></Field>
      <Field label="Assign to (optional)"><select style={St.input} value={v.assignee} onChange={e=>setV({...v,assignee:e.target.value})}>
        <option value="">—</option>
        {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
      </select></Field>
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} onClick={submit} disabled={!v.title.trim()||!v.day}><Ic.check style={ic(15)}/> Add to itinerary</button>
      </div>
    </Modal>
  );
}
