// The Yes, And Machine v1 — suggestions work even when WebGL is unavailable.
const places = [
  "At a moon laundromat.",
  "Inside a very tiny museum.",
  "At the last cheese shop on Earth.",
  "Backstage at a ghost talent show.",
  "On a suspiciously polite pirate ship.",
  "At a dragon’s yard sale.",
  "In a cloud repair shop.",
  "At a lakeside robot picnic.",
];
const relationships = [
  "You’re rival tour guides.",
  "You’re roommates with a secret.",
  "You’re first-time business partners.",
  "You’re siblings planning a surprise.",
  "You’re an apprentice and a very lost expert.",
  "You’re strangers sharing an umbrella.",
];
const twists = [
  "Every sock holds a tiny universe.",
  "Gravity takes a coffee break.",
  "Everything you say becomes a song title.",
  "The furniture is judging your choices.",
  "Someone has misplaced Tuesday.",
  "You both think the other is royalty.",
  "A very small parade needs your help.",
  "The only rule is: celebrate every mistake.",
];
const stage = document.querySelector("#stage");
const status = document.querySelector("#render-status");
const motionButton = document.querySelector("#motion");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reducedMotion.matches;
let energy = 0.45;
let sceneNumber = 1;
let burst = 0;
let renderOnce = () => {};
let updateLoop = () => {};

// Choose a different suggestion on every click and announce the new scene accessibly.
function chooseDifferent(items, current) {
  const options = items.filter((item) => item !== current);
  return options[Math.floor(Math.random() * options.length)];
}
document.querySelector("#new-scene").addEventListener("click", () => {
  for (const [id, items] of [
    ["place", places],
    ["relationship", relationships],
    ["twist", twists],
  ]) {
    const element = document.getElementById(id);
    element.textContent = chooseDifferent(items, element.textContent);
  }
  document.querySelector("#scene-number").textContent =
    `SCENE ${String(++sceneNumber).padStart(3, "0")}`;
  burst = paused ? 0 : 1;
  renderOnce();
});
document.querySelector("#energy").addEventListener("input", (event) => {
  energy = Number(event.target.value) / 100;
  document.querySelector("#energy-label").textContent =
    energy < 0.3 ? "Mellow" : energy < 0.7 ? "Playful" : "Full weird";
  renderOnce();
});
function syncMotion() {
  motionButton.textContent = paused ? "Resume motion" : "Pause motion";
  motionButton.setAttribute("aria-pressed", String(paused));
  updateLoop();
}
motionButton.addEventListener("click", () => {
  paused = !paused;
  syncMotion();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  syncMotion();
});
syncMotion();

// Load the pinned local Three.js distribution; no build step or CDN is needed.
try {
  const THREE = await import("./vendor/three.module.js");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xffe974, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "A miniature circular improv stage with two colorful characters, a microphone, and floating confetti. Drag horizontally to rotate.",
  );
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 60);
  camera.position.set(0, 5.5, 10.8);
  camera.lookAt(0, 1, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb36339, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const world = new THREE.Group();
  world.rotation.y = -0.2;
  scene.add(world);
  const material = (color) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  const pink = material(0xbd005b),
    orange = material(0xe55937),
    cream = material(0xf7f6f3),
    dark = material(0x231d25);
  function mesh(geometry, surface, parent, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  // Build a toy theater from reusable primitives, including a lit proscenium arch.
  mesh(new THREE.CylinderGeometry(3.05, 3.15, 0.3, 64), pink, world, 0, -0.05);
  mesh(new THREE.CylinderGeometry(2.98, 2.98, 0.08, 64), cream, world, 0, 0.14);
  mesh(
    new THREE.TorusGeometry(2.5, 0.15, 12, 72, Math.PI),
    orange,
    world,
    0,
    0.65,
    -0.75,
  );
  for (const x of [-2.5, 2.5])
    mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.55, 16),
      orange,
      world,
      x,
      0.4,
      -0.75,
    );
  for (let i = 0; i < 11; i++) {
    const angle = (i / 10) * Math.PI;
    mesh(
      new THREE.SphereGeometry(0.065, 12, 8),
      cream,
      world,
      Math.cos(angle) * 2.5,
      0.65 + Math.sin(angle) * 2.5,
      -0.58,
    );
  }
  const ground = mesh(
    new THREE.PlaneGeometry(200, 200),
    material(0xffe974),
    scene,
    0,
    -0.23,
  );
  ground.rotation.x = -Math.PI / 2;

  // Give the two improvisers eyes, feet, and expressive arms.
  function player(x, surface, round) {
    const group = new THREE.Group();
    group.position.set(x, 0.22, 0.15);
    world.add(group);
    const body = mesh(
      round
        ? new THREE.SphereGeometry(0.64, 32, 24)
        : new THREE.BoxGeometry(1.04, 1.08, 0.9),
      surface,
      group,
      0,
      1.04,
    );
    if (!round) body.rotation.z = -0.08;
    for (const side of [-1, 1]) {
      mesh(
        new THREE.CapsuleGeometry(0.1, 0.34, 4, 12),
        dark,
        group,
        side * 0.25,
        0.29,
      );
      mesh(
        new THREE.SphereGeometry(0.15, 16, 12),
        dark,
        group,
        side * 0.25,
        0.09,
        0.12,
      ).scale.set(1, 0.6, 1.5);
      mesh(
        new THREE.SphereGeometry(0.125, 16, 12),
        cream,
        group,
        side * 0.21,
        1.19,
        0.53,
      );
      mesh(
        new THREE.SphereGeometry(0.061, 12, 8),
        dark,
        group,
        side * 0.21,
        1.19,
        0.635,
      );
      const arm = mesh(
        new THREE.CapsuleGeometry(0.085, 0.42, 4, 12),
        surface,
        group,
        side * 0.7,
        0.93,
      );
      arm.rotation.z = side * 0.9;
    }
    const smile = mesh(
      new THREE.TorusGeometry(0.15, 0.035, 8, 24, Math.PI),
      dark,
      group,
      0,
      0.96,
      0.59,
    );
    smile.rotation.z = Math.PI;
    return group;
  }
  const players = [player(-1.08, orange, true), player(1.08, pink, false)];
  mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1.45, 12),
    dark,
    world,
    0,
    0.91,
    0.9,
  );
  mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.06, 24),
    dark,
    world,
    0,
    0.22,
    0.9,
  );
  mesh(
    new THREE.CapsuleGeometry(0.105, 0.17, 4, 16),
    dark,
    world,
    0,
    1.73,
    0.9,
  ).rotation.z = -0.35;
  const confetti = Array.from({ length: 22 }, (_, i) => {
    const angle = i * 2.39996;
    const object = mesh(
      new THREE.BoxGeometry(0.09, 0.2, 0.055),
      [pink, orange, cream][i % 3],
      world,
      Math.cos(angle) * 2.6,
      1.8 + (i % 5) * 0.39,
      Math.sin(angle) * 1.6,
    );
    object.userData.baseY = object.position.y;
    object.rotation.set(i, i * 0.5, i);
    return object;
  });

  // Rotate with pointer input; retain vertical touch scrolling inside the embed.
  let dragStart = null;
  renderer.domElement.addEventListener("pointerdown", (event) => {
    dragStart = { x: event.clientX, rotation: world.rotation.y };
    renderer.domElement.setPointerCapture(event.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    world.rotation.y =
      dragStart.rotation + (event.clientX - dragStart.x) * 0.008;
    renderOnce();
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    renderer.domElement.addEventListener(event, () => {
      dragStart = null;
    });

  // Pause GPU work when hidden, offscreen, or paused. Clamp time after resuming.
  let visible = true;
  let contextLost = false;
  let previousTime = 0;
  let elapsed = 0;
  renderOnce = () => {
    if (!contextLost) renderer.render(scene, camera);
  };
  function animate(now) {
    const delta = previousTime
      ? Math.min((now - previousTime) / 1000, 0.05)
      : 0;
    previousTime = now;
    elapsed += delta * (0.5 + energy * 1.9);
    burst = Math.max(0, burst - delta * 0.8);
    players.forEach((player, i) => {
      player.position.y =
        0.22 +
        Math.abs(Math.sin(elapsed * 2.7 + i)) *
          (0.04 + energy * 0.2 + burst * 0.25);
      player.rotation.z =
        Math.sin(elapsed * 1.9 + i * 2) * (0.03 + energy * 0.12);
      player.rotation.y = Math.sin(elapsed + i * 2) * 0.16;
    });
    confetti.forEach((piece, i) => {
      piece.position.y =
        piece.userData.baseY + Math.sin(elapsed + i) * (0.12 + energy * 0.3);
      piece.rotation.z += delta * (0.3 + energy);
    });
    renderOnce();
  }
  updateLoop = () => {
    previousTime = 0;
    renderer.setAnimationLoop(
      !paused && visible && !document.hidden && !contextLost ? animate : null,
    );
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateLoop();
  }).observe(stage);
  document.addEventListener("visibilitychange", updateLoop);
  new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1.15 ? 13.2 : 10.8;
    camera.updateProjectionMatrix();
    renderOnce();
  }).observe(stage);
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    status.hidden = false;
    status.textContent =
      "The 3D stage is taking a break. You can still make a scene using the suggestions.";
    updateLoop();
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    contextLost = false;
    status.hidden = true;
    renderOnce();
    updateLoop();
  });
  status.hidden = true;
  stage.dataset.renderer = `three-r${THREE.REVISION}`;
  renderOnce();
  updateLoop();
} catch (error) {
  status.textContent =
    "The 3D stage needs WebGL 2 in a supported browser. The scene generator is still ready to play.";
  motionButton.disabled = true;
  console.warn("Amalgam 3D stage could not start:", error);
}
