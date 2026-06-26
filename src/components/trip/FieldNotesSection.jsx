import React, { useState, useMemo } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';

export default function FieldNotesSection({trip,me,isAdmin,patch}){
  const [text,setText]=useState("");
  const [posting,setPosting]=useState(false);

  const notes=useMemo(()=>[...(trip.fieldNotes||[])].sort((a,b)=>b.createdAt-a.createdAt),[trip.fieldNotes]);

  const fmtAge=(ts)=>{
    const diff=Date.now()-ts;
    if(diff<60000) return "just now";
    if(diff<3600000) return `${Math.floor(diff/60000)}m ago`;
    if(diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"});
  };

  const post=async()=>{
    const t=text.trim(); if(!t||posting) return;
    setPosting(true);
    try{
      const newNote={id:uid(),authorId:me.id,authorName:me.name,text:t,createdAt:Date.now()};
      await patch({fieldNotes:[...(trip.fieldNotes||[]),newNote]});
      setText("");
    }finally{ setPosting(false); }
  };

  const del=async(noteId)=>{
    if(!confirm("Delete this note?")) return;
    await patch({fieldNotes:(trip.fieldNotes||[]).filter(n=>n.id!==noteId)});
  };

  return (
    <div style={St.block}>
      <div style={St.blockHead}><span>Field Notes</span><Ic.edit style={{...ic(13),color:"var(--sage)"}}/></div>
      {notes.length===0
        ? <div style={{fontSize:13,color:"var(--sage)",textAlign:"center",padding:"10px 0 6px"}}>No notes yet — be the first to post.</div>
        : <div style={{maxHeight:260,overflowY:"auto",display:"grid",gap:8,marginBottom:10}}>
            {notes.map(n=>(
              <div key={n.id} style={{background:"var(--night)",borderRadius:10,padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:12.5,fontWeight:700,color:"var(--ember2)"}}>{n.authorName}</span>
                  <span style={{fontSize:11,color:"var(--mist)"}}>·</span>
                  <span style={{fontSize:11,color:"var(--sage)"}}>{fmtAge(n.createdAt)}</span>
                  {isAdmin &&
                    <button style={{...St.iconBtn,marginLeft:"auto",padding:2}} onClick={()=>del(n.id)} aria-label="Delete note">
                      <Ic.trash style={ic(13)}/>
                    </button>}
                </div>
                <div style={{fontSize:13.5,lineHeight:1.5,color:"var(--paper)",whiteSpace:"pre-wrap"}}>{n.text}</div>
              </div>
            ))}
          </div>}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <input style={{...St.input,fontSize:13}} placeholder="Leave a note…" value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();post();} }}/>
        <button style={{...St.smallBtn,opacity:posting||!text.trim()?0.5:1}}
          onClick={post} disabled={posting||!text.trim()}>Post</button>
      </div>
    </div>
  );
}
