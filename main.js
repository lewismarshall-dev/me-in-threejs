import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SetupGUI from './gui.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
  premultipliedAlpha: false,
});
renderer.toneMapping = THREE.ReinhardToneMapping;
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x2b1b17);

const camera = new THREE.PerspectiveCamera(20, 2, 0.1, 100); // fov, aspect, near, far
camera.position.set(0, 0, 1);

// configure DRACO loader to decode compressed model file
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

// add model
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load('model_drc.glb', (gltf) => {
  gltf.scene.position.set(0, 0, 0);
  gltf.scene.scale.set(1, 1, 1);
  autoframeCamera(gltf.scene);

  gsap.to('#loading', { opacity: 0, display: 'none', duration: 0.5 });
  scene.add(gltf.scene);
});

let cameraDistance, boxCenter;
function autoframeCamera(scene) {
  const boundingBox = new THREE.Box3().setFromObject(scene);

  const boundingBoxHelper = new THREE.Box3Helper(boundingBox, 0xffff00); // Yellow color
  // scene.add(boundingBoxHelper);
  // scene.add(createLine());

  const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
  boxCenter = boundingBox.getCenter(new THREE.Vector3());

  // move object position to where center is at 0,0,0
  scene.position.set(-boxCenter.x, -boxCenter.y, -boxCenter.z);
  boxCenter = scene.position;

  // Using TOA from SOHCAHTOA to calculate camera distance to frame scene. i.e. adj = opp / tan(theta)
  // where adj = camera's distance from scene, opp = 1/2 scene's length, and theta == 1/2 camera's FOV
  const opp = (boxSize / 2) * 1.2;
  const theta = THREE.MathUtils.degToRad(camera.fov / 2);
  cameraDistance = opp / Math.tan(theta);

  // Set camera target to the center of the bounding box
  // camera.lookAt(boxCenter);
  // controls.target = boxCenter;

  // pick some near and far values for the frustum that will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  // move camera back along the Z-axis
  camera.position.z = cameraDistance;

  camera.updateProjectionMatrix();
}

const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
scene.add(hemiLight);

const light = new THREE.SpotLight(0xffa95c, 4);
light.position.set(-50, 75, 50);
scene.add(light);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// const lightHelper = new THREE.SpotLightHelper(light);
// scene.add(lightHelper);

const controls = new OrbitControls(camera, renderer.domElement);

controls.minPolarAngle = Math.PI / 5;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 200;
controls.maxDistance = 1200;

const b = document.querySelector('#b');

// Animation loop
function render() {
  requestAnimationFrame(render);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  b.disabled =
    controls.target.equals(new THREE.Vector3(0, 0, 0)) && camera.position.z == cameraDistance;

  renderer.render(scene, camera);
}
render();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needsResize = canvas.width !== width || canvas.height !== height;

  if (needsResize) {
    renderer.setSize(width, height, false);
  }

  return needsResize;
}

b.onclick = () => {
  const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'none' } });
  tl.to(controls.target, { x: 0, y: 0, z: 0 });
  tl.to(camera.position, { x: 0, y: 0, z: cameraDistance }, '<');

  // gsap breaks positioning, gotta put it right after animation
  setTimeout(() => {
    controls.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, cameraDistance);
  }, 510);
};

function createLine() {
  // Create a buffer geometry
  let eyeline = 63.65;
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -100,
    eyeline,
    50, // Start point (x=-10, y=1.802510678768158, z=0)
    100,
    eyeline,
    50, // End point (x=10, y=1.802510678768158, z=0)
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  // Create a material
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Create a line using the geometry and material
  const line = new THREE.Line(geometry, material);
  return line;
}

// SetupGUI(camera);
