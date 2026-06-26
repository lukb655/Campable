import { HAS_FB } from './firebase.js';
import { lread, lwrite, blankMember } from './data.js';
import { uid, code6 } from './utils.js';

const LK_TRIPS = "campable:trips";

export function seedFor(me){
  if(HAS_FB) return;
  const all=lread(LK_TRIPS,{});
  if(Object.values(all).some(t=>(t.memberIds||[]).includes(me.id))) return;
  const id=uid();
  all[id]={
    id, ownerId:me.id, joinCode:code6(), createdAt:Date.now(),
    name:"Dolly Sods Overlander", location:"Dolly Sods Wilderness, WV",
    start:"2026-09-18", end:"2026-09-21", cover:"",
    campLat:39.0476, campLng:-79.3074, campLabel:"Bear Rocks dispersed site",
    notes:"Ridge camp, dark-sky photography, bring the 270 awning.",
    memberIds:[me.id],
    members:[{...blankMember(me), emergency:"Sam — (555) 014-2231"}],
    meals:[
      {id:uid(),day:"Fri",title:"Foil-pack steak & potatoes",responsible:me.id,
        items:[{id:uid(),name:"Ribeye steak",qty:"2 lb",got:false},{id:uid(),name:"Baby potatoes",qty:"1 bag",got:false},{id:uid(),name:"Foil",qty:"1 roll",got:false}],
        cost:38,paidBy:me.id,forAll:true},
    ],
    trails:[{id:uid(),name:"Bear Rocks Loop",miles:4.2,difficulty:"Moderate",lat:39.0489,lng:-79.3010,done:false}],
    waypoints:[{id:uid(),name:"Bear Rocks Vista",type:"Vista",lat:39.0489,lng:-79.3010}],
    photos:[],
    extras:[{id:uid(),name:"Coffee",category:"Drink",price:12,assignee:me.id}],
  };
  lwrite(LK_TRIPS,all);
}
