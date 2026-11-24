import * as THREE from 'three';
import {makeOfficeStation,makeRoomShell} from './humanModel.js';
const line=(a,b,color='#728391',dashed=false)=>{const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);const m=new THREE.Line(geo,new THREE.LineBasicMaterial({color,dashSize:.12,gapSize:.08,dashed}));return m};
export function createTallStructure(){
 const group=new THREE.Group(),nodes=[];const tiers=[
  {y:0,xs:[-2.45,0,2.45],roles:['Operations specialist','Customer support specialist','Sales specialist'],names:['Maya Thompson','Ravi Shah','Nora Williams'],details:['Owns daily process execution, prepares work reports, and identifies opportunities to improve operational efficiency.','Answers customer enquiries, resolves routine service issues, and records feedback for product and operations teams.','Develops client relationships, prepares proposals, and coordinates sales commitments with operations.']},
  {y:4,xs:[-1.25,1.25],roles:['Operations manager','Customer and sales manager'],names:['Casey Morgan','Riley James'],details:['Plans team workloads, assigns priorities, monitors delivery quality, and reports operational performance to the executive.','Coordinates customer and sales activities, manages service commitments, coaches frontline staff, and escalates major issues.']},
  {y:8,xs:[0],roles:['Chief executive'],names:['Avery Chen'],details:['Sets organizational strategy, approves budgets and major initiatives, holds final accountability, and communicates direction to all teams.']}
 ];
 for(const tier of tiers){const suite=makeRoomShell({width:8.8,depth:5,color:tier.y>5?'#e9e5dc':'#e3ebef'});suite.position.set(0,tier.y-.28,0);group.add(suite)}
 tiers.forEach((tier,ti)=>tier.xs.forEach((x,i)=>{const n=makeOfficeStation({role:tier.roles[i],title:tier.names[i],detail:tier.details[i],position:[x,tier.y,0],seated:true,accent:ti===2?'#a26e21':'#286b9e'});group.add(n);nodes.push({x,y:tier.y,group:n,tier:ti})}));
 for(const top of nodes.filter(n=>n.tier>0)){const reports=nodes.filter(n=>n.tier===top.tier-1).sort((a,b)=>Math.abs(a.x-top.x)-Math.abs(b.x-top.x)).slice(0,top.tier===2?2:2);for(const sub of reports)group.add(line([top.x,top.y+2.8,0],[sub.x,sub.y+2.8,0],top.tier===2?'#b07c32':'#758695'))}
 // reporting flow markers move downward along the reporting tiers
 const pulses=nodes.filter(n=>n.tier>0).map(n=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),new THREE.MeshStandardMaterial({color:'#bd8537'}));m.userData={top:n,phase:Math.random()};group.add(m);return m});
 return {group,caption:'Three glass-fronted office levels · executive, management, and frontline teams',focus:new THREE.Vector3(0,4.2,0),camera:new THREE.Vector3(11,14,20),update(t){for(const p of pulses){const f=(t*.12+p.userData.phase)%1;p.position.set(p.userData.top.x,p.userData.top.y+2.9-f*2.5,.02)}for(const n of nodes)n.group.position.y=n.y+Math.sin(t*1.1+n.x)*.025}};
}
