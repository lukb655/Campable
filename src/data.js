import firebase from 'firebase/compat/app';
import { HAS_FB, db, auth, _configReady, _initFirebase } from './firebase.js';
import { uid, code6 } from './utils.js';

export { HAS_FB, _configReady, _initFirebase };

/* TODO: Replace this with final privacy policy text or fetch from config/privacyPolicy in Firestore */
export const PRIVACY_POLICY_TEXT=`Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

1. Information We Collect
We collect information you provide directly to us, such as your name, email address, and camping trip data.

2. How We Use Your Information
We use the information to provide, maintain, and improve our service, and to communicate with you about your account and trips.

3. Data Storage
Your trip data is stored securely in our servers. You control who can access your trips through sharing codes.

4. Third-Party Services
We use Firebase for authentication and data storage. Please review Firebase's privacy policy at https://policies.google.com/privacy.

5. Your Rights
You can access, update, or delete your account information at any time through your account settings.

6. Contact Us
If you have questions about this privacy policy, please contact us through our support channels.`;

export const LK={users:"campable:users",session:"campable:session",trips:"campable:trips"};
export function lread(k,d){try{return JSON.parse(localStorage.getItem(k))??d;}catch{return d;}}
export function lwrite(k,v){localStorage.setItem(k,JSON.stringify(v));}
export const localSubs=new Set();
function localPing(){const all=lread(LK.trips,{});localSubs.forEach(fn=>fn(all));}
export const fieldNoteSubs=new Map();
export function pingFieldNotes(tripId){
  const key=`campable:fieldNotes:${tripId}`;
  const notes=lread(key,[]).sort((a,b)=>b.createdAt-a.createdAt);
  (fieldNoteSubs.get(tripId)||new Set()).forEach(fn=>fn(notes));
}
export const messageSubs=new Map();
export function pingMessages(tripId){
  const key=`campable:messages:${tripId}`;
  const messages=lread(key,[]).sort((a,b)=>a.createdAt-b.createdAt);
  (messageSubs.get(tripId)||new Set()).forEach(fn=>fn(messages));
}

/* simple non-cryptographic hash for the LOCAL fallback only.
   (Real security comes from Firebase Auth when configured.) */
export function weakHash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h);}

export const blankMember=(me)=>({id:me.id,name:me.name,email:me.email||"",emergency:"",dietary:"",photo:""});

export const Auth = {
  current:null,
  async init(onUser){
    try { await _configReady; } catch {}
    _initFirebase();
    if(HAS_FB){
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn("Firebase auth timed out — showing login screen.");
          onUser(null);
        }
      }, 8000);
      auth.onAuthStateChanged(async u => {
        if (!resolved) { resolved = true; clearTimeout(timeout); }
        try {
          if (u && !u.email) {
            await auth.signOut();
            this.current = null;
            onUser(null);
            return;
          }
          this.current = u ? {id:u.uid, email:u.email||"", name:(u.displayName||(u.email?u.email.split("@")[0]:"Camper"))} : null;
          onUser(this.current);
        } catch(e) {
          console.warn("Auth state parse error:", e.message);
          this.current = null;
          onUser(null);
        }
      });
      return;
    }
    const s=lread(LK.session,null);
    const users=lread(LK.users,{});
    const found = s && users[s] && users[s].name && users[s].email ? users[s] : null;
    this.current = found ? {id:s, email:found.email, name:found.name} : null;
    onUser(this.current);
  },
  async signUp(email,password,name,privacyAgreed){
    if(HAS_FB){
      const cred=await auth.createUserWithEmailAndPassword(email.trim(),password);
      await cred.user.updateProfile({displayName:name});
      if(privacyAgreed){
        await db.collection("profiles").doc(cred.user.uid).set({agreedToPrivacyPolicy:true,privacyPolicyAgreedAt:Date.now()},{merge:true});
      }
      this.current={id:cred.user.uid,email:email.trim(),name};
      return this.current;
    }
    const users=lread(LK.users,{});
    const key=email.trim().toLowerCase();
    if(Object.values(users).some(u=>u.email===key)) throw new Error("That email already has an account.");
    const id=uid();
    const userData={email:key,name,pass:weakHash(password)};
    if(privacyAgreed){
      userData.agreedToPrivacyPolicy=true;
      userData.privacyPolicyAgreedAt=Date.now();
    }
    users[id]=userData;
    lwrite(LK.users,users); lwrite(LK.session,id);
    this.current={id,email:key,name}; return this.current;
  },
  async signIn(email,password){
    if(HAS_FB){
      const cred=await auth.signInWithEmailAndPassword(email.trim(),password);
      this.current={id:cred.user.uid,email:cred.user.email||email.trim(),name:(cred.user.displayName||(email?email.split("@")[0]:"Camper"))};
      return this.current;
    }
    const users=lread(LK.users,{});
    const key=email.trim().toLowerCase();
    const entry=Object.entries(users).find(([,u])=>u.email===key);
    if(!entry||entry[1].pass!==weakHash(password)) throw new Error("Wrong email or password.");
    lwrite(LK.session,entry[0]);
    this.current={id:entry[0],email:key,name:entry[1].name}; return this.current;
  },
  async signOut(){
    if(HAS_FB){ await auth.signOut(); this.current=null; return; }
    localStorage.removeItem(LK.session); this.current=null;
  }
};

export const Data = {
  subscribeTrips(myId, cb){
    if(!HAS_FB){
      const fn=(all)=>cb(Object.values(all).filter(t=>(t.memberIds||[]).includes(myId)));
      localSubs.add(fn); fn(lread(LK.trips,{}));
      return ()=>localSubs.delete(fn);
    }
    return db.collection("trips").where("memberIds","array-contains",myId)
      .onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), e=>console.error(e));
  },
  async createTrip(t){
    const full={...t, joinCode:code6(), createdAt:Date.now()};
    if(!HAS_FB){ const all=lread(LK.trips,{}); full.id=uid(); all[full.id]=full; lwrite(LK.trips,all); localPing(); return full; }
    const ref=await db.collection("trips").add(full); return {id:ref.id,...full};
  },
  async updateTrip(id,patch){
    if(!HAS_FB){ const all=lread(LK.trips,{}); if(all[id]){all[id]={...all[id],...patch};lwrite(LK.trips,all);localPing();} return; }
    await db.collection("trips").doc(id).update(patch);
  },
  async deleteTrip(id){
    if(!HAS_FB){ const all=lread(LK.trips,{}); delete all[id]; lwrite(LK.trips,all); localPing(); return; }
    await db.collection("trips").doc(id).delete();
  },
  async getProfile(uid){
    if(!HAS_FB){ const u=lread(LK.users,{})[uid]; return {photo:u?.photo||""}; }
    try{ const d=await db.collection("profiles").doc(uid).get(); return d.exists?d.data():{photo:""}; }catch{return {photo:""};}
  },
  async updateProfile(uid,fields){
    if(!HAS_FB){ const u=lread(LK.users,{}); if(u[uid]){u[uid]={...u[uid],...fields};lwrite(LK.users,u);} return; }
    await db.collection("profiles").doc(uid).set(fields,{merge:true});
  },
  async deleteAccount(uid){
    if(!HAS_FB){
      const u=lread(LK.users,{}); delete u[uid]; lwrite(LK.users,u);
      localStorage.removeItem(LK.session);
      const all=lread(LK.trips,{});
      Object.keys(all).forEach(id=>{
        if(all[id].ownerId===uid){delete all[id];}
        else{all[id].members=(all[id].members||[]).filter(m=>m.id!==uid);
          all[id].memberIds=(all[id].memberIds||[]).filter(x=>x!==uid);}
      });
      lwrite(LK.trips,all); return;
    }
    try{ await auth.currentUser.delete(); }
    catch(e){
      if(e.code==="auth/requires-recent-login")
        throw new Error("For security, please sign out and sign back in, then try again.");
      throw e;
    }
  },
  subscribeFieldNotes(tripId, cb){
    if(!HAS_FB){
      if(!fieldNoteSubs.has(tripId)) fieldNoteSubs.set(tripId,new Set());
      const key=`campable:fieldNotes:${tripId}`;
      const fn=()=>cb(lread(key,[]).sort((a,b)=>b.createdAt-a.createdAt));
      fieldNoteSubs.get(tripId).add(fn); fn();
      return ()=>fieldNoteSubs.get(tripId).delete(fn);
    }
    return db.collection("trips").doc(tripId).collection("fieldNotes")
      .orderBy("createdAt","desc")
      .onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), e=>console.error(e));
  },
  async addFieldNote(tripId, note){
    if(!HAS_FB){
      const key=`campable:fieldNotes:${tripId}`;
      const notes=lread(key,[]); const n={...note,id:uid()}; notes.unshift(n); lwrite(key,notes);
      pingFieldNotes(tripId); return n;
    }
    const ref=await db.collection("trips").doc(tripId).collection("fieldNotes").add(note);
    return {id:ref.id,...note};
  },
  async deleteFieldNote(tripId, noteId){
    if(!HAS_FB){
      const key=`campable:fieldNotes:${tripId}`;
      lwrite(key,lread(key,[]).filter(n=>n.id!==noteId)); pingFieldNotes(tripId); return;
    }
    await db.collection("trips").doc(tripId).collection("fieldNotes").doc(noteId).delete();
  },
  async joinByCode(me, codeInput){
    const code=codeInput.trim().toUpperCase();
    if(!HAS_FB){
      const all=lread(LK.trips,{}); const t=Object.values(all).find(x=>x.joinCode===code); if(!t)return null;
      t.members=t.members||[]; t.memberIds=t.memberIds||[];
      if(!t.memberIds.includes(me.id)){t.members.push(blankMember(me));t.memberIds.push(me.id);}
      all[t.id]=t; lwrite(LK.trips,all); localPing(); return t;
    }
    const q=await db.collection("trips").where("joinCode","==",code).limit(1).get();
    if(q.empty)return null;
    const doc=q.docs[0], t=doc.data();
    const members=t.members||[], memberIds=t.memberIds||[];
    if(!memberIds.includes(me.id)){members.push(blankMember(me));memberIds.push(me.id);}
    await doc.ref.update({members,memberIds});
    return {id:doc.id,...t,members,memberIds};
  },
  subscribeMessages(tripId, cb){
    if(!HAS_FB){
      if(!messageSubs.has(tripId)) messageSubs.set(tripId,new Set());
      const key=`campable:messages:${tripId}`;
      const fn=()=>cb(lread(key,[]).sort((a,b)=>a.createdAt-b.createdAt));
      messageSubs.get(tripId).add(fn); fn();
      return ()=>messageSubs.get(tripId).delete(fn);
    }
    return db.collection("trips").doc(tripId).collection("messages")
      .orderBy("createdAt","asc")
      .onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), e=>console.error(e));
  },
  async addMessage(tripId, msg){
    if(!HAS_FB){
      const key=`campable:messages:${tripId}`;
      const messages=lread(key,[]); const m={...msg,id:uid(),createdAt:Date.now()}; messages.push(m); lwrite(key,messages);
      pingMessages(tripId); return m;
    }
    const ref=await db.collection("trips").doc(tripId).collection("messages").add({...msg,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    return {id:ref.id,...msg,createdAt:Date.now()};
  }
};
