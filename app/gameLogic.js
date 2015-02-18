'use strict';

angular.module('myApp', []).factory('gameLogic', function() {

    function getInitialBoard() {
        return [
            ['-', '-', '',  '',  'B', '',  '', '-',  '-'],
            ['-', '',  '',  'B', 'B', 'B', '', '',   '-'],
            ['',  '',  'B', 'B', 'B', 'B', 'B', '',  '' ],
            ['',  'B', 'B', 'B', 'B', 'B', 'B', 'B', '' ],
            ['',  '',  '',  '',  '',  '',  '',  '',  '' ],
            ['',  'R', 'R', 'R', 'R', 'R', 'R', 'R', '' ],
            ['',  '',  'R', 'R', 'R', 'R', 'R', '',  '' ],
            ['-', '',  '',  'R', 'R', 'R', '',  '',  '-'],
            ['-', '-', '',  '',  'R', '',  '',  '-', '-']
        ];
    }

    function getPieceByTurn(turnIndex) {
        return turnIndexBeforeMove === 0  ? 'B' : 'R';
    }

    function getOppositePieceByTurn(turnIndex) {
        return turnIndexBeforeMove === 0  ? 'R' : 'B';
    }

    function isTie(board) {
        var pieceCount = [0, 0];
        for(var i = 0; i < 9; i++) {
            var row = board[i];
            for(var j = 0; j < row.length; j++) {
                if(row[j] === 'B') {
                    pieceCount[0]++;
                }
                else if(cell == 'R') {
                    pieceCount[1]++;
                }
            }
        }

        if( ( pieceCount[0] < 3 && pieceCount[1] < 3 ) 
            || ( pieceCount[0] < 3 && pieceCount[0] == pieceCount[1] ) ) {
            return true;
        }

        return false;
    }

    function getWinner(board) {
        var pieceCount = [0, 0],
            boardString = '';

        for(var i = 0; i < 9; i++) {
            var row = board[i];
            for(var j = 0; j < row.length; j++) {
                cell = row[j];
                if(cell === 'B') {
                    pieceCount[0]++;
                }
                else if(cell == 'R') {
                    pieceCount[1]++;
                }
                boardString += (cell === '' ? ' ' : cell);
            }
        }

        if( pieceCount[0] >= 3 && pieceCount[1] >= 3) {
            return '';
        }
        else if( pieceCount[0] >= 3 && pieceCount[1] < 3 ) {
            return 'B';
        }
        else if( pieceCount[1] >= 3 && pieceCount[0] < 3 ) {
            return 'R';
        }
    }

    function checkMove(board, from_row, from_col, to_row, to_row, turnIndex) {
        var turnPiece = getPieceByTurn(turnIndex);

        var row_delta = from_row - to_row,
            col_delta = from_col - to_col,
            row_delta_dir = (row_delta === 0) ? 0 : (row_delta/row_delta),
            col_delta_dir = (col_delta === 0) ? 0 : (col_delta/col_delta);


        if(Math.abs(row_delta) > 1 || Math.abs(col_delta > 1)) {
            return false;
        }
        else if(board[to_row][to_col] == getOppositePieceByTurn(turnIndex) && board[to_row + row_delta_dir][to_col _ col_delta_dir] != turnPiece){
            return false;
        }

        return true;
    }

    function isCaptured(board, row, col, turnIndex) {
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ];
        var oppositePiece = getOppositePieceByTurn(turnIndex);

        for( var i = 0; i < DIRS.length; i++ ){
            var dir = DIRS[i];
            if(board[row + dir.r][col + dir.c] == oppositePiece && board[row - dir.r][col - dir.c] == oppositePiece) {
                return true;
            }
        }

        return false;
    }

    function willCapture(board, row, col, turnIndex) {
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ];
        var turnPiece = getPieceByTurn(turnIndex),
            oppositePiece = getOppositePieceByTurn(turnIndex),
            captures = [];

        for(var i = 0; i < DIRS.length; i++ ){
            var dir = DIRS[i];
            if(board[row + dir.r][col + dir.c] == oppositePiece && board[row + 2 * dir.r][col + 2 * dir.c] == turnPiece) {
                captures.push({row: row + dir.r, col: col + dir.c})
            }
        }

        for(var i = 0; i < DIRS.length; i++ ){
            var dir = DIRS[i];
            if(board[row - dir.r][col - dir.c] == oppositePiece && board[row - 2 * dir.r][col - 2 * dir.c] == turnPiece) {
                captures.push({row: row + dir.r, col: col + dir.c})
            }
        }

        return captures;
    }

    function createMove(board, from_row, from_col, to_row, to_col, turnIndexBeforeMove) {
        if (board === undefined) {
            board = getInitialBoard();
        }
        var turnPiece = getPieceByTurn(turnIndexBeforeMove);

        if(board[from_row][from_col] != turnPiece) {
            throw new Error("One can only move his own pawn!");
        }

        if (board[to_row][to_col] !== '' || board[to_row][to_col] !== getOppositePieceByTurn(turnIndexBeforeMove)) {
            throw new Error("One can only make a move in an empty position or in a position containing an opponent's piece!");
        }

        if (getWinner(board) !== '' || isTie(board)) {
            throw new Error("Can only make a move if the game is not over!");
        }

        if(!checkMove(board, from_row, from_col, to_row, to_row, turnIndexBeforeMove)) {
            throw new Error("One Can only make a one step move to an opponent's piece if followed by one's own piece in the same direction.")
        }

        var boardAfterMove = angular.copy(board),
            captures = [],
            changeTurn = false;
        boardAfterMove[from_row][from_col] = '';

        if(!(to_row == 4 && to_col == 4)) { // Special board position. Player has to make another move.

            if(isCaptured(board, to_row, to_col, turnIndexBeforeMove)) {
                boardAfterMove[to_row][to_col] = '';
                captures = [{row: to_row, col_ to_col}];
                changeTurn = true;
            }
            else {
                boardAfterMove[to_row][to_col] = turnPiece;
                captures = willCapture(board, to_row, to_col, turnIndexBeforeMove);
                if(!captures.length) {
                    changeTurn = true;
                }
            }

            var winner = getWinner(boardAfterMove);
            var firstOperation = {};
            if (winner !== '' || isTie(boardAfterMove)) {
                // Game over.
                firstOperation = {endMatch: {endMatchScores:
                (winner === 'B' ? [1, 0] : (winner === 'R' ? [0, 1] : [0, 0]))}};
            } else if(changeTurn) {
                // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
                firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
            }
        }

        return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {from_row: from_row, from_col: from_col, to_row: to_row, to_col: to_col}}}
            {set: {key: 'captures', value: captures}}];
    }

    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;

        try {

            var deltaValue = move[2].set.value;
            var from_row = deltaValue.from_row,
                from_col = deltaValue.from_col,
                to_row = deltaValue.to_row,
                to_col = deltaValue.to_col;

            var board = stateBeforeMove.board;
            var expectedMove = createMove(board, from_row, from_col, to_row, to_col, turnIndexBeforeMove);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        } catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
});