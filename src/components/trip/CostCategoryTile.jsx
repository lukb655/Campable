import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';

export default function CostCategoryTile({title,icon:Icon,items,total,members,nameOf,expandable,readOnly,onAdd}){
  const [exp,setExp]=useState(false);

  return (
    <div style={{...St.block,padding:0,overflow:"hidden"}}>
      <button onClick={()=>setExp(!exp)} style={{width:"100%",background:"none",border:"none",padding:"14px",cursor:expandable?"pointer":"default",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
        <Icon style={{...ic(18),color:"var(--ember2)",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--paper)"}}>{title}</div>
          {items.length>0&&<div style={{fontSize:12,color:"var(--sage)",marginTop:2}}>{items.length} {items.length===1?"item":"items"}</div>}
        </div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:"var(--gold)",flexShrink:0}}>
          ${total.toFixed(2)}
        </div>
        {expandable&&<Ic.chev style={{...ic(16),color:"var(--sage)",transform:exp?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}/>}
      </button>

      {exp&&items.length>0&&(
        <div style={{padding:"0 14px 14px",borderTop:"1px solid var(--line)"}}>
          {items.map((item,i)=>(
            <div key={item.id||i} style={{...St.itemRow,paddingBottom:10,marginBottom:10,...(i===items.length-1?{paddingBottom:0,marginBottom:0}:{})}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={St.itemTitle}>{item.title||item.name}</div>
                <div style={St.itemMeta}>
                  ${((item.cost||item.price)||0).toFixed(2)}
                  {item.paidBy?` · paid by ${nameOf(item.paidBy)}`:""}
                  {item.assignee?` · ${nameOf(item.assignee)}`:""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length===0&&<div style={{padding:"14px",fontSize:12.5,color:"var(--sage)",textAlign:"center"}}>No items</div>}
    </div>
  );
}
