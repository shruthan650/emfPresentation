import * as THREE from 'three';
import {makeOfficeStation,makeRoomShell} from './humanModel.js';
const line=(color='#83919c')=>new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color}));
export function createNetworkStructure(){
 const group=new THREE.Group();const coreSuite=makeRoomShell({width:3.5,depth:3.5,color:'#e7e3da'});group.add(coreSuite);const hub=makeOfficeStation({role:'Core headquarters',title:'Taylor Brooks',detail:'Coordinates organizational strategy, integrates partner deliverables, and resolves priorities across the network.',position:[0,0,0],seated:true,accent:'#a26e21'});group.add(hub);
 const partners=[
  ['R&D partner',-4.2,0,'Sofia Kim','Conducts research, validates prototypes, protects technical knowledge, and recommends evidence-based product improvements.'],
  ['Logistics provider',0,-4.2,'Mateo Rivera','Plans transport, manages inventory flow, tracks supplier schedules, and reports delivery risks to headquarters.'],
  ['Marketing agency',4.2,0,'Amara Okafor','Creates campaigns, manages market communications, measures audience response, and recommends positioning changes.'],
  ['Manufacturing partner',0,4.2,'Lucas Moreau','Plans production capacity, maintains quality standards, schedules assembly, and confirms delivery commitments.']
 ];
 const orbiters=partners.map(([role,x,z,name,detail],i)=>{const pod=makeRoomShell({width:2.8,depth:2.8,color:['#e3edf1','#e9e5dc','#efe7e2','#e6eadf'][i]});pod.position.set(x,0,z);group.add(pod);const station=makeOfficeStation({role,title:name,detail,position:[x,0,z],seated:true,accent:'#286b9e',style:i===2?'cafe':'office'});group.add(station);const tether=line();group.add(tether);return{station,tether,base:new THREE.Vector3(x,0,z),phase:i*Math.PI/2}});
 return {group,caption:'A small core coordinates specialist external partners',focus:new THREE.Vector3(0,.7,0),camera:new THREE.Vector3(11,9,13),update(t){for(const o of orbiters){const a=t*.09+o.phase;o.station.position.set(o.base.x+Math.cos(a)*.14,.06*Math.sin(a*1.4),o.base.z+Math.sin(a)*.14);const start=new THREE.Vector3(0,1.1,0),end=o.station.position.clone().add(new THREE.Vector3(0,1.05,0));o.tether.geometry.setFromPoints([start,end]);o.tether.geometry.attributes.position.needsUpdate=true}}};
}
