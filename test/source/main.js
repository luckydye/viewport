import Config from "../../src/Config.js";
import { Loader } from "../../src/Loader.js";
import TestMaterial from "../../src/materials/TestMaterial.js";
import { Transform } from "../../src/Math.js";
import { Resources } from "../../src/Resources.js";
import { Geometry } from "../../src/scene/Geometry.js";
import { Task, Scheduler } from "../../src/Scheduler.js";
import Viewport from "../../Viewport.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/dota2.obj'),
}, false);

viewport.onload = () => {

    const scheduler = viewport.scheduler;
    const scene = viewport.scene;

    const meshVerts = Loader.loadObjFile(Resources.get('box_model'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: new TestMaterial(),
        id: 10,
    });
    scene.add(mesh);

    const camera = viewport.camera;

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }

    const configTask = new Task();
    const timer = Scheduler.timer(120, () => {
        Config.global.setValue('camera', camera);
        campos.innerHTML = `
            <span>${camera.position}</span>
            <span>${camera.rotation}</span>
            <span>${viewport.frameRate.toFixed(0)}</span>
        `;
    })
    configTask.execute = (ms) => {
        timer(ms);
        return false;
    }
    scheduler.addTask(configTask);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
