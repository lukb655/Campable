import React, { useState, useMemo, useEffect } from 'react';
import { Data } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';
import MemberProfileModal from './MemberProfileModal.jsx';
import GroupChat from './GroupChat.jsx';
import ShareCard from './ShareCard.jsx';

export default function CrewTab({trip,me,patch,flash,isAdmin,readOnly}){
  const members=trip.members||[]; const meals=trip.meals||[];

  const sortedMembers=useMemo(()=>[...members].sort((a,b)=>{
    if(a.id===trip.ownerId) return -1;
    if(b.id===trip.ownerId) return 1;
    return a.name.localeCompare(b.name);
  }),[members,trip.ownerId]);

  const tally=useMemo(()=>{
    const paid={},owes={}; members.forEach(m=>{paid[m.id]=0;owes[m.id]=0;});
    meals.forEach(m=>{const c=+m.cost||0; if(m.paidBy&&paid[m.paidBy]!=null)paid[m.paidBy]+=c;
      const share=members.length?c/members.length:0; members.forEach(mm=>owes[mm.id]+=share);});
    const map={}; members.forEach(m=>map[m.id]={paid:paid[m.id],share:owes[m.id],net:paid[m.id]-owes[m.id]});
    return map;
  },[trip]);

  const [fetchedPhotos,setFetchedPhotos]=useState({});
  useEffect(()=>{
    members.filter(m=>!m.photo).forEach(m=>{
      Data.getProfile(m.id).then(p=>{
        if(p.photo) setFetchedPhotos(prev=>({...prev,[m.id]:p.photo}));
      });
    });
  },[members.map(m=>m.id+(m.photo||"")).join()]);

  const [selectedMember,setSelectedMember]=useState(null);

  const [addName,setAddName]=useState("");
  const addMember=()=>{ if(!isAdmin)return; if(!addName.trim())return;
    patch({members:[...members,{id:uid(),name:addName.trim(),email:"",emergency:"",dietary:"",photo:""}]});
    setAddName(""); flash("Added to crew");
  };
  const updateMember=(id,fields)=>patch({members:members.map(m=>m.id===id?{...m,...fields}:m)});
  const delMember=(id)=>{ if(!isAdmin)return; patch({members:members.filter(m=>m.id!==id)}); };

  const cookingFor=(mid)=>{
    const out=[];
    meals.forEach(m=>{ if(m.responsible===mid) out.push(m.title); });
    return out;
  };
  const bringing=(mid)=>{
    const out=[];
    meals.forEach(m=>(m.items||[]).forEach(i=>{ if(i.responsible===mid) out.push(i.name+(i.qty?` (${i.qty})`:"")); }));
    return out;
  };

  return (
    <div style={St.pane}>
      {selectedMember && <MemberProfileModal
        member={selectedMember}
        trip={trip}
        me={me}
        isAdmin={isAdmin}
        onClose={()=>setSelectedMember(null)}
        onUpdate={(id,fields)=>{updateMember(id,fields);setSelectedMember(prev=>prev?{...prev,...fields}:null);}}
        fetchedPhoto={fetchedPhotos[selectedMember.id]}
      />}
      {trip.joinCode && (isAdmin||trip.shareCode) && <ShareCard trip={trip} flash={flash} isAdmin={isAdmin} patch={patch}/>}

      <GroupChat trip={trip} me={me} patch={patch}/>

      {isAdmin && !readOnly && (
        <div style={{display:"flex",gap:8,margin:"4px 0 16px"}}>
          <input style={St.input} placeholder="Add someone by name" value={addName}
            onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()}/>
          <button style={St.smallBtn} onClick={addMember}><Ic.plus style={ic(15)}/></button>
        </div>
      )}

      <div style={{display:"grid",gap:14}}>
        {sortedMembers.map(m=>{
          const t=tally[m.id]||{paid:0,share:0,net:0};
          const cooks=cookingFor(m.id);
          const brings=bringing(m.id);
          const isSelf=m.id===me.id;
          const isOwner=m.id===trip.ownerId;
          return (
            <div key={m.id} style={{...St.memberCard,cursor:"pointer"}} onClick={()=>setSelectedMember(m)}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {(m.photo||fetchedPhotos[m.id])
                  ? <img src={m.photo||fetchedPhotos[m.id]} alt="" style={St.memberAvatarImg}/>
                  : <div style={St.avatar}>{m.name.slice(0,1).toUpperCase()}</div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={St.itemTitle}>{m.name}{isOwner && <span style={St.ownerBadge}>Owner</span>}{isSelf && <span style={St.youTag}>you</span>}</div>
                  {trip.duesEnabled && <div style={{...St.netPill,marginTop:4,display:"inline-flex",
                    background:t.net>=0?"rgba(127,169,155,.15)":"rgba(232,104,44,.15)",
                    color:t.net>=0?"var(--sage)":"var(--ember2)"}}>
                    {Math.abs(t.net)<0.005?"settled up":t.net>0?`gets back $${t.net.toFixed(2)}`:`owes $${Math.abs(t.net).toFixed(2)}`}
                  </div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {isAdmin && !readOnly && <button style={St.iconBtn} onClick={e=>{e.stopPropagation();delMember(m.id);}} aria-label="Remove"><Ic.trash style={ic(15)}/></button>}
                  <Ic.chev style={{...ic(14),color:"var(--mist)",flexShrink:0}}/>
                </div>
              </div>

              {trip.duesEnabled && <div style={St.memberMeta}>paid ${t.paid.toFixed(2)} · fair share ${t.share.toFixed(2)}</div>}

              <div style={St.memberRow}>
                <Ic.food style={{...ic(14),color:"var(--sage)"}}/>
                <span style={{color:cooks.length?"var(--paper)":"var(--sage)"}}>
                  {cooks.length?`Cook: ${cooks.join(", ")}`:"Not cooking any meals"}
                </span>
              </div>
              <div style={St.memberRow}>
                <Ic.cart style={{...ic(14),color:"var(--sage)"}}/>
                <span style={{color:brings.length?"var(--paper)":"var(--sage)"}}>
                  {brings.length?`Bringing: ${brings.join(", ")}`:"Nothing assigned to bring"}
                </span>
              </div>
              <div style={St.memberRow}>
                <Ic.sos style={{...ic(14),color:"var(--sage)"}}/>
                <span style={{fontSize:13,color:m.emergency?"var(--paper)":"var(--sage)"}}>
                  {m.emergency||(isSelf&&!readOnly?"Tap to add emergency contact":"No emergency contact")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {members.length===0 && <Empty icon={Ic.users} text="Add your crew. Costs split evenly across everyone here."/>}
    </div>
  );
}
