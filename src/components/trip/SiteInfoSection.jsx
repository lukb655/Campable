import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Field } from '../common/Modal.jsx';

export default function SiteInfoSection({trip,isAdmin,patch,readOnly}){
  const [editing,setEditing]=useState(false);
  const [addr,setAddr]=useState(trip.siteAddress||"");
  const [notes,setNotes]=useState(trip.siteNotes||"");

  const save=async()=>{
    await patch({siteAddress:addr.trim(),siteNotes:notes.trim()});
    setEditing(false);
  };
  const cancel=()=>{
    setAddr(trip.siteAddress||"");
    setNotes(trip.siteNotes||"");
    setEditing(false);
  };

  const siteName=trip.campLabel||trip.name;
  const mapsUrl=trip.siteAddress
    ?`https://maps.google.com/?q=${encodeURIComponent(trip.siteAddress)}`
    :null;

  return (
    <div style={St.block}>
      <div style={St.blockHead}>
        <span>Site Info &amp; Directions</span>
        {isAdmin&&!readOnly&&
          <button style={St.iconBtn} onClick={()=>setEditing(!editing)} aria-label="Edit site info">
            <Ic.edit style={{...ic(13),color:"var(--sage)"}}/>
          </button>}
      </div>
      {siteName&&<div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600,color:"var(--paper)",marginBottom:8}}>{siteName}</div>}
      {editing
        ?<>
          <Field label="Address"><input style={St.input} value={addr} placeholder="123 Camp Rd, Forest, CA 90210"
            onChange={e=>setAddr(e.target.value)}/></Field>
          <Field label="Site Notes"><textarea style={{...St.notes,minHeight:64}} placeholder="Arrival details, gate codes, parking notes…"
            value={notes} onChange={e=>setNotes(e.target.value)}/></Field>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button style={St.smallBtn} onClick={save}><Ic.check style={ic(14)}/> Save</button>
            <button style={{...St.smallBtn,background:"var(--mist)",color:"var(--night)"}} onClick={cancel}>Cancel</button>
          </div>
        </>
        :<>
          {trip.siteAddress
            ?<div style={{fontSize:13.5,color:"var(--paper)",marginBottom:trip.siteNotes?6:10}}>{trip.siteAddress}</div>
            :isAdmin&&<div style={{fontSize:13,color:"var(--sage)",marginBottom:8}}>No address set — tap the pencil to add one.</div>}
          {trip.siteNotes&&<div style={{fontSize:13,color:"var(--sage)",lineHeight:1.55,marginBottom:10,whiteSpace:"pre-wrap"}}>{trip.siteNotes}</div>}
          {mapsUrl&&<a style={St.dirBtn} href={mapsUrl} target="_blank" rel="noreferrer"><Ic.nav style={ic(14)}/> Get Directions</a>}
          {!trip.siteAddress&&!trip.siteNotes&&!isAdmin&&<div style={{fontSize:13,color:"var(--sage)"}}>No site info available yet.</div>}
        </>}
    </div>
  );
}
