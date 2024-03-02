import * as THREE from 'three';
import Scene from './Scene.js';
import SetupGUI from './gui.js';

const params = new URLSearchParams(window.location.search);
const helpParam = params.get('helpParam');
const compressionParam = params.get('compression');

if (helpParam) {
  Scene.addLight('spotLight', new THREE.SpotLight(0xffa95c, 4), true, [-50, 75, 50]);
  // Scene.addLight('directionalLight', new THREE.DirectionalLight(0xffa95c, 4), true, [-50, 75, 50]);
  Scene.addLight('hemiLight', new THREE.HemisphereLight(0xffeeb1, 0x080820, 4));

  SetupGUI();
} else {
  Scene.addLight('hemiLight', new THREE.HemisphereLight(0xffeeb1, 0x080820, 4));
  Scene.addLight('spotLight', new THREE.SpotLight(0xffa95c, 4), false, [-50, 75, 50]);
}

Scene.loadModel(compressionParam, () => {
  // callback hides loading screen once model loaded
  gsap.to('#loading', { opacity: 0, display: 'none', duration: 0.5 });
  if (helpParam) {
    const y = 75.7;
    const z = 105;
    Scene.controls.setLookAt(0, y, z, 0, y, 0);
  }
});

configRealignButton();
function configRealignButton() {
  // setup re-align button overlay
  const b = document.querySelector('#b');
  Scene.configButtonOverlay(b);
  b.onclick = () => {
    const { controls } = Scene;
    controls.setLookAt(0, 0, Scene.cameraDistance, 0, 0, 0, true);
  };
}
