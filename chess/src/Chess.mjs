const Pieces = {
    'KING': 0,
    'ROCK': 1,
    'BISHOP': 2,
    'QUEEN': 3,
    'KNIGHT': 4,
    'PAWN': 5
};

class Piece {
    constructor(type, side, pos) {
        this.moves = 0;
        this.type = type;
        this.side = side;
        this.coords = pos;
    }
}

export class ChessBoard {

    constructor() {
        
        this.moves = [];
        this.board = [
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
        ];

        this.offboard = [];
        this.currentSide = 0;
        this.clientSide = -1;
        this.state = null;

        this.setup();
    }

    evaluate() {
        const state = {
            check: null,
            promotion: null,
            win: null,
        };

        const pieces = [...this.board.flat()];

        for(let piece of pieces) {

            // promotion
            if(piece && piece.type == Pieces.PAWN) {
                if(piece.side === 0 && piece.coords[1] == 7) {
                    // choose type to replace the pawn
                    state.promotion = piece;
                }
                if(piece.side === 1 && piece.coords[1] == 0) {
                    // choose type to replace the pawn
                    state.promotion = piece;
                }
            }

            // check
            if(piece && piece.type == Pieces.KING) {
                for(let otherPiece of pieces) {
                    if(otherPiece && piece.side != otherPiece.side) {
                        const moves = this.getAvailableMovesAt(otherPiece.coords);

                        for(let pos of moves) {
                            if(pos[0] === piece.coords[0] && pos[1] === piece.coords[1]) {
                                state.check = otherPiece;
                            }
                        }
                    }
                }
            }
        }

        if(state.check) {
            const checkMoves = this.getAvailableMovesAt(state.check.coords);
            const king = pieces.find(p => p && p.type === Pieces.KING && p.side !== state.check.side);

            let escapeable = false;

            if (state.check.type === Pieces.QUEEN ||
                state.check.type === Pieces.BISHOP ||
                state.check.type === Pieces.ROCK) {

                const kingMoves = this.getAvailableMovesAt(king.coords);

                for(let kingMove of kingMoves) {
                    for(let checkMove of checkMoves) {
                        if(kingMove[0] !== checkMove[0] && kingMove[1] !== checkMove[1]) {
                            escapeable = true;
                        }
                    }
                }
            }

            // TODO: Check Move
            // see if it can be prevented with anothers piece move

            if(!escapeable) {
                state.win = state.check.side;
            }
        }

        // general winning conditions
        if(!pieces.find(p => p && p.side === 0)) {
            state.win = 1;
        }
        if(!pieces.find(p => p && p.side === 1)) {
            state.win = 0;
        }

        if(!pieces.find(p => p && p.type === Pieces.KING && p.side === 0)) {
            state.win = 1;
        }
        if(!pieces.find(p => p && p.type === Pieces.KING && p.side === 1)) {
            state.win = 0;
        }

        return state;
    }

    setBoard(board, updateCallback, removeCallback, createCallback) {
        const pieces = [...this.board.flat(), ...this.offboard];

        this.offboard = [];
        this.moves = [...board.moves];
        this.board = [
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
        ];
     
        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                const boardPice = board.board[x][y];
                
                if(boardPice) {
                    const foundPice = pieces.find(p => (
                        p && p.type == boardPice.type && p.side == boardPice.side
                    ));

                    pieces.splice(pieces.indexOf(foundPice), 1);

                    foundPice.moves = boardPice.moves;
                    foundPice.coords = boardPice.coords;

                    if(updateCallback) {
                        updateCallback(foundPice);
                    }

                    this.board[x][y] = foundPice;
                }
            }
        }

        for(let p of pieces) {
            if(p) removeCallback(p);
        }
    }

    compareBoard(board) {
        for(let x = 0; x < 8; x++) {
            for(let y = 0; y < 8; y++) {
                const clientPiece = this.board[x][y];
                const comparePiece = board.board[x][y];

                if(clientPiece && comparePiece) {
                    if(comparePiece.type != clientPiece.type) {
                        // type differencce
                        return false;
                    }
                } else if(clientPiece == null || comparePiece == null) {
                    if(clientPiece != comparePiece) {
                        // position difference
                        return false;
                    }
                }
            }
        }

        return true;
    }

    setup() {
        this.board[0][0] = new Piece(Pieces.ROCK, 0, [0, 0]);
        this.board[1][0] = new Piece(Pieces.KNIGHT, 0, [1, 0]);
        this.board[2][0] = new Piece(Pieces.BISHOP, 0, [2, 0]);
        this.board[3][0] = new Piece(Pieces.QUEEN, 0, [3, 0]);
        this.board[4][0] = new Piece(Pieces.KING, 0, [4, 0]);
        this.board[5][0] = new Piece(Pieces.BISHOP, 0, [5, 0]);
        this.board[6][0] = new Piece(Pieces.KNIGHT, 0, [6, 0]);
        this.board[7][0] = new Piece(Pieces.ROCK, 0, [7, 0]);
        this.board[0][1] = new Piece(Pieces.PAWN, 0, [0, 1]);
        this.board[1][1] = new Piece(Pieces.PAWN, 0, [1, 1]);
        this.board[2][1] = new Piece(Pieces.PAWN, 0, [2, 1]);
        this.board[3][1] = new Piece(Pieces.PAWN, 0, [3, 1]);
        this.board[4][1] = new Piece(Pieces.PAWN, 0, [4, 1]);
        this.board[5][1] = new Piece(Pieces.PAWN, 0, [5, 1]);
        this.board[6][1] = new Piece(Pieces.PAWN, 0, [6, 1]);
        this.board[7][1] = new Piece(Pieces.PAWN, 0, [7, 1]);
        this.board[0][6] = new Piece(Pieces.PAWN, 1, [0, 6]);
        this.board[1][6] = new Piece(Pieces.PAWN, 1, [1, 6]);
        this.board[2][6] = new Piece(Pieces.PAWN, 1, [2, 6]);
        this.board[3][6] = new Piece(Pieces.PAWN, 1, [3, 6]);
        this.board[4][6] = new Piece(Pieces.PAWN, 1, [4, 6]);
        this.board[5][6] = new Piece(Pieces.PAWN, 1, [5, 6]);
        this.board[6][6] = new Piece(Pieces.PAWN, 1, [6, 6]);
        this.board[7][6] = new Piece(Pieces.PAWN, 1, [7, 6]);
        this.board[0][7] = new Piece(Pieces.ROCK, 1, [0, 7]);
        this.board[1][7] = new Piece(Pieces.KNIGHT, 1, [1, 7]);
        this.board[2][7] = new Piece(Pieces.BISHOP, 1, [2, 7]);
        this.board[3][7] = new Piece(Pieces.QUEEN, 1, [3, 7]);
        this.board[4][7] = new Piece(Pieces.KING, 1, [4, 7]);
        this.board[5][7] = new Piece(Pieces.BISHOP, 1, [5, 7]);
        this.board[6][7] = new Piece(Pieces.KNIGHT, 1, [6, 7]);
        this.board[7][7] = new Piece(Pieces.ROCK, 1, [7, 7]);
    }

    movePiece(p1, p2) {
        const position = p1;
        const targetPosition = p2;

        const movePiece = this.getPieaceAt(p1);
        const available = this.getAvailableMovesAt(p1);

        let targetPiece = [];
        let found = false;

        for(let p of available) {
            if(p[0] == targetPosition[0] && p[1] == targetPosition[1]) {
                const piece = this.board[position[0]][position[1]];

                const dist = Math.sqrt(
                    Math.pow(targetPosition[0] - position[0], 2) +
                    Math.pow(targetPosition[1] - position[1], 2)
                );

                if(this.board[targetPosition[0]][targetPosition[1]]) {
                    targetPiece[0] = this.board[targetPosition[0]][targetPosition[1]];
                    this.board[targetPosition[0]][targetPosition[1]] = null;
                    this.offboard.push(targetPiece[0]);
                }

                this.board[targetPosition[0]][targetPosition[1]] = piece;
                this.board[position[0]][position[1]] = null;

                piece.coords = targetPosition;
                piece.moves += dist;
                
                this.moves.push([p1, p2]);

                found = true;
                break;
            }
        }

        this.state = this.evaluate();

        if(this.state.check) {
            // eval check conditions
        }

        if(found) {
            return targetPiece;
        }

        return false;
    }

    getLethalMovesAt(origin, available) {
        const lethal = [];
        
        const piece = this.getPieaceAt(origin[0], origin[1]);

        for(let p of available) {
            const target = this.getPieaceAt(p[0], p[1]);
            if(target && target.side != piece.side) {
                lethal.push(p);
            }
        }

        return lethal;
    }

    getAvailableMovesAt(origin) {
        
        const p = origin;
        const piece = this.getPieaceAt(p[0], p[1]);
        const available = [];

        const addIfEmpty = (x, y) => {
            if (this.getPieaceAt(x, y) == null || this.getPieaceAt(x, y).side != piece.side) {
                if(this.isOnBoard(x, y)) {
                    available.push([x, y, this.board[x][y]]);
                }
            }
        }

        const addOnlyEmpty = (x, y) => {
            if (this.getPieaceAt(x, y) == null && this.isOnBoard(x, y)) {
                available.push([x, y, this.board[x][y]]);
            }
        }

        const addIfNotEmpty = (x, y) => {
            const target = this.getPieaceAt(x, y);
            if(target != null && piece.side != target.side) {
                available.push([x, y, this.board[x][y]]);
            }
        }

        const checkTargets = (target, update) => {
            while(this.isOnBoard(...target)) {
                if(this.getPieaceAt(...target) == null || target[0] == p[0] && target[1] == p[1]) {
                    update(target);
                    addIfEmpty(...target);
                } else if(this.getPieaceAt(...target) != null && target[0] != p[0] && target[1] != p[1]) {
                    addIfNotEmpty(...target);
                    break;
                } else {
                    break;
                }
            }
        }

        const pawnMoves = () => {
            if(piece.side == 0) {
                addOnlyEmpty(p[0], p[1] + 1);
                if(piece.moves == 0) {
                    addOnlyEmpty(p[0], p[1] + 2);
                }
                addIfNotEmpty(p[0] + 1, p[1] + 1);
                addIfNotEmpty(p[0] - 1, p[1] + 1);
            }
            if(piece.side == 1) {
                addOnlyEmpty(p[0], p[1] - 1);
                if(piece.moves == 0) {
                    addOnlyEmpty(p[0], p[1] - 2);
                }
                addIfNotEmpty(p[0] + 1, p[1] - 1);
                addIfNotEmpty(p[0] - 1, p[1] - 1);
            }
        }

        const knightMoves = () => {
            addIfEmpty(p[0] + 1, p[1] + 2);
            addIfEmpty(p[0] - 1, p[1] + 2);
            addIfEmpty(p[0] + 1, p[1] - 2);
            addIfEmpty(p[0] - 1, p[1] - 2);

            addIfEmpty(p[0] + 2, p[1] + 1);
            addIfEmpty(p[0] + 2, p[1] - 1);
            addIfEmpty(p[0] - 2, p[1] + 1);
            addIfEmpty(p[0] - 2, p[1] - 1);
        }

        const queenMoves = () => {
            kingMoves();
            rockMoves();
            bishopMoves();
        }

        const kingMoves = () => {
            addIfEmpty(p[0] + 1, p[1]);
            addIfEmpty(p[0] + 1, p[1] + 1);
            addIfEmpty(p[0], p[1] + 1);
            addIfEmpty(p[0] - 1, p[1] + 1);
            addIfEmpty(p[0] - 1, p[1]);
            addIfEmpty(p[0] - 1, p[1] - 1);
            addIfEmpty(p[0], p[1] - 1);
            addIfEmpty(p[0] + 1, p[1] - 1);
        }

        const rockMoves = () => {
            checkTargets([...p], target => { target[0]++; });
            checkTargets([...p], target => { target[0]--; });
            checkTargets([...p], target => { target[1]--; })
            checkTargets([...p], target => { target[1]++; })
        }

        const bishopMoves = () => {
            checkTargets([...p], target => { target[0]++; target[1]++; });
            checkTargets([...p], target => { target[0]--; target[1]--; });
            checkTargets([...p], target => { target[0]++; target[1]--; });
            checkTargets([...p], target => { target[0]--; target[1]++; });
        }

        if(piece) {
            switch(piece.type) {
                case Pieces.PAWN: pawnMoves(); break;
                case Pieces.KNIGHT: knightMoves(); break;
                case Pieces.QUEEN: queenMoves(); break;
                case Pieces.KING: kingMoves(); break;
                case Pieces.ROCK: rockMoves(); break;
                case Pieces.BISHOP: bishopMoves(); break;
            }
        }

        return available;
    }

    getPieaceAt(x, y) {
        if(this.isOnBoard(x, y)) {
            return this.board[x][y];
        } else {
            return null;
        }
    }

    isOnBoard(x, y) {
        return x < 8 && y < 8 && x > -1 && y > -1;
    }

}
