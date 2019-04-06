import Viewport from "../src/Viewport.js";
import { Cube } from "../src/geo/Cube.js";
import { Material } from "../index.js";
import { Resources } from "../src/Resources.js";

Resources.add({
    'texture256': require('../res/textures/placeholder_256.png'),
}, false);

const viewport = new Viewport();

viewport.onload = () => {
    viewport.scene.add(new Cube({
        scale: 40,
        material: Material.TEST
    }));
    console.dir(viewport.scene);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});