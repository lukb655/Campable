import { useState, useEffect, useCallback } from 'react';
import { Auth, Data } from './data.js';
import { HAS_FB } from './firebase.js';
import { seedFor } from './seed.js';
import { St } from './styles.js';
import { Ic } from './icons.jsx';
import { ic } from './utils.js';
import Splash from './components/common/Splash.jsx';
import Header from './components/common/Header.jsx';
import { Contours } from './components/common/Modal.jsx';
import { Empty } from './components/common/ListHead.jsx';
import AuthScreen from './components/auth/AuthScreen.jsx';
import Home from './components/home/Home.jsx';
import Profile from './components/profile/Profile.jsx';
import TripShell from './components/trip/TripShell.jsx';

export default function App(){
  const [me,setMe]=useState(undefined);
  const [trips,setTrips]=useState(null);
  const [route,setRoute]=useState({name:"trips"});
  const [toast,setToast]=useState(null);
  const [profilePhoto,setProfilePhoto]=useState("");
  const flash=useCallback(m=>{setToast(m);setTimeout(()=>setToast(null),2400);},[]);

  useEffect(()=>{ Auth.init(u=>{ setMe(u); if(u){seedFor(u);Data.getProfile(u.id).then(p=>setProfilePhoto(p.photo||""));}else setTrips(null); }); },[]);

  useEffect(()=>{
    if(!me){return;}
    const unsub=Data.subscribeTrips(me.id,list=>{
      list.sort((a,b)=>(a.start||"9999").localeCompare(b.start||"9999"));
      setTrips(list);
    });
    return ()=>unsub&&unsub();
  },[me]);

  if(me===undefined) return <Splash/>;
  if(me===null) return <AuthScreen onAuthed={u=>setMe(u)} flash={flash}/>;
  if(trips===null) return <Splash/>;

  const current = route.name==="trip" ? trips.find(t=>t.id===route.id) : null;

  return (
    <div style={St.app}>
      <Contours/>
      {route.name!=="trip" &&
        <Header me={me} mode={HAS_FB?"live":"local"} photo={profilePhoto} onProfile={()=>setRoute({name:"me"})}/>}
      <main style={{...St.main, ...(route.name==="trip"?{padding:"0 0 0",maxWidth:"none"}:{})}}>
        {route.name==="trips" &&
          <Home trips={trips} me={me} flash={flash}
            onOpen={id=>setRoute({name:"trip",id})}
            onOpenSettings={id=>setRoute({name:"trip",id,tab:"settings"})}/>}
        {route.name==="trip" && current &&
          <TripShell trip={current} me={me} flash={flash} onBack={()=>setRoute({name:"trips"})} initialTab={route.tab||"plan"}/>}
        {route.name==="trip" && !current &&
          <div style={{...St.main}}><Empty icon={Ic.mtn} text="This trip is no longer available."/>
            <button style={St.primaryBtn} onClick={()=>setRoute({name:"trips"})}>Back to trips</button></div>}
        {route.name==="me" &&
          <Profile me={me} mode={HAS_FB?"live":"local"} photo={profilePhoto}
            onPhotoChange={p=>{
              setProfilePhoto(p);
              Data.updateProfile(me.id,{photo:p});
              (trips||[]).forEach(t=>{
                const members=(t.members||[]).map(m=>m.id===me.id?{...m,photo:p}:m);
                Data.updateTrip(t.id,{members});
              });
            }}
            onBack={()=>setRoute({name:"trips"})}
            onSignOut={async()=>{await Auth.signOut();setMe(null);setRoute({name:"trips"});setProfilePhoto("");}}
            onDeleted={()=>{setMe(null);setTrips(null);setRoute({name:"trips"});setProfilePhoto("");}}
            flash={flash}/>}
      </main>
      {toast && <div style={St.toast} className="fade"><Ic.check style={{width:15,height:15,color:"var(--gold)"}}/> {toast}</div>}
    </div>
  );
}
