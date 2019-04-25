import Viewport from "../../Viewport.js";
import { Transform, Vec, Raycast } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Resources } from "../../src/Resources.js";
import { Loader } from "../../src/Loader.js";
import { Keyframe, Animation } from "../../src/Animation.js";
import { Task } from "../../src/Scheduler.js";
import { Guide } from "../../src/geo/Guide.js";
import { Vector } from "../../src/geo/Vector.js";
import { Geometry } from "../../src/scene/Geometry.js";
import TestMaterial from "../../src/materials/TestMaterial.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/test.obj'),
}, false);

viewport.onload = () => {

    const scheduler = viewport.scheduler;
    const scene = viewport.scene;

    const meshVerts = Loader.loadObjFile(Resources.get('box_model'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: new TestMaterial(),
        scale: 100,
        id: 10,
    });
    scene.add(mesh);

    const camera = viewport.camera;

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }

    const configTask = new Task();
    configTask.execute = (ms) => {
        Config.global.setValue('camera', camera);
        campos.innerText = camera.position + "  |  " + camera.rotation;
        return false;
    }
    scheduler.addTask(configTask);

    setTimeout(() => {
        viewport.setCursor();
    }, 0)
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
