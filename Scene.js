import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let instance;

export class Scene {
  controls = false;
  lights = {};

  constructor() {
    // ensure only one instance is created
    if (instance) return instance;

    const canvas = document.getElementById('c');

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.canvas = this.renderer.domElement;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(20, 2, 0.1, 100); // fov, aspect, near, far
    this.camera.position.set(0, 0, 1);

    if (this.controls) this.#configControls();

    this.#render();

    instance = this;
  }

  loadModel(callback) {
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
      this.#autoframeCamera(gltf.scene);

      // Execute the callback function once the model is loaded
      if (callback && typeof callback === 'function') {
        callback();
      }

      this.scene.add(gltf.scene);
    });
  }

  addLight(name, light, p) {
    // set light's position
    if (p) light.position.set(p[0], p[1], p[2]);

    this.lights = {
      ...this.lights,
      [name]: light,
    };
    this.scene.add(this.lights[name]);
  }

  configButtonOverlay(b) {
    this.buttonOverlay = b;
    this.#configControls();
  }

  #configControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minPolarAngle = Math.PI / 5;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 1200;
  }

  #autoframeCamera(scene) {
    const boundingBox = new THREE.Box3().setFromObject(scene);

    // const boundingBoxHelper = new THREE.Box3Helper(boundingBox, 0xffff00); // Yellow color
    // scene.add(boundingBoxHelper);
    // scene.add(createLine());

    const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
    let boxCenter = boundingBox.getCenter(new THREE.Vector3());

    // move object position to where center is at 0,0,0
    this.scene.position.set(-boxCenter.x, -boxCenter.y, -boxCenter.z);
    boxCenter = this.scene.position;

    // Using TOA from SOHCAHTOA to calculate camera distance to frame scene. i.e. adj = opp / tan(theta)
    // where adj = camera's distance from scene, opp = 1/2 scene's length, and theta == 1/2 camera's FOV
    const opp = (boxSize / 2) * 1.2;
    const theta = THREE.MathUtils.degToRad(this.camera.fov / 2);
    // move camera back along the Z-axis
    this.cameraDistance = opp / Math.tan(theta);
    this.camera.position.z = this.cameraDistance;

    // Set camera target to the center of the bounding box
    this.camera.lookAt(boxCenter);
    // controls.target = boxCenter;

    // pick some near and far values for the frustum that will contain the box.
    this.camera.near = boxSize / 100;
    this.camera.far = boxSize * 100;

    this.camera.updateProjectionMatrix();
  }

  #render() {
    requestAnimationFrame(this.#render.bind(this));

    if (this.#resizeRendererToDisplaySize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    if (this.controls) this.controls.update();

    this.renderer.render(this.scene, this.camera);

    // re-align button toggles if camera is/isn't in default position
    if (this.buttonOverlay) {
      b.disabled =
        this.controls.target.equals(new THREE.Vector3(0, 0, 0)) &&
        this.camera.position.z == this.cameraDistance;
    }
  }

  #resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const needsResize = this.canvas.width !== width || this.canvas.height !== height;

    if (needsResize) {
      this.renderer.setSize(width, height, false);
    }

    return needsResize;
  }
}

export default new Scene();
