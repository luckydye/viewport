import { Connection, MessageHandler, Room } from '@uncut/hotel';
import express from 'express';
import path from 'path';
import WebSocket from 'ws';
import { ChessBoard } from './src/Chess.mjs';

class ChessRoom extends Room {

    constructor() {
        super();

        this.chessBoard = new ChessBoard();

        console.log(this);
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
            'binary': msg => this.handleBinaryMessage(msg)
        }
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
