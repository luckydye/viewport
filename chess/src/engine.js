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

const GameState = {
    'WAITING': 0,
    'STARTED': 1,
    'ENDED': 2,
}

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [0, 0, 0, 0];
    viewport.tabIndex = 0;

    const scene = Resources.get('testmap').toScene();
    const game = gameSetup(viewport, scene);

    let uiTimer = null;
    let started = false;

    const uiUpdate = lobby => {
        uiTimer = setTimeout(() => {
            const state = lobby.getRoomState();
            let hudHTML = "";

            if(state.players.length < 2) {
                hudHTML += "<h2>Waiting for players (1/2)</h2>";
                started = false;
            } else {
                if(!started) {
                    hudHTML += '<h2 class="delayed-fade-out">Game Started</h2>';
                } else {
                    const turn = game.chess.currentSide == 0 ? "white" : "black";
                    hudHTML += `
                        <div class="current-turn" ${turn}>
                            <span>Current turn:</span>
                            <a>${turn}</a>
                        </div>
                    `;
                }
                started = true;
            }

            viewport.innerHTML = hudHTML;

            uiUpdate(lobby);
        }, 300);
    };

    connect(game).then(uiUpdate);
}

async function connect(game) {
    const client = new HotelClient();

    const tickrate = 32;
    const playerCursors = new Map();
    let lastMove = null;
    let latestState = null;
    
    client.on('client.connected', msg => {
        client.id = msg.uid;
    });

    client.on('room.state', msg => handleRoomState(msg));

    const connected = await client.connect();
    client.emit('join', { roomId: "0", username: "Player1" });

    setInterval(() => sendPlayerState(), 1000 / tickrate);

    function sendPlayerState() {
        let currentMove = game.getLastMove();

        if (lastMove && lastMove[0][0] == currentMove[0][0] &&
                        lastMove[0][1] == currentMove[0][1] &&
                        lastMove[1][0] == currentMove[1][0] &&
                        lastMove[1][1] == currentMove[1][1]) {

            currentMove = null;
        } else {
            lastMove = currentMove;
        }

        client.emit('player', {
            cursor: game.cursor,
            world: game.position,
            pickup: game.pickup,
            move: currentMove
        });
    }

    function handleRoomState(msg) {
        const players = msg.players;

        latestState = msg;

        game.chess.currentSide = msg.turn;

        if(!game.chess.compareBoard(msg.board)) {
            game.chess.setBoard(msg.board, piece => {
                const coords = piece.coords;
                if(piece.geometry && !piece.geometry.hover) {
                    game.movePieceToGrid(piece, coords);
                }
                if(piece.geometry) {
                    piece.geometry.removed = false;
                    game.scene.add(piece.geometry);
                }
            }, removedPiece => {
                removedPiece.geometry.remove();
            });
        }

        for(let player of players) {
            // handle network players
            if(player.clientId != client.id) {
                if(player.pickup) {
                    const piece = game.chess.getPieaceAt(player.pickup[0], player.pickup[1]);
                    if(piece) {
                        if(!piece.geometry.hover) {
                            piece.geometry.pickup();
                            piece.client = player.clientId;
                        }
                        piece.geometry.moveTo(player.world[0], player.world[2]);
                    } else {
                        console.error('Network error');
                    }
                } else {
                    const pieces = game.chess.board.flat();

                    for(let otherPiece of pieces) {
                        if(otherPiece && otherPiece.client && otherPiece.client == player.clientId) {
                            otherPiece.geometry.release();
                            game.movePieceToGrid(otherPiece, otherPiece.coords);
                        }
                    }
                }
            } else {
                if(game.chess.clientSide != player.side) {
                    if(player.side === 0) {
                        game.moveCamera(180 * Math.PI / 180);
                    }
                }
                game.chess.clientSide = player.side;
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
    }

    return {
        getRoomState() {
            return latestState;
        }
    }
}

function gameSetup(viewport, scene) {
    
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
            texture: new Texture(),
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

    viewport.scene.lightsource.rotation.x = 100 * Math.PI / 180;
    viewport.scene.lightsource.rotation.y = 0;
    viewport.scene.lightsource.rotation.z = 0.75;

    viewport.scene.lightsource.position.x = -100;
    viewport.scene.lightsource.position.y = -100;
    viewport.scene.lightsource.position.z = 25;

    viewport.scene.lightsource.color = [1.0, 0.590619, 0.296138];

    const border = 0.91;
    const origin = [0.1, 0.1];

    let cursorTarget = null;
    let cursorTargetPosition = null;
    let currentPiece = null;
    let cursorWorldPosition = [0, 0];
    let positionHelpers = null;
    let lastMove = null;

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

    function moveCamera(deg) {
        camera.setDegrees(deg);
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

    initBoard();

    function initBoard() {
        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                const piece = chessBoard.board[x][y];
    
                if(piece) {
                    if(!piece.geometry) {
                        piece.geometry = spawnFigure(piece.type, piece.side, gridToWorld(x, y));
                        piece.coords = [x, y];
                    } else {
                        const pos = gridToWorld(x, y);
                        piece.geometry.position = new Vec(pos[0], 5, pos[2]);
                    }
                }
            }
        }
    }

    // events

    function mouseMoveHandler(x, y) {
        const hit = Input.cast(viewport.camera, x, y, [0, -0.2, 0]);
        
        if (hit.position[0] > 9 || hit.position[0] < -9 ||
            hit.position[2] > 9 || hit.position[2] < -9) {

            cursorTargetPosition = null;
            cursorTarget = null;
            
            return;
        }

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
        cursorTargetPosition = [cursor.position[0], cursor.position[2]];
        cursorTarget = [
            Math.floor((hit.position[0] / 2) * border) + 4,
            Math.floor((hit.position[2] / 2) * border) + 4,
        ];

        if(currentPiece) {
            const sollX = ((hit.position[0] / 2) * border) * (2 / border) + origin[0];
            const sollZ = ((hit.position[2] / 2) * border) * (2 / border) + origin[1];
            cursorWorldPosition = [sollX, 0, sollZ];
            currentPiece.geometry.moveTo(sollX, sollZ);
        }
    }

    function mouseDownHandler(e) {
        if(!cursorTarget) {
            return;
        }

        cursor.scale = 0.95;

        if(chessBoard.currentSide !== chessBoard.clientSide) {
            return;
        }

        const piece = chessBoard.getPieaceAt(...cursorTarget);

        if(piece && piece.side == chessBoard.currentSide) {
            camera.turntable = false;

            // pickup piece
            currentPiece = piece;
            currentPiece.geometry.pickup();

            mouseMoveHandler(e.x, e.y);

            // display available moves
            const available = chessBoard.getAvailableMovesAt(cursorTarget);
            positionHelpers = helperDisplay(available);
            
        } else {
            currentPiece = null;
        }
    }

    function movePiece(piece, pos) {
        piece.geometry.moveTo(pos[0], pos[1]);

        setTimeout(() => {
            piece.geometry.position.x = pos[0];
            piece.geometry.position.z = pos[1];

            piece.geometry.velocity.x = 0;
            piece.geometry.velocity.z = 0;
        }, 300);
    }

    function movePieceToGrid(piece, pos) {
        pos = gridToWorld(pos[0], pos[1]);
        piece.geometry.position.x = pos[0];
        piece.geometry.position.z = pos[2];
    }

    function removePiece(piece) {
        piece.geometry.remove();

        emitter.position[0] = piece.geometry.position[0];
        emitter.position[1] = 0.5;
        emitter.position[2] = piece.geometry.position[2];

        setTimeout(() => { emitter.rate = 25; }, 0);
        setTimeout(() => { emitter.rate = 0; }, 50);
    }

    function mouseUpHandler() {
        cursor.scale = 1;
        camera.turntable = true;

        if(positionHelpers) {
            positionHelpers.remove();
        }

        if(currentPiece) {

            if(!cursorTarget) {
                movePiece(currentPiece, currentPiece.geometry.lastPosition);
            } else {
                lastMove = [[...currentPiece.coords], [...cursorTarget]];

                const move = chessBoard.movePiece(currentPiece.coords, cursorTarget);

                if(move) {
                    movePiece(currentPiece, cursorTargetPosition);

                    if(move.length > 0) {
                        removePiece(move[0]);
                    }
                } else {
                    movePiece(currentPiece, currentPiece.geometry.lastPosition);
                }
            }

            currentPiece.geometry.release();
            currentPiece = null;
        }
    }

    viewport.addEventListener('mousemove', e => mouseMoveHandler(e.x, e.y));
    viewport.addEventListener('contextmenu', e => e.preventDefault());
    viewport.addEventListener('mouseup', e => mouseUpHandler());
    viewport.addEventListener('mousedown', e => {
        if(e.button == 0) mouseDownHandler(e);
    });

    return {
        get cursor() {
            return cursorTarget;
        },
        get position() {
            return cursorWorldPosition;
        },
        get pickup() {
            return currentPiece ? currentPiece.coords : null;
        },
        get scene() {
            return scene;
        },
        getLastMove() {
            return lastMove;
        },
        removePiece,
        movePiece,
        movePieceToGrid,
        moveCamera,
        chess: chessBoard,
        createCursor,
        gridToWorld
    };
}
