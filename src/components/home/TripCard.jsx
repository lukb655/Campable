import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic, fmt } from '../../utils.js';

export default function TripCard({trip,me,onOpen,onSettings}){
  const isCreator=me && trip.ownerId===me.id;
  const creatorName=!isCreator
    ? ((trip.members||[]).find(m=>m.id===trip.ownerId)?.name||"")
    : "";
  const miles=(trip.trails||[]).reduce((a,t)=>a+(+t.miles||0),0);
  const dateLabel=trip.start?new Date(trip.start+"T00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"}):"TBD";
  return (
    <button style={St.card} onClick={onOpen}>
      <div style={{...St.cardCover,...(trip.cover?{backgroundImage:`url(${trip.cover})`}:{})}}>
        {!trip.cover && <Ic.tent style={{width:30,height:30,color:"var(--mist)",opacity:.7}}/>}
        <div style={St.coverGrad}/>
        <div style={St.cardDate}>{dateLabel}</div>
        {isCreator
          ? <div
              role="button" tabIndex={0}
              title="Trip settings"
              onClick={e=>{e.stopPropagation();onSettings&&onSettings();}}
              onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.stopPropagation();onSettings&&onSettings();}}}
              style={{position:"absolute",top:10,right:10,background:"rgba(15,26,23,.82)",
                color:"var(--sage)",borderRadius:8,padding:"4px 7px",cursor:"pointer",
                display:"flex",alignItems:"center",lineHeight:1}}>
              <Ic.gear style={ic(13)}/>
            </div>
          : <div style={{position:"absolute",top:10,right:10,background:"rgba(15,26,23,.82)",
              color:"var(--ember2)",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:8,
              fontFamily:"'Oswald',sans-serif",letterSpacing:.5}}>
              Joined
            </div>}
      </div>
      <div style={St.cardBody}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
          <div style={St.cardTitle}>{trip.name}</div>
          {trip.status==="completed" &&
            <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(91,191,138,.18)",
              color:"#5BBF8A",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:7,
              fontFamily:"'Oswald',sans-serif",letterSpacing:.4,border:"1px solid rgba(91,191,138,.3)",flexShrink:0}}>
              <Ic.checkCircle style={ic(10)}/> Done
            </div>}
        </div>
        {!isCreator && creatorName &&
          <div style={{fontSize:11,color:"var(--sage)",marginTop:2,marginBottom:1}}>by {creatorName}</div>}
        <div style={St.cardLoc}><Ic.pin style={ic(12)}/> {trip.location||"Location TBD"}</div>
        <div style={St.cardStats}>
          <span><Ic.foot style={ic(12)}/> {miles.toFixed(1)}mi</span>
          <span><Ic.users style={ic(12)}/> {(trip.members||[]).length}</span>
          <span><Ic.img style={ic(12)}/> {(trip.photos||[]).length}</span>
        </div>
      </div>
      <Ic.chev style={{...ic(18),...St.cardArrow}}/>
    </button>
  );
}
