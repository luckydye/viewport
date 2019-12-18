import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import Input from '../src/Input.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Task } from '../src/Scheduler.js';
import Follow from '../src/traits/Follow.js';
import { Scene } from '../src/scene/Scene.js';
import { Plane } from '../src/geo/Plane.js';
import SpriteMaterial from '../src/materials/SpriteMaterial.js';
import { Texture } from '../src/materials/Texture.js';

Resources.add({
    'sprite': '/textures/spritetest.png'
});

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];
    viewport.tabIndex = 0;
    Input.domElement = viewport;

    const scene = new Scene();

    const plane = new Plane({
        position: [0, 4, 0],
        material: new SpriteMaterial({
            texture: new Texture(Resources.get('sprite'))
        }),
        scale: 5,
    });
    
    scene.add(plane);

    const camera = new Camera({
        fov: 54.4,
        traits: [ Follow ]
    });

    camera.position.z = -20;
    camera.position.y = -2;
    camera.origin.y = -4;

    // camera.follow([...scene.objects].find(o => o instanceof PlayerEntity));

    scene.add(camera);

    viewport.camera = camera;
    viewport.scene = scene;
}
