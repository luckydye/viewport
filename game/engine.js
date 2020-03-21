import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import { Plane } from '../src/geo/Plane.js';
import Input from '../src/Input.js';
import SpriteMaterial from '../src/materials/SpriteMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Scene } from '../src/scene/Scene.js';
import Follow from '../src/traits/Follow.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Console } from '../components/Console.js';

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);

    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];
    viewport.renderer.clearPass = true;

    const scene = new Scene();
    
    scene.add([
        new Plane({
            position: [0, 0, 0],
            material: new DefaultMaterial(),
            scale: 5,
        }),
        new Plane({
            position: [5, 5, -4],
            material: new DefaultMaterial(),
            scale: 5,
        }),
    ]);

    const camera1 = new Camera({
        position: [0.1, -2, -20],
        fov: 54.4,
        traits: [ Follow ]
    });

    const camera2 = new Camera({
        position: [-0.1, -2, -20],
        fov: 54.4,
        traits: [ Follow ]
    });

    scene.add(camera1);
    scene.add(camera2);

    viewport.camera = camera1;
    viewport.scene = scene;
}
