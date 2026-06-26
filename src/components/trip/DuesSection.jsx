import React from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';

export default function DuesSection({trip,me,patch,flash,isAdmin,readOnly}){
  if(!trip.duesEnabled) return null;
  const myMember=(trip.members||[]).find(m=>m.id===me.id);
  if(!myMember) return null;

  const markPaid=()=>{
    const paid=!trip.requireDuesConfirm;
    patch({members:(trip.members||[]).map(m=>
      m.id===me.id?{...m,duesPaid:paid,duesPending:!paid}:m
    )});
    flash(trip.requireDuesConfirm?"Payment submitted — awaiting admin confirmation":"Dues marked as paid");
  };

  return (
    <div style={St.block}>
      <div style={St.blockHead}><span>Trip Dues</span><Ic.dollar style={{...ic(13),color:"var(--sage)"}}/></div>
      {trip.duesAmount>0&&(
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)",marginBottom:12}}>
          ${(+trip.duesAmount).toFixed(2)}
          <span style={{fontSize:13,fontFamily:"'Inter',sans-serif",color:"var(--sage)",fontWeight:400}}> per person</span>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {myMember.duesPaid
          ?<div style={{color:"#5BBF8A",fontSize:13.5,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <Ic.check style={ic(16)}/> Your dues are confirmed paid</div>
          :myMember.duesPending
            ?<div style={{color:"var(--gold)",fontSize:13.5,fontWeight:600}}>⏳ Payment pending confirmation</div>
            :!readOnly&&<button style={St.primaryBtn} onClick={markPaid}><Ic.dollar style={ic(15)}/> Mark dues as paid</button>}
      </div>
      {isAdmin&&(trip.members||[]).some(m=>m.duesPending&&!m.duesPaid)&&(
        <div style={{marginTop:12,padding:"10px 12px",background:"rgba(232,178,60,.08)",border:"1px solid rgba(232,178,60,.25)",borderRadius:10,fontSize:12.5,color:"var(--gold)"}}>
          {(trip.members||[]).filter(m=>m.duesPending&&!m.duesPaid).length} pending confirmation — confirm in Settings tab.
        </div>
      )}
    </div>
  );
}
