import '../../components/Console.js';
import '../../components/Viewport.js';
import Viewport from '../../components/Viewport.js';
import { Box } from '../../src/geo/Box.js';
import { Plane } from '../../src/geo/Plane.js';
import Input from '../../src/Input.js';
import DefaultMaterial from '../../src/materials/DefaultMaterial.js';
import MattMaterial from '../../src/materials/MattMaterial.js';
import { Texture } from '../../src/materials/Texture.js';
import { Vec } from '../../src/Math.js';
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
import { Hud } from '../../components/Hud.js';
import { Task } from '../../src/Scheduler.js';
import { Emitter } from '../../src/entities/Emitter.js';
import { Cube } from '../../src/geo/Cube.js';
import WaterMaterial from '../../src/materials/WaterMaterial.js';

Resources.resourceRoot = "../chess/res/";

Resources.add({
    'select_tex': "textures/selector.png",
    'testmap': "maps/chess_winter.gmap",
    'board': "textures/chess.png",
});

Resources.load().then(() => init());

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [0, 0, 0, 0];
    viewport.tabIndex = 0;

    const hud = new Hud();
    viewport.appendChild(hud);

    let lastValue = 0;
    hud.jiggle = [0, 0];

    viewport.scheduler.addTask(new Task(() => {
        const cam = viewport.camera;
        const deltaX = (cam.rotation.y - lastValue);

        hud.jiggle[0] += Math.sign(deltaX) * 0.5;
        hud.jiggle[1] += Math.sign(deltaX) * 0.125;
        hud.jiggle[0] *= 0.9;
        hud.jiggle[1] *= 0.9;

        hud.style.transform = `translateX(${hud.jiggle[0]}px) translateY(${hud.jiggle[1]}px)`;
        lastValue = cam.rotation.y;
    }));

    const scene = Resources.get('testmap').toScene();
    gameSetup(viewport, scene);
}

function gameSetup(viewport, scene) {

    scene.add(new Box({
        top: 0,
        right: 10,
        bottom: -2,
        left: -10,
        depth: 10,
        position: [0, -0.05, 0],
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: [
                0.08388 * 2, 
                0.08202 * 2, 
                0.08167 * 2, 
                1
            ]
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

    const figures = [
        Bishop,
        Farmer,
        Horse,
        King,
        Queen,
        Tower,
    ];

    const camera = new Camera({ 
        fov: 35,
        traits: [ Turntable ]
    });

    const cursor = new Plane({
        rotation: [90 * Math.PI / 180, 0, 0],
        material: new MattMaterial({
            texture: new Texture(Resources.get('select_tex')),
            diffuseColor: [0, 0, 0, 0]
        })
    });
    cursor.matrixAutoUpdate = true;

    const emitter = new Emitter({
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: [1, 1, 1, 1],
        }),
        scale: 0.5,
    });

    emitter.particleGeometry = new Cube();

    emitter.speed = 0.1;
    emitter.maxage = 400;
    emitter.rate = 0;

    camera.rotation.x = 0.8;
    camera.position.y = -32;

    scene.add(emitter);
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
    let currentObject = null;

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

        emitter.position[0] = pos[0];
        emitter.position[2] = pos[2];

        setTimeout(() => {
            emitter.rate = 25;
        }, 200);

        setTimeout(() => {
            emitter.rate = 0;
        }, 220);

        scene.add([ p ]);

        return p;
    }

    const gridToWorld = (x, z) => {
        return [
            ((x - 4) / 2) * 4.38 + 1 + origin[0],
            0,
            ((z - 4) / 2) * 4.38 + 1 + origin[1]
        ]
    }

    // board

    const boardState = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
    ];


    boardState[0][0] = spawnCube(gridToWorld(0, 0));
    boardState[1][0] = spawnCube(gridToWorld(1, 0));
    boardState[2][0] = spawnCube(gridToWorld(2, 0));
    boardState[3][0] = spawnCube(gridToWorld(3, 0));
    boardState[4][0] = spawnCube(gridToWorld(4, 0));
    boardState[5][0] = spawnCube(gridToWorld(5, 0));
    boardState[6][0] = spawnCube(gridToWorld(6, 0));
    boardState[7][0] = spawnCube(gridToWorld(7, 0));

    boardState[0][1] = spawnCube(gridToWorld(0, 1));
    boardState[1][1] = spawnCube(gridToWorld(1, 1));
    boardState[2][1] = spawnCube(gridToWorld(2, 1));
    boardState[3][1] = spawnCube(gridToWorld(3, 1));
    boardState[4][1] = spawnCube(gridToWorld(4, 1));
    boardState[5][1] = spawnCube(gridToWorld(5, 1));
    boardState[6][1] = spawnCube(gridToWorld(6, 1));
    boardState[7][1] = spawnCube(gridToWorld(7, 1));

    boardState[0][6] = spawnCube(gridToWorld(0, 6));
    boardState[1][6] = spawnCube(gridToWorld(1, 6));
    boardState[2][6] = spawnCube(gridToWorld(2, 6));
    boardState[3][6] = spawnCube(gridToWorld(3, 6));
    boardState[4][6] = spawnCube(gridToWorld(4, 6));
    boardState[5][6] = spawnCube(gridToWorld(5, 6));
    boardState[6][6] = spawnCube(gridToWorld(6, 6));
    boardState[7][6] = spawnCube(gridToWorld(7, 6));

    boardState[0][7] = spawnCube(gridToWorld(0, 7));
    boardState[1][7] = spawnCube(gridToWorld(1, 7));
    boardState[2][7] = spawnCube(gridToWorld(2, 7));
    boardState[3][7] = spawnCube(gridToWorld(3, 7));
    boardState[4][7] = spawnCube(gridToWorld(4, 7));
    boardState[5][7] = spawnCube(gridToWorld(5, 7));
    boardState[6][7] = spawnCube(gridToWorld(6, 7));
    boardState[7][7] = spawnCube(gridToWorld(7, 7));

    // events

    viewport.addEventListener('mousemove', e => {
        const hit = Input.cast(viewport.camera, e.x, e.y, [0, -0.2, 0]);
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

        if(currentObject) {
            const sollX = ((hit.position[0] / 2) * border) * (2 / border) + origin[0];
            const sollZ = ((hit.position[2] / 2) * border) * (2 / border) + origin[1];

            currentObject.moveTo(sollX, sollZ);
        }
    })

    viewport.addEventListener('mousedown', e => {
        if(e.button == 0) {
            const pos = currentTargetPosition;

            if(!boardState[currentTarget[0]][currentTarget[1]]) {
                const geo = spawnCube(pos);
                boardState[currentTarget[0]][currentTarget[1]] = geo;
                currentObject = boardState[currentTarget[0]][currentTarget[1]];
                currentObject.lastPosition = [currentObject.position.x, currentObject.position.z];
                currentObject = null;
            } else {
                currentObject = boardState[currentTarget[0]][currentTarget[1]];
                currentObject.pickup();
                currentObject.coord = [currentTarget[0], currentTarget[1]];
                currentObject.lastPosition = [currentObject.position.x, currentObject.position.z];
            }

            cursor.scale = 0.95;
        }
    })

    viewport.addEventListener('mouseup', e => {
        cursor.scale = 1;

        if(currentObject) {
            if(!boardState[currentTarget[0]][currentTarget[1]]) {
                boardState[currentObject.coord[0]][currentObject.coord[1]] = null;
                boardState[currentTarget[0]][currentTarget[1]] = currentObject;
                currentObject.position.x = currentTargetPosition[0];
                currentObject.position.z = currentTargetPosition[2];
            } else {
                currentObject.position.x = currentObject.lastPosition[0];
                currentObject.position.z = currentObject.lastPosition[1];
            }

            currentObject.coord = [currentTarget[0], currentTarget[1]];

            currentObject.release();

            emitter.position[0] = currentObject.position[0];
            emitter.position[2] = currentObject.position[2];
    
            setTimeout(() => {
                emitter.rate = 25;
            }, 200);
    
            setTimeout(() => {
                emitter.rate = 0;
            }, 220);
            
            currentObject = null;
        }
    })

    viewport.addEventListener('contextmenu', e => {
        e.preventDefault();
    })
}