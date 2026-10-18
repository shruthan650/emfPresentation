import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTallStructure } from './tallStructure.js';
import { createFlatStructure } from './flatStructure.js';
import { createNetworkStructure } from './networkStructure.js';
import { createVirtualStructure } from './virtualStructure.js';
import { initUI } from './uiController.js';

const canvas = document.querySelector('#scene');
const stage = document.querySelector('#canvas-wrap');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#eef2f5');
scene.fog = new THREE.Fog('#eef2f5', 24, 48);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(11, 14, 20);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 6;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 4.2, 0);

scene.add(new THREE.HemisphereLight('#ffffff', '#b6c1ca', 2.1));
const keyLight = new THREE.DirectionalLight('#fff6e8', 3.1);
keyLight.position.set(-7, 15, 9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight('#d7eaff', 1.25);
fillLight.position.set(8, 7, -8);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: '#e9edf0', roughness: 0.87 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(100, 100, '#cad3da', '#dce2e7');
grid.position.y = 0.005;
for (const material of (Array.isArray(grid.material) ? grid.material : [grid.material])) {
  material.transparent = true;
  material.opacity = 0.32;
}
scene.add(grid);

const builders = {
  tall: createTallStructure,
  flat: createFlatStructure,
  network: createNetworkStructure,
  virtual: createVirtualStructure
};
let activeStructure = null;
let transition = null;
let elapsed = 0;
let greetedStation = null;
let poseStations = [];

function animateCamera(target, position, duration = 850) {
  transition = {
    fromPosition: camera.position.clone(),
    toPosition: position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
    start: performance.now(),
    duration
  };
}

function disposeGroup(group) {
  group.traverse(object => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    }
  });
}

function selectStructure(name) {
  if (greetedStation) greetedStation.userData.setGreeting(false);
  greetedStation = null;
  const speechBubble = document.querySelector('#speech-bubble');
  if (speechBubble) speechBubble.hidden = true;
  if (activeStructure) {
    scene.remove(activeStructure.group);
    disposeGroup(activeStructure.group);
  }
  const builder = builders[name] || builders.tall;
  activeStructure = builder();
  scene.add(activeStructure.group);
  poseStations = [];
  activeStructure.group.traverse(object => {
    if (object.userData?.poseAnimator) poseStations.push(object);
  });
  document.querySelector('#inspection-backdrop').hidden = true;
  selectedBounds.visible = false;
  window.dispatchEvent(new CustomEvent('structure:zones', { detail: { name } }));
  animateCamera(activeStructure.focus.clone(), activeStructure.camera.clone());
}

const selectedBounds = new THREE.BoxHelper(new THREE.Object3D(), 0x1769aa);
selectedBounds.visible = false;
scene.add(selectedBounds);
initUI({ onChange: selectStructure });

const roomViews = {
  tall: [
    [[0, 4.2, 0], [11, 14, 20]], [[0, 9, 0], [9, 12, 15]],
    [[-0.5, 5, 0], [9, 8, 12]], [[0, 0.5, 0], [8, 4, 9]]
  ],
  flat: [
    [[0, 0.8, 0], [10, 8, 12]], [[-4, 1, 0], [5, 4, 7]],
    [[-1, 1, 0], [5, 4, 7]], [[2, 1, 0], [5, 4, 7]], [[4, 1, 0], [5, 4, 7]]
  ],
  network: [
    [[0, 1, 0], [11, 9, 13]], [[0, 1, 0], [6, 4, 7]], [[-4, 1, 0], [5, 4, 6]],
    [[0, 1, -4], [5, 4, 6]], [[4, 1, 0], [5, 4, 6]], [[0, 1, 4], [5, 4, 6]]
  ],
  virtual: [
    [[0, 1, 0], [12, 10, 15]], [[-4, 1, 0], [5, 4, 7]], [[-2, 1, -3], [5, 4, 7]],
    [[2, 1, -3], [5, 4, 7]], [[4, 1, 0], [5, 4, 7]], [[0, 1, 4], [5, 4, 7]]
  ]
};
window.addEventListener('structure:room', event => {
  const views = roomViews[event.detail.name] || roomViews.tall;
  const [target, position] = views[event.detail.index] || views[0];
  animateCamera(new THREE.Vector3(...target), new THREE.Vector3(...position));
});
window.addEventListener('structure:birdseye', () => {
  const target = activeStructure?.focus.clone() || new THREE.Vector3();
  animateCamera(target, new THREE.Vector3(target.x, 20, target.z + 0.01), 900);
});
window.addEventListener('structure:zones', () => { selectedBounds.visible = false; });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const stationWorldPosition = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
let hoveredObject = null;
const inspection = document.querySelector('#inspection-backdrop');
const speechBubble = document.querySelector('#speech-bubble');
speechBubble.style.cssText = 'position:absolute;z-index:5;transform:translate(-50%,-100%);max-width:260px;padding:12px 16px;border:2px solid #1e3a56;border-radius:14px;background:#fff;color:#111827;box-shadow:0 8px 24px #172b3a25;font:700 18px/1.35 system-ui,sans-serif;text-align:center;white-space:nowrap;pointer-events:none';
const greetingLine = document.querySelector('#greeting-line');
function findStation(object) {
  for (let current = object; current; current = current.parent) {
    if (typeof current.userData?.setGreeting === 'function') return current;
  }
  return null;
}
function updateSpeechBubble() {
  if (!greetedStation || greetedStation.userData.pose < 0.06) {
    speechBubble.hidden = true;
    return;
  }
  const person = greetedStation.userData.standingPerson;
  if (!person) return;
  const point = new THREE.Vector3(0, 2.58, 0);
  person.localToWorld(point);
  point.project(camera);
  if (point.z < -1 || point.z > 1) {
    speechBubble.hidden = true;
    return;
  }
  const rect = stage.getBoundingClientRect();
  speechBubble.style.left = `${THREE.MathUtils.clamp((point.x * .5 + .5) * rect.width, 120, rect.width - 120)}px`;
  speechBubble.style.top = `${THREE.MathUtils.clamp((-.5 * point.y + .5) * rect.height, 70, rect.height - 24)}px`;
  speechBubble.hidden = false;
}
function findSelectable(object) {
  for (let current = object; current; current = current.parent) {
    if (current.userData?.selectable) return current;
  }
  return null;
}
function closeInspection() {
  if (greetedStation) greetedStation.userData.setGreeting(false);
  greetedStation = null;
  speechBubble.hidden = true;
  greetingLine.hidden = true;
  inspection.hidden = true;
  selectedBounds.visible = false;
}
function inspect(object) {
  if (!object) {
    closeInspection();
    return;
  }
  const role = object.userData.role || object.userData.label || 'Team member';
  const detail = object.userData.detail || 'Contributes to the team’s work and shared goals.';
  const name = object.userData.title || role;
  if (greetedStation && greetedStation !== findStation(object)) greetedStation.userData.setGreeting(false);
  greetedStation = findStation(object);
  if (greetedStation) greetedStation.userData.setGreeting(true);
  document.querySelector('#inspection-name').textContent = name;
  document.querySelector('#inspection-role').textContent = role;
  greetingLine.textContent = greetedStation ? `👋 Hi! I'm ${name}.` : '';
  greetingLine.hidden = !greetedStation;
  document.querySelector('#inspection-detail').textContent = detail;
  document.querySelector('#inspection-reports').textContent = object.userData.connections || 'Works with the relevant team through the reporting structure shown.';
  inspection.hidden = false;
  selectedBounds.setFromObject(object);
  selectedBounds.visible = true;
  const target = new THREE.Vector3();
  object.getWorldPosition(target);
  const cameraOffset = name === 'Ravi Shah'
    ? new THREE.Vector3(-3.5, 2.4, -5.8)
    : new THREE.Vector3(4, 3, 6);
  animateCamera(target, target.clone().add(cameraOffset), 700);
}
document.querySelector('#inspection-close').addEventListener('click', closeInspection);
inspection.addEventListener('click', event => { if (event.target === inspection) closeInspection(); });

function pick(event, activate = false) {
  if (!activeStructure) return;
  const rect = canvas.getBoundingClientRect();
  pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(activeStructure.group, true)
    .map(intersection => findSelectable(intersection.object)).find(Boolean) || null;
  canvas.style.cursor = hit ? 'pointer' : 'grab';
  if (hit !== hoveredObject) {
    if (hoveredObject) hoveredObject.scale.setScalar(1);
    hoveredObject = hit;
    if (hoveredObject) hoveredObject.scale.setScalar(1.06);
  }
  if (activate) inspect(hit);
}
canvas.addEventListener('pointermove', event => pick(event));
canvas.addEventListener('pointerleave', () => {
  canvas.style.cursor = 'grab';
  if (hoveredObject) hoveredObject.scale.setScalar(1);
  hoveredObject = null;
});
canvas.addEventListener('click', event => pick(event, true));

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  // Widen the view on portrait screens so broad structures are not cropped
  // by the narrow phone viewport. Restore the presentation FOV in landscape.
  camera.fov = camera.aspect < 1 ? Math.min(65, 38 / camera.aspect) : 38;
  camera.updateProjectionMatrix();
}
let resizeFrame = 0;
function scheduleResize() {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resize();
  });
}
new ResizeObserver(scheduleResize).observe(stage);
window.addEventListener('resize', scheduleResize);
window.addEventListener('orientationchange', () => {
  // Mobile browsers can report the new viewport one frame after rotation.
  requestAnimationFrame(() => requestAnimationFrame(scheduleResize));
});
scheduleResize();

const clock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;
  activeStructure?.update(elapsed);
  for (const station of poseStations) {
    station.getWorldPosition(stationWorldPosition);
    cameraDirection.subVectors(camera.position, stationWorldPosition);
    station.userData.cameraFacing = Math.atan2(cameraDirection.x, cameraDirection.z);
    station.userData.poseAnimator(delta, elapsed);
  }
  if (transition) {
    const progress = Math.min((performance.now() - transition.start) / transition.duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
    controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
    if (progress === 1) transition = null;
  }
  controls.update();
  updateSpeechBubble();
  renderer.render(scene, camera);
}
render();
