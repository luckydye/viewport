import Viewport from "../../Viewport.js";
import { Transform, Vec } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Resources } from "../../src/Resources.js";
import { Task, Scheduler } from "../../src/Scheduler.js";
import { Emitter } from "../../src/geo/Emitter.js";
import { Cube } from "../../src/geo/Cube.js";
import DefaultMaterial from "../../src/materials/DefaultMaterial.js";
import TestMaterial from "../../src/materials/TestMaterial.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/test.obj'),
}, false);

viewport.onload = () => {

    const scheduler = viewport.scheduler;
    const scene = viewport.scene;

    const camera = viewport.camera;

    const emitter = new Emitter();

    scene.add(emitter);

    scene.add(new Cube({
        material: new TestMaterial(),
        scale: 30,
        id: 10
    }))

    scene.add(new Cube({
        material: new TestMaterial(),
        position: new Vec(600, 500, 10),
        scale: 15,
        id: 30
    }))

    scene.add(new Cube({
        material: new TestMaterial(),
        position: new Vec(600, 1000, 800),
        scale: 15,
        id: 20
    }))

    // viewport.setCursor();

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
            <span>${viewport.renderer.frameRate.toFixed(0)}</span>
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
