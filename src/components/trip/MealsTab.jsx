import React, { useState, useMemo } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';
import { FormSheet } from '../common/Modal.jsx';
import MealCard from './MealCard.jsx';
import ShoppingList from './ShoppingList.jsx';
import ExtrasSection from './ExtrasSection.jsx';

export default function MealsTab({trip,patch,flash,readOnly}){
  const [open,setOpen]=useState(false);
  const [showList,setShowList]=useState(false);
  const [openExtra,setOpenExtra]=useState(false);
  const meals=trip.meals||[]; const members=trip.members||[];
  const extras=trip.extras||[];
  const nameOf=mid=>members.find(x=>x.id===mid)?.name||"";

  const addMeal=(m)=>{
    patch({meals:[...meals,{id:uid(),title:m.title,day:m.day,cost:+m.cost||0,paidBy:m.paidBy||"",
      responsible:m.responsible||"",forAll:m.forAll,items:[]}]});
    flash("Meal added"); setOpen(false);
  };
  const delMeal=(id)=>patch({meals:meals.filter(m=>m.id!==id)});
  const updateMeal=(id,fields)=>patch({meals:meals.map(m=>m.id===id?{...m,...fields}:m)});

  const addItem=(mealId,name,qty)=>{
    if(!name.trim())return;
    patch({meals:meals.map(m=>m.id===mealId?{...m,items:[...(m.items||[]),{id:uid(),name:name.trim(),qty:qty.trim(),got:false,responsible:""}]}:m)});
  };
  const toggleItem=(mealId,itemId)=>patch({meals:meals.map(m=>m.id===mealId?{...m,items:m.items.map(i=>i.id===itemId?{...i,got:!i.got}:i)}:m)});
  const delItem=(mealId,itemId)=>patch({meals:meals.map(m=>m.id===mealId?{...m,items:m.items.filter(i=>i.id!==itemId)}:m)});
  const updateItem=(mealId,itemId,fields)=>patch({meals:meals.map(m=>m.id===mealId?{...m,items:m.items.map(i=>i.id===itemId?{...i,...fields}:i)}:m)});

  const addExtra=(e)=>{
    if(!e.name.trim())return;
    patch({extras:[...extras,{id:uid(),name:e.name.trim(),category:e.category||"Drink",price:e.price?+e.price:0,assignee:e.assignee||""}]});
    flash("Extra added"); setOpenExtra(false);
  };
  const delExtra=(id)=>patch({extras:extras.filter(e=>e.id!==id)});
  const updateExtra=(id,fields)=>patch({extras:extras.map(e=>e.id===id?{...e,...fields}:e)});

  const allItems=useMemo(()=>{
    const out=[]; meals.forEach(m=>(m.items||[]).forEach(i=>out.push({...i,meal:m.title,mealId:m.id})));
    return out;
  },[meals]);
  const toBuy=allItems.filter(i=>!i.got).length;

  const days=["Thu","Fri","Sat","Sun","Mon"];

  return (
    <div style={St.pane}>
      <div style={St.listHead}>
        <h2 style={St.h2}>Meal plan</h2>
        <div style={{display:"flex",gap:8}}>
          <button style={St.smallBtn} onClick={()=>setShowList(true)}><Ic.cart style={ic(14)}/> List{toBuy?` (${toBuy})`:""}</button>
          {!readOnly&&<button style={St.smallBtn} onClick={()=>setOpen(true)}><Ic.plus style={ic(14)}/> Meal</button>}
        </div>
      </div>

      {meals.length===0 && <Empty icon={Ic.food} text="Plan meals, add the ingredients each one needs, and the app builds your shopping list."/>}

      <div style={{display:"grid",gap:12}}>
        {meals.map(m=>(
          <MealCard key={m.id} meal={m} members={members} nameOf={nameOf} readOnly={readOnly}
            onDel={()=>delMeal(m.id)} onUpdate={f=>updateMeal(m.id,f)}
            onAddItem={(n,q)=>addItem(m.id,n,q)} onToggleItem={iid=>toggleItem(m.id,iid)} onDelItem={iid=>delItem(m.id,iid)} onUpdateItem={(iid,f)=>updateItem(m.id,iid,f)}/>
        ))}
      </div>

      <ExtrasSection extras={extras} members={members} nameOf={nameOf} readOnly={readOnly}
        onAdd={()=>setOpenExtra(true)} onDel={delExtra} onUpdate={updateExtra}/>

      {open && !readOnly && <FormSheet title="Add meal" onClose={()=>setOpen(false)} onSave={addMeal}
        fields={[
          {k:"title",label:"Meal",type:"text",req:true},
          {k:"day",label:"Day",type:"select",opts:days.map(d=>({v:d,l:d})),def:"Fri"},
          {k:"cost",label:"Estimated cost ($)",type:"number"},
          {k:"paidBy",label:"Paid by",type:"select",allowEmpty:true,opts:members.map(x=>({v:x.id,l:x.name}))},
          {k:"responsible",label:"Cook (who's making this meal)",type:"select",allowEmpty:true,opts:members.map(x=>({v:x.id,l:x.name}))},
          {k:"forAll",label:"Split cost across whole crew",type:"bool",def:true},
        ]}/>}

      {openExtra && !readOnly && <FormSheet title="Add extra" onClose={()=>setOpenExtra(false)} onSave={addExtra}
        fields={[
          {k:"name",label:"Item name",type:"text",req:true},
          {k:"category",label:"Category",type:"select",opts:[{v:"Drink",l:"Drink"},{v:"Snack",l:"Snack"}],def:"Drink"},
          {k:"price",label:"Price ($)",type:"number"},
          {k:"assignee",label:"Assigned to",type:"select",allowEmpty:true,opts:members.map(x=>({v:x.id,l:x.name}))},
        ]}/>}

      {showList && <ShoppingList items={allItems} members={members} onToggle={(mealId,itemId)=>toggleItem(mealId,itemId)} onClose={()=>setShowList(false)}/>}
    </div>
  );
}
