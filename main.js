import * as THREE from 'three';
import Scene from './Scene.js';
import SetupGUI from './gui.js';

Scene.addLight('hemiLight', new THREE.HemisphereLight(0xffeeb1, 0x080820, 4));
Scene.addLight('spotLight', new THREE.SpotLight(0xffa95c, 4), [-50, 75, 50]);
Scene.loadModel(() => {
  // callback hides loading screen once model loaded
  gsap.to('#loading', { opacity: 0, display: 'none', duration: 0.5 });
});

// SetupGUI();

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
