import GUI from 'GUI';
import * as THREE from 'three';
import Scene from './Scene.js';

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}

export default function SetupGUI() {
  const { camera, lights, controls } = Scene;

  const gui = new GUI();
  gui.close();
  function createXYZGui(folder, obj, namePrefix, min, max, updateFunc) {
    ['x', 'y', 'z'].forEach((axis) => {
      folder
        .add(obj, axis, min, max)
        .name(`${namePrefix}${axis.toUpperCase()}`)
        .onChange(updateFunc)
        .listen();
    });
  }
  const camFolder = gui.addFolder('Camera');

  const camPosition = { x: 0, y: 0, z: 0 };
  const camLookAt = { x: 0, y: 0, z: 0 };

  createXYZGui(camFolder, camPosition, 'position', undefined, undefined, () => {
    controls.setPosition(camPosition.x, camPosition.y, camPosition.z);
  });

  createXYZGui(camFolder, camLookAt, 'target', undefined, undefined, () => {
    controls.setTarget(camLookAt.x, camLookAt.y, camLookAt.z);
  });

  controls.addEventListener('update', () => {
    Object.assign(camPosition, controls.getPosition());

    Object.assign(camLookAt, controls.getTarget());
  });

  Object.keys(lights).forEach((l) => {
    const light = lights[l];
    console.log(light.type);
    const lightFolder = gui.addFolder(l);
    if (light.type == 'SpotLight') {
      updateLight(light, Scene.helpers[l]);

      lightFolder.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
      lightFolder.add(light, 'intensity', 0, 250, 1);
      lightFolder
        .add(light, 'distance', 0, 100)
        .onChange(() => updateLight(light, Scene.helpers[l]));

      lightFolder
        .add(new DegRadHelper(light, 'angle'), 'value', 0, 90)
        .name('angle')
        .onChange(() => updateLight(light, Scene.helpers[l]));
      lightFolder.add(light, 'penumbra', 0, 1, 0.01);

      createXYZGui(lightFolder, light.position, 'position', -100, 100);
      createXYZGui(lightFolder, light.target.position, 'target', undefined, undefined, () => {
        updateLight(light, Scene.helpers[l]);
      });
    }

    function updateLight(light, helper) {
      light.target.updateMatrixWorld();
      helper.update();
      console.log(light.target.position);
    }
  });
}
