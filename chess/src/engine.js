import '../../components/Console.js';
import '../../components/Viewport.js';
import Viewport from '../../components/Viewport.js';
import { Plane } from '../../src/geo/Plane.js';
import DefaultMaterial from '../../src/materials/DefaultMaterial.js';
import MattMaterial from '../../src/materials/MattMaterial.js';
import { Texture } from '../../src/materials/Texture.js';
import { Raycast, Vec } from '../../src/Math.js';
import { Resources } from '../../src/resources/Resources.js';
import { Camera } from '../../src/scene/Camera.js';
import { Figure } from './Figure.js';

Resources.resourceRoot = "../chess/res/";

Resources.add({
    'select_tex': "textures/selector.png",
    'testmap': "maps/chess_winter.gmap",
});

Resources.load().then(() => init());

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [0, 0, 0, 0];

    viewport.tabIndex = 0;

    loadMap(viewport, Resources.get('testmap'));
}

function loadMap(viewport, resources) {
    const scene = resources.toScene();

    const camera = new Camera({
        fov: 35,
    });

    Texture.default.mag_filter = "LINEAR";
    Texture.default.min_filter = "LINEAR";

    const cursor = new Plane({
        rotation: [90 * Math.PI / 180, 0, 0],
        material: new MattMaterial({
            texture: new Texture(Resources.get('select_tex')),
            diffuseColor: [0, 0, 0, 0]
        })
    });
    cursor.matrixAutoUpdate = true;

    camera.rotation.y = -90 * Math.PI / 180;
    camera.rotation.x = 0.75;
    camera.position.y = -32;
    camera.position.x = -35;

    scene.add(cursor);
    scene.add(camera);

    viewport.camera = camera;
    viewport.scene = scene;

    viewport.scene.lightsource.position.z = -100;
    viewport.scene.lightsource.rotation.x = 0.75;
    
    const border = 0.91;
    const origin = [0.1, 0.1];

    let currentTarget = null;
    let currentTargetPosition = null;

    const castRay = (x, y) => {
        const bounds = viewport.getBoundingClientRect();
        const cast = new Raycast(viewport.camera, x - bounds.x, y - bounds.y);
        return cast.hit(new Vec(0, -0.2, 0), new Vec(0, -1, 0));
    }

    const spawnCube = pos => {
        const p = new Figure({
            material: new DefaultMaterial(),
            position: new Vec(pos[0], 12, pos[2]),
            scale: 0,
        });

        setInterval(() => {
            if(p.scale < 2) {
                p.scale += 0.25;
            }
        }, 14);

        scene.add([ p ]);
    }

    viewport.addEventListener('mousemove', e => {
        const hit = castRay(e.x, e.y);
        hit.position = [
            Math.max(Math.min(hit.position[0], 8), -8),
            hit.position[1],
            Math.max(Math.min(hit.position[2], 8), -8),
        ]
        cursor.position = [
            Math.floor((hit.position[0] / 2) * border) * (2 / border) + 1 + origin[0],
            hit.position[1],
            Math.floor((hit.position[2] / 2) * border) * (2 / border) + 1 + origin[1],
        ];
        currentTargetPosition = cursor.position;
        currentTarget = [
            Math.floor((hit.position[0] / 2) * border) + 4,
            Math.floor((hit.position[2] / 2) * border) + 4,
        ];
    })

    viewport.addEventListener('mousedown', e => {
        const target = currentTarget;
        const pos = currentTargetPosition;
        spawnCube(pos);
        cursor.scale = 0.95;
    })

    viewport.addEventListener('mouseup', e => {
        cursor.scale = 1;
    })
}
