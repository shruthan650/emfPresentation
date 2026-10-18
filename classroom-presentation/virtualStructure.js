import * as THREE from 'three';
import {makeOfficeStation,makeIsland} from './humanModel.js';
const dashedLine=()=>new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:'#71879a',dashSize:.16,gapSize:.12}));
function makeWorldTexture(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
 const ocean=ctx.createLinearGradient(0,0,0,512);ocean.addColorStop(0,'#075b91');ocean.addColorStop(.48,'#073a70');ocean.addColorStop(1,'#071f4c');ctx.fillStyle=ocean;ctx.fillRect(0,0,1024,512);
 // Simplified, softly glowing continents on an equirectangular map.
 const continents=[
  [[-168,70],[-145,72],[-128,60],[-125,50],[-115,32],[-105,23],[-98,16],[-83,8],[-78,25],[-66,45],[-55,52],[-61,63],[-82,74],[-112,77]],
  [[-81,12],[-70,8],[-52,-2],[-36,-10],[-43,-25],[-54,-39],[-66,-55],[-73,-32],[-79,-8]],
  [[-54,82],[-25,80],[-19,64],[-35,58],[-48,65]],
  [[-12,36],[-3,50],[20,58],[38,67],[73,70],[112,66],[145,58],[160,48],[145,38],[126,22],[112,8],[97,6],[82,20],[63,24],[48,34],[32,30],[20,42],[8,36]],
  [[-18,34],[2,37],[26,32],[42,13],[35,-11],[27,-34],[14,-35],[-1,-19],[-12,1]],
  [[43,-12],[51,-16],[49,-25],[45,-22]],
  [[113,-11],[132,-10],[153,-19],[151,-38],[134,-44],[116,-34]],
  [[-9,59],[-2,58],[0,51],[-5,50]],
  [[-8,50],[-6,58],[-2,58],[0,51]]
 ];
 const toPoint=([lon,lat])=>[(lon+180)/360*1024,(90-lat)/180*512];
 for(const polygon of continents){ctx.beginPath();polygon.map(toPoint).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();const land=ctx.createLinearGradient(0,80,0,450);land.addColorStop(0,'#46d8f3');land.addColorStop(1,'#1280c1');ctx.fillStyle=land;ctx.shadowColor='#28c8ff';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(120,232,255,.7)';ctx.lineWidth=2;ctx.stroke()}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function makeNetworkGlobe(parent){
 const globe=new THREE.Group();parent.add(globe);const radius=1.08;
 const earth=new THREE.Mesh(new THREE.SphereGeometry(radius,64,48),new THREE.MeshStandardMaterial({map:makeWorldTexture(),roughness:.55,metalness:.08,emissive:'#06294e',emissiveIntensity:.28}));earth.castShadow=true;earth.receiveShadow=true;globe.add(earth);
 const shell=new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,32,24),new THREE.MeshBasicMaterial({color:'#47cfff',wireframe:true,transparent:true,opacity:.12,depthWrite:false}));globe.add(shell);
 const count=68,points=[];const goldenAngle=Math.PI*(3-Math.sqrt(5));
 for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),theta=goldenAngle*i;points.push(new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r).multiplyScalar(radius*1.018))}
 const linePositions=[];for(let i=0;i<count;i++){const neighbors=[];for(let j=0;j<count;j++){if(i===j)continue;neighbors.push({j,d:points[i].dot(points[j])})}neighbors.sort((a,b)=>b.d-a.d);for(const {j,d}of neighbors.slice(0,3)){if(j<=i||d<.82)continue;const a=points[i].clone().normalize(),b=points[j].clone().normalize(),angle=Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1)),steps=7;let previous=a.clone().multiplyScalar(radius*1.023);for(let step=1;step<=steps;step++){const t=step/steps,s=Math.sin(angle)||1;const next=a.clone().multiplyScalar(Math.sin((1-t)*angle)/s).add(b.clone().multiplyScalar(Math.sin(t*angle)/s)).multiplyScalar(radius*1.023);linePositions.push(previous.x,previous.y,previous.z,next.x,next.y,next.z);previous=next}}}
 const webGeometry=new THREE.BufferGeometry();webGeometry.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));const web=new THREE.LineSegments(webGeometry,new THREE.LineBasicMaterial({color:'#56dfff',transparent:true,opacity:.46,depthWrite:false}));globe.add(web);
 const markerGeometry=new THREE.SphereGeometry(.018,10,8),markerMaterial=new THREE.MeshBasicMaterial({color:'#8bf3ff'}),markers=new THREE.InstancedMesh(markerGeometry,markerMaterial,count),matrix=new THREE.Matrix4();
 points.forEach((point,i)=>{matrix.makeTranslation(point.x,point.y,point.z);markers.setMatrixAt(i,matrix)});markers.instanceMatrix.needsUpdate=true;globe.add(markers);
 return globe;
}
export function createVirtualStructure(){
 const group=new THREE.Group();const hub=new THREE.Group();hub.position.set(0,2.3,0);const globe=makeNetworkGlobe(hub);group.add(hub);
 const places=[
  ['Urban home office',-4.1,0,'#e2e9df','Product planning: owns roadmap updates, records decisions, assigns follow-ups, and prepares clear handoffs so teammates in other time zones can continue the work.',true,false,'office'],
  ['Coffee shop cafe',-1.9,-3.5,'#eee2d3','Customer success: responds to customer questions, captures call outcomes, and posts actionable follow-ups for support and product teammates working asynchronously.',false,true,'cafe'],
  ['Airport lounge pod',2.1,-3.5,'#e4e8ec','Regional operations: monitors service issues, coordinates urgent responses, and publishes shift summaries so coverage continues while colleagues are offline.',false,false,'airport'],
  ['Suburban co-working hub',4.2,0,'#e4ebdf','Experience design: creates and tests prototypes, requests asynchronous feedback, and documents accessibility and design decisions for product and engineering.',true,false,'office'],
  ['Mountain resort balcony',0,4.1,'#e6e1ed','Software engineering: builds and reviews product changes, documents technical decisions, and shares deployment status for reliable cross-time-zone handoffs.',true,false,'office']
 ];
 const nodes=places.map(([role,x,z,color,detail,plant,cup,style],i)=>{const island=makeIsland({color});island.position.set(x,i%2?.3:0,z);group.add(island);const station=makeOfficeStation({role,detail,position:[0,0,0],seated:true,style,plant,cup});station.scale.setScalar(.76);island.add(station);if(i===4){const railMat=new THREE.MeshStandardMaterial({color:'#8799a7',roughness:.45});for(const rx of[-.95,.95]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.48,10),railMat);post.position.set(rx,.36,-.92);island.add(post)}const rail=new THREE.Mesh(new THREE.BoxGeometry(2,.06,.06),railMat);rail.position.set(0,.57,-.92);island.add(rail);const treeTrunk=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,.5,8),new THREE.MeshStandardMaterial({color:'#81694d'}));treeTrunk.position.set(-1.03,.25,.38);island.add(treeTrunk);const treeTop=new THREE.Mesh(new THREE.ConeGeometry(.32,.8,10),new THREE.MeshStandardMaterial({color:'#718a71'}));treeTop.position.set(-1.03,.82,.38);island.add(treeTop)}if(i===2){const seat=new THREE.Mesh(new THREE.BoxGeometry(.52,.16,.52),new THREE.MeshStandardMaterial({color:'#758b9a'}));seat.position.set(-.86,.24,.3);island.add(seat);const back=new THREE.Mesh(new THREE.BoxGeometry(.52,.52,.12),new THREE.MeshStandardMaterial({color:'#758b9a'}));back.position.set(-.86,.52,.06);island.add(back)}const tether=dashedLine();group.add(tether);const card=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:'#fffefa',roughness:.7});const cardBase=new THREE.Mesh(new THREE.BoxGeometry(.62,.42,.035),mat);cardBase.castShadow=true;card.add(cardBase);const bar=new THREE.Mesh(new THREE.BoxGeometry(.4,.035,.02),new THREE.MeshStandardMaterial({color:'#6c91aa'}));bar.position.set(-.04,.09,.03);card.add(bar);for(let j=0;j<2;j++){const row=new THREE.Mesh(new THREE.BoxGeometry(.34,.022,.02),new THREE.MeshStandardMaterial({color:'#aab8c3'}));row.position.set(-.02,.005-j*.09,.03);card.add(row)}card.position.set(.8,1.05,.25);island.add(card);return{island,station,tether,card,x,z,phase:i*.6}});
 return {group,caption:'Five distinct remote locations · shared digital workspace',focus:new THREE.Vector3(0,1.1,0),camera:new THREE.Vector3(11,9,14),update(t){hub.position.y=2.3+Math.sin(t*.55)*.08;globe.rotation.y=t*.07;for(const n of nodes){n.island.position.y=(n.phase%2?.3:0)+Math.sin(t*.65+n.phase)*.07;n.card.rotation.y=Math.sin(t*.35+n.phase)*.09;const from=new THREE.Vector3(0,2.3,0),to=new THREE.Vector3(n.x,1.5,n.z);n.tether.geometry.setFromPoints([from,to]);n.tether.computeLineDistances()}}};
}
