import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//helpers
// const axeshelper = new THREE.AxesHelper(5);
// scene.add(axeshelper);

/**
 * Textures
 */
const particleAlphaTexture = new THREE.TextureLoader().load("/particles/5.png");

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  color: "#ca1eb5",
  radius: 11,
  branches: 3,
  spin: 1,
  randomness: 1.4,
  randomPower: 1.8,
  centerFlatness: 3,
  insideColor: "#fe6512",
  outsideColor: "#0984ff",
  addBurst: false,
};

let particlesGeometry = null;
let particlesMaterial = null;
let particlesPointsMesh = null;

function galaxyGenerator() {
  if (particlesGeometry !== null) {
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(particlesPointsMesh);
  }

  //geometry
  particlesGeometry = new THREE.BufferGeometry();

  const particlesPositions = new Float32Array(parameters.count * 3);
  const particlesColors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const radius =
      Math.pow(Math.random(), parameters.randomPower) * parameters.radius;

    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * 2 * Math.PI;
    const i3 = i * 3;

    const randomX =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1);

    particlesPositions[i3] =
      Math.sin(branchAngle + spinAngle) * (radius + randomX);
    particlesPositions[i3 + 1] = parameters.addBurst
      ? randomY / radius
      : randomY / (parameters.centerFlatness + radius);
    particlesPositions[i3 + 2] =
      Math.cos(branchAngle + spinAngle) * radius + randomZ;

    //Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    particlesColors[i3] = mixedColor.r;
    particlesColors[i3 + 1] = mixedColor.g;
    particlesColors[i3 + 2] = mixedColor.b;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlesPositions, 3)
  );
  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(particlesColors, 3)
  );

  //material
  particlesMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    alphaMap: particleAlphaTexture,
  });

  particlesPointsMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesPointsMesh);
}
galaxyGenerator();

gui
  .add(parameters, "size")
  .min(0)
  .max(0.05)
  .step(0.0001)
  .name("Particles size")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "count")
  .min(1500)
  .max(150000)
  .step(10)
  .name("Particles count")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "radius")
  .min(1)
  .max(20)
  .step(0.1)
  .name("Particles radius")
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "branches")
  .min(2)
  .max(15)
  .step(1)
  .name("Particles branches")
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "spin")
  .min(-6)
  .max(6)
  .step(0.1)
  .name("Particles spin")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Particles randomness")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "randomPower")
  .min(0)
  .max(10)
  .step(0.01)
  .name("Particles randomPower")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "centerFlatness")
  .min(1)
  .max(10)
  .step(0.01)
  .name("Particles center flatness")
  .onFinishChange(galaxyGenerator);
gui
  .addColor(parameters, "insideColor")
  .name("Particles center color")
  .onFinishChange(galaxyGenerator);
gui
  .addColor(parameters, "outsideColor")
  .name("Particles border color")
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "addBurst")
  .name("Add burst to center")
  .onFinishChange(galaxyGenerator);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 17;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  particlesPointsMesh.rotation.y =
    parameters.spin < 0 ? elapsedTime * 0.1 : -elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
