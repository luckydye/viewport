import Config from "../../src/Config.js";
import { Loader } from "../../src/Loader.js";
import TestMaterial from "../../src/materials/TestMaterial.js";
import { Transform, Vec } from "../../src/Math.js";
import { Resources } from "../../src/Resources.js";
import { Geometry } from "../../src/scene/Geometry.js";
import { Task } from "../../src/Scheduler.js";
import Viewport from "../../Viewport.js";
import { Texture } from "../../src/materials/Texture.js";
import { Plane } from "../../src/geo/Plane.js";
import DefaultMaterial from "../../src/materials/DefaultMaterial.js";
import { Cube } from "../../src/geo/Cube.js";

const viewport = new Viewport();

Resources.add({
    'map_model': require('../../res/models/cs_template.obj'),
    'map_texture': require('../../res/textures/test.png'),
}, false);

viewport.onload = () => {

    const scheduler = viewport.scheduler;
    const scene = viewport.scene;

    viewport.renderer.clearColor = [0.85, 0.85, 1.0, 1.0];

    const texture = new Texture(Resources.get('map_texture'));
    const material = new TestMaterial();
    material.texture = texture;

    scene.add(scene.activeCamera);
    // scene.activeCamera = scene.lightSources;

    const meshVerts = Loader.loadObjFile(Resources.get('map_model'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: material,
        scale: 2,
        id: 10,
    });
    // scene.add(mesh);

    scene.add(new Plane({
        material: new DefaultMaterial(),
        scale: 10000,
        rotation: new Vec(-90 / 180 * Math.PI, 0, 0)
    }));

    scene.add(new Cube({
        material: new DefaultMaterial(),
        scale: 50,
        position: new Vec(400, 800, 0)
    }));

    const camera = viewport.camera;

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
