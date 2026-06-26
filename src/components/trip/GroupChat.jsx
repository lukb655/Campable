import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';

export default function GroupChat({trip,me,patch}){
  const messages=useMemo(()=>[...(trip.messages||[])].sort((a,b)=>a.createdAt-b.createdAt),[trip.messages]);
  const [msgText,setMsgText]=useState("");
  const [sending,setSending]=useState(false);
  const messagesEndRef=useRef(null);

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages.length]);

  const members=trip.members||[];

  const handleSend=async()=>{
    if(!msgText.trim()||sending)return;
    setSending(true);
    try{
      const newMsg={id:uid(),senderId:me.id,senderName:me.name,text:msgText.trim(),createdAt:Date.now()};
      await patch({messages:[...(trip.messages||[]),newMsg]});
      setMsgText("");
    }catch(e){
      console.error("Failed to send message",e);
    }finally{
      setSending(false);
    }
  };

  const formatTime=ts=>{
    const d=new Date(ts);
    const now=new Date();
    const sameDay=d.toDateString()===now.toDateString();
    if(sameDay){
      return d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
    }
    return d.toLocaleDateString(undefined,{month:"short",day:"numeric"});
  };

  return (
    <div style={{...St.block,display:"flex",flexDirection:"column",height:440,marginBottom:16}}>
      <div style={St.blockHead}><span>Messages</span><Ic.chat style={{...ic(13),color:"var(--sage)"}}/></div>

      <div style={St.messagesBox}>
        {messages.map(msg=>{
          const sender=members.find(m=>m.id===msg.senderId);
          const isSelf=msg.senderId===me.id;
          return (
            <div key={msg.id} style={{...St.messageRow,justifyContent:isSelf?"flex-end":"flex-start"}}>
              {!isSelf&&(
                <div style={{flexShrink:0}}>
                  {sender?.photo
                    ?<img src={sender.photo} alt="" style={{width:32,height:32,borderRadius:8,objectFit:"cover"}}/>
                    :<div style={{width:32,height:32,borderRadius:8,background:"var(--mist)",display:"grid",placeItems:"center",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:13}}>
                      {(msg.senderName||"?").slice(0,1).toUpperCase()}
                    </div>}
                </div>
              )}
              <div style={{flex:1,maxWidth:"85%",alignItems:isSelf?"flex-end":"flex-start",display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:12.5,fontWeight:600,marginBottom:2,color:"var(--paper)"}}>
                  {msg.senderName}{isSelf?" (you)":""}
                </div>
                <div style={{...St.messageBubble,background:isSelf?"var(--ember)":"var(--moss)",color:isSelf?"var(--night)":"var(--paper)"}}>
                  <div style={St.messageText}>{msg.text}</div>
                </div>
                <div style={{...St.messageMeta,fontSize:11,marginTop:3}}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}/>
      </div>

      <div style={St.inputBox}>
        <textarea
          style={{...St.messageInput,height:36}}
          placeholder="Send a message..."
          value={msgText}
          onChange={e=>setMsgText(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
          disabled={sending}
        />
        <button
          style={{...St.smallBtn,flexShrink:0,height:36,width:36,padding:0,display:"grid",placeItems:"center"}}
          onClick={handleSend}
          disabled={sending||!msgText.trim()}
          aria-label="Send">
          <Ic.share style={ic(15)}/>
        </button>
      </div>
    </div>
  );
}
