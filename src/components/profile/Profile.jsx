import React, { useState } from 'react';
import { Data } from '../../data.js';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, fileToCompressedDataURL } from '../../utils.js';
import PrivacyPolicy from '../auth/PrivacyPolicy.jsx';

export default function Profile({me,mode,photo,onPhotoChange,onBack,onSignOut,onDeleted,flash}){
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [delConfirm,setDelConfirm]=useState(false);
  const [delBusy,setDelBusy]=useState(false);
  const [delErr,setDelErr]=useState("");
  const [photoBusy,setPhotoBusy]=useState(false);

  const handlePhoto=async(file)=>{
    if(!file)return; setPhotoBusy(true);
    try{ const d=await fileToCompressedDataURL(file,800,0.75); onPhotoChange(d); flash("Profile photo updated"); }
    catch(e){ flash(e.message||"Couldn't load photo"); }
    setPhotoBusy(false);
  };

  const deleteAccount=async()=>{
    setDelBusy(true); setDelErr("");
    try{ await Data.deleteAccount(me.id); onDeleted(); }
    catch(e){ setDelErr(e.message||"Couldn't delete account."); setDelBusy(false); }
  };

  return (
    <div className="fade">
      <button style={St.backBtn} onClick={onBack}><Ic.back style={ic(16)}/> Back</button>
      <h1 style={St.h1}>Account</h1>

      <div style={St.block}>
        <div style={St.blockHead}><span>Profile</span></div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{position:"relative",flexShrink:0}}>
            {photo
              ?<img src={photo} alt="" style={{width:60,height:60,borderRadius:16,objectFit:"cover",display:"block"}}/>
              :<div style={{...St.avatar,width:60,height:60,borderRadius:16,fontSize:24}}>{me.name.slice(0,1).toUpperCase()}</div>}
            <label style={{position:"absolute",bottom:-4,right:-4,background:"var(--ember)",borderRadius:8,
              width:24,height:24,display:"grid",placeItems:"center",cursor:"pointer",border:"2px solid var(--night)"}}>
              {photoBusy?<Ic.tent style={{...ic(12),color:"var(--night)"}} className="spin"/>:<Ic.img style={{...ic(12),color:"var(--night)"}}/>}
              <input type="file" accept="image/*" style={{display:"none"}} disabled={photoBusy}
                onChange={e=>{handlePhoto(e.target.files[0]);e.target.value="";}}/>
            </label>
          </div>
          <div>
            <div style={St.itemTitle}>{me.name}</div>
            <div style={St.itemMeta}>{me.email||"local account"}</div>
          </div>
        </div>
        <button style={{...St.dangerBtn}} onClick={onSignOut}><Ic.logout style={ic(15)}/> Sign out</button>
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Sync status</span>
          <span style={{...St.modeBadge,background:mode==="live"?"rgba(91,191,138,.15)":"rgba(232,178,60,.15)",
            color:mode==="live"?"#7FD8A8":"var(--gold)"}}>
            {mode==="live"?<Ic.cloud style={ic(13)}/>:<Ic.phone style={ic(13)}/>}
            {mode==="live"?"Live":"Local · this device only"}
          </span>
        </div>
        <p style={{...St.sub,marginTop:4}}>
          {mode==="live"
            ?"Your account and trips sync across all your devices."
            :"Add Firebase keys (setup guide) to sync across phones."}
        </p>
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Add to Home Screen</span></div>
        <ol style={St.ol}>
          <li>Open in <b>Safari</b>.</li>
          <li>Tap the <b>Share</b> button.</li>
          <li>Choose <b>Add to Home Screen</b>.</li>
        </ol>
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Legal</span></div>
        <button style={St.linkBtn} onClick={()=>setShowPrivacy(true)}>Privacy Policy</button>
      </div>

      <div style={St.block}>
        <div style={St.blockHead}><span>Danger zone</span></div>
        {!delConfirm
          ?<button style={St.dangerBtn} onClick={()=>setDelConfirm(true)}><Ic.trash style={ic(15)}/> Delete account</button>
          :<div>
            <p style={{...St.sub,marginTop:0,marginBottom:12,color:"#E78A87"}}>
              This permanently deletes your account and removes you from all trips. If you own any trips, they will be deleted too. This cannot be undone.
            </p>
            {delErr&&<div style={St.errText}>{delErr}</div>}
            <div style={{display:"flex",gap:10}}>
              <button style={St.ghostBtn} onClick={()=>{setDelConfirm(false);setDelErr("");}}>Cancel</button>
              <button style={{...St.dangerBtn,background:"rgba(217,83,79,.15)"}} disabled={delBusy} onClick={deleteAccount}>
                {delBusy?<Ic.tent style={ic(15)} className="spin"/>:<><Ic.trash style={ic(15)}/> Yes, delete everything</>}
              </button>
            </div>
          </div>}
      </div>

      {showPrivacy&&<PrivacyPolicy onClose={()=>setShowPrivacy(false)}/>}
    </div>
  );
}
