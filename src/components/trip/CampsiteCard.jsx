import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, directionsURL, isIOS } from '../../utils.js';
import { Field } from '../common/Modal.jsx';
import PinPicker from '../common/PinPicker.jsx';

export default function CampsiteCard({trip,patch,flash}){
  const [pick,setPick]=useState(false);
  const [lat,setLat]=useState(trip.campLat??""); const [lng,setLng]=useState(trip.campLng??"");
  const [label,setLabel]=useState(trip.campLabel||"");
  const has=trip.campLat&&trip.campLng;
  const save=()=>{
    const la=parseFloat(lat),ln=parseFloat(lng);
    if(isNaN(la)||isNaN(ln)){flash("Enter valid coordinates");return;}
    patch({campLat:la,campLng:ln,campLabel:label.trim()}); flash("Campsite saved");
  };
  return (
    <div style={St.block}>
      <div style={St.blockHead}><span>Campsite</span><Ic.tent style={{...ic(14),color:"var(--ember2)"}}/></div>
      <Field label="Site name (optional)"><input style={St.input} value={label}
        placeholder="Bear Rocks dispersed site" onChange={e=>setLabel(e.target.value)}/></Field>
      <div style={{display:"flex",gap:8}}>
        <Field label="Latitude"><input style={St.input} value={lat} onChange={e=>setLat(e.target.value)}/></Field>
        <Field label="Longitude"><input style={St.input} value={lng} onChange={e=>setLng(e.target.value)}/></Field>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button style={St.smallBtn} onClick={()=>setPick(true)}><Ic.map style={ic(14)}/> Pick on map</button>
        <button style={St.smallBtn} onClick={save}><Ic.check style={ic(14)}/> Save</button>
        {has && <a style={St.dirBtn} href={directionsURL(trip.campLat,trip.campLng,trip.campLabel||trip.name)} target="_blank" rel="noreferrer">
          <Ic.nav style={ic(14)}/> Get directions</a>}
      </div>
      {has && <div style={St.hintSm}>Directions open in {isIOS()?"Apple Maps":"Google Maps"} to {(+trip.campLat).toFixed(4)}, {(+trip.campLng).toFixed(4)}.</div>}
      {pick && <PinPicker startLat={trip.campLat} startLng={trip.campLng} title="Pin the campsite"
        onClose={()=>setPick(false)}
        onPick={(la,ln)=>{setLat(la.toFixed(6));setLng(ln.toFixed(6));setPick(false);patch({campLat:la,campLng:ln,campLabel:label.trim()});flash("Campsite saved");}}/>}
    </div>
  );
}
