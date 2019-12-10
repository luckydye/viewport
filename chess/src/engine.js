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
import { Task } from '../../src/Scheduler.js';
import { Emitter } from '../../src/entities/Emitter.js';
import { Cube } from '../../src/geo/Cube.js';
import WaterMaterial from '../../src/materials/WaterMaterial.js';
import { ChessBoard } from './Chess.js';
import { Renderer } from '../../src/renderer/Renderer.js';

Resources.resourceRoot = "../chess/res/";

Resources.add({
    'select_tex': "textures/selector.png",
    'testmap': "maps/chess_winter.gmap",
    'board': "textures/chess.png",
});

Resources.load().then(() => init());

Renderer.showGuides = false;
Renderer.clearPass = false;
Renderer.indexPass = false;
Renderer.shadowPass = true;

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [0, 0, 0, 0];
    viewport.tabIndex = 0;

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

    cursor.matrixAutoUpdate = true;

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

    const figures = [
        King,
        Tower,
        Bishop,
        Queen,
        Horse,
        Farmer,
    ];

    function spawnFigure(type, side, pos) {
        const Fig = figures[type];

        const p = new Fig({
            position: new Vec(pos[0], 5, pos[2]),
            side: side,
            scale: 1.5,
        });

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

    function gridToWorld(x, z) {
        return [
            ((x - 4) / 2) * 4.38 + 1 + origin[0],
            0,
            ((z - 4) / 2) * 4.38 + 1 + origin[1]
        ]
    }

    const neutralMaterial = new DefaultMaterial({
        diffuseColor: [0.75, 0.75, 1, 1]
    });

    const targetMaterial = new DefaultMaterial({
        diffuseColor: [1, 0.75, 0.75, 1]
    });

    function helperDisplay(positions) {
        const objs = [];

        for(let pos of positions) {

            const world = [
                ((pos[0] - 4) / 2) * 4.38 + 1 + origin[0],
                0.05,
                ((pos[1] - 4) / 2) * 4.38 + 1 + origin[1],
                0
            ];

            let mat = neutralMaterial;

            if(pos[2]) {
                mat = targetMaterial;
            }
            
            const helper = new Plane({
                rotation: [90 * Math.PI / 180, 0, 0, 0],
                position: world,
                material: mat
            });
            objs.push(helper);
            scene.add(helper);
        }

        return {
            remove() {
                for(let obj of objs) {
                    scene.remove(obj);
                }
            }
        }
    }

    // initialize board

    const chessBoard = new ChessBoard();

    for(let x = 0; x < 8; x++) {
        for(let y = 0; y < 8; y++) {
            const piece = chessBoard.board[x][y];

            if(piece) {
                piece.geometry = spawnFigure(piece.type, piece.side, gridToWorld(x, y));
            }
        }
    }

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
            currentObject.geometry.moveTo(sollX, sollZ);
        }
    })

    let positionHelpers = null;

    viewport.addEventListener('mousedown', e => {
        if(e.button == 0) {

            const piece = chessBoard.getPieaceAt(...currentTarget);

            if(piece) {
                currentObject = piece;
                
                currentObject.geometry.pickup();
                currentObject.coord = [currentTarget[0], currentTarget[1]];
                currentObject.lastPosition = [
                    currentObject.geometry.position.x, 
                    currentObject.geometry.position.z
                ];

                const available = chessBoard.getAvailableMovesAt(currentTarget);
                positionHelpers = helperDisplay(available);
                
            } else {
                currentObject = null;
            }

            cursor.scale = 0.95;
        }
    })

    viewport.addEventListener('mouseup', e => {
        cursor.scale = 1;

        if(positionHelpers) {
            positionHelpers.remove();
        }

        if(currentObject) {

            const move = chessBoard.movePiece(currentObject.coord, currentTarget);

            if(move) {
                currentObject.geometry.position.x = currentTargetPosition[0];
                currentObject.geometry.position.z = currentTargetPosition[2];

                if(move[0]) {
                    scene.remove(move[0].geometry);
                }
            } else {
                currentObject.geometry.position.x = currentObject.lastPosition[0];
                currentObject.geometry.position.z = currentObject.lastPosition[1];
            }

            currentObject.coord = [currentTarget[0], currentTarget[1]];

            currentObject.geometry.release();

            emitter.position[0] = currentObject.geometry.position[0];
            emitter.position[2] = currentObject.geometry.position[2];
    
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
