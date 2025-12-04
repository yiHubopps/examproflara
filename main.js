const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let scene;

function createScene() {
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.05, 0.07, 0.15, 1);

  // Cámara
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    Math.PI / 2,
    Math.PI / 3,
    8,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // Luz
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Ejes
  BABYLON.MeshBuilder.CreateLines(
    "axes",
    {
      points: [
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(3, 0, 0),
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 3, 0),
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 0, 3)
      ]
    },
    scene
  );

  generarSimulacion();

  return scene;
}

function generarSimulacion() {
  scene.meshes.slice().forEach(m => {
    if (m.name !== "axes") m.dispose();
  });

  const I = parseFloat(intensity.value);
  const R = parseFloat(radius.value);
  const D = parseInt(density.value);
  const S = parseFloat(scale.value);

  // Conductor curvo
  const points = [];
  for (let t = -Math.PI / 2; t <= Math.PI / 2; t += Math.PI / 40) {
    points.push(new BABYLON.Vector3(
      R * Math.cos(t),
      R * Math.sin(t),
      0
    ));
  }

  BABYLON.MeshBuilder.CreateLines("wire", { points }, scene);

  // Campo magnético 3D (volumen + flechas)
  for (let x = -3; x <= 3; x += 6 / D) {
    for (let y = -3; y <= 3; y += 6 / D) {
      for (let z = -2; z <= 2; z += 4 / (D / 2)) {

        const r = Math.sqrt(x * x + y * y) + 0.1;
        const strength = I / (r * r);

        const dir = new BABYLON.Vector3(-y, x, 0).normalize();

        const arrow = BABYLON.MeshBuilder.CreateCylinder(
          "arrow",
          { height: strength * S, diameter: 0.05 },
          scene
        );

        arrow.position = new BABYLON.Vector3(x, y, z);
        arrow.lookAt(arrow.position.add(dir));

        const mat = new BABYLON.StandardMaterial("m", scene);
        mat.emissiveColor = new BABYLON.Color3(
          strength,
          0.3,
          1 - strength
        );
        arrow.material = mat;
      }
    }
  }
}

// UI
document.getElementById("update").onclick = generarSimulacion;

// Arranque
createScene();
engine.runRenderLoop(() => scene.render());

window.addEventListener("resize", () => engine.resize());
