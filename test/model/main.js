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
        scale: 100
    });
    scene.add(mesh);

    const camera = viewport.camera;

    const anim2 = new Animation(camera, 'position', 3000, true);
    anim2.setKeyframe(new Keyframe(new Vec(0, -200, 0)));
    anim2.setKeyframe(new Keyframe(new Vec(0, -1000, 500)));
    // scheduler.addTask(anim2);

    const anim1 = new Animation(camera, 'rotation', 3000, true);
    anim1.setKeyframe(new Keyframe(new Vec(1.00, -1.5, 0)));
    anim1.setKeyframe(new Keyframe(new Vec(0.14, -2.1, 0)));
    // scheduler.addTask(anim1);

    scene.add(new Guide({
        position: Vec.multiply(anim2.keyframes[0].input, new Vec(-1, -1, -1))
    }));

    scene.add(new Guide({
        position: Vec.multiply(anim2.keyframes[1].input, new Vec(-1, -1, -1))
    }));

    scene.add(new Vector({
        points: [
            Vec.multiply(anim2.keyframes[0].input, new Vec(-1, -1, -1)),
            Vec.multiply(anim2.keyframes[1].input, new Vec(-1, -1, -1))
        ]
    }));

    viewport.setCursor(mesh);

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
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
