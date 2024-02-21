import GUI from 'GUI';
import Scene from './Scene.js';

export default function SetupGUI() {
  const { camera, lights } = Scene;

  const gui = new GUI();
  const cFolder = gui.addFolder('Camera');
  const camPosition = { x: 0, y: 0, z: 0 };
  cFolder.add(camPosition, 'x').onChange(updateCamPosition).listen();
  cFolder.add(camPosition, 'y').onChange(updateCamPosition).listen();
  cFolder.add(camPosition, 'z').onChange(updateCamPosition).listen();

  const claFolder = cFolder.addFolder('Camera camLookAt');
  const camLookAt = { x: 0, y: 0, z: 0 };
  cFolder.add(camLookAt, 'x').onChange(updateCamcamLookAt).listen();
  cFolder.add(camLookAt, 'y').onChange(updateCamcamLookAt).listen();
  cFolder.add(camLookAt, 'z').onChange(updateCamcamLookAt).listen();

  function updateCamPosition() {
    Scene.controls.setPosition(camPosition.x, camPosition.y, camPosition.z);
  }

  function updateCamcamLookAt() {
    Scene.controls.setTarget(camLookAt.x, camLookAt.y, camLookAt.z);
  }

  Scene.controls.addEventListener('update', () => {
    const position = Scene.controls.getPosition();
    camPosition.x = position.x;
    camPosition.y = position.y;
    camPosition.z = position.z;

    const target = Scene.controls.getTarget();
    camLookAt.x = target.x;
    camLookAt.y = target.y;
    camLookAt.z = target.z;
  });

  // Object.keys(lights).forEach((l) => {
  //   console.log(l);
  //   const lFolder = gui.addFolder(l);
  //   lFolder.add(lights[l].position, 'x', -100, 100).listen();
  //   lFolder.add(lights[l].position, 'y', -100, 100).listen();
  //   lFolder.add(camera.position, 'z', -100, 100).listen();
  // });
}
