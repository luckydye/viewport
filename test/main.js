import Viewport from "../Viewport.js";
import { Cube } from "../src/geo/Cube.js";
import { Vec, Transform } from "../src/Math.js";
import TestMaterial from "../src/materials/TestMaterial.js";
import Config from "../src/Config.js";

const viewport = new Viewport();

viewport.onload = () => {

    const camera = viewport.camera;

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }
    setInterval(() => {
        Config.global.setValue('camera', camera);
    }, 1000);

    const cube = new Cube({
        scale: 20,
        material: new TestMaterial(),
        position: new Vec(0, 0, 0)
    });
    
    viewport.scene.add(cube);

    function rotate() {
        cube.rotation.y += 0.01;
        cube.rotation.x += 0.005;
        requestAnimationFrame(rotate);
    }
    // rotate();
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
