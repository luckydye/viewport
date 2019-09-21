import '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';
import { Geometry } from '../src/scene/Geometry.js';
import { Loader } from '../src/Loader.js';
import { Texture } from '../src/materials/Texture.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Plane } from '../src/geo/Plane.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import PrimitiveShader from '../src/shader/PrimitiveShader.js';
import { Cube } from '../src/geo/Cube.js';
import CompShader from '../src/shader/CompShader.js';

Config.global.load();
Config.global.save();

Resources.add({
    'model': 'models/sphere.obj',
}, false);

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', () => {
        init();
    });
})

function init() {

    const paperTexture = new Texture(Resources.get('paper'));
    const noiseTexture = new Texture(Resources.get('noise'));
    const noiseTexture2 = new Texture(Resources.get('noise2'));

    const renderer = viewport.renderer;

    viewport.renderer.setResolution(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
        viewport.renderer.setResolution(window.innerWidth, window.innerHeight);
    })

    new PlayerControler(viewport.camera, viewport);

    viewport.camera.position.z = -500;
    viewport.camera.position.y = -200;

    viewport.scene.add(new Geometry({
        position: [0, 200, 0],
        vertecies: Loader.loadObjFile(Resources.get('model')),
        scale: 50
    }));

    viewport.scene.add(new Plane({
        rotation: [90 * Math.PI / 180, 0, 0],
        scale: 1000
    }));
}
