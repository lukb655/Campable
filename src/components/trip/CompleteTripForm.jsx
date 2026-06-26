import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Field } from '../common/Modal.jsx';

export default function CompleteTripForm({trip,patch,flash}){
  const today=new Date().toISOString().slice(0,10);
  const defaultDate=trip.end&&trip.end<=today?trip.end:today;
  const [completedAt,setCompletedAt]=useState(defaultDate);
  return (
    <div style={{marginTop:12}}>
      <Field label="Completion date">
        <input type="date" style={St.input} value={completedAt} max={today}
          onChange={e=>setCompletedAt(e.target.value)}/>
      </Field>
      <button style={{...St.smallBtn,marginTop:8,background:"rgba(91,191,138,.18)",color:"#5BBF8A",border:"1px solid rgba(91,191,138,.35)"}}
        onClick={()=>{patch({status:"completed",completedAt}); flash("Trip marked as completed");}}>
        <Ic.checkCircle style={ic(14)}/> Mark as completed
      </button>
    </div>
  );
}
