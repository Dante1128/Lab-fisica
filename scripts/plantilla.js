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