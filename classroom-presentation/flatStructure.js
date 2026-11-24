import * as THREE from 'three';
import {makeOfficeStation,makeRoomShell} from './humanModel.js';
const connect=(a,b,color='#6c8091')=>new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]),new THREE.LineBasicMaterial({color}));
export function createFlatStructure(){
 const group=new THREE.Group(),nodes=[],n=6,radius=4.3;
 for(let i=0;i<4;i++){const zone=makeRoomShell({width:2.35,depth:6.1,color:['#e6ecef','#e7eaf0','#eee8e2','#e8ede7'][i]});zone.position.x=-3.6+i*2.4;group.add(zone)}
 const roles=['Executive lead','Operations coordinator','Customer success lead','Finance and compliance lead','Product and marketing lead','People and culture lead'];
 const names=['Jordan Patel','Maya Thompson','Ravi Shah','Noah Garcia','Amara Okafor','Sofia Kim'];
 const details=[
  'Sets shared priorities, removes cross-team blockers, and gives every team member direct access to organizational decisions.',
  'Coordinates daily workflows, monitors delivery progress, and aligns resources across functional teams.',
  'Leads customer relationships, resolves service problems, and shares user needs with product and operations.',
  'Manages budgets, approves spending, tracks compliance requirements, and maintains financial reporting.',
  'Defines product direction, leads market research, and coordinates marketing plans with customer feedback.',
  'Supports recruitment, learning and development, workplace policy, and the wellbeing of every team member.'
 ];
 for(let i=0;i<n;i++){const a=Math.PI*2*i/n-Math.PI/2,x=Math.cos(a)*radius,z=Math.sin(a)*2.6;const station=makeOfficeStation({role:roles[i],title:names[i],detail:details[i],position:[x,0,z],seated:true,accent:i===0?'#a26e21':'#286b9e'});group.add(station);nodes.push({x,z,station,lead:i===0})}
 const center=[0,1.02,0];for(let i=0;i<n;i++){const a=nodes[i],b=nodes[(i+1)%n];group.add(connect([a.x,.05,a.z],[b.x,.05,b.z],i===0?'#b07c32':'#8d9ba7'));if(i!==0)group.add(connect(center,[a.x,.05,a.z],'#91a0ab'))}
 const pulses=nodes.map((node,i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),new THREE.MeshStandardMaterial({color:i===0?'#b07c32':'#286b9e'}));group.add(m);return{m,node,phase:i/n}});
 return {group,caption:'Four connected functional zones · direct access · few management layers',focus:new THREE.Vector3(0,.7,0),camera:new THREE.Vector3(10,8,13),update(t){for(const p of pulses){const f=(t*.22+p.phase)%1;p.m.position.set(p.node.x*f,1.02*(1-f)+.05,p.node.z*f)}}};
}
