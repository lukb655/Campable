import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic, uid } from '../../utils.js';
import { Empty } from '../common/ListHead.jsx';
import { FormSheet } from '../common/Modal.jsx';
import PackingListPrintView from './PackingListPrintView.jsx';

export default function PackingListTab({trip,patch,flash,readOnly}){
  const [open,setOpen]=useState(false);
  const [showPrint,setShowPrint]=useState(false);
  const items=trip.packingList||[];
  const members=trip.members||[];
  const nameOf=mid=>members.find(x=>x.id===mid)?.name||"";

  const addItem=(item)=>{
    if(!item.name.trim())return;
    patch({packingList:[...items,{id:uid(),name:item.name.trim(),category:item.category||"",responsible:item.responsible||"",cost:item.cost?+item.cost:0,packed:false}]});
    flash("Item added"); setOpen(false);
  };
  const delItem=(id)=>{
    if(!confirm("Remove this item?"))return;
    patch({packingList:items.filter(i=>i.id!==id)});
  };
  const toggleItem=(id)=>patch({packingList:items.map(i=>i.id===id?{...i,packed:!i.packed}:i)});

  const hasCategories=items.some(i=>i.category);
  let grouped={};
  if(hasCategories){
    items.forEach(i=>{
      const cat=i.category||"Other";
      if(!grouped[cat])grouped[cat]=[];
      grouped[cat].push(i);
    });
  }

  const renderItem=(i)=>(
    <div key={i.id} style={{...St.itemRow,justifyContent:"space-between",alignItems:"center"}}>
      <button style={{...St.checkBtn,...(i.packed?St.checkOn:{})}} onClick={()=>toggleItem(i.id)} aria-label="Packed">
        {i.packed&&<Ic.check style={{width:12,height:12,color:"var(--night)"}}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{...St.itemTitle,...(i.packed?{textDecoration:"line-through",opacity:.55}:{})}}>{i.name}</div>
        <div style={{...St.itemMeta,...(i.packed?{opacity:.55}:{})}}>
          {i.cost?`$${(+i.cost).toFixed(2)}`:""}
          {i.cost&&i.responsible?" · ":""}
          {i.responsible?nameOf(i.responsible):""}
        </div>
      </div>
      {!readOnly&&<button style={St.iconBtn} onClick={()=>delItem(i.id)} aria-label="Remove"><Ic.trash style={ic(15)}/></button>}
    </div>
  );

  return (
    <div style={St.pane}>
      <div style={St.listHead}>
        <h2 style={St.h2}>Packing List</h2>
        <div style={{display:"flex",gap:8}}>
          {items.length>0&&<button style={St.smallBtn} onClick={()=>setShowPrint(true)}><Ic.share style={ic(14)}/> Print</button>}
          {!readOnly&&<button style={St.smallBtn} onClick={()=>setOpen(true)}><Ic.plus style={ic(14)}/> Item</button>}
        </div>
      </div>

      {items.length===0&&<Empty icon={Ic.pack} text="Pack efficiently — add gear, assign to crew members, track cost and status."/>}

      {hasCategories
        ?Object.entries(grouped).map(([cat,catItems])=>(
          <div key={cat} style={{marginBottom:20}}>
            <div style={{fontSize:12,color:"var(--sage)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:8}}>{cat} ({catItems.length})</div>
            <div style={{display:"grid",gap:6}}>{catItems.map(renderItem)}</div>
          </div>
        ))
        :<div style={{display:"grid",gap:6}}>{items.map(renderItem)}</div>}

      {open&&!readOnly&&<FormSheet title="Add packing item" onClose={()=>setOpen(false)} onSave={addItem}
        fields={[
          {k:"name",label:"Item name",type:"text",req:true},
          {k:"category",label:"Category",type:"text"},
          {k:"responsible",label:"Assign to",type:"select",allowEmpty:true,opts:members.map(x=>({v:x.id,l:x.name}))},
          {k:"cost",label:"Purchase cost ($)",type:"number"},
        ]}/>}

      {showPrint&&<PackingListPrintView items={items} members={members} hasCategories={hasCategories} grouped={grouped} nameOf={nameOf} onClose={()=>setShowPrint(false)}/>}
    </div>
  );
}
