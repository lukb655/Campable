import React from 'react';
import { Data } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import WidgetGrid from './WidgetGrid.jsx';
import DuesSection from './DuesSection.jsx';
import FieldNotesSection from './FieldNotesSection.jsx';
import SiteInfoSection from './SiteInfoSection.jsx';
import { Empty } from '../common/ListHead.jsx';

export default function OverviewTab({trip,me,patch,flash,onBack,isAdmin,readOnly}){
  const allMealItems=(trip.meals||[]).reduce((a,m)=>[...a,...(m.items||[])],[]);
  const tasks=[
    ["Crew confirmed",(trip.members||[]).length>=2],
    ["Packing list complete",allMealItems.length>0&&allMealItems.every(i=>i.got)],
    ["Costs settled",trip.duesEnabled?(trip.members||[]).every(m=>m.duesPaid):(trip.expenses||[]).length>0],
    ["Itinerary planned",(trip.events||[]).length>=1],
    ["Waypoints added",(trip.waypoints||[]).length>0],
  ];
  const pct=Math.round(tasks.filter(t=>t[1]).length/tasks.length*100);

  const leaveTrip=async()=>{
    if(!confirm("Leave this trip?"))return;
    const members=(trip.members||[]).filter(m=>m.id!==me.id);
    const memberIds=(trip.memberIds||[]).filter(id=>id!==me.id);
    await Data.updateTrip(trip.id,{members,memberIds});
    flash("Left trip"); onBack();
  };

  const completeTrip=async()=>{
    if(!confirm("Mark this trip as completed? It will move to the archive."))return;
    await Data.updateTrip(trip.id,{status:"completed",completedAt:new Date().toISOString()});
    flash("Trip completed"); onBack();
  };

  return (
    <div style={St.pane}>
      <WidgetGrid trip={trip} isAdmin={isAdmin} patch={patch}/>

      <DuesSection trip={trip} me={me} patch={patch} flash={flash} isAdmin={isAdmin} readOnly={readOnly}/>

      <div style={St.block}>
        <div style={St.blockHead}><span>Trip readiness</span><span style={{color:"var(--ember2)"}}>{pct}%</span></div>
        <div style={St.readyTrack}><div style={{...St.readyFill,width:`${pct}%`}}/></div>
        <div style={{marginTop:12,display:"grid",gap:8}}>
          {tasks.map(([label,ok])=>(
            <div key={label} style={St.taskRow}>
              <span style={{...St.taskDot,
                background:ok?"var(--ember)":"rgba(232,104,44,.12)",
                borderColor:ok?"var(--ember)":"var(--gold)"}}>
                {ok
                  ? <Ic.check style={{width:11,height:11,color:"var(--night)"}}/>
                  : <Ic.warn style={{width:11,height:11,color:"var(--gold)"}}/>}
              </span>
              <span style={{color:ok?"var(--paper)":"var(--sage)"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <FieldNotesSection trip={trip} me={me} isAdmin={isAdmin} patch={patch}/>

      <SiteInfoSection trip={trip} isAdmin={isAdmin} patch={patch} readOnly={readOnly}/>

      {!readOnly && (
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {!isAdmin &&
            <button style={St.ghostBtn} onClick={leaveTrip}>
              <Ic.logout style={ic(15)}/> Leave trip
            </button>}
          {isAdmin &&
            <button style={St.primaryBtn} onClick={completeTrip}>
              <Ic.checkCircle style={ic(15)}/> Complete trip
            </button>}
        </div>
      )}
    </div>
  );
}
