import { St } from '../../styles.js';
import { Ic } from '../../icons.jsx';
import { ic } from '../../utils.js';

export function ListHead({title,onAdd,addLabel}){
  return <div style={St.listHead}><h2 style={St.h2}>{title}</h2>
    {onAdd && <button style={St.smallBtn} onClick={onAdd}><Ic.plus style={ic(14)}/> {addLabel}</button>}</div>;
}

export function Empty({icon:Icon,text}){
  return <div style={St.empty}><Icon style={{...ic(26),color:"var(--mist)"}}/><span>{text}</span></div>;
}

export function Stat({icon:Icon,label,value}){
  return <div style={St.statCard}><Icon style={{...ic(16),color:"var(--ember2)"}}/>
    <div style={St.statValue}>{value}</div><div style={St.statLabel}>{label}</div></div>;
}
