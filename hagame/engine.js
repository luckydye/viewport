import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/resources/Resources.js';
import { Loader } from '../src/resources/Loader.js';
import { Camera } from '../src/scene/Camera.js';
import { Entity } from '../src/scene/Entity.js';
import { Geometry } from '../src/scene/Geometry.js';
import Collider from '../src/traits/Collider.js';
import Follow from '../src/traits/Follow.js';
import Player from '../src/traits/Player.js';
import RigidBody from '../src/traits/RigidBody.js';

Resources.add({
    'noise': "textures/noise.jpg",
    'norm': "textures/norm.png",
    'teapot': "models/teapot.obj",
    'ground': "models/ground.obj",
});

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);

    const noise = Resources.get('noise');
    const norm = Resources.get('norm');

    const teapo = Loader.loadObjFile(Resources.get('teapot'));
    const ground = Loader.loadObjFile(Resources.get('ground'));

    const geo = [
        new Entity({
            material: new DefaultMaterial({
                normalMap: new Texture(norm),
                specularMap: new Texture(noise),
            }),
            position: [0, 10, 0],
            scale: 0.33,
            vertecies: teapo,
            traits: [ RigidBody, Player, Collider ]
        }),
        new Geometry({
            material: new DefaultMaterial({
                normalMap: new Texture(norm),
                specularMap: new Texture(noise),
            }),
            hitbox: [-3, 10, 3, -10],
            vertecies: ground,
            position: [5, -2, 0],
            rotation: [0, 0, 0],
            scale: 2
        }),
        // new Geometry({
        //     material: new DefaultMaterial({
        //         normalMap: new Texture(norm),
        //         specularMap: new Texture(noise),
        //     }),
        //     hitbox: [-1, 1, 1, -1],
        //     vertecies: ground,
        //     position: [-18, -2, 0],
        //     rotation: [0, 0, 0],
        //     scale: 2
        // })
    ];

    const camera = new Camera({
        fov: 54.4,
        traits: [ Follow ]
    });

    camera.follow(geo[0]);

    camera.position.z = -20;
    camera.position.y = -2;

    camera.origin.y = -4;

    viewport.camera = camera;

    viewport.scene.add(camera);
    viewport.scene.add(geo);
}
