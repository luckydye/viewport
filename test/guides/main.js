import Viewport from "../../Viewport.js";
import { Vec, Transform } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Guide } from "../../src/geo/Guide.js";
import { Vector } from "../../src/geo/Vector.js";
import DefaultMaterial from "../../src/materials/DefaultMaterial.js";
import { Cube } from "../../src/geo/Cube.js";
import TestMaterial from "../../src/materials/TestMaterial.js";

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

    viewport.scene.add(new Cube({
        material: new TestMaterial(),
        scale: 400,
        position: new Vec(0, 0, 0)
    }));

    viewport.scene.add(new Guide({
        material: new DefaultMaterial(),
        scale: 100,
        position: new Vec(0, 400, 0)
    }));

    viewport.scene.add(new Vector({
        points: [
            new Vec(400, 800, 400),
            new Vec(1400, 400, 100),
            new Vec(0, 0, -800),
            new Vec(-1500, -200, 600)
        ]
    }));
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
