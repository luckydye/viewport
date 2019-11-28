import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Cube } from '../src/geo/Cube.js';
import { Plane } from '../src/geo/Plane.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/Resources.js';
import { Camera } from '../src/scene/Camera.js';

Resources.add({
    'noise': "textures/noise.jpg",
    'norm': "textures/norm.png",
});

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: PlayerControler });
    document.body.appendChild(viewport);

    const preview = new Viewport({ controllertype: null });
    document.body.appendChild(preview);

    viewport.enableCameraSaveState();

    const noise = Resources.get('noise');
    const norm = Resources.get('norm');

    const geo = [
        new Cube({
            material: new DefaultMaterial(),
            position: [0, 2, 0],
            scale: 2
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

    const camera = new Camera();

    camera.position.z = -10;
    camera.position.y = -2;
    
    camera.hidden = false;

    viewport.scene.add(camera);
    viewport.scene.add(geo);

    preview.scene = viewport.scene;
    preview.camera = camera;
}
