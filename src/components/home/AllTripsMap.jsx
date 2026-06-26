import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic, fmt } from '../../utils.js';

export default function AllTripsMap({trips,onOpen}){
  const [open,setOpen]=useState(()=>window.innerWidth>=600);
  const ref=useRef(null);
  const pts=trips.filter(t=>t.campLat&&t.campLng);

  useEffect(()=>{
    if(!open||!ref.current) return;
    const center=pts.length?[+pts[0].campLat,+pts[0].campLng]:[39.5,-98.35];
    const map=L.map(ref.current,{attributionControl:false}).setView(center,pts.length?5:3);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);
    const bounds=[];
    pts.forEach(t=>{
      L.marker([+t.campLat,+t.campLng]).addTo(map)
        .bindPopup(`<b>${t.name}</b><br>${t.location||""}<br>${fmt(t.start)}`);
      bounds.push([+t.campLat,+t.campLng]);
    });
    if(bounds.length>1) map.fitBounds(L.latLngBounds(bounds).pad(0.35));
    setTimeout(()=>map.invalidateSize(),150);
    return ()=>map.remove();
  },[open, trips.map(t=>t.id+t.campLat+t.campLng).join()]);

  return (
    <div style={{marginBottom:20,background:"var(--pine)",border:"1px solid var(--line)",borderRadius:14,overflow:"hidden"}}>
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          width:"100%",background:"none",border:"none",color:"var(--paper)",
          padding:"12px 14px",cursor:"pointer",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Ic.map style={{...ic(15),color:"var(--ember2)"}}/>
          <span style={{fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:14,letterSpacing:.5}}>
            All campsites
          </span>
          {pts.length>0 &&
            <span style={{fontSize:11,background:"var(--moss)",color:"var(--sage)",
              padding:"2px 8px",borderRadius:6,fontWeight:600}}>
              {pts.length} pinned
            </span>}
        </div>
        <Ic.chev style={{...ic(16),color:"var(--sage)",
          transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}/>
      </button>
      {open &&
        <div style={{padding:"0 14px 14px"}}>
          <div ref={ref} style={St.mapHome}/>
          {pts.length===0 &&
            <div style={{...St.hintSm,marginTop:8}}>Add campsite coordinates to a trip and it'll appear here.</div>}
        </div>}
    </div>
  );
}
