import React, { useState } from 'react';
import { Ic } from '../../icons.jsx';
import { St } from '../../styles.js';
import { ic } from '../../utils.js';
import CostCategoryTile from './CostCategoryTile.jsx';
import DistributionModal from './DistributionModal.jsx';

export default function CostsTab({trip,me,patch,flash,readOnly,isAdmin}){
  const expenses=trip.expenses||[];
  const meals=trip.meals||[];
  const extras=trip.extras||[];
  const members=trip.members||[];
  const costSettings=trip.costSettings||{splitMethod:"evenly"};
  const nameOf=mid=>members.find(x=>x.id===mid)?.name||"";

  const [distribOpen,setDistribOpen]=useState(false);

  const sharedCosts=expenses;
  const individualCosts=meals.filter(m=>!m.forAll).concat(extras.filter(e=>e.assignee));
  const foodCosts=meals.filter(m=>m.cost>0).map(m=>({...m,type:"meal"})).concat(
    extras.filter(e=>e.price>0).map(e=>({...e,type:"extra"}))
  );

  const sharedTotal=sharedCosts.reduce((a,e)=>a+(+e.amount||0),0);
  const individualTotal=meals.filter(m=>!m.forAll).reduce((a,m)=>a+(+m.cost||0),0)+extras.filter(e=>e.assignee).reduce((a,e)=>a+(+e.price||0),0);
  const foodTotal=meals.reduce((a,m)=>a+(+m.cost||0),0)+extras.reduce((a,e)=>a+(+e.price||0),0);
  const tripTotal=sharedTotal+individualTotal+foodTotal;

  const markPayDues=()=>{
    const members_update=members.map(m=>
      m.id===me.id?{...m,duesPaid:true,duesPending:false}:m
    );
    patch({members:members_update});
    flash("Dues marked as paid");
  };

  return (
    <div style={St.pane}>
      <div style={{...St.block,background:"linear-gradient(135deg,var(--moss),var(--mist))",border:"1px solid var(--line)",padding:24,marginBottom:20,textAlign:"center"}}>
        <div style={St.miniLabel}>Total Trip Cost</div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:44,fontWeight:700,color:"var(--gold)",marginTop:8}}>
          ${tripTotal.toFixed(2)}
        </div>
        {members.length>0&&(
          <div style={{fontSize:13,color:"var(--sage)",marginTop:12}}>
            ≈ ${(tripTotal/members.length).toFixed(2)} per person
          </div>
        )}
      </div>

      <div style={{display:"grid",gap:14,marginBottom:20}}>
        <CostCategoryTile title="Shared Costs" icon={Ic.users} items={sharedCosts} total={sharedTotal} members={members} nameOf={nameOf}
          expandable readOnly={readOnly} onAdd={!readOnly?()=>{alert("Add shared expenses in Crew tab")}:null}/>

        <CostCategoryTile title="Individual Costs" icon={Ic.dollar} items={individualCosts} total={individualTotal} members={members} nameOf={nameOf}
          expandable readOnly={readOnly} onAdd={!readOnly?()=>{alert("Add individual meal costs in Meals tab")}:null}/>

        <CostCategoryTile title="Food Costs" icon={Ic.food} items={foodCosts} total={foodTotal} members={members} nameOf={nameOf}
          expandable readOnly={readOnly} onAdd={!readOnly?()=>{alert("Add meals or extras in Meals tab")}:null}/>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <button style={{...St.primaryBtn,flex:1}} onClick={markPayDues}>
          <Ic.dollar style={ic(15)}/> Pay Dues
        </button>
        {isAdmin&&(
          <button style={{...St.ghostBtn,flex:1}} onClick={()=>setDistribOpen(true)}>
            <Ic.gear style={ic(15)}/> Change Distribution
          </button>
        )}
      </div>

      {distribOpen&&<DistributionModal trip={trip} members={members} costSettings={costSettings} patch={patch} flash={flash} onClose={()=>setDistribOpen(false)}/>}
    </div>
  );
}
