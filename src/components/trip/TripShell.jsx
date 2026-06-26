import React, { useState, useCallback, useEffect } from 'react';
import { Data } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, fmt, code6 } from '../../utils.js';
import OverviewTab from './OverviewTab.jsx';
import CrewTab from './CrewTab.jsx';
import MealsTab from './MealsTab.jsx';
import CostsTab from './CostsTab.jsx';
import ItineraryTab from './ItineraryTab.jsx';
import PackingListTab from './PackingListTab.jsx';
import WaypointsTab from './WaypointsTab.jsx';
import TripSettingsTab from './TripSettingsTab.jsx';

export default function TripShell({trip,me,flash,onBack,initialTab}){
  const [tab,setTab]=useState(initialTab||"plan");
  const [menuOpen,setMenuOpen]=useState(false);
  const patch=useCallback(fields=>Data.updateTrip(trip.id,fields),[trip.id]);
  const isAdmin=trip.ownerId===me.id;

  useEffect(()=>{
    if(!trip.joinCode) patch({joinCode: trip.code || code6()});
  },[trip.id]);
  const isCompleted=trip.status==="completed";
  const centerItems=[
    {id:"meals",label:"Meals",icon:Ic.food},
    {id:"costs",label:"Costs",icon:Ic.dollar},
    {id:"packing",label:"Packing List",icon:Ic.pack},
    {id:"waypoints",label:"Waypoints",icon:Ic.pin},
    {id:"itinerary",label:"Itinerary",icon:Ic.cal},
  ];
  return (
    <div style={St.tripWrap}>
      <div style={St.tripScroll} className="fade">
        <button style={St.backBtn} onClick={onBack}><Ic.back style={ic(16)}/> All trips</button>
        <div style={{...St.detailHero,...(trip.cover?{backgroundImage:`url(${trip.cover})`}:{})}}>
          <div style={St.heroGrad}/>
          <div style={St.heroInner}>
            <div style={St.heroDates}><Ic.cal style={ic(13)}/> {fmt(trip.start)}{trip.end?` – ${fmt(trip.end)}`:""}</div>
            <h1 style={St.heroTitle}>{trip.name}</h1>
            <div style={St.heroLoc}><Ic.pin style={ic(14)}/> {trip.location||"Set a location"}</div>
          </div>
          {isCompleted&&(
            <div style={{position:"absolute",top:12,right:12,background:"rgba(91,191,138,.22)",
              color:"#5BBF8A",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:9,
              fontFamily:"'Oswald',sans-serif",letterSpacing:.5,display:"flex",alignItems:"center",gap:5,
              border:"1px solid rgba(91,191,138,.4)"}}>
              <Ic.checkCircle style={ic(12)}/> Completed
            </div>
          )}
        </div>

        {isCompleted&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",
            background:"rgba(91,191,138,.07)",border:"1px solid rgba(91,191,138,.2)",
            borderRadius:12,marginBottom:14,fontSize:13,color:"#5BBF8A"}}>
            <Ic.archive style={{...ic(15),flexShrink:0}}/>
            <span>This trip is archived and <strong>read-only</strong>.{trip.completedAt?` Completed ${fmt(trip.completedAt)}.`:""}{isAdmin?" Restore it in Settings to make changes.":""}</span>
          </div>
        )}

        <div style={St.tripBody}>
          {tab==="plan" && <OverviewTab trip={trip} me={me} patch={patch} flash={flash} onBack={onBack} isAdmin={isAdmin} readOnly={isCompleted}/>}
          {tab==="crew" && <CrewTab trip={trip} me={me} patch={patch} flash={flash} isAdmin={isAdmin} readOnly={isCompleted}/>}
          {tab==="meals" && <MealsTab trip={trip} patch={patch} flash={flash} readOnly={isCompleted}/>}
          {tab==="costs" && <CostsTab trip={trip} me={me} patch={patch} flash={flash} readOnly={isCompleted} isAdmin={isAdmin}/>}
          {tab==="itinerary" && <ItineraryTab trip={trip} me={me} patch={patch} flash={flash} readOnly={isCompleted}/>}
          {tab==="packing" && <PackingListTab trip={trip} patch={patch} flash={flash} readOnly={isCompleted}/>}
          {tab==="waypoints" && <WaypointsTab trip={trip} me={me} patch={patch} flash={flash} readOnly={isCompleted}/>}
          {tab==="settings" && isAdmin && <TripSettingsTab trip={trip} me={me} patch={patch} flash={flash} onBack={onBack}/>}
        </div>
      </div>

      <nav style={St.tabBarBottom}>
        <button onClick={()=>{setTab("plan");setMenuOpen(false);}}
          style={{...St.bottomTab,...(tab==="plan"?St.bottomTabOn:{})}}>
          <Ic.tent style={ic(22)}/>
          <span style={St.bottomTabLabel}>Home</span>
        </button>

        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:50}}/>}
          <div className={`center-popup${menuOpen?" open":""}`}>
            {centerItems.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}}
                style={{...St.centerMenuItem,...(tab===t.id?St.centerMenuItemOn:{})}}>
                <t.icon style={ic(18)}/>
                <span style={St.bottomTabLabel}>{t.label}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>setMenuOpen(o=>!o)}
            style={{...St.centerBtn,...(menuOpen?St.centerBtnOpen:{})}}>
            <Ic.plus style={{...ic(26),transition:"transform .2s",transform:menuOpen?"rotate(45deg)":"rotate(0deg)"}}/>
          </button>
        </div>

        <button onClick={()=>{setTab("crew");setMenuOpen(false);}}
          style={{...St.bottomTab,...(tab==="crew"?St.bottomTabOn:{})}}>
          <Ic.users style={ic(22)}/>
          <span style={St.bottomTabLabel}>Crew</span>
        </button>
      </nav>
    </div>
  );
}
