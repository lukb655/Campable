import React, { useState, useMemo } from 'react';
import { Data } from '../../data.js';
import { blankMember } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import AllTripsMap from './AllTripsMap.jsx';
import TripCard from './TripCard.jsx';
import TripForm from './TripForm.jsx';
import JoinForm from './JoinForm.jsx';
import { Empty } from '../common/ListHead.jsx';

export default function Home({trips,me,flash,onOpen,onOpenSettings}){
  const [adding,setAdding]=useState(false);
  const [joining,setJoining]=useState(false);
  const [archiveOpen,setArchiveOpen]=useState(false);

  const activeTrips=useMemo(()=>trips.filter(t=>t.status!=="completed"),[trips]);
  const archivedTrips=useMemo(()=>trips.filter(t=>t.status==="completed"),[trips]);

  const grouped=useMemo(()=>{
    const g={}; activeTrips.forEach(t=>{const y=t.start?t.start.slice(0,4):"Unscheduled";(g[y]=g[y]||[]).push(t);}); return g;
  },[activeTrips]);

  const archivedGrouped=useMemo(()=>{
    const g={}; archivedTrips.forEach(t=>{const y=t.start?t.start.slice(0,4):"Unscheduled";(g[y]=g[y]||[]).push(t);}); return g;
  },[archivedTrips]);

  const addTrip=async(d)=>{
    await Data.createTrip({
      ownerId:me.id, name:d.name, location:d.location, start:d.start, end:d.end, cover:"",
      campLat:d.campLat?+d.campLat:null, campLng:d.campLng?+d.campLng:null, campLabel:d.campLabel||"",
      notes:"", memberIds:[me.id], members:[blankMember(me)], meals:[], trails:[], photos:[], extras:[],
    });
    flash("Trip created"); setAdding(false);
  };
  const join=async(c)=>{
    const t=await Data.joinByCode(me,c);
    if(!t){flash("No trip with that code");return false;}
    flash(`Joined ${t.name}`); setJoining(false); return true;
  };

  return (
    <div className="fade">
      <div style={St.sectionHead}>
        <div>
          <h1 style={St.h1}>Your Trips</h1>
          <p style={St.sub}>{activeTrips.length} active {activeTrips.length===1?"trip":"trips"}{archivedTrips.length>0?` · ${archivedTrips.length} completed`:""}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={St.ghostBtn} onClick={()=>setJoining(true)}>Join</button>
          <button style={St.primaryBtn} onClick={()=>setAdding(true)}><Ic.plus style={ic(16)}/> New trip</button>
        </div>
      </div>

      <AllTripsMap trips={activeTrips} onOpen={onOpen}/>

      {activeTrips.length===0 && archivedTrips.length===0 &&
        <Empty icon={Ic.pack} text="No trips yet. Plan one and share its code, or join a friend's with theirs."/>}

      {activeTrips.length===0 && archivedTrips.length>0 &&
        <Empty icon={Ic.pack} text="No active trips. All your trips are in the archive below."/>}

      {Object.keys(grouped).sort().map(year=>(
        <div key={year} style={{marginBottom:26}}>
          <div style={St.yearLabel}><span style={St.yearNum}>{year}</span><span style={St.yearLine}/></div>
          <div style={St.tripGrid}>
            {grouped[year].map(t=><TripCard key={t.id} trip={t} me={me} onOpen={()=>onOpen(t.id)} onSettings={()=>onOpenSettings(t.id)}/>)}
          </div>
        </div>
      ))}

      {archivedTrips.length>0&&(
        <div style={{marginBottom:26}}>
          <button
            onClick={()=>setArchiveOpen(o=>!o)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              width:"100%",background:"var(--pine)",border:"1px solid var(--line)",borderRadius:14,
              color:"var(--paper)",padding:"12px 14px",cursor:"pointer",gap:8,marginBottom:archiveOpen?14:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Ic.archive style={{...ic(15),color:"var(--sage)"}}/>
              <span style={{fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:14,letterSpacing:.5}}>Archive</span>
              <span style={{fontSize:11,background:"var(--moss)",color:"var(--sage)",padding:"2px 8px",borderRadius:6,fontWeight:600}}>
                {archivedTrips.length}
              </span>
            </div>
            <Ic.chev style={{...ic(16),color:"var(--sage)",transform:archiveOpen?"rotate(90deg)":"none",transition:"transform .2s"}}/>
          </button>
          {archiveOpen&&(
            <div>
              {Object.keys(archivedGrouped).sort().reverse().map(year=>(
                <div key={year} style={{marginBottom:18}}>
                  <div style={St.yearLabel}><span style={St.yearNum}>{year}</span><span style={St.yearLine}/></div>
                  <div style={St.tripGrid}>
                    {archivedGrouped[year].map(t=><TripCard key={t.id} trip={t} me={me} onOpen={()=>onOpen(t.id)} onSettings={()=>onOpenSettings(t.id)}/>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adding && <TripForm onSave={addTrip} onClose={()=>setAdding(false)}/>}
      {joining && <JoinForm onJoin={join} onClose={()=>setJoining(false)}/>}
    </div>
  );
}
