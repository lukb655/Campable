import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal, Field } from '../common/Modal.jsx';

export default function WaypointForm({onClose,onSave,preset,onPick}){
  const [v,setV]=useState({name:"",type:"Trail",mileage:"",description:"",lat:preset?.lat||"",lng:preset?.lng||""});
  const submit=()=>{if(!v.name.trim()||!v.type) return; onSave(v);};
  return (
    <Modal title="Add Waypoint" onClose={onClose}>
      <Field label="Name"><input style={St.input} type="text" value={v.name} onChange={e=>setV({...v,name:e.target.value})} placeholder="Vista name" autoFocus/></Field>
      <Field label="Type"><select style={St.input} value={v.type} onChange={e=>setV({...v,type:e.target.value})}>
        <option value="Vista">Vista</option>
        <option value="Trail">Trail</option>
        <option value="Other Point">Other Point</option>
      </select></Field>
      {v.type==="Trail"&&<Field label="Mileage (optional)"><input style={St.input} type="number" value={v.mileage} onChange={e=>setV({...v,mileage:e.target.value})} placeholder="e.g. 2.5"/></Field>}
      {v.type==="Other Point"&&<Field label="Description (optional)"><textarea style={{...St.input,fontFamily:"inherit",resize:"none",minHeight:60}} value={v.description} onChange={e=>setV({...v,description:e.target.value})} placeholder="What's special about this spot?"/></Field>}
      <Field label="Coordinates (optional)">
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input style={{...St.input,flex:1}} type="number" step="0.0001" value={v.lat} onChange={e=>setV({...v,lat:e.target.value})} placeholder="Latitude"/>
          <input style={{...St.input,flex:1}} type="number" step="0.0001" value={v.lng} onChange={e=>setV({...v,lng:e.target.value})} placeholder="Longitude"/>
        </div>
        <button style={{...St.ghostBtn,width:"100%",justifyContent:"center",fontSize:13}} onClick={onPick}><Ic.map style={ic(14)}/> Pick on map</button>
      </Field>
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} onClick={submit} disabled={!v.name.trim()||!v.type}><Ic.check style={ic(15)}/> Add</button>
      </div>
    </Modal>
  );
}
