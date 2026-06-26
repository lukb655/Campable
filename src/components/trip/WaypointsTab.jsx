import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';
import { Modal } from '../common/Modal.jsx';
import PinPicker from '../common/PinPicker.jsx';
import WaypointForm from './WaypointForm.jsx';
import AddToItineraryForm from './AddToItineraryForm.jsx';

export default function WaypointsTab({trip,me,patch,flash,readOnly}){
  const waypoints=trip.waypoints||[];
  const events=trip.events||[];
  const members=trip.members||[];

  const [addWp,setAddWp]=useState(false);
  const [pick,setPick]=useState(false);
  const [preset,setPreset]=useState(null);
  const [addToItin,setAddToItin]=useState(null);
  const [delConfirm,setDelConfirm]=useState(null);

  const tripDays=useMemo(()=>{
    if(!trip.start) return [{v:"Day 1",l:"Day 1"},{v:"Day 2",l:"Day 2"},{v:"Day 3",l:"Day 3"},{v:"Day 4",l:"Day 4"},{v:"Day 5",l:"Day 5"}];
    const start=new Date(trip.start+"T00:00");
    const end=trip.end?new Date(trip.end+"T00:00"):new Date(start.getTime()+4*86400000);
    const days=[];
    for(let d=new Date(start);d<=end;d=new Date(d.getTime()+86400000))
      days.push({v:d.toISOString().slice(0,10),l:d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})});
    return days;
  },[trip.start,trip.end]);

  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current || waypoints.length===0) return;
    const center=waypoints.length?[+waypoints[0].lat,+waypoints[0].lng]:[39.0476,-79.3074];
    const map=L.map(ref.current,{attributionControl:false}).setView(center,12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);

    const bounds=[];
    waypoints.forEach(p=>{
      const color=p.type==="Vista"?"#E8B23C":p.type==="Trail"?"#7FA99B":"#E8682C";
      const svgPath=p.type==="Vista"
        ?'<path d="M2 12c0-2.2 1.79-4 4-4h12c2.21 0 4 1.79 4 4M2 12h20M2 12c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4M6 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>'
        :'<path d="M12 2c-3.3 0-6 2.7-6 6 0 4 6 10 6 10s6-6 6-10c0-3.3-2.7-6-6-6z"/><circle cx="12" cy="8" r="2"/>';
      const customIcon=L.divIcon({className:"",html:`<div style="background:${color};width:24px;height:24px;border-radius:50%;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4)"><svg style="width:13px;height:13px;color:white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">${svgPath}</svg></div>`,iconSize:[24,24],iconAnchor:[12,24]});
      L.marker([+p.lat,+p.lng],{icon:customIcon}).addTo(map).bindPopup(`<b>${p.name}</b><br>${p.type}${p.mileage?` · ${p.mileage}mi`:""}`);
      bounds.push([+p.lat,+p.lng]);
    });
    if(bounds.length>0) map.fitBounds(L.latLngBounds(bounds).pad(0.2));
    setTimeout(()=>map.invalidateSize(),120);
    return ()=>map.remove();
  },[waypoints.map(w=>w.id+w.lat+w.lng).join()]);

  const addWaypoint=w=>{
    const toAdd={id:uid(),name:w.name,type:w.type,lat:w.lat?+w.lat:null,lng:w.lng?+w.lng:null};
    if(w.type==="Trail" && w.mileage) toAdd.mileage=+w.mileage;
    if(w.type==="Other Point" && w.description) toAdd.description=w.description;
    patch({waypoints:[...waypoints,toAdd]});
    flash("Waypoint added");setAddWp(false);setPreset(null);
  };

  const delWaypoint=id=>patch({waypoints:waypoints.filter(w=>w.id!==id)});

  const addToItinerary=data=>{
    const newEvent={id:uid(),...data};
    patch({events:[...events,newEvent]});
    flash("Added to itinerary");setAddToItin(null);
  };

  const getIconColor=type=>type==="Vista"?"var(--gold)":type==="Trail"?"var(--sage)":"var(--ember2)";
  const getIcon=type=>type==="Vista"?Ic.vista:type==="Trail"?Ic.trail:Ic.marker;

  return (
    <div style={St.pane}>
      <div style={St.listHead}>
        <h2 style={St.h2}>Map</h2>
        {!readOnly&&<button style={St.smallBtn} onClick={()=>setPick(true)}><Ic.map style={ic(14)}/> Pick on map</button>}
      </div>
      {waypoints.length>0?<div ref={ref} style={{...St.mapBig,marginBottom:20}}/>:<Empty icon={Ic.map} text="Add waypoints to see them on the map."/>}

      <div style={St.listHead}>
        <h2 style={St.h2}>Waypoints</h2>
        {!readOnly&&<button style={St.smallBtn} onClick={()=>setAddWp(true)}><Ic.plus style={ic(14)}/> Add</button>}
      </div>
      {waypoints.length===0&&<Empty icon={Ic.pin} text="Mark scenic vistas, trails, and points of interest."/>}
      <div style={{display:"grid",gap:12,marginBottom:24}}>
        {waypoints.map(w=>{
          const WpIcon=getIcon(w.type);
          return (
            <div key={w.id} style={{...St.card2,padding:14}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                <div style={{color:getIconColor(w.type),flexShrink:0,marginTop:2}}>
                  <WpIcon style={ic(18)}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,marginBottom:2}}>{w.name}</div>
                  <div style={{fontSize:12,color:"var(--sage)"}}>{w.type}{w.mileage?` · ${w.mileage}mi`:""}{w.description?` · ${w.description}`:""}{w.lat?` · ${(+w.lat).toFixed(4)}, ${(+w.lng).toFixed(4)}`:""}</div>
                </div>
                {!readOnly&&<button style={St.iconBtn} onClick={()=>setDelConfirm(w.id)} aria-label="Delete"><Ic.trash style={ic(15)}/></button>}
              </div>
              {!readOnly&&<button style={{...St.ghostBtn,width:"100%",justifyContent:"center",fontSize:13}} onClick={()=>setAddToItin(w)}>+ Add to Itinerary</button>}
            </div>
          );
        })}
      </div>

      {addWp&&!readOnly&&<WaypointForm onClose={()=>{setAddWp(false);setPreset(null);}} onSave={addWaypoint} preset={preset} onPick={()=>setPick(true)}/>}
      {pick&&<PinPicker startLat={preset?.lat} startLng={preset?.lng} title="Pick waypoint location" onClose={()=>setPick(false)} onPick={(la,ln)=>{setPick(false);setPreset({lat:la.toFixed(6),lng:ln.toFixed(6)});setAddWp(true);}}/>}
      {addToItin&&<AddToItineraryForm waypoint={addToItin} tripDays={tripDays} members={members} onClose={()=>setAddToItin(null)} onSave={addToItinerary}/>}
      {delConfirm&&<Modal title="Remove waypoint?" onClose={()=>setDelConfirm(null)}>
        <p style={St.sub}>This can't be undone.</p>
        <div style={St.modalActions}>
          <button style={St.ghostBtn} onClick={()=>setDelConfirm(null)}>Keep it</button>
          <button style={{...St.primaryBtn,background:"var(--danger)"}} onClick={()=>{delWaypoint(delConfirm);flash("Waypoint removed");setDelConfirm(null);}}><Ic.trash style={ic(15)}/> Remove</button>
        </div>
      </Modal>}
    </div>
  );
}
