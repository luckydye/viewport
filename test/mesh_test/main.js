import Viewport from "../../Viewport.js";
import { Transform, Vec } from "../../src/Math.js";
import Config from "../../src/Config.js";
import { Resources } from "../../src/Resources.js";
import { Loader } from "../../src/Loader.js";
import { Cube } from "../../src/geo/Cube.js";
import TestMaterial from "../../src/materials/TestMaterial.js";

const viewport = new Viewport();

Resources.add({
    'box_model': require('../../res/models/box.obj'),
}, false);

viewport.onload = () => {

    const mesh = Loader.createMeshFromObjFile(Resources.get('box_model'));
    console.log(mesh);
    
    viewport.scene.add(mesh);

    // viewport.renderer.gl.disable(viewport.renderer.gl.CULL_FACE);

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
