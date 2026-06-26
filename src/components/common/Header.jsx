import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';

export default function Header({me,mode,photo,onProfile}){
  return (
    <header style={St.header}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={St.logoMark}><Ic.tent style={{width:20,height:20,color:"var(--night)"}}/></div>
        <div>
          <div style={St.brand}>CAMP<span style={{color:"var(--ember)"}}>ABLE</span></div>
          <div style={St.tagline}>plan · pack · go together</div>
        </div>
      </div>
      <button style={St.profileBtn} onClick={onProfile}>
        <span style={{...St.modeDot,background:mode==="live"?"#5BBF8A":"var(--gold)"}}/>
        {photo
          ?<img src={photo} alt="" style={{...St.avatarSm,objectFit:"cover",padding:0}}/>
          :<span style={St.avatarSm}>{(me.name||"?").slice(0,1).toUpperCase()}</span>}
      </button>
    </header>
  );
}
