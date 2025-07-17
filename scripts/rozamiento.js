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
    let duracion = 2000;
    let bloque, colgante, anclajeBloque, anclajeColgante;
    const posInicialX = -1.31;
    const posInicialY = 0;
    const posInicialZ = 0;
    const rotZGrados = 45;

    let dx, dy;
    let mover;
    let posicionesBloque = [];
    let posicionesColgante = [];
    let tiempos = [];

    function animar(timestamp) {
          if (!animStart) animStart = timestamp;
          const progreso = Math.min((timestamp - animStart) / duracion, 1);

          const posX = posInicialX + dx * progreso;
          const posY = posInicialY + dy * progreso;
          bloque.setAttribute("position", `${posX} ${posY} ${posInicialZ}`);
          anclajeBloque.setAttribute("position", `${posX} ${posY + 0.25} ${posInicialZ}`);

          const colgY = 2 - 3 * progreso;
          colgante.setAttribute("position", `1.5 ${colgY} 0`);
          anclajeColgante.setAttribute("position", `1.5 ${colgY + 0.25} 0`);

          actualizarCuerda("cuerdaPlano", anclajeBloque, document.getElementById("anclajePolea"));
          actualizarCuerda("cuerdaColgante", document.getElementById("anclajePolea"), anclajeColgante);

          posicionesBloque.push(posX);
          posicionesColgante.push(colgY);
          tiempos.push(((timestamp - animStart) / 1000).toFixed(2)); 

          if (progreso < 1) {
            requestAnimationFrame(animar);
          } else {
            animando = false;
            animStart = null;

            graficarMovimiento();
            posicionesBloque = [];
            posicionesColgante = [];
            tiempos = [];
          }
        }

        function graficarMovimiento() {
          const ctx = document.getElementById("miGrafico").getContext("2d");

          if (window.miGraficoInstance) {
            window.miGraficoInstance.destroy();
          }

          window.miGraficoInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: tiempos,
              datasets: [
                {
                  label: "Posición bloque X (m)",
                  data: posicionesBloque,
                  borderColor: "blue",
                  fill: false,
                  tension: 0.2
                },
                {
                  label: "Posición colgante Y (m)",
                  data: posicionesColgante,
                  borderColor: "green",
                  fill: false,
                  tension: 0.2
                }
              ]
            },
            options: {
              responsive: false,
              scales: {
                x: {
                  title: { display: true, text: "Tiempo (s)" }
                },
                y: {
                  title: { display: true, text: "Posición (m)" }
                }
              }
            }
          });
        }


 
      function iniciarSimulacion() {
          const masaBloque_g = parseFloat(document.getElementById("masaBloque").value);
          const masaColgante_g = parseFloat(document.getElementById("masaColgante").value);

          const masaBloque = masaBloque_g / 1000;
          const masaColgante = masaColgante_g / 1000;

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

          const duracionMin = 100; 
          const duracionMax = 1000; 
          const pesoMaximo_g = 20000; 
          const pesoNormalizado = Math.min(masaColgante_g / pesoMaximo_g, 1);
          duracion = duracionMax - pesoNormalizado * (duracionMax - duracionMin);

          const resultadosDiv = document.getElementById("resultados");
          resultadosDiv.innerHTML = `
            <strong>Resultados de la simulación:</strong><br/>
            Masa del bloque: ${(masaBloque_g).toFixed(2)} g<br/>
            Masa colgante: ${(masaColgante_g).toFixed(2)} g<br/>
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
 