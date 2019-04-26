import Config from "../../src/Config.js";
import { Loader } from "../../src/Loader.js";
import TestMaterial from "../../src/materials/TestMaterial.js";
import { Texture } from "../../src/materials/Texture.js";
import { Transform } from "../../src/Math.js";
import { Resources } from "../../src/Resources.js";
import { Geometry } from "../../src/scene/Geometry.js";
import { Task } from "../../src/Scheduler.js";
import Viewport from "../../Viewport.js";

const viewport = new Viewport();

Resources.add({
    'map_model': require('../../res/models/cs_template.obj'),
    'map_texture': require('../../res/textures/test.png'),
}, false);

viewport.onload = () => {
    const scheduler = viewport.scheduler;
    const scene = viewport.scene;
    const camera = viewport.camera;

    viewport.renderer.background = [0.8, 0.9, 1.0, 1.0];

    const material = new TestMaterial();
    material.texture = new Texture(Resources.get('map_texture'));

    const meshVerts = Loader.loadObjFile(Resources.get('map_model'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: material,
        scale: 3,
        id: 10,
    });
    scene.add(mesh);

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }

    const configTask = new Task();
    configTask.execute = (ms) => {
        Config.global.setValue('camera', camera);
        campos.innerHTML = `
            <span>${camera.position}</span>
            <span>${camera.rotation}</span>
            <span>${viewport.frameRate.toFixed(0)}</span>
        `;
        return false;
    }
    scheduler.addTask(configTask);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
