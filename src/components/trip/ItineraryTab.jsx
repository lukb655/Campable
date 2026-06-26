import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid, directionsURL, fileToCompressedDataURL } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';
import { FormSheet } from '../common/Modal.jsx';
import PinPicker from '../common/PinPicker.jsx';

export default function ItineraryTab({trip,me,patch,flash,readOnly}){
  const members=trip.members||[];
  const trails=trip.trails||[];
  const photos=trip.photos||[];
  const events=trip.events||[];
  const meals=trip.meals||[];
  const waypoints=trip.waypoints||[];

  const [addEvt,setAddEvt]=useState(false);

  const tripDays=useMemo(()=>{
    if(!trip.start) return [{v:"Day 1",l:"Day 1"},{v:"Day 2",l:"Day 2"},{v:"Day 3",l:"Day 3"},{v:"Day 4",l:"Day 4"},{v:"Day 5",l:"Day 5"}];
    const start=new Date(trip.start+"T00:00");
    const end=trip.end?new Date(trip.end+"T00:00"):new Date(start.getTime()+4*86400000);
    const days=[];
    for(let d=new Date(start);d<=end;d=new Date(d.getTime()+86400000))
      days.push({v:d.toISOString().slice(0,10),l:d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})});
    return days;
  },[trip.start,trip.end]);

  const getWaypointInfo=waypointId=>{
    if(!waypointId) return null;
    return waypoints.find(w=>w.id===waypointId);
  };

  const getWaypointDetail=wp=>{
    if(!wp) return "";
    if(wp.type==="Trail") return wp.mileage?`${wp.mileage} mi`:"";
    if(wp.type==="Vista") return wp.description||"Vista";
    if(wp.type==="Other Point") return wp.description||"Other Point";
    return "";
  };

  const allItems=useMemo(()=>{
    const items=[];
    tripDays.forEach(day=>{
      events.forEach(e=>{if(e.day===day.v) items.push({...e,type:"event",sortKey:(e.time||"").padStart(5,"0"),day:day.v});});
      meals.forEach(m=>{if(m.day===day.v) items.push({...m,type:"meal",sortKey:(m.scheduledTime||"").padStart(5,"0"),day:day.v});});
    });
    return items.sort((a,b)=>a.sortKey.localeCompare(b.sortKey));
  },[events,meals,tripDays]);

  const byDay=useMemo(()=>{
    const g={}; tripDays.forEach(d=>{g[d.v]=[];});
    allItems.forEach(item=>{if(g[item.day]) g[item.day].push(item);});
    return g;
  },[allItems,tripDays]);

  const addEvent=e=>{patch({events:[...events,{id:uid(),...e}]});flash("Event added");setAddEvt(false);};
  const delEvent=id=>patch({events:events.filter(e=>e.id!==id)});
  const eventTypes=["Activity","Hike","Travel","Rest","Other"];

  const ref=useRef(null);
  const [openTrail,setOpenTrail]=useState(false);
  const [pick,setPick]=useState(false);
  const [preset,setPreset]=useState(null);
  const trailsOnMap=trails.filter(t=>t.lat&&t.lng);

  useEffect(()=>{
    if(!ref.current) return;
    const cs=(trip.campLat&&trip.campLng)?[+trip.campLat,+trip.campLng]:null;
    const center=cs||(trailsOnMap.length?[+trailsOnMap[0].lat,+trailsOnMap[0].lng]:[39.0476,-79.3074]);
    const map=L.map(ref.current,{attributionControl:false}).setView(center,12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);
    const bounds=[];
    if(cs){
      const tentIcon=L.divIcon({className:"",html:`<div style="background:#E8682C;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4)"><span style="transform:rotate(45deg);font-size:13px">⛺</span></div>`,iconSize:[26,26],iconAnchor:[13,26]});
      L.marker(cs,{icon:tentIcon}).addTo(map).bindPopup(`<b>Campsite</b><br>${trip.campLabel||trip.name}`);
      bounds.push(cs);
    }
    trailsOnMap.forEach(p=>{
      L.marker([+p.lat,+p.lng]).addTo(map).bindPopup(`<b>${p.name}</b><br>${(+p.miles||0).toFixed(1)} mi · ${p.difficulty||""}`);
      bounds.push([+p.lat,+p.lng]);
    });
    if(bounds.length>1) map.fitBounds(L.latLngBounds(bounds).pad(0.3));
    setTimeout(()=>map.invalidateSize(),120);
    return ()=>map.remove();
  },[trip.id,trip.campLat,trip.campLng,trails.map(t=>t.id+t.lat+t.lng).join()]);

  const addTrail=t=>{
    patch({trails:[...trails,{id:uid(),done:false,name:t.name,miles:+t.miles||0,difficulty:t.difficulty,
      lat:t.lat?+t.lat:null,lng:t.lng?+t.lng:null}]});
    flash("Trail added");setOpenTrail(false);setPreset(null);
  };
  const delTrail=id=>patch({trails:trails.filter(t=>t.id!==id)});
  const toggleTrail=id=>patch({trails:trails.map(t=>t.id===id?{...t,done:!t.done}:t)});

  const [viewPhoto,setViewPhoto]=useState(null);
  const getName=id=>members.find(m=>m.id===id)?.name||"Someone";

  const addPhotos=async fileList=>{
    const files=Array.from(fileList).slice(0,6);
    try{
      const added=[];
      for(const f of files){const d=await fileToCompressedDataURL(f);added.push({id:uid(),by:me.id,data:d,ts:Date.now()});}
      patch({photos:[...photos,...added]});flash(`${added.length} photo${added.length>1?"s":""} added`);
    }catch(e){flash(e.message||"Couldn't add photo");}
  };
  const delPhoto=pid=>{patch({photos:photos.filter(p=>p.id!==pid)});flash("Photo removed");setViewPhoto(null);};

  return (
    <div style={St.pane}>

      {/* SCHEDULE */}
      <div style={St.listHead}>
        <h2 style={St.h2}>Itinerary</h2>
        {!readOnly&&<button style={St.smallBtn} onClick={()=>setAddEvt(true)}><Ic.plus style={ic(14)}/> Event</button>}
      </div>
      {allItems.length===0 && <Empty icon={Ic.cal} text="Add activities and events to build your day-by-day itinerary."/>}
      {tripDays.filter(d=>(byDay[d.v]||[]).length>0).map(d=>(
        <div key={d.v} style={{marginBottom:20}}>
          <div style={St.yearLabel}>
            <span style={{...St.yearNum,fontSize:12,letterSpacing:1}}>{d.l}</span>
            <span style={St.yearLine}/>
          </div>
          <div style={{display:"grid",gap:10}}>
            {(byDay[d.v]||[]).map(item=>(
              <div key={item.id} style={St.itemRow}>
                <div style={{...St.dayChip,minWidth:52,fontSize:11}}>{item.type==="event"?(item.time||"—"):(item.scheduledTime||"—")}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={St.itemTitle}>{item.title}</div>
                  {item.type==="event" && getWaypointInfo(item.waypointId) && (
                    <div style={{fontSize:12,color:"var(--ember2)",marginBottom:4,fontWeight:500}}>
                      📍 {getWaypointInfo(item.waypointId).name} · {getWaypointInfo(item.waypointId).type}{getWaypointDetail(getWaypointInfo(item.waypointId))?` · ${getWaypointDetail(getWaypointInfo(item.waypointId))}`:""}
                    </div>
                  )}
                  <div style={St.itemMeta}>
                    {item.type==="event"
                      ?((item.type||"Activity")+(item.notes?" · "+item.notes:"")+(item.assignee?" · Assigned to "+(members.find(m=>m.id===item.assignee)?.name||""):""))
                      :("Meal"+(item.responsible?" · Cook: "+(members.find(m=>m.id===item.responsible)?.name||""):""))}
                  </div>
                </div>
                {!readOnly&&item.type==="event"&&<button style={St.iconBtn} onClick={()=>delEvent(item.id)} aria-label="Delete"><Ic.trash style={ic(15)}/></button>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* MAP */}
      <div style={{...St.listHead,marginTop:events.length?20:0}}>
        <h2 style={St.h2}>Map</h2>
        {!readOnly&&<div style={{display:"flex",gap:8}}>
          <button style={St.smallBtn} onClick={()=>setPick(true)}><Ic.map style={ic(14)}/> Drop pin</button>
          <button style={St.smallBtn} onClick={()=>setOpenTrail(true)}><Ic.plus style={ic(14)}/> Trail</button>
        </div>}
      </div>
      <div ref={ref} style={{...St.mapBig,marginBottom:10}}/>
      {(trip.campLat&&trip.campLng)&&
        <a style={{...St.dirBtn,marginBottom:14,width:"100%",justifyContent:"center"}}
          href={directionsURL(trip.campLat,trip.campLng,trip.campLabel||trip.name)} target="_blank" rel="noreferrer">
          <Ic.nav style={ic(15)}/> Directions to campsite
        </a>}
      {trails.length===0&&<Empty icon={Ic.foot} text="Drop a pin or add a trail to map your routes."/>}
      <div style={{display:"grid",gap:10,marginBottom:24}}>
        {trails.map(t=>(
          <div key={t.id} style={St.itemRow}>
            <button style={{...St.checkBtn,...(t.done?St.checkOn:{})}} onClick={()=>!readOnly&&toggleTrail(t.id)} aria-label="Done">
              {t.done&&<Ic.check style={{width:13,height:13,color:"var(--night)"}}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{...St.itemTitle,textDecoration:t.done?"line-through":"none",opacity:t.done?.6:1}}>{t.name}</div>
              <div style={St.itemMeta}>{(+t.miles||0).toFixed(1)} mi · {t.difficulty||"—"}{t.lat?" · "+((+t.lat).toFixed(4))+", "+((+t.lng).toFixed(4)):""}</div>
            </div>
            {t.lat&&t.lng&&
              <a style={St.navBtn} href={directionsURL(t.lat,t.lng,t.name)} target="_blank" rel="noreferrer" aria-label="Directions"><Ic.nav style={ic(14)}/></a>}
            {!readOnly&&<button style={St.iconBtn} onClick={()=>delTrail(t.id)} aria-label="Delete"><Ic.trash style={ic(15)}/></button>}
          </div>
        ))}
      </div>

      {/* PHOTOS */}
      <div style={St.listHead}>
        <h2 style={St.h2}>Photos</h2>
        {!readOnly&&<label style={{...St.smallBtn,cursor:"pointer"}}>
          <Ic.img style={ic(14)}/> Add
          <input type="file" accept="image/*" multiple style={{display:"none"}}
            onChange={e=>{addPhotos(e.target.files);e.target.value="";}}/>
        </label>}
      </div>
      {photos.length===0&&<Empty icon={Ic.img} text="Add photos from the trip to share with your crew."/>}
      {photos.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:16}}>
          {[...photos].reverse().map(p=>(
            <div key={p.id} style={{paddingBottom:"100%",position:"relative",borderRadius:10,overflow:"hidden",cursor:"pointer"}}
              onClick={()=>setViewPhoto(p)}>
              <img src={p.data} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {addEvt&&!readOnly&&<FormSheet title="Add event" onClose={()=>setAddEvt(false)} onSave={addEvent}
        fields={[
          {k:"title",label:"Event",type:"text",req:true},
          {k:"day",label:"Day",type:"select",opts:tripDays,def:tripDays[0]?.v||""},
          {k:"time",label:"Time (e.g. 09:00)",type:"text"},
          {k:"type",label:"Type",type:"select",opts:eventTypes.map(t=>({v:t,l:t})),def:"Activity"},
          {k:"waypointId",label:"Link to waypoint (optional)",type:"select",allowEmpty:true,opts:waypoints.map(w=>({v:w.id,l:w.name}))},
          {k:"assignee",label:"Assign to (optional)",type:"select",allowEmpty:true,opts:members.map(m=>({v:m.id,l:m.name}))},
          {k:"notes",label:"Notes (optional)",type:"text"},
        ]}/>}
      {openTrail&&!readOnly&&<FormSheet title={preset?"Name this pin":"Add trail"} onClose={()=>{setOpenTrail(false);setPreset(null);}} onSave={addTrail}
        initial={preset||{}}
        fields={[
          {k:"name",label:"Trail name",type:"text",req:true},
          {k:"miles",label:"Distance (mi)",type:"number"},
          {k:"difficulty",label:"Difficulty",type:"select",opts:["Easy","Moderate","Hard","Expert"].map(d=>({v:d,l:d})),def:"Moderate"},
          {k:"lat",label:"Latitude",type:"text"},
          {k:"lng",label:"Longitude",type:"text"},
        ]}/>}
      {pick&&!readOnly&&<PinPicker startLat={trip.campLat} startLng={trip.campLng} title="Drop a waypoint"
        onClose={()=>setPick(false)}
        onPick={(la,ln)=>{setPick(false);setPreset({lat:la.toFixed(6),lng:ln.toFixed(6)});setOpenTrail(true);}}/>}
      {viewPhoto&&(
        <div style={St.overlay} onClick={()=>setViewPhoto(null)}>
          <div style={{position:"relative",maxWidth:500,width:"100%",padding:"0 4px"}} onClick={e=>e.stopPropagation()}>
            <img src={viewPhoto.data} alt="" style={{width:"100%",borderRadius:14,display:"block"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 2px 0"}}>
              <span style={{fontSize:12,color:"var(--sage)"}}>by {getName(viewPhoto.by)}</span>
              {!readOnly&&<button style={St.dangerBtn} onClick={()=>delPhoto(viewPhoto.id)}><Ic.trash style={ic(14)}/> Remove</button>}
            </div>
            <button style={{position:"absolute",top:8,right:12,background:"rgba(0,0,0,.6)",border:"none",borderRadius:8,padding:"4px 6px",cursor:"pointer"}}
              onClick={()=>setViewPhoto(null)}><Ic.x style={{...ic(18),color:"var(--paper)"}}/></button>
          </div>
        </div>
      )}
    </div>
  );
}
