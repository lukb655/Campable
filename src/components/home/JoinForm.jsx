import { useState } from 'react';
import { HAS_FB } from '../../firebase.js';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

export default function JoinForm({onJoin,onClose}){
  const [c,setC]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const go=async()=>{
    if(c.length<6||busy) return;
    setBusy(true); setErr("");
    try{
      const ok=await onJoin(c);
      if(!ok) setErr("No trip found with that code — double-check with your crew.");
    }catch(e){
      const msg=e.code==="permission-denied"
        ?"Permission denied — check Firebase rules allow authenticated users to query trips by code."
        :e.message||"Couldn't join. Check your connection and try again.";
      setErr(msg);
    }
    setBusy(false);
  };
  return (
    <Modal title="Join a trip" onClose={onClose}>
      <p style={{...St.sub,marginTop:0}}>Enter the 6-character code from whoever planned it.</p>
      <input style={{...St.input,textAlign:"center",fontFamily:"'Oswald',sans-serif",fontSize:24,letterSpacing:6,textTransform:"uppercase"}}
        maxLength={6} autoFocus value={c} placeholder="ABC123"
        onChange={e=>{setC(e.target.value.toUpperCase());setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/>
      {err && <div style={St.errText}>{err}</div>}
      {!HAS_FB && <div style={{...St.hintSm,marginTop:8}}>⚠ Join only works across devices in Firebase mode — local mode is single-device only.</div>}
      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} disabled={c.length<6||busy} onClick={go}>
          {busy?<Ic.tent style={ic(15)} className="spin"/>:"Join trip"}
        </button>
      </div>
    </Modal>
  );
}
