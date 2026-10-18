import * as THREE from 'three';

const mat=(color,roughness=.78)=>new THREE.MeshStandardMaterial({color,roughness});
const suitMat=mat('#25364a'),shirtMat=mat('#f7f8f9'),tieMat=mat('#49627b'),skinMat=mat('#d6a983'),shoeMat=mat('#202a33'),woodMat=mat('#a9784e'),metalMat=mat('#647687');
function box(parent,size,pos,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,r,pos,material){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),material);m.position.set(...pos);m.castShadow=true;parent.add(m);return m}
function cylinder(parent,r1,r2,h,pos,material){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);m.position.set(...pos);m.castShadow=true;parent.add(m);return m}
function limb(parent,a,b,r,material){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(B,A);const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.82,r,d.length(),10),material);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;parent.add(m);return m}

const roleNamePools = [
 [/chief executive|ceo/i, ['Avery Chen', 'Morgan Ellis']],
 [/executive|business lead|leadership|headquarters|core hub/i, ['Jordan Patel', 'Taylor Brooks']],
 [/manager|director|team lead/i, ['Casey Morgan', 'Riley James', 'Samira Khan']],
 [/urban home|home office/i, ['Maya Thompson']],
 [/coffee shop|cafe/i, ['Ravi Shah']],
 [/airport|lounge/i, ['Nora Williams']],
 [/suburban|co-working|coworking/i, ['Ethan Park']],
 [/mountain|resort|balcony/i, ['Leila Hassan']],
 [/frontline|contributor|staff|team member|remote node|worker/i, ['Maya Thompson', 'Ravi Shah', 'Nora Williams', 'Ethan Park', 'Leila Hassan', 'Noah Garcia']],
 [/r\s*&\s*d|research|lab/i, ['Sofia Kim']],
 [/logistics|provider|supplier/i, ['Mateo Rivera']],
 [/marketing|agency|studio/i, ['Amara Okafor']],
 [/manufacturing|factory/i, ['Lucas Moreau']],
 [/vendor|partner/i, ['Isabel Costa']]
];
function nameForRole(role='Team member',position=[0,0,0]){
 const entry=roleNamePools.find(([pattern])=>pattern.test(role));
 if(!entry)return 'Alex Morgan';
 const [,names]=entry;const seed=Math.abs(Math.round((position[0]+20)*17+(position[1]+20)*7+(position[2]+20)*31));return names[seed%names.length];
}

export function makePerson({role='Team member',detail='Works as part of the organization.',accent='#286b9e',seated=false,title}={}){
 const root=new THREE.Group();root.userData={selectable:true,role,title:title||nameForRole(role),detail,connections:/chief executive/i.test(role)?'Reports to the board; directs managers and the organization.':/manager/i.test(role)?'Reports to the executive; coordinates frontline contributors.':/frontline|contributor/i.test(role)?'Reports through the team manager; collaborates with peers.':/headquarters|core/i.test(role)?'Coordinates external partner teams and reports to executive leadership.':/partner|provider|agency|manufacturing|logistics|r&d/i.test(role)?'Connected to headquarters through a specialist service or contract relationship.':'Collaborates through the shared digital workspace and team workflows.'};
 const body=new THREE.Group();root.add(body);body.position.y=seated?0.47:0;const upper=new THREE.Group();upper.position.y=seated?-0.77:0;body.add(upper);
 // Legs and polished shoes.
 if(seated){for(const side of[-1,1]){limb(body,[side*.11,.42,0],[side*.14,.3,.36],.075,suitMat);limb(body,[side*.14,.3,.36],[side*.14,-.39,.65],.055,suitMat);box(body,[.15,.08,.25],[side*.14,-.43,.75],shoeMat)}}
 else{limb(body,[-.11,.83,0],[-.12,.14,.02],.085,suitMat);limb(body,[.11,.83,0],[.12,.14,.02],.085,suitMat);box(body,[.19,.1,.31],[-.12,.07,.1],shoeMat);box(body,[.19,.1,.31],[.12,.07,.1],shoeMat)}
 // Suit torso, shirt and tie.
 const torso=box(upper,[.48,.62,.27],[0,1.16,0],suitMat);torso.rotation.x=-.035;
 box(upper,[.2,.28,.035],[0,1.29,.15],shirtMat);
 const tie= new THREE.Mesh(new THREE.BufferGeometry(),tieMat); // replaced with a tapered business tie below
 const tieGeo=new THREE.CylinderGeometry(.025,.065,.29,4);tie.geometry.dispose();tie.geometry=tieGeo;tie.position.set(0,1.19,.18);tie.rotation.y=Math.PI/4;tie.castShadow=true;upper.add(tie);
 // Arms rest in a restrained, approachable working pose.
 if(seated){limb(upper,[-.25,1.38,0],[-.36,1.07,.15],.063,suitMat);limb(upper,[-.36,1.07,.15],[-.26,1.24,.42],.052,shirtMat);sphere(upper,.065,[-.26,1.24,.43],skinMat);limb(upper,[.25,1.38,0],[.36,1.08,.15],.063,suitMat);limb(upper,[.36,1.08,.15],[.26,1.24,.42],.052,shirtMat);sphere(upper,.065,[.26,1.24,.43],skinMat)}else{limb(upper,[-.25,1.38,0],[-.36,1.07,.07],.063,suitMat);limb(upper,[-.36,1.07,.07],[-.26,.91,.2],.052,shirtMat);sphere(upper,.065,[-.26,.9,.21],skinMat);const waveArm=new THREE.Group();waveArm.position.set(.25,1.38,0);upper.add(waveArm);limb(waveArm,[0,0,0],[.09,.3,.03],.067,suitMat);limb(waveArm,[.09,.3,.03],[.04,.57,.05],.052,shirtMat);sphere(waveArm,.065,[.04,.62,.06],skinMat);root.userData.waveArm=waveArm}
 cylinder(upper,.095,.105,.22,[0,1.58,0],shirtMat);sphere(upper,.17,[0,1.82,0],skinMat);sphere(upper,.175,[0,1.9,-.015],mat('#3b302c'));
 // Eyes and a subtle jacket lapel hint.
 sphere(upper,.016,[.058,1.84,.157],mat('#17212b'));sphere(upper,.016,[-.058,1.84,.157],mat('#17212b'));
 box(upper,[.09,.38,.025],[-.12,1.2,.145],mat('#33485e')).rotation.z=.18;
 // Each avatar owns its materials so the greeting pose can fade without changing every figure.
 root.traverse(object=>{if(object.material){const clone=material=>{const copy=material.clone();copy.transparent=true;copy.depthWrite=false;return copy};object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material)}});
 root.userData.body=body;root.userData.upper=upper;root.userData.accent=accent;return root;
}

export function makeDesk({label='Workstation',screen=true,cup=false,plant=false,style='office'}={}){
 const g=new THREE.Group();
 const topColor=style==='cafe'?'#9b7252':style==='airport'?'#c4cbd1':'#d4b18c';
 box(g,[1.85,.12,1.05],[0,.92,0],mat(topColor));
 for(const x of [-.78,.78])for(const z of [-.39,.39])box(g,[.07,.9,.07],[x,.45,z],metalMat);
 if(screen){box(g,[.69,.43,.055],[0,1.24,-.27],mat('#253545'));box(g,[.61,.34,.025],[0,1.25,-.235],mat('#8eafc5'));box(g,[.07,.19,.07],[0,1.02,-.26],metalMat);box(g,[.34,.035,.2],[0,1.005,.12],mat('#647687'))}
 else{box(g,[.53,.035,.36],[0,1.02,-.16],mat('#384b5a'));box(g,[.5,.24,.025],[0,1.14,-.16],mat('#9db7c8'))}
 if(cup){cylinder(g,.075,.065,.14,[.68,1.04,.2],mat('#f4f1e9'));cylinder(g,.049,.049,.015,[.68,1.116,.2],mat('#654a39'))}
 if(plant){cylinder(g,.095,.13,.16,[-.7,1.05,-.22],mat('#ad795d'));for(const [x,y,z]of[[-.79,1.22,-.22],[-.69,1.3,-.24],[-.61,1.22,-.18]]){const leaf=sphere(g,.085,[x,y,z],mat('#438061'));leaf.scale.set(.65,1.5,.6)}}
 // A laptop, paper documents, and an adjustable task lamp make each station read as a real workplace.
 box(g,[.43,.035,.29],[.02,1.02,.2],mat('#aeb9c2'));box(g,[.43,.29,.035],[.02,1.17,.33],mat('#334b5e'));box(g,[.37,.22,.012],[.02,1.17,.351],mat('#b9cfdd'));
 box(g,[.31,.025,.23],[-.39,1.015,.2],mat('#fffdf7'));box(g,[.31,.012,.23],[-.39,1.035,.2],mat('#dfe6eb'));
 cylinder(g,.09,.1,.1,[.7,1.05,-.28],mat('#53677a'));limb(g,[.7,1.1,-.28],[.63,1.39,-.27],.025,metalMat);limb(g,[.63,1.39,-.27],[.46,1.45,-.25],.025,metalMat);const shade=new THREE.Mesh(new THREE.ConeGeometry(.12,.12,16,1,true),mat('#d6b66c'));shade.position.set(.43,1.47,-.25);shade.rotation.z=Math.PI/2;g.add(shade);
 g.userData.label=label;g.userData.selectable=true;g.userData.role=label;g.userData.detail='Office desk with computer, laptop, task lamp, and working documents.';return g;
}

export function makeChair(){const g=new THREE.Group();cylinder(g,.24,.24,.08,[0,.55,0],mat('#344b61'));box(g,[.43,.48,.09],[0,.83,-.17],mat('#344b61'));cylinder(g,.035,.035,.45,[0,.28,0],metalMat);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;limb(g,[0,.1,0],[Math.cos(a)*.3,.07,Math.sin(a)*.3],.022,metalMat)}return g}
export function makeOfficeStation({role,detail,accent,position=[0,0,0],seated=true,style='office',cup=false,plant=false}={}){
 const g=new THREE.Group();g.position.set(...position);const desk=makeDesk({label:role,style,cup,plant});g.add(desk);
 const title=nameForRole(role,position);const person=makePerson({role,detail,accent,seated,title});person.position.set(0,seated?-0.03:0.93,style==='airport'?0.72:0.72);person.rotation.y=Math.PI;g.add(person);
 const standing=makePerson({role,detail,accent,seated:false,title});standing.position.set(0,-.48,style==='airport'?0.72:0.72);standing.rotation.y=Math.PI;standing.visible=false;g.add(standing);
 const chair=makeChair();chair.position.set(0,-0.07,0.72);chair.rotation.y=Math.PI;chair.userData.selectable=true;chair.userData.role=role;chair.userData.detail='Assigned office chair and workstation seating.';g.add(chair);
 let pose=0,targetPose=0;g.userData.person=person;g.userData.standingPerson=standing;g.userData.role=role;g.userData.title=person.userData.title;desk.userData.title=person.userData.title;g.userData.setGreeting=active=>{targetPose=active?1:0};
 g.userData.poseAnimator=(delta,time)=>{pose=THREE.MathUtils.damp(pose,targetPose,4.2,delta);g.userData.pose=pose;const blend=THREE.MathUtils.smoothstep(pose,0.12,.88);person.visible=blend<.999;standing.visible=blend>.001;person.traverse(o=>{if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.opacity=1-blend}});standing.traverse(o=>{if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.opacity=blend}});standing.position.y=-.48*(1-blend);standing.rotation.y=THREE.MathUtils.lerp(Math.PI,g.userData.cameraFacing??0,blend);if(standing.userData.waveArm){standing.userData.waveArm.rotation.z=blend>.65?Math.sin(time*7.2)*.42:0;standing.userData.waveArm.rotation.x=blend>.65?Math.sin(time*3.6)*.12:0}};
 return g;
}

export function makeIsland({color='#dfe7ec',radius=1.55}={}){const g=new THREE.Group();const base=new THREE.Mesh(new THREE.CylinderGeometry(radius*.92,radius,radius*.25,48),mat(color));base.position.y=-.13;base.castShadow=true;base.receiveShadow=true;g.add(base);const edge=new THREE.Mesh(new THREE.TorusGeometry(radius*.91,.035,8,64),mat('#8799a7'));edge.rotation.x=Math.PI/2;edge.position.y=-.005;g.add(edge);return g}
export function makeRoomShell({width=4,depth=4,color='#e5ebef',walls=true}={}){const g=new THREE.Group();box(g,[width,.18,depth],[0,-.1,0],mat(color));const glass=new THREE.MeshPhysicalMaterial({color:'#c4d9e5',transparent:true,opacity:.28,roughness:.18,metalness:.08});const frame=mat('#8295a4');if(walls){box(g,[width,.045,.06],[0,2.25,-depth/2],frame);const back=new THREE.Mesh(new THREE.BoxGeometry(width-.12,2.18,.035),glass);back.position.set(0,1.14,-depth/2);g.add(back);for(const x of[-width/2,width/2]){box(g,[.06,2.3,.06],[x,1.1,-depth/2],frame);const side=new THREE.Mesh(new THREE.BoxGeometry(.035,2.12,depth*.72),glass);side.position.set(x,1.1,-depth*.12);g.add(side)}for(const x of[-width*.34,width*.34]){box(g,[.12,2.3,.12],[x,1.1,depth/2],frame)}}else for(const x of[-width/2,width/2])box(g,[.12,2.5,.12],[x,1.15,-depth/2],frame);return g}
