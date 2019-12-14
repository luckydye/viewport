import { Connection, MessageHandler, Room } from '@uncut/hotel';
import express from 'express';
import * as http from 'http';
import path from 'path';
import WebSocket from 'ws';
import { ChessBoard } from './src/Chess.mjs';

// send room state with side that has to play
// wait for player move response
// send next room state with the other side as player
// dont accept any responses from the other player
    // (also block client interaction)
    // (apply room state to client board)

const GameState = {
    'WAITING': 0,
    'STARTED': 1,
    'ENDED': 2,
}

class ChessRoom extends Room {

    constructor(braodcast) {
        super(braodcast);

        this.tickrate = 32;
        this.chessBoard = new ChessBoard();
        this.players = [];
        this.gameState = GameState.WAITING;
    }

    get turn() {
        return this.chessBoard.currentSide;
    }

    set turn(val) {
        this.chessBoard.currentSide = val;
    }

    onJoined(clientId, username) {
        if(this.players.length < 2) {
            const side = !this.players[0] ? 0 : 1;
            
            this.players[side] = {
                side: side,
                clientId, 
                username,
                cursor: [0, 0]
            }
        }

        if(this.members.size > 1) {
            this.startGame();
        }
    }

    onLeft(clientId, username) {
        for(let player of this.players) {
            if(player.clientId == clientId) {
                this.players.splice(this.players.indexOf(player), 1);
            }
        }

        if(this.players.length < 1) {
            this.stopGame();
        }

        this.braodcastRoomState();
    }

    getState() {
        return {
            players: this.players,
            turn: this.turn,
            board: this.chessBoard,
            state: this.gameState,
            moves: this.chessBoard.moves,
        }
    }

    tick() {
        this.tiemr = setTimeout(() => {
            this.braodcastRoomState();
            this.tick();
        }, 1000 / this.tickrate);
    }

    stopGame() {
        console.log("stop game");

        this.gameState = GameState.ENDED;

        clearTimeout(this.tiemr);
        this.braodcastRoomState();
    }

    startGame() {
        console.log("start game");

        this.gameState = GameState.STARTED;

        this.turn = 0;

        this.tick();
    }

    nextTurn() {
        this.turn = this.turn === 0 ? 1 : 0;
        console.log('next turn');
    }

    movePiece(clientId, [p1, p2]) {
        const player = this.getPlayer(clientId);

        if(player.side == this.turn) {
            const collateral = this.chessBoard.movePiece(p1, p2);
            console.log(collateral, [p1, p2]);
            if(collateral) {
                this.nextTurn();
            }
        }
    }

    updatePlayer(clientId, data) {
        const player = this.getPlayer(clientId);

        if(player) {
            player.cursor = data.cursor;
            player.world = data.world;
            player.pickup = data.pickup;

            if(data.move && player.side == this.turn) {
                this.movePiece(clientId, data.move);
            }
        }
    }

    getPlayer(clientId) {
        for(let player of this.players) {
            if(player.clientId == clientId) {
                return player;
            }
        }
    }
}

class ChessMessageHandler extends MessageHandler {

    static get Room() {
        return ChessRoom;
    }

    get messageTypes() {
        return {
            'ping': msg => { },
            'join': msg => this.handleJoinMessage(msg),
            'leave': msg => this.handleLeaveMessage(msg),
            'chat': msg => this.handleChatMessage(msg),
            'player': msg => this.handlePlayerMessage(msg),
            'binary': msg => this.handleBinaryMessage(msg)
        }
    }

    handlePlayerMessage(msg) {
        const room = this.getRoom(msg.socket.room);
        room.updatePlayer(msg.socket.uid, msg.data);
    }

}

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const handler = new ChessMessageHandler();
const con = new Connection(wss, handler);

app.use('/', express.static(path.resolve('dist')));
app.use('/chess/res', express.static(path.resolve('chess/res')));

server.listen(port, () => console.log(`Example app listening on port ${port}!`));
