import React from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

export default function ShoppingList({items,members,onToggle,onClose}){
  const remaining=items.filter(i=>!i.got);
  const done=items.filter(i=>i.got);
  const firstNameOf=mid=>members?(members.find(x=>x.id===mid)?.name.split(" ")[0]||""):"";
  return (
    <Modal title="Shopping list" onClose={onClose}>
      {items.length===0 && <p style={St.sub}>No ingredients yet. Open a meal and add what it needs.</p>}
      {remaining.length>0 &&
        <div style={{marginBottom:14}}>
          <div style={St.miniLabel}>To buy ({remaining.length})</div>
          <div style={{display:"grid",gap:6,marginTop:8}}>
            {remaining.map(i=>(
              <div key={i.id} style={St.shopRow}>
                <button style={St.checkBtn} onClick={()=>onToggle(i.mealId,i.id)} aria-label="Got it"/>
                <span style={{flex:1,fontSize:13.5}}>{i.name}{i.qty?` · ${i.qty}`:""}</span>
                {i.responsible && <span style={St.shopBringer}>{firstNameOf(i.responsible)}</span>}
                <span style={St.shopMeal}>{i.meal}</span>
              </div>
            ))}
          </div>
        </div>}
      {done.length>0 &&
        <div>
          <div style={St.miniLabel}>Got it ({done.length})</div>
          <div style={{display:"grid",gap:6,marginTop:8}}>
            {done.map(i=>(
              <div key={i.id} style={St.shopRow}>
                <button style={{...St.checkBtn,...St.checkOn}} onClick={()=>onToggle(i.mealId,i.id)} aria-label="Undo">
                  <Ic.check style={{width:12,height:12,color:"var(--night)"}}/>
                </button>
                <span style={{flex:1,fontSize:13.5,textDecoration:"line-through",opacity:.55}}>{i.name}{i.qty?` · ${i.qty}`:""}</span>
                {i.responsible && <span style={{...St.shopBringer,opacity:.55}}>{firstNameOf(i.responsible)}</span>}
              </div>
            ))}
          </div>
        </div>}
    </Modal>
  );
}
