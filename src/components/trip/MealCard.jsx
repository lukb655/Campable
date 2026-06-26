import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';

export default function MealCard({meal,members,nameOf,readOnly,onDel,onUpdate,onAddItem,onToggleItem,onDelItem,onUpdateItem}){
  const [exp,setExp]=useState(false);
  const [iname,setIname]=useState(""); const [iqty,setIqty]=useState("");
  const items=meal.items||[];
  const got=items.filter(i=>i.got).length;
  return (
    <div style={St.mealCard}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={St.dayChip}>{meal.day}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={St.itemTitle}>{meal.title}</div>
          <div style={St.itemMeta}>
            ${(+meal.cost||0).toFixed(2)}
            {meal.paidBy?` · paid by ${nameOf(meal.paidBy)}`:""}
            {meal.responsible?` · Cook: ${nameOf(meal.responsible)}`:""}
          </div>
        </div>
        {!readOnly&&<button style={St.iconBtn} onClick={onDel} aria-label="Delete meal"><Ic.trash style={ic(15)}/></button>}
      </div>

      <button style={St.expandRow} onClick={()=>setExp(!exp)}>
        <Ic.cart style={{...ic(13),color:"var(--sage)"}}/>
        {items.length?`${items.length} ingredient${items.length>1?"s":""} · ${got}/${items.length} got`:"Add ingredients"}
        <Ic.chev style={{...ic(14),marginLeft:"auto",transform:exp?"rotate(90deg)":"none",transition:"transform .2s"}}/>
      </button>

      {exp &&
        <div style={St.itemsBox}>
          {items.map(i=>(
            <div key={i.id} style={St.shopRow}>
              <button style={{...St.checkBtn,...(i.got?St.checkOn:{})}} onClick={()=>onToggleItem(i.id)} aria-label="Got it">
                {i.got && <Ic.check style={{width:12,height:12,color:"var(--night)"}}/>}
              </button>
              <span style={{flex:1,textDecoration:i.got?"line-through":"none",opacity:i.got?.55:1,fontSize:13.5}}>
                {i.name}{i.qty?` · ${i.qty}`:""}
              </span>
              {members.length>0 && onUpdateItem && !readOnly && (
                <select style={St.itemRespSelect} value={i.responsible||""} title="Who's bringing this?"
                  onChange={e=>onUpdateItem(i.id,{responsible:e.target.value})}>
                  <option value="">—</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.name.split(" ")[0]}</option>)}
                </select>
              )}
              {!readOnly&&<button style={St.iconBtn} onClick={()=>onDelItem(i.id)} aria-label="Remove"><Ic.x style={ic(13)}/></button>}
            </div>
          ))}
          {!readOnly&&<div style={{display:"flex",gap:6,marginTop:8}}>
            <input style={{...St.input,flex:2}} placeholder="Ingredient" value={iname} onChange={e=>setIname(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"){onAddItem(iname,iqty);setIname("");setIqty("");}}}/>
            <input style={{...St.input,flex:1}} placeholder="Qty" value={iqty} onChange={e=>setIqty(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"){onAddItem(iname,iqty);setIname("");setIqty("");}}}/>
            <button style={St.smallBtn} onClick={()=>{onAddItem(iname,iqty);setIname("");setIqty("");}}><Ic.plus style={ic(15)}/></button>
          </div>}
        </div>}
    </div>
  );
}
