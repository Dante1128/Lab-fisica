
window.addEventListener("load", () => {
  const scene = document.querySelector("a-scene");
  if (scene.hasLoaded) {
    scene.enterVR();
  } else {
    scene.addEventListener("loaded", () => {
      scene.enterVR();
    });
  }
});

function actualizarCuerda(idCuerda, puntoA, puntoB) {
  const cuerda = document.getElementById(idCuerda);

  const posA = new THREE.Vector3();
  const posB = new THREE.Vector3();

  puntoA.object3D.getWorldPosition(posA);
  puntoB.object3D.getWorldPosition(posB);

  const diff = new THREE.Vector3().subVectors(posB, posA);
  const longitud = diff.length();

  const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, diff.clone().normalize());

  cuerda.object3D.position.copy(midpoint);
  cuerda.object3D.quaternion.copy(quaternion);

  cuerda.setAttribute("geometry", `primitive: cylinder; radius: 0.01; height: ${longitud}`);
}

let animando = false;
let animStart = null;
const duracion = 2000; // ms
let bloque, colgante, anclajeBloque, anclajeColgante;
const posInicialX = -1.31;
const posInicialY = 0;
const posInicialZ = 0;
const rotZGrados = 45;

let dx, dy;
let mover;

function animar(timestamp) {
  if (!animStart) animStart = timestamp;
  const progreso = Math.min((timestamp - animStart) / duracion, 1);


  const posX = posInicialX + dx * progreso;
  const posY = posInicialY + dy * progreso;
  bloque.setAttribute("position", `${posX} ${posY} ${posInicialZ}`);
  anclajeBloque.setAttribute("position", `${posX} ${posY + 0.25} ${posInicialZ}`);

  
  const colgY = 2 - 3 * progreso; // baja de 2 a -1
  colgante.setAttribute("position", `1.5 ${colgY} 0`);
  anclajeColgante.setAttribute("position", `1.5 ${colgY + 0.25} 0`);


  actualizarCuerda("cuerdaPlano", anclajeBloque, document.getElementById("anclajePolea"));
  actualizarCuerda("cuerdaColgante", document.getElementById("anclajePolea"), anclajeColgante);

  if (progreso < 1) {
    requestAnimationFrame(animar);
  } else {
    animando = false;
    animStart = null;
  }
}
function iniciarSimulacion() {
  const masaBloque = parseFloat(document.getElementById("masaBloque").value);
  const masaColgante = parseFloat(document.getElementById("masaColgante").value);
  const anguloGrados = parseFloat(document.getElementById("angulo").value);
  const angulo = (anguloGrados * Math.PI) / 180;
  const mu = parseFloat(document.getElementById("coefRozamiento").value);
  const g = 9.81;

  const pesoBloque = masaBloque * g;
  const normal = pesoBloque * Math.cos(angulo);
  const fuerzaRozamiento = mu * normal;
  const fuerzaPlano = pesoBloque * Math.sin(angulo);
  const pesoColgante = masaColgante * g;

  mover = pesoColgante > fuerzaPlano + fuerzaRozamiento;


  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <strong>Resultados de la simulación:</strong><br/>
    Masa del bloque: ${masaBloque.toFixed(2)} kg<br/>
    Masa colgante: ${masaColgante.toFixed(2)} kg<br/>
    Ángulo del plano: ${anguloGrados.toFixed(2)}°<br/>
    Coeficiente de rozamiento: ${mu.toFixed(2)}<br/>
    Peso del bloque: ${pesoBloque.toFixed(2)} N<br/>
    Fuerza normal: ${normal.toFixed(2)} N<br/>
    Fuerza de rozamiento: ${fuerzaRozamiento.toFixed(2)} N<br/>
    <br/>
    <strong>Estado del sistema:</strong> ${mover ? "Se mueve" : "No se mueve (fricción mayor o igual)"}
  `;

  bloque = document.querySelector("#objetoBloque");
  colgante = document.querySelector("#objetoColgante");
  anclajeBloque = document.querySelector("#anclajeBloque");
  anclajeColgante = document.querySelector("#anclajeColgante");

  bloque.removeAttribute("animation");
  colgante.removeAttribute("animation");
  anclajeBloque.removeAttribute("animation");
  anclajeColgante.removeAttribute("animation");

  bloque.setAttribute("rotation", `0 0 ${rotZGrados}`);
  bloque.setAttribute("position", `${posInicialX} ${posInicialY} ${posInicialZ}`);
  anclajeBloque.setAttribute("position", `${posInicialX} ${posInicialY + 0.25} ${posInicialZ}`);
  colgante.setAttribute("position", "1.5 2 0");
  anclajeColgante.setAttribute("position", "1.5 2.25 0");

  actualizarCuerda("cuerdaPlano", anclajeBloque, document.getElementById("anclajePolea"));
  actualizarCuerda("cuerdaColgante", document.getElementById("anclajePolea"), anclajeColgante);

  if (mover) {
    const desplazamiento = 3.08;
    dx = desplazamiento * Math.cos(angulo);
    dy = desplazamiento * Math.sin(angulo);

    if (!animando) {
      animando = true;
      animStart = null;
      requestAnimationFrame(animar);
    }
  } else {
    
  }
}

