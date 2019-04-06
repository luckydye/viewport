import Viewport from "../Viewport.js";
import { Cube } from "../src/geo/Cube.js";
import { Vec } from "../src/Math.js";
import TestMaterial from "../src/materials/TestMaterial.js";

const viewport = new Viewport();

viewport.onload = () => {
    const cube = new Cube({
        scale: 40,
        material: new TestMaterial(),
        origin: new Vec(0, 700, 0)
    });
    
    viewport.scene.add(cube);

    setInterval(() => {
        cube.rotation.y += 0.05;
        cube.rotation.x += 0.025;
    }, 50)
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
