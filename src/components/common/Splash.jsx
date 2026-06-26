import { useState, useEffect } from 'react';
import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { Contours } from './Modal.jsx';

export default function Splash(){
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 6000); return () => clearTimeout(t); }, []);
  return <div style={{...St.app,display:"grid",placeItems:"center"}}>
    <Contours/>
    <div style={{textAlign:"center",padding:24}}>
      <Ic.tent style={{width:40,height:40,color:"var(--ember)"}} className="spin"/>
      <div style={{...St.brand,marginTop:12}}>CAMP<span style={{color:"var(--ember)"}}>ABLE</span></div>
      {slow &&
        <div style={{marginTop:20,color:"var(--sage)",fontSize:13,lineHeight:1.6,maxWidth:280}}>
          <p style={{margin:"0 0 12px"}}>Taking longer than expected. This usually means the Firebase scripts are slow to load on your network.</p>
          <button style={St.ghostBtn} onClick={() => window.location.reload()}>Reload</button>
        </div>}
    </div>
  </div>;
}
