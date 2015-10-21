angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function() {

    'use strict';

    function getInitialBoard() {
        return [
            ['-', '-', '',  '',  'B', '',  '',  '-', '-'],
            ['-', '',  '',  'B', 'B', 'B', '',  '',  '-'],
            ['',  '',  'B', 'B', 'B', 'B', 'B', '',  '' ],
            ['',  'B', 'B', 'B', 'B', 'B', 'B', 'B', '' ],
            ['',  '',  '',  '',  '',  '',  '',  '',  '' ],
            ['',  'R', 'R', 'R', 'R', 'R', 'R', 'R', '' ],
            ['',  '',  'R', 'R', 'R', 'R', 'R', '',  '' ],
            ['-', '',  '',  'R', 'R', 'R', '',  '',  '-'],
            ['-', '-', '',  '',  'R', '',  '',  '-', '-']
        ];
    }

    function getPawnByTurn(turnIndex) {
        return turnIndex === 0  ? 'R' : 'B';
    }

    function getOppositePawnByTurn(turnIndex) {
        return turnIndex === 0  ? 'B' : 'R';
    }

    function getPawnCount(board) {
        var pawnCount = [0, 0];
        for(var i = 0; i < 9; i++) {
            var row = board[i];
            for(var j = 0; j < 9; j++) {
                if(row[j] === 'R') {
                    pawnCount[0]++;
                }
                else if(row[j] === 'B') {
                    pawnCount[1]++;
                }
            }
        }
        return pawnCount;
    }

    function isTie(board) {
        var pawnCount = getPawnCount(board);
        if( pawnCount[0] < 3 && pawnCount[1] < 3 ) {
            return true;
        }
        return false;
    }

    function getWinner(board, captures, turnIndex) {
        var pawnCount = getPawnCount(board);
        if(captures.length > 0) {
            if(pawnCount[1 - turnIndex] < 3) {
                for(var i = 0; i < captures.length; i++) {
                    if(!isCaptured(board, captures[i].row, captures[i].col, turnIndex)) {
                        return getPawnByTurn(turnIndex);
                    }
                }
            }
            return '';
        }

        if( pawnCount[0] >= 3 && pawnCount[1] >= 3 ) {
            return '';
        }
        else if( pawnCount[0] >= 3 && pawnCount[1] < 3 ) {
            return 'B';
        }
        else if( pawnCount[1] >= 3 && pawnCount[0] < 3 ) {
            return 'R';
        }
    }

    function getValidMoves(board, row, col, captures, turnIndex) {
        var valid = [];
        var rMin = Math.max(row - 2, 0), rMax = Math.min(row + 2, 8);
        var cMin = Math.max(col - 2, 0), cMax = Math.min(col + 2, 8);
        for(var k = rMin; k <= rMax; k++) {
            for(var l = cMin; l <= cMax; l++) {
                try {
                    var move = createMove(board, row, col, k, l, captures, turnIndex);
                    valid.push(move);
                } catch (e) {}
            }
        }
        return valid;
    }

    function getPossibleMoves(board, captures, turnIndex) {
        var possibleMoves = [];
        var i, j;
        var turnPawn = getPawnByTurn(turnIndex);
        for (i = 0; i < 9; i++) {
            for (j = 0; j < 9; j++) {
                if(board[i][j] === turnPawn) {
                    possibleMoves = possibleMoves.concat(getValidMoves(board, i, j, captures, turnIndex));
                }
            }
        }
        return possibleMoves;
    }

    function getValidFromPositionsOnCapture(board, captures, turnIndex) {
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ],
            validPositions = [],
            turnPawn = getPawnByTurn(turnIndex);

        for(var j = 0; j < captures.length; j++ ){
            var row = captures[j].row, col = captures[j].col;
            for( var i = 0; i < DIRS.length; i++ ){
                var dir = DIRS[i],
                    pRow = row + dir.r, pCol = col + dir.c,
                    nRow = row - dir.r, nCol = col - dir.c;

                if( board[pRow] && board[pRow][pCol] === turnPawn && board[nRow] && board[nRow][nCol] === turnPawn ) {
                    validPositions.push({row: pRow, col: pCol}, {row: nRow, col: nCol});
                }
            }
        }
        return validPositions;
    }

    function getValidFromPositions(board, captures, turnIndex){
        var turnPawn = getPawnByTurn(turnIndex),
            validPositions = [];

        if(board[4][4] === turnPawn) {
            return [{row: 4, col: 4}];
        }
        else if(captures.length > 0) {
            return getValidFromPositionsOnCapture(board, captures, turnIndex);
        }

        for( var i = 0; i < 9; i++ ) {
            for( var j = 0; j < 9; j++ ) {
                if(board[i][j] === turnPawn) {
                    validPositions.push({row: i, col: j});
                }
            }
        }

        return validPositions;
    }

    function isValidFromPosition(board, row, col, captures, turnIndex) {
        var validPositions = getValidFromPositions(board, captures, turnIndex);
        for(var i = 0; i < validPositions.length; i++) {
            var valid = validPositions[i];
            if(row === valid.row && col === valid.col) {
                return true;
            }
        }
        return false;
    }

    function getValidToPositions(board, row, col, captures, turnIndex) {
        // Assuming {row, col} is a valid from position.
        var valid = getValidMoves(board, row, col, captures, turnIndex),
            validPositions = [];

        for( var i = 0; i < valid.length; i++ ) {
            var v = valid[i];
            validPositions.push({row: v[2].set.value.to_row, col: v[2].set.value.to_col});
        }
        return validPositions;
    }

    function checkMoveSteps(board, from_row, from_col, to_row, to_col, turnIndex ) {

        var row_delta = to_row - from_row,
            col_delta = to_col - from_col,
            row_delta_dir = row_delta === 0 ? 0 : row_delta/Math.abs(row_delta),
            col_delta_dir = col_delta === 0 ? 0 : col_delta/Math.abs(col_delta),
            jump_row = from_row + row_delta_dir,
            jump_col = from_col + col_delta_dir;

        if(Math.abs(row_delta) > 1 || Math.abs(col_delta) > 1) {
            var sum_delta = row_delta + col_delta;
            if(sum_delta <= 4 && sum_delta % 2 === 0) {
                if(board[jump_row] && board[jump_row][jump_col] === getOppositePawnByTurn(turnIndex)) {
                    return true;
                }
                return false;
            }
            return false;
        }
        return true;
    }

    function checkMoveOnCapture(board, to_row, to_col, captures) {

        for( var i = 0; i < captures.length; i++ ) {
            var capture = captures[i];
            if( to_row === capture.row && to_col === capture.col ) {
                return true;
            }
        }
        return false;
    }

    function isCaptured(board, row, col, turnIndex) {
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ];
        var oppositePawn = getOppositePawnByTurn(turnIndex);

        for( var i = 0; i < DIRS.length; i++ ){
            var dir = DIRS[i];
            if( board[row + dir.r] && board[row + dir.r][col + dir.c] === oppositePawn && board[row - dir.r] && board[row - dir.r][col - dir.c] === oppositePawn ) {
                return true;
            }
        }

        return false;
    }

    function checkCaptures(board, to_row, to_col, captures, turnIndex) {
        var caps = [];
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ];
        if(captures.length > 0) {
            for(var i = 0; i < captures.length; i++) {
                var cap = captures[i];
                if(isCaptured(board, cap.row, cap.col, turnIndex)) {
                    caps.push({row: cap.row, col: cap.col});
                }
                for(var j = 0; j < DIRS.length; j++) {
                    var dir = DIRS[j];
                    var r1 = cap.row + dir.r;
                    var r2 = cap.row - dir.r;
                    var c1 = cap.col + dir.c;
                    var c2 = cap.col - dir.c;
                    if(board[r1][c1] === getPawnByTurn(turnIndex) && isCaptured(board, r1, c1, turnIndex)) {
                        caps.push({row: r1, col: c1});
                    }
                    else if(board[r2][c2] === getPawnByTurn(turnIndex) && isCaptured(board, r2, c2, turnIndex)) {
                        caps.push({row: r2, col: c2});
                    }
                }

            }
        }
        else if(isCaptured(board, to_row, to_col, turnIndex)) {
            caps.push({row: to_row, col: to_col});
        }
        return caps;
    }

    function willCapture(board, row, col, turnIndex) {
        var DIRS = [ { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 } ];
        var turnPawn = getPawnByTurn(turnIndex),
            oppositePawn = getOppositePawnByTurn(turnIndex),
            captures = [], i, dir;

        for(i = 0; i < DIRS.length; i++ ){
            dir = DIRS[i];
            if( board[row + dir.r] && board[row + dir.r][col + dir.c] === oppositePawn &&
                board[row + 2 * dir.r] && board[row + 2 * dir.r][col + 2 * dir.c] === turnPawn ) {
                captures.push({row: row + dir.r, col: col + dir.c});
            }
        }

        for(i = 0; i < DIRS.length; i++ ){
            dir = DIRS[i];
            if( board[row - dir.r] && board[row - dir.r][col - dir.c] === oppositePawn &&
                board[row - 2 * dir.r] && board[row - 2 * dir.r][col - 2 * dir.c] === turnPawn ) {
                captures.push({row: row - dir.r, col: col - dir.c});
            }
        }

        return captures;
    }

    function createMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove) {
        if ( board === undefined ) {
            board = getInitialBoard();
        }
        var turnPawn = getPawnByTurn(turnIndexBeforeMove);

        if( board[from_row] === undefined || board[from_row][from_col] !== turnPawn ) {
            throw new Error("One can only move his own pawn!");
        }

        if(board[4][4] === turnPawn && from_row !== 4 && from_col !== 4) {
            throw new Error("One can only move his own pawn from the center block!");
        }

        if( board[to_row] === undefined || board[to_row][to_col] !== '' ) {
            throw new Error("One can only make a move in an empty position.");
        }
        if( getWinner(board, captures, turnIndexBeforeMove) !== '' || isTie(board) ) {
            throw new Error("One can only make a move if the game is not over!");
        }

        if(!isValidFromPosition(board, from_row, from_col, captures, turnIndexBeforeMove)) {
            throw new Error("One can only capture using one of the capturing pawns.");
        }

        if( !checkMoveSteps(board, from_row, from_col, to_row, to_col, turnIndexBeforeMove) ) {
            throw new Error("One can only make a one step move or jump once over opponent's pawn.");
        }

        if( captures && captures.length > 0 && !checkMoveOnCapture(board, to_row, to_col, captures) ) {
            throw new Error("One can only move a pawn to a captured pawn.");
        }


        var boardAfterMove = angular.copy(board),
            changeTurn = false,
            firstOperation = {}, i;

        boardAfterMove[from_row][from_col] = '';
        var canCapture = willCapture(boardAfterMove, to_row, to_col, turnIndexBeforeMove);
        var newCaptures = checkCaptures(boardAfterMove, to_row, to_col, captures, turnIndexBeforeMove);
        captures = [];
        if(!(to_row === 4 && to_col === 4)) {
            boardAfterMove[to_row][to_col] = turnPawn;
            if(newCaptures.length > 0 && canCapture.length === 0) {
                /**
                 * If the move results in capture of the moved pawn, remove it from
                 * the board and change turn.
                 */
                for(i = 0; i < newCaptures.length; i++) {
                    boardAfterMove[newCaptures[i].row][newCaptures[i].col] = '';
                }
                captures = newCaptures;
                changeTurn = true;
            }
            else {
                captures = canCapture;
                if( captures.length === 0 ) {
                    changeTurn = true;
                }
                else {
                    for(i = 0; i < captures.length; i++) {
                        var cap = captures[i];
                        boardAfterMove[cap.row][cap.col] = '';
                    }
                }
            }

            var winner = getWinner(boardAfterMove, captures, turnIndexBeforeMove);
            if (winner !== '' || isTie(boardAfterMove)) {
                // Game over.
                firstOperation = {endMatch: {endMatchScores:
                winner === 'R' ? [1, 0] : winner === 'B' ? [0, 1] : [0, 0] }};
            } else if(changeTurn) {
                // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
                firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
            }
            else {
                firstOperation = {setTurn: {turnIndex: turnIndexBeforeMove}};
            }
        }
        else {
            firstOperation = {setTurn: {turnIndex: turnIndexBeforeMove}};
            boardAfterMove[4][4] = turnPawn;
        }

        return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: { from_row: from_row, from_col: from_col, to_row: to_row, to_col: to_col } } },
            {set: {key: 'captures', value: captures } } ];
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
                to_col = deltaValue.to_col,
                captures = stateBeforeMove.captures || [],
                board = stateBeforeMove.board;

            var expectedMove = createMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        } catch (e) {
            //console.log(e.message);
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }

    return {
        getInitialBoard: getInitialBoard,
        createMove: createMove,
        isMoveOk: isMoveOk,
		isTie: isTie,
		getWinner: getWinner,
		checkMoveSteps: checkMoveSteps,
        getPawnByTurn: getPawnByTurn,
        getOppositePawnByTurn: getOppositePawnByTurn,
        getPossibleMoves: getPossibleMoves,
        getValidFromPositions: getValidFromPositions,
        getValidToPositions: getValidToPositions,
    };
});
