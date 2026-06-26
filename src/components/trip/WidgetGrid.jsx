import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St, WIDGET_DEFS, DEFAULT_WIDGETS } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

function WidgetPicker({trip,current,onSave,onClose}){
  const [sel,setSel]=useState([...current]);
  const toggle=(id)=>setSel(prev=>prev.includes(id)?prev.filter(x=>x!==id):prev.length<4?[...prev,id]:prev);
  const ready=sel.length===4;
  return (
    <Modal title="Edit Widgets" onClose={onClose}>
      <div style={{color:"var(--sage)",fontSize:12.5,marginBottom:14}}>Choose 4 widgets to display on your overview. ({sel.length}/4 selected)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {WIDGET_DEFS.map(w=>{
          const on=sel.includes(w.id);
          return (
            <button key={w.id} onClick={()=>toggle(w.id)}
              style={{...St.statCard,cursor:"pointer",border:on?"1px solid var(--ember)":"1px solid var(--line)",
                background:on?"rgba(232,104,44,0.1)":"var(--pine)",padding:"12px 10px"}}>
              <w.icon style={{...ic(16),color:on?"var(--ember2)":"var(--sage)"}}/>
              <div style={{...St.statValue,fontSize:20,color:on?"var(--paper)":"var(--sage)"}}>{w.get(trip)}</div>
              <div style={{...St.statLabel,color:on?"var(--ember2)":"var(--sage)"}}>{w.label}</div>
            </button>
          );
        })}
      </div>
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={{...St.primaryBtn,...(!ready?{opacity:.45,cursor:"not-allowed"}:{})}}
          disabled={!ready} onClick={()=>{onSave(sel);onClose();}}>
          <Ic.check style={ic(15)}/> Save Widgets
        </button>
      </div>
    </Modal>
  );
}

export default function WidgetGrid({trip,isAdmin,patch}){
  const [picking,setPicking]=useState(false);
  const order=trip.widgetOrder||DEFAULT_WIDGETS;
  const widgets=order.map(id=>WIDGET_DEFS.find(w=>w.id===id)).filter(Boolean);
  return (
    <>
      {isAdmin&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button style={St.smallBtn} onClick={()=>setPicking(true)}>
          <Ic.edit style={ic(13)}/> Edit Widgets
        </button>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {widgets.map(w=>(
          <div key={w.id} style={St.statCard}>
            <w.icon style={{...ic(16),color:"var(--ember2)"}}/>
            <div style={St.statValue}>{w.get(trip)}</div>
            <div style={St.statLabel}>{w.label}</div>
          </div>
        ))}
      </div>
      {picking&&<WidgetPicker trip={trip} current={order} onSave={sel=>patch({widgetOrder:sel})} onClose={()=>setPicking(false)}/>}
    </>
  );
}
