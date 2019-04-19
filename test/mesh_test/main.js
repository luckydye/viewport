import Viewport from "../../Viewport.js";
import { Transform } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Resources } from "../../src/Resources.js";
import { Loader } from "../../src/Loader.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/box.obj'),
}, false);

viewport.onload = () => {

    const boxData = Resources.get('box_model');
    console.log(boxData);

    const mesh = Loader.createMeshFromObj(boxData);
    viewport.scene.add(mesh);

    const camera = viewport.camera;

    const savedPosition = Config.global.getValue('camera');
    if(savedPosition) {
        camera.setPositionTo(new Transform(savedPosition));
    }
    setInterval(() => {
        Config.global.setValue('camera', camera);
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(viewport);
});
