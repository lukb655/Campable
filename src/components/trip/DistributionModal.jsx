import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import { Modal, Field } from '../common/Modal.jsx';

export default function DistributionModal({trip,members,costSettings,patch,flash,onClose}){
  const [method,setMethod]=useState(costSettings.splitMethod||"evenly");
  const [customPcts,setCustomPcts]=useState(costSettings.customPercentages||{});
  const [subsetIds,setSubsetIds]=useState(costSettings.subsetMembers||[]);

  const save=()=>{
    const settings={splitMethod:method};
    if(method==="custom") settings.customPercentages=customPcts;
    if(method==="subset") settings.subsetMembers=subsetIds;
    patch({costSettings:settings});
    flash("Cost distribution updated");
    onClose();
  };

  return (
    <Modal title="Change Cost Distribution" onClose={onClose}>
      <p style={St.sub}>Choose how shared costs are split among the crew.</p>

      <Field label="Distribution method">
        <select style={St.input} value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="evenly">Split evenly among all members</option>
          <option value="custom">Custom percentages</option>
          <option value="subset">Specific members only</option>
        </select>
      </Field>

      {method==="custom"&&(
        <div style={{marginTop:12,padding:12,background:"var(--pine)",borderRadius:10,border:"1px solid var(--line)"}}>
          {members.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{flex:1}}>{m.name}</span>
              <input type="number" min="0" max="100" step="1" style={{...St.input,width:80}} value={customPcts[m.id]||0}
                onChange={e=>setCustomPcts({...customPcts,[m.id]:+e.target.value})}/>
              <span style={{fontSize:12,color:"var(--sage)"}}>%</span>
            </div>
          ))}
        </div>
      )}

      {method==="subset"&&(
        <div style={{marginTop:12,display:"grid",gap:8}}>
          {members.map(m=>(
            <label key={m.id} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px",background:"var(--pine)",borderRadius:10,border:"1px solid var(--line)"}}>
              <input type="checkbox" checked={subsetIds.includes(m.id)}
                onChange={e=>setSubsetIds(e.target.checked?[...subsetIds,m.id]:subsetIds.filter(id=>id!==m.id))}
                style={{cursor:"pointer"}}/>
              <span>{m.name}</span>
            </label>
          ))}
        </div>
      )}

      <div style={St.modalActions}>
        <button style={St.ghostBtn} onClick={onClose}>Cancel</button>
        <button style={St.primaryBtn} onClick={save}><Ic.check style={ic(15)}/> Save</button>
      </div>
    </Modal>
  );
}
