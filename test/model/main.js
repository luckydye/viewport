import Viewport from "../../Viewport.js";
import { Transform, Vec } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Resources } from "../../src/Resources.js";
import { Loader } from "../../src/Loader.js";
import { Keyframe, Animation } from "../../src/Animation.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/test.obj'),
}, false);

viewport.onload = () => {

    const mesh = Loader.createMeshFromObjFile(Resources.get('box_model'));
    console.log(mesh);
    
    viewport.scene.add(mesh);

    const camera = viewport.camera;

    const anim1 = new Animation();
    anim1.setKeyframe(new Keyframe(new Vec(400, 800, 400)));
    anim1.play(camera, 'position');

    const anim2 = new Animation();
    anim2.setKeyframe(new Keyframe(new Vec(400, 800, 400)));
    anim2.play(camera, 'position');

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }
    setInterval(() => {
        Config.global.setValue('camera', camera);
    }, 1000);

    setInterval(() => {
        campos.innerText = camera.position + "  |  " + camera.rotation;
    }, 16);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
