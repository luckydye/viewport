import { Connection, MessageHandler, Room } from '@uncut/hotel';
import express from 'express';
import path from 'path';
import WebSocket from 'ws';
import { ChessBoard } from './src/Chess.mjs';

class ChessRoom extends Room {

    constructor(braodcast) {
        super(braodcast);

        this.chessBoard = new ChessBoard();
        this.players = [];

        this.tickrate = 32;
    }

    getState() {
        return {
            members: this.members,
            players: this.players
        }
    }

    onJoined(clientId, username) {
        if(this.players.length < 2) {
            this.players.push({
                side: this.players.length,
                clientId, 
                username,
                cursor: [0, 0]
            });
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

    stopGame() {
        console.log("stop game");

        clearTimeout(this.tiemr);
    }

    startGame() {
        console.log("start game");

        this.tick();
    }

    tick() {
        this.tiemr = setTimeout(() => {

            this.braodcastRoomState();

            this.tick();
        }, 1000 / this.tickrate);
    }

    updatePlayer(clientId, data) {
        const player = this.getPlayer(clientId);

        if(player) {
            player.cursor = data.cursor;
            player.world = data.world;
            player.pickup = data.pickup;
            player.lastTarget = data.lastTarget;
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

const wss = new WebSocket.Server({ port: 8080 });
const handler = new ChessMessageHandler();
const con = new Connection(wss, handler);

app.use('/', express.static(path.resolve('dist')));
app.use('/chess/res', express.static(path.resolve('chess/res')));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
