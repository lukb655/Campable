import { useState } from 'react';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic, fileToCompressedDataURL } from '../../utils.js';

export default function ImagePicker({label,current,onPicked,onClear,flash}){
  const [busy,setBusy]=useState(false);
  const handle=async(file)=>{
    if(!file)return; setBusy(true);
    try{ const d=await fileToCompressedDataURL(file); onPicked(d); }
    catch(e){ flash&&flash(e.message||"Couldn't load that image"); }
    setBusy(false);
  };
  return (
    <div style={St.block}>
      <div style={St.blockHead}><span>{label}</span><Ic.img style={{...ic(13),color:"var(--sage)"}}/></div>
      {current &&
        <div style={{position:"relative",marginBottom:10}}>
          <img src={current} alt="" style={St.coverPreview}/>
          <button style={St.photoDel} onClick={onClear} aria-label="Remove"><Ic.x style={ic(13)}/></button>
        </div>}
      <label style={{...St.smallBtn,display:"inline-flex",cursor:"pointer",opacity:busy?.6:1}}>
        {busy ? <><Ic.tent style={ic(14)} className="spin"/> Working…</> : <><Ic.img style={ic(14)}/> {current?"Replace photo":"Choose photo"}</>}
        <input type="file" accept="image/*" style={{display:"none"}} disabled={busy}
          onChange={e=>{handle(e.target.files[0]);e.target.value="";}}/>
      </label>
      <div style={St.hintSm}>JPG, PNG, WEBP, or GIF · max 15 MB. Photos are resized automatically. HEIC (iPhone default) must be exported as JPEG first.</div>
    </div>
  );
}
