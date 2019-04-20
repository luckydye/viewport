import Viewport from "../../Viewport.js";
import { Vec, Transform, Raycast } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Guide } from "../../src/geo/Guide.js";
import { Vector } from "../../src/geo/Vector.js";
import DefaultMaterial from "../../src/materials/DefaultMaterial.js";
import { Cube } from "../../src/geo/Cube.js";
import TestMaterial from "../../src/materials/TestMaterial.js";
import { Plane } from "../../src/geo/Plane.js";

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
    
    viewport.addEventListener('click', e => {
        // define ground plane
        const plane = new Vec(0, 0, 0);
        const normal = new Vec(0, 1, 0);

        // ray
        const ray = new Raycast(camera, e.x, e.y);
        const hit = ray.hit(plane, normal);

        if(hit) {
            viewport.scene.add(new Guide({
                position: hit.position
            }));
        }
    })

    viewport.scene.add([
        new Cube({
            material: new DefaultMaterial(),
            scale: 20,
            position: new Vec(0, 0, 0)
        }),
        new Plane({
            material: new TestMaterial(),
            scale: 2000,
            rotation: new Vec(-90 / 180 * Math.PI, 0, 0)
        }),
        new Guide({
            material: new DefaultMaterial(),
            position: new Vec(0, 400, 0)
        }),
        new Vector({
            points: [
                new Vec(400, 800, 400),
                new Vec(1400, 400, 100),
                new Vec(0, 0, -800),
                new Vec(-1500, -200, 600)
            ]
        })
    ]);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
