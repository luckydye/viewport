import Viewport from "../Viewport.js";
import { Cube } from "../src/geo/Cube.js";
import { Vec, Transform, Raycast } from "../src/Math.js";
import TestMaterial from "../src/materials/TestMaterial.js";
import Config from "../src/Config.js";
import { Guide } from "../src/geo/Guide.js";

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
    rotate();

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
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
