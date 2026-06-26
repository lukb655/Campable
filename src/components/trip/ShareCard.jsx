import React from 'react';
import { St } from '../../styles.js';

export default function ShareCard({trip,flash,isAdmin,patch}){
  const joinCode=trip.joinCode;
  const copy=async()=>{try{await navigator.clipboard.writeText(joinCode);flash("Code copied");}catch{flash(joinCode);}};
  return (
    <div style={{...St.shareCard,flexDirection:"column",alignItems:"stretch"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={St.shareLabel}>Invite code</div>
          <div style={St.shareCode}>{joinCode}</div>
          <div style={St.hintSm}>Friends tap "Join" and type this in.</div>
        </div>
        <button style={St.smallBtn} onClick={copy}>Copy Code</button>
      </div>
      {isAdmin && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.1)",marginTop:10,paddingTop:10}}>
          <span style={{fontSize:12,color:"var(--sage)"}}>Show code to crew</span>
          <button style={{...St.toggle,...(trip.shareCode?St.toggleOn:{})}}
            onClick={()=>patch({shareCode:!trip.shareCode})}>
            <span style={{...St.toggleKnob,...(trip.shareCode?St.toggleKnobOn:{})}}/>
            {trip.shareCode?"On":"Off"}
          </button>
        </div>
      )}
    </div>
  );
}
