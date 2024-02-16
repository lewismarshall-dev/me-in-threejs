import * as THREE from 'three';
import scene from './Scene.js';

scene.addLight('hemiLight', new THREE.HemisphereLight(0xffeeb1, 0x080820, 4));
scene.addLight('spotLight', new THREE.SpotLight(0xffa95c, 4), [-50, 75, 50]);
console.log(scene.lights);
scene.loadModel(() => {
  // callback hides loading screen once model loaded
  gsap.to('#loading', { opacity: 0, display: 'none', duration: 0.5 });
});

// setup re-align button overlay
const b = document.querySelector('#b');
scene.configButtonOverlay(b);
b.onclick = () => {
  const { controls, camera, cameraDistance } = scene;

  const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'none' } });
  tl.to(controls.target, { x: 0, y: 0, z: 0 });
  tl.to(camera.position, { x: 0, y: 0, z: cameraDistance }, '<');

  // gsap breaks positioning, gotta put it right after animation
  setTimeout(() => {
    controls.target = new THREE.Vector3(0, 0, 0);
    camera.position.set(0, 0, cameraDistance);
  }, 510);
};
