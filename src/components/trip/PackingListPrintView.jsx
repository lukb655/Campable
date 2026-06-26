import React, { useEffect } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal } from '../common/Modal.jsx';

export default function PackingListPrintView({items,members,hasCategories,grouped,nameOf,onClose}){
  const total=items.reduce((a,i)=>a+(+i.cost||0),0);
  useEffect(()=>{
    setTimeout(()=>window.print(),100);
  },[]);
  return <Modal title="Packing List" onClose={onClose} wide>
    <style>{`@media print{body{background:white;color:black}*{box-shadow:none!important;border-color:rgba(0,0,0,.1)!important}.print-header,.print-footer{display:none!important}.print-content{all:initial;color:black;font-family:system-ui,sans-serif;line-height:1.6}}`}</style>
    <div className="print-content">
      <h1 style={{fontSize:22,fontWeight:700,marginBottom:12,pageBreakAfter:"avoid"}}>Packing List</h1>
      {hasCategories
        ?Object.entries(grouped).map(([cat,catItems])=>(
          <div key={cat} style={{marginBottom:16,pageBreakInside:"avoid"}}>
            <h2 style={{fontSize:16,fontWeight:600,borderBottom:"1px solid #000",paddingBottom:6,marginBottom:8}}>{cat}</h2>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <tbody>
                {catItems.map(i=>(
                  <tr key={i.id} style={{borderBottom:"1px solid #eee"}}>
                    <td style={{padding:"8px 0",width:20}}>☐</td>
                    <td style={{padding:"8px 12px",flex:1}}>{i.name}</td>
                    {i.responsible&&<td style={{padding:"8px 12px",textAlign:"right"}}>{nameOf(i.responsible)}</td>}
                    {i.cost&&<td style={{padding:"8px 12px",textAlign:"right"}}>${(+i.cost).toFixed(2)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
        :<table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <tbody>
            {items.map(i=>(
              <tr key={i.id} style={{borderBottom:"1px solid #eee"}}>
                <td style={{padding:"8px 0",width:20}}>☐</td>
                <td style={{padding:"8px 12px",flex:1}}>{i.name}</td>
                {i.responsible&&<td style={{padding:"8px 12px",textAlign:"right"}}>{nameOf(i.responsible)}</td>}
                {i.cost&&<td style={{padding:"8px 12px",textAlign:"right"}}>${(+i.cost).toFixed(2)}</td>}
              </tr>
            ))}
          </tbody>
        </table>}
      {items.some(i=>i.cost)&&<div style={{marginTop:16,textAlign:"right",fontSize:14,fontWeight:600,borderTop:"2px solid #000",paddingTop:8}}>Total: ${total.toFixed(2)}</div>}
    </div>
    <div style={St.modalActions}>
      <button style={St.primaryBtn} onClick={()=>{window.print();}}><Ic.share style={ic(15)}/> Print</button>
      <button style={St.ghostBtn} onClick={onClose}>Close</button>
    </div>
  </Modal>;
}
