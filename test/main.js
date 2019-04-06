import Viewport from "../src/Viewport.js";
import { Cube } from "../src/geo/Cube.js";
import { Material } from "../index.js";
import { Vec } from "../src/Math.js";

const viewport = new Viewport();

viewport.onload = () => {
    const cube = new Cube({
        scale: 40,
        material: Material.TEST,
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
