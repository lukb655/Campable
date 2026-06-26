import React from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';

export default function ExtrasSection({extras,members,nameOf,readOnly,onAdd,onDel,onUpdate}){
  const drinks=extras.filter(e=>e.category==="Drink");
  const snacks=extras.filter(e=>e.category==="Snack");

  if(extras.length===0&&readOnly) return null;

  return (
    <div style={{marginTop:20}}>
      <div style={St.listHead}>
        <h2 style={St.h2}>Extras</h2>
        {!readOnly&&<button style={St.smallBtn} onClick={onAdd}><Ic.plus style={ic(14)}/> Extra</button>}
      </div>

      {extras.length===0&&!readOnly&&<Empty icon={Ic.cart} text="Add drinks, snacks, or other items to your shopping list."/>}

      {drinks.length>0&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"var(--sage)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:8}}>Drinks ({drinks.length})</div>
          <div style={{display:"grid",gap:6}}>
            {drinks.map(e=>(
              <div key={e.id} style={{...St.itemRow,justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={St.itemTitle}>{e.name}</div>
                  <div style={St.itemMeta}>
                    {e.price?`$${(+e.price).toFixed(2)}`:""}{e.assignee?` · ${nameOf(e.assignee)}`:""}</div>
                </div>
                {!readOnly&&(
                  <div style={{display:"flex",gap:6,marginLeft:8}}>
                    <button style={St.iconBtn} onClick={()=>onDel(e.id)} aria-label="Delete"><Ic.trash style={ic(13)}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {snacks.length>0&&(
        <div>
          <div style={{fontSize:12,color:"var(--sage)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:8}}>Snacks ({snacks.length})</div>
          <div style={{display:"grid",gap:6}}>
            {snacks.map(e=>(
              <div key={e.id} style={{...St.itemRow,justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={St.itemTitle}>{e.name}</div>
                  <div style={St.itemMeta}>
                    {e.price?`$${(+e.price).toFixed(2)}`:""}{e.assignee?` · ${nameOf(e.assignee)}`:""}</div>
                </div>
                {!readOnly&&(
                  <div style={{display:"flex",gap:6,marginLeft:8}}>
                    <button style={St.iconBtn} onClick={()=>onDel(e.id)} aria-label="Delete"><Ic.trash style={ic(13)}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
