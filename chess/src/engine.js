import '../../components/Console.js';
import '../../components/Viewport.js';
import Viewport from '../../components/Viewport.js';
import { Box } from '../../src/geo/Box.js';
import { Plane } from '../../src/geo/Plane.js';
import DefaultMaterial from '../../src/materials/DefaultMaterial.js';
import MattMaterial from '../../src/materials/MattMaterial.js';
import { Texture } from '../../src/materials/Texture.js';
import { Raycast, Vec } from '../../src/Math.js';
import { Resources } from '../../src/resources/Resources.js';
import { Camera } from '../../src/scene/Camera.js';
import { Geometry } from '../../src/scene/Geometry.js';
import { Scene } from '../../src/scene/Scene.js';
import Turntable from '../../src/traits/Turntable.js';
import { Bishop } from './Bishop.js';
import { Farmer } from './Farmer.js';
import { Horse } from './Horse.js';
import { King } from './King.js';
import { Queen } from './Queen.js';
import { Tower } from './Tower.js';

Resources.resourceRoot = "../chess/res/";

Resources.add({
    'select_tex': "textures/selector.png",
    'testmap': "maps/chess_winter.gmap",
    'board_frame': "models/chess_board_frame.obj",
    'board': "textures/chess.png",
});

Resources.load().then(() => init());

const figures = [
    Bishop,
    Farmer,
    Horse,
    King,
    Queen,
    Tower,
]

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [0, 0, 0, 0];
    viewport.tabIndex = 0;

    loadMap(viewport, Resources.get('testmap'));
}

function loadMap(viewport, resources) {
    // const scene = resources.toScene();
    const scene = new Scene();

    const darkGrey = [
        0.08388 * 2, 
        0.08202 * 2, 
        0.09167 * 2, 
        1
    ];

    scene.add(new Box({
        top: 0,
        right: 10,
        bottom: -2,
        left: -10,
        depth: 10,
        position: [0, -0.05, 0],
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: darkGrey
        })
    }));

    scene.add(new Plane({
        scale: 10,
        rotation: [90 * Math.PI / 180, 0, 0],
        position: [0, 0, 0],
        material: new DefaultMaterial({
            texture: new Texture(Resources.get('board')),
            diffuseColor: [1, 1, 1, 1]
        })
    }));

    scene.add(new Plane({
        scale: 50,
        rotation: [90 * Math.PI / 180, 0, 0],
        position: [0, -0.5, 0],
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: darkGrey
        })
    }));

    scene.add(new Geometry({
        scale: 2,
        position: [0, -0.33, 0],
        vertecies: Resources.get('board_frame').getVertecies(),
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: darkGrey,
        })
    }));

    const camera = new Camera({ 
        fov: 35,
        traits: [ Turntable ]
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

    camera.rotation.x = 0.8;
    camera.position.y = -32;

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
        const Fig = figures[Math.floor(figures.length * Math.random())];

        const p = new Fig({
            material: new DefaultMaterial(),
            position: new Vec(pos[0], 4, pos[2]),
            side: Math.round(Math.random()),
            scale: 0,
        });

        setInterval(() => {
            if(p.scale < 1.5) {
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
        if(e.button == 0) {
            const target = currentTarget;
            const pos = currentTargetPosition;
            spawnCube(pos);
            cursor.scale = 0.95;
        }
    })

    viewport.addEventListener('mouseup', e => {
        cursor.scale = 1;
    })

    viewport.addEventListener('contextmenu', e => {
        e.preventDefault();
    })
}
