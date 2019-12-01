import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Geometry } from '../src/scene/Geometry.js';
import Follow from '../src/traits/Follow.js';
import { createPlayer } from './entities/Player.js';
import { Loader } from '../src/resources/Loader.js';
import { Console } from '../components/Console.js';
import { Serializer } from '../src/resources/Serializer.js';

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];

    const ground = Loader.loadObjFile(Resources.get('ground'));
    
    const geo = [
        createPlayer(),
        new Geometry({
            material: new DefaultMaterial(),
            hitbox: [2.25, 9.2, -1.5, -9.2, 2],
            vertecies: ground,
            position: [0, -1, 0],
            rotation: [0, 0, 0],
            scale: 2
        }),
        new Geometry({
            material: new DefaultMaterial(),
            hitbox: [2.25, 9.2, -1.5, -9.2, 2],
            vertecies: ground,
            position: [-18, -3, 1],
            rotation: [0, 0, 0],
            scale: 2
        })
    ];

    const camera = new Camera({
        fov: 54.4,
        traits: [ Follow ]
    });

    camera.position.z = -20;
    camera.position.y = -2;

    camera.origin.y = -4;

    viewport.camera = camera;

    viewport.scene.add(camera);
    viewport.scene.add(geo);

    camera.follow(geo[0]);

    Console.GLOBAL_COMMANDS["export"] = () => {
        Serializer.serializeScene(viewport.scene);
    }
}
