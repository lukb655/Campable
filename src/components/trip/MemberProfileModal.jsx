import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St, TRIP_ROLES } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

export default function MemberProfileModal({member,trip,me,isAdmin,onClose,onUpdate,fetchedPhoto}){
  const isSelf=member.id===me.id;
  const isOwner=member.id===trip.ownerId;
  const canEdit=isSelf&&!trip.completed;
  const photo=member.photo||fetchedPhoto||null;

  const [emergency,setEmergency]=useState(member.emergency||"");
  const [dietary,setDietary]=useState(member.dietary||"");

  const save=()=>{
    if(!canEdit)return;
    onUpdate(member.id,{emergency,dietary});
    onClose();
  };

  const responsibilities=trip.responsibilities||{};
  const roles=TRIP_ROLES.filter(r=>responsibilities[r.id]===member.id);
  const meals=trip.meals||[];
  const cookingMeals=meals.filter(m=>m.responsible===member.id).map(m=>m.title);
  const bringingItems=[];
  meals.forEach(m=>(m.items||[]).forEach(i=>{
    if(i.responsible===member.id) bringingItems.push(i.name+(i.qty?` (${i.qty})`:""));
  }));

  return (
    <Modal title="Member Profile" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20,gap:10}}>
        {photo
          ?<img src={photo} alt="" style={{width:80,height:80,borderRadius:20,objectFit:"cover",border:"2px solid var(--line)"}}/>
          :<div style={{width:80,height:80,borderRadius:20,background:"var(--mist)",display:"grid",placeItems:"center",
              fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:32,color:"var(--paper)",flexShrink:0}}>
            {member.name.slice(0,1).toUpperCase()}
          </div>}
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:600,letterSpacing:.3}}>
            {member.name}
            {isOwner&&<span style={St.ownerBadge}>Owner</span>}
            {isSelf&&<span style={St.youTag}>you</span>}
          </div>
          {member.email&&<div style={{fontSize:12.5,color:"var(--sage)",marginTop:3}}>{member.email}</div>}
        </div>
      </div>

      {roles.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={St.fieldLabel}>Trip Roles</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {roles.map(r=>(
              <span key={r.id} style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--moss)",
                color:"var(--paper)",padding:"5px 10px",borderRadius:8,fontSize:12.5,fontWeight:600}}>
                <r.icon style={ic(13)}/>{r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{marginBottom:12}}>
        <div style={St.fieldLabel}>Emergency Contact</div>
        {canEdit
          ?<input style={St.input} placeholder="Name and phone number"
              value={emergency} onChange={e=>setEmergency(e.target.value)}/>
          :<div style={{fontSize:13.5,color:emergency?"var(--paper)":"var(--sage)",padding:"10px 12px",
              background:"var(--night)",borderRadius:10}}>
            {emergency||"Not provided"}
          </div>}
      </div>

      <div style={{marginBottom:16}}>
        <div style={St.fieldLabel}>Dietary Restrictions / Notes</div>
        {canEdit
          ?<input style={St.input} placeholder="Allergies, preferences, or notes"
              value={dietary} onChange={e=>setDietary(e.target.value)}/>
          :<div style={{fontSize:13.5,color:dietary?"var(--paper)":"var(--sage)",padding:"10px 12px",
              background:"var(--night)",borderRadius:10}}>
            {dietary||"None noted"}
          </div>}
      </div>

      {(cookingMeals.length>0||bringingItems.length>0)&&(
        <div style={{marginBottom:16}}>
          <div style={St.fieldLabel}>Assignments</div>
          {cookingMeals.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:13}}>
              <Ic.food style={{...ic(14),color:"var(--sage)",flexShrink:0}}/>
              <span>{`Cook: ${cookingMeals.join(", ")}`}</span>
            </div>
          )}
          {bringingItems.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
              <Ic.cart style={{...ic(14),color:"var(--sage)",flexShrink:0}}/>
              <span>{`Bringing: ${bringingItems.join(", ")}`}</span>
            </div>
          )}
        </div>
      )}

      {canEdit&&(
        <div style={St.modalActions}>
          <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
          <button style={St.primaryBtn} onClick={save}>Save</button>
        </div>
      )}
    </Modal>
  );
}
