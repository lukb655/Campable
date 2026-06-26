import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';
import { Modal } from './Modal.jsx';

export default function PinPicker({startLat,startLng,title,onPick,onClose}){
  const ref=useRef(null); const [sel,setSel]=useState(null);
  useEffect(()=>{
    if(!ref.current) return;
    const center=(startLat&&startLng)?[+startLat,+startLng]:[39.0476,-79.3074];
    const map=L.map(ref.current,{attributionControl:false}).setView(center,11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);
    let marker=(startLat&&startLng)?L.marker(center).addTo(map):null;
    if(marker) setSel({lat:+startLat,lng:+startLng});
    map.on("click",e=>{ setSel(e.latlng); if(marker)marker.setLatLng(e.latlng); else marker=L.marker(e.latlng).addTo(map); });
    setTimeout(()=>map.invalidateSize(),120);
    return ()=>map.remove();
  },[]);
  return (
    <Modal title={title} onClose={onClose} wide>
      <p style={{...St.sub,marginTop:0}}>Tap the map to set the spot.</p>
      <div ref={ref} style={St.mapPick}/>
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} disabled={!sel} onClick={()=>sel&&onPick(sel.lat,sel.lng)}><Ic.check style={ic(15)}/> Use this spot</button>
      </div>
    </Modal>
  );
}
