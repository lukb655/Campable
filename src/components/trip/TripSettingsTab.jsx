import React, { useState } from 'react';
import { Data } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, fmt } from '../../utils.js';
import { Field } from '../common/Modal.jsx';
import ImagePicker from '../common/ImagePicker.jsx';
import CampsiteCard from './CampsiteCard.jsx';
import CompleteTripForm from './CompleteTripForm.jsx';

export default function TripSettingsTab({trip,me,patch,flash,onBack}){
  const [name,setName]=useState(trip.name);
  const [loc,setLoc]=useState(trip.location||"");
  const [start,setStart]=useState(trip.start||"");
  const [end,setEnd]=useState(trip.end||"");

  const saveDetails=()=>{
    if(!name.trim()){flash("Trip name required");return;}
    patch({name:name.trim(),location:loc.trim(),start,end}); flash("Trip details saved");
  };

  const copyCode=async()=>{try{await navigator.clipboard.writeText(trip.joinCode);flash("Code copied");}catch{flash(trip.joinCode);}};
  const shareCodeNative=async()=>{
    const text=`Join "${trip.name}" on Campable. Tap Join and enter code: ${trip.joinCode}`;
    if(navigator.share){try{await navigator.share({title:"Campable",text});return;}catch{}}
    copyCode();
  };

  const deleteTrip=async()=>{
    if(!confirm("Delete this trip for everyone? This can't be undone."))return;
    await Data.deleteTrip(trip.id); flash("Trip deleted"); onBack();
  };

  return (
    <div style={St.pane}>
      <div style={St.block}>
        <div style={St.blockHead}><span>Trip Details</span><Ic.edit style={{...ic(13),color:"var(--sage)"}}/></div>
        <Field label="Trip name"><input style={St.input} value={name} onChange={e=>setName(e.target.value)}/></Field>
        <Field label="Location"><input style={St.input} value={loc} placeholder="Wilderness area, state" onChange={e=>setLoc(e.target.value)}/></Field>
        <div style={{display:"flex",gap:10}}>
          <Field label="Start"><input type="date" style={St.input} value={start} onChange={e=>setStart(e.target.value)}/></Field>
          <Field label="End"><input type="date" style={St.input} value={end} onChange={e=>setEnd(e.target.value)}/></Field>
        </div>
        <button style={St.smallBtn} onClick={saveDetails}><Ic.check style={ic(14)}/> Save details</button>
      </div>

      <CampsiteCard trip={trip} patch={patch} flash={flash}/>

      <ImagePicker label="Cover photo" current={trip.cover}
        onPicked={dataUrl=>{patch({cover:dataUrl});flash("Cover updated");}}
        onClear={()=>patch({cover:""})} flash={flash}/>

      <div style={St.block}>
        <div style={St.blockHead}><span>Invite Code</span><Ic.share style={{...ic(13),color:"var(--sage)"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={St.shareLabel}>Crew invite code</div>
            <div style={St.shareCode}>{trip.joinCode}</div>
            <div style={St.hintSm}>Share this with people you want to join the trip.</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={St.iconChip} onClick={copyCode} aria-label="Copy"><Ic.copy style={ic(16)}/></button>
            <button style={St.iconChip} onClick={shareCodeNative} aria-label="Share"><Ic.share style={ic(16)}/></button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--night)",borderRadius:10,padding:"10px 12px"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Let crew share code</div>
            <div style={St.hintSm}>Show the invite code to all members in the Crew tab.</div>
          </div>
          <button style={{...St.toggle,...(trip.shareCode?St.toggleOn:{})}}
            onClick={()=>patch({shareCode:!trip.shareCode})}>
            <span style={{...St.toggleKnob,...(trip.shareCode?St.toggleKnobOn:{})}}/>
            {trip.shareCode?"On":"Off"}
          </button>
        </div>
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Dues</span><Ic.dollar style={{...ic(13),color:"var(--sage)"}}/></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:trip.duesEnabled?14:0}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Enable trip dues</div>
            <div style={St.hintSm}>Collect a set amount from each crew member.</div>
          </div>
          <button style={{...St.toggle,...(trip.duesEnabled?St.toggleOn:{})}}
            onClick={()=>patch({duesEnabled:!trip.duesEnabled})}>
            <span style={{...St.toggleKnob,...(trip.duesEnabled?St.toggleKnobOn:{})}}/>
            {trip.duesEnabled?"On":"Off"}
          </button>
        </div>
        {trip.duesEnabled && <>
          <Field label="Amount per person ($)">
            <input style={St.input} type="number" min="0" step="0.01"
              value={trip.duesAmount||""} placeholder="0.00"
              onChange={e=>patch({duesAmount:+e.target.value})}/>
          </Field>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--night)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Admin must confirm payments</div>
              <div style={St.hintSm}>When a member marks dues paid, you confirm it in real life first.</div>
            </div>
            <button style={{...St.toggle,...(trip.requireDuesConfirm?St.toggleOn:{})}}
              onClick={()=>patch({requireDuesConfirm:!trip.requireDuesConfirm})}>
              <span style={{...St.toggleKnob,...(trip.requireDuesConfirm?St.toggleKnobOn:{})}}/>
              {trip.requireDuesConfirm?"On":"Off"}
            </button>
          </div>
          <div style={St.miniLabel}>Member dues status</div>
          <div style={{display:"grid",gap:8,marginTop:8}}>
            {(trip.members||[]).map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--night)",borderRadius:10,padding:"10px 12px"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600}}>{m.name}{m.id===me.id?" (you)":""}</div>
                  <div style={{fontSize:12,marginTop:2,color:m.duesPaid?"#5BBF8A":m.duesPending?"var(--gold)":"var(--sage)"}}>
                    {m.duesPaid?"✓ Confirmed paid":m.duesPending?"⏳ Pending confirmation":"Not paid"}
                  </div>
                </div>
                {m.duesPending&&!m.duesPaid&&
                  <button style={{...St.smallBtn,padding:"5px 10px",fontSize:12}} onClick={()=>{
                    patch({members:(trip.members||[]).map(x=>x.id===m.id?{...x,duesPaid:true,duesPending:false}:x)});
                    flash(`${m.name}'s dues confirmed`);
                  }}><Ic.check style={ic(13)}/> Confirm</button>}
                {m.duesPaid&&
                  <button style={St.iconBtn} title="Reset dues" onClick={()=>{
                    patch({members:(trip.members||[]).map(x=>x.id===m.id?{...x,duesPaid:false,duesPending:false}:x)});
                    flash("Dues reset");
                  }}><Ic.x style={ic(14)}/></button>}
              </div>
            ))}
          </div>
        </>}
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Trip Status</span><Ic.checkCircle style={{...ic(13),color:"var(--sage)"}}/></div>
        {trip.status==="completed"
          ? <>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",
                background:"rgba(91,191,138,.1)",border:"1px solid rgba(91,191,138,.25)",
                borderRadius:10,marginBottom:14}}>
                <Ic.checkCircle style={{...ic(16),color:"#5BBF8A",flexShrink:0}}/>
                <div>
                  <div style={{fontSize:13.5,fontWeight:600,color:"#5BBF8A"}}>Trip completed</div>
                  {trip.completedAt&&<div style={St.hintSm}>on {fmt(trip.completedAt)}</div>}
                </div>
              </div>
              <div style={St.hintSm}>This trip is archived and read-only. Restore it to allow editing again.</div>
              <button style={{...St.smallBtn,marginTop:12}} onClick={()=>{
                patch({status:"active",completedAt:null}); flash("Trip restored to active");
              }}><Ic.back style={ic(14)}/> Restore to active</button>
            </>
          : <>
              <div style={St.hintSm}>Mark this trip as completed to move it to the archive. The crew can still view everything, but nothing will be editable.</div>
              <CompleteTripForm trip={trip} patch={patch} flash={flash}/>
            </>}
      </div>

      <button style={St.dangerBtn} onClick={deleteTrip}>
        <Ic.trash style={ic(15)}/> Delete trip
      </button>
    </div>
  );
}
