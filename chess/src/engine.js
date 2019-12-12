import '../../components/Console.js';
import '../../components/Viewport.js';
import Viewport from '../../components/Viewport.js';
import { Emitter } from '../../src/entities/Emitter.js';
import { Box } from '../../src/geo/Box.js';
import { Cube } from '../../src/geo/Cube.js';
import { Plane } from '../../src/geo/Plane.js';
import Input from '../../src/Input.js';
import DefaultMaterial from '../../src/materials/DefaultMaterial.js';
import MattMaterial from '../../src/materials/MattMaterial.js';
import { Texture } from '../../src/materials/Texture.js';
import { Vec } from '../../src/Math.js';
import { Renderer } from '../../src/renderer/Renderer.js';
import { Resources } from '../../src/resources/Resources.js';
import { Camera } from '../../src/scene/Camera.js';
import Turntable from '../../src/traits/Turntable.js';
import { Bishop } from './Bishop.js';
import { ChessBoard } from './Chess.mjs';
import { Farmer } from './Farmer.js';
import { Horse } from './Horse.js';
import { King } from './King.js';
import { Queen } from './Queen.js';
import { Tower } from './Tower.js';
import HotelClient from '@uncut/hotel/Client';

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
    const game = gameSetup(viewport, scene);

    connect(game);
}

async function connect(game) {
    const client = new HotelClient({ port: 8080 });

    const tickrate = 32;
    
    client.on('client.connected', msg => {
        client.id = msg.uid;
    });

    const connected = await client.connect();
    client.emit('join', { roomId: "0", username: "Player1" });

    setInterval(() => {
        client.emit('player', {
            cursor: game.cursor,
            world: game.position,
            pickup: game.pickup,
            lastTarget: game.lastTarget,
        });
    }, 1000 / tickrate);

    const playerCursors = new Map();

    client.on('room.state', msg => {
        const players = msg.players;

        for(let player of players) {
            if(player.clientId == client.id) {
                game.chess.currentSide = player.side;
            } else {
                if(player.pickup) {
                    const piece = game.chess.getPieaceAt(player.pickup[0], player.pickup[1]);
                    if(!piece.geometry.hover) {
                        piece.geometry.pickup();
                    }
                    piece.geometry.moveTo(player.world[0], player.world[2]);

                } else if(player.lastTarget) {
                    const piece = game.chess.getPieaceAt(player.lastTarget[0], player.lastTarget[1]);
                    
                    if(piece) {
                        piece.geometry.position.x = piece.geometry.lastPosition[0];
                        piece.geometry.position.z = piece.geometry.lastPosition[1];

                        piece.geometry.release();

                        const move = game.chess.movePiece(player.lastTarget, player.cursor);
                        
                        if(move) {
                            const pos = game.gridToWorld(
                                player.cursor[0],
                                player.cursor[1],
                            );

                            piece.geometry.position.x = pos[0];
                            piece.geometry.position.z = pos[2];

                            if(move[0]) {
                                game.scene.remove(move[0].geometry);
                            }
                        }
                    }
                }
            }
        }

        for(let player of players) {
            if(!playerCursors.has(player.clientId)) {
                if(player.clientId != client.id) {
                    playerCursors.set(player.clientId, game.createCursor());
                }
            }
        }

        for(let [id, cursor] of playerCursors) {
            const player = players.find(p => p.clientId == id);

            if(!player) {
                cursor.remove();
                continue;
            }

            if(player.cursor) {
                const pos = game.gridToWorld(
                    player.cursor[0],
                    player.cursor[1],
                );

                cursor.cursor.position.x = pos[0];
                cursor.cursor.position.y = 0.05;
                cursor.cursor.position.z = pos[2];
                cursor.cursor.material.diffuseColor = [0, 0, 0, 0.5];
            }
        }
        
    });
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

    function createCursor() {
        const cursor = new Plane({
            rotation: [90 * Math.PI / 180, 0, 0],
            material: new MattMaterial({
                texture: new Texture(Resources.get('select_tex')),
                diffuseColor: [0, 0, 0, 0]
            })
        });
    
        cursor.matrixAutoUpdate = true;
        scene.add(cursor);

        return {
            cursor: cursor,
            remove() {
                scene.remove(cursor);
            }
        };
    }

    const cursor = createCursor().cursor;

    const emitter = new Emitter({
        material: new DefaultMaterial({
            texture: viewport.renderer.emptyTexture,
            diffuseColor: [1, 1, 1, 1],
        }),
        scale: 0.5,
    });

    emitter.particleGeometry = new Cube();

    emitter.speed = 0.05;
    emitter.maxage = 500;
    emitter.rate = 0;

    camera.rotation.x = 0.8;
    camera.position.y = -32;

    scene.add(emitter);
    scene.add(camera);

    viewport.camera = camera;
    viewport.scene = scene;

    viewport.scene.lightsource.rotation.x = 80 * Math.PI / 180;
    viewport.scene.lightsource.rotation.y = 0;
    viewport.scene.lightsource.rotation.z = 0.75;

    viewport.scene.lightsource.position.x = -100;
    viewport.scene.lightsource.position.y = -100;
    viewport.scene.lightsource.position.z = -25;
    
    const border = 0.91;
    const origin = [0.1, 0.1];

    let lastTarget = null;
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

    let cursorWorldPosition = [0, 0];

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
            cursorWorldPosition = [sollX, 0, sollZ];
            currentObject.geometry.moveTo(sollX, sollZ);
        }
    })

    let positionHelpers = null;

    viewport.addEventListener('mousedown', e => {
        if(e.button == 0) {

            const piece = chessBoard.getPieaceAt(...currentTarget);

            if(piece && piece.side == chessBoard.currentSide) {
                
                lastTarget = [...currentTarget];

                currentObject = piece;
                
                currentObject.geometry.pickup();
                currentObject.coord = [currentTarget[0], currentTarget[1]];

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

                    emitter.position[0] = move[0].geometry.position[0];
                    emitter.position[1] = 0.5;
                    emitter.position[2] = move[0].geometry.position[2];
            
                    setTimeout(() => { emitter.rate = 25; }, 0);
                    setTimeout(() => { emitter.rate = 0; }, 50);
                }
            } else {
                currentObject.geometry.position.x = currentObject.geometry.lastPosition[0];
                currentObject.geometry.position.z = currentObject.geometry.lastPosition[1];
            }

            currentObject.coord = [currentTarget[0], currentTarget[1]];

            currentObject.geometry.release();
            
            currentObject = null;
        }
    })

    viewport.addEventListener('contextmenu', e => {
        e.preventDefault();
    })

    return {
        get lastTarget() {
            return lastTarget;
        },
        get cursor() {
            return currentTarget;
        },
        get position() {
            return cursorWorldPosition;
        },
        get pickup() {
            return currentObject ? currentObject.coord : null;
        },
        get scene() {
            return scene;
        },
        chess: chessBoard,
        createCursor,
        gridToWorld
    };
}
