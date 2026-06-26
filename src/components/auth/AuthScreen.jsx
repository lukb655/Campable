import { useState } from 'react';
import { Auth } from '../../data.js';
import { HAS_FB } from '../../firebase.js';
import { seedFor } from '../../seed.js';
import { PRIVACY_POLICY_TEXT } from '../../data.js';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';
import { Contours, Field } from '../common/Modal.jsx';

export default function AuthScreen({onAuthed, flash}){
  const [mode,setMode]=useState("up");
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [name,setName]=useState("");
  const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  const [agreedToPolicy,setAgreedToPolicy]=useState(false);
  const [policyOpen,setPolicyOpen]=useState(false);

  const go=async()=>{
    setErr(""); setBusy(true);
    try{
      if(mode==="up"){
        if(!name.trim()) throw new Error("Add your name so the crew knows who you are.");
        if(pass.length<6) throw new Error("Use at least 6 characters for your password.");
        if(!agreedToPolicy) throw new Error("Please read and agree to the Privacy Policy.");
        const u=await Auth.signUp(email,pass,name.trim(),true);
        seedFor(u); onAuthed(u);
      }else{
        const u=await Auth.signIn(email,pass); onAuthed(u);
      }
    }catch(e){ setErr(e.message||"Something went wrong."); }
    setBusy(false);
  };

  return (
    <div style={{...St.app,display:"grid",placeItems:"center",padding:24}}>
      <Contours/>
      <div style={{...St.card2,maxWidth:380,width:"100%",padding:28}} className="fade">
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{...St.logoMark,margin:"0 auto 14px",width:52,height:52}}>
            <Ic.tent style={{width:26,height:26,color:"var(--night)"}}/>
          </div>
          <div style={{...St.brand,fontSize:26}}>CAMP<span style={{color:"var(--ember)"}}>ABLE</span></div>
          <p style={{...St.sub,marginTop:6}}>{mode==="up"?"Make an account so your trips follow you to any phone.":"Welcome back. Sign in to your trips."}</p>
        </div>
        {mode==="up" &&
          <Field label="Your name"><input style={St.input} value={name} autoFocus
            placeholder="Name" onChange={e=>setName(e.target.value)}/></Field>}
        <Field label="Email"><input style={St.input} type="email" value={email} autoComplete="email"
          placeholder="you@example.com" onChange={e=>setEmail(e.target.value)}/></Field>
        <Field label="Password"><input style={St.input} type="password" value={pass}
          autoComplete={mode==="up"?"new-password":"current-password"}
          placeholder="••••••" onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&go()}/></Field>
        {mode==="up" && (
          <div style={{marginTop:16,borderTop:"1px solid var(--line)",paddingTop:16}}>
            <button
              onClick={()=>setPolicyOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                width:"100%",background:"none",border:"none",color:"var(--paper)",
                padding:0,cursor:"pointer",gap:8,marginBottom:policyOpen?12:0,fontSize:13,fontWeight:600}}>
              <span>Privacy Policy</span>
              <Ic.chev style={{...ic(14),color:"var(--sage)",
                transform:policyOpen?"rotate(90deg)":"none",transition:"transform .2s"}}/>
            </button>
            {policyOpen && (
              <textarea
                readOnly
                value={PRIVACY_POLICY_TEXT}
                style={{width:"100%",height:200,padding:12,background:"var(--moss)",
                  color:"var(--paper)",border:"1px solid var(--line)",borderRadius:8,
                  fontFamily:"'Inter',sans-serif",fontSize:12,lineHeight:1.5,
                  marginBottom:12,resize:"none",overflowY:"auto"}}/>
            )}
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={e=>setAgreedToPolicy(e.target.checked)}
                style={{cursor:"pointer",width:18,height:18}}/>
              <span>I have read and agree to the Privacy Policy</span>
            </label>
          </div>
        )}
        {err && <div style={St.errText}>{err}</div>}
        <button style={{...St.primaryBtn,width:"100%",justifyContent:"center",marginTop:8,opacity:(busy||mode==="up"&&!agreedToPolicy)?.6:1}}
          disabled={busy||mode==="up"&&!agreedToPolicy} onClick={go}>
          {busy ? <Ic.tent style={{...ic(16)}} className="spin"/> : (mode==="up"?"Create account":"Sign in")}
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"var(--sage)"}}>
          {mode==="up" ? "Already have an account? " : "New here? "}
          <button style={St.linkBtn} onClick={()=>{setErr("");setMode(mode==="up"?"in":"up");setAgreedToPolicy(false);setPolicyOpen(false);}}>
            {mode==="up"?"Sign in":"Create one"}
          </button>
        </div>
        {!HAS_FB &&
          <div style={St.localBanner}>
            <Ic.phone style={{...ic(13),color:"var(--gold)"}}/>
            Demo mode: accounts live on this device only. Add Firebase keys (setup guide) for real cross-phone login.
          </div>}
      </div>
    </div>
  );
}
