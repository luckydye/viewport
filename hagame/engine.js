import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Plane } from '../src/geo/Plane.js';
import { Loader } from '../src/Loader.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Entity } from '../src/scene/Entity.js';
import Collider from '../src/traits/Collider.js';
import Player from '../src/traits/Player.js';
import RigidBody from '../src/traits/RigidBody.js';
import Follow from '../src/traits/Follow.js';

Resources.add({
    'noise': "textures/noise.jpg",
    'norm': "textures/norm.png",
    'teapot': "models/teapot.obj",
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
        new Plane({
            material: new DefaultMaterial({
                normalMap: new Texture(norm),
                specularMap: new Texture(noise),
            }),
            position: [0, -0.1, 0],
            rotation: [-90 * Math.PI / 180, 0, 0],
            scale: 10
        })
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
