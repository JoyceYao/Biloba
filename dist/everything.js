var gameLogic;
(function (gameLogic) {
    function getInitialBoard() {
        var board = [['-', '-', '', '', 'B', '', '', '-', '-'],
            ['-', '', '', 'B', 'B', 'B', '', '', '-'],
            ['', '', 'B', 'B', 'B', 'B', 'B', '', ''],
            ['', 'B', 'B', 'B', 'B', 'B', 'B', 'B', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', 'R', 'R', 'R', 'R', 'R', 'R', 'R', ''],
            ['', '', 'R', 'R', 'R', 'R', 'R', '', ''],
            ['-', '', '', 'R', 'R', 'R', '', '', '-'],
            ['-', '-', '', '', 'R', '', '', '-', '-']];
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getPawnByTurn(turnIndex) {
        return turnIndex === 0 ? 'R' : 'B';
    }
    function getOppositePawnByTurn(turnIndex) {
        return turnIndex === 0 ? 'B' : 'R';
    }
    gameLogic.getOppositePawnByTurn = getOppositePawnByTurn;
    function getPawnCount(board) {
        var pawnCount = { R: 0, B: 0 };
        for (var i = 0; i < 9; i++) {
            var row = board[i];
            for (var j = 0; j < 9; j++) {
                if (row[j] === 'R') {
                    pawnCount.R++;
                }
                else if (row[j] === 'B') {
                    pawnCount.B++;
                }
            }
        }
        return pawnCount;
    }
    function isTie(board) {
        var pawnCount = getPawnCount(board);
        if (pawnCount.R < 3 && pawnCount.B < 3) {
            return true;
        }
        return false;
    }
    function getWinner(board, captures, turnIndex) {
        var pawnCount = getPawnCount(board);
        if (captures.length > 0) {
            //if(pawnCount[1 - turnIndex] < 3)
            if ((turnIndex == 0 && pawnCount.B < 3) || (turnIndex == 1 && pawnCount.R < 3)) {
                for (var i = 0; i < captures.length; i++) {
                    if (!isCaptured(board, captures[i].row, captures[i].col, turnIndex)) {
                        return getPawnByTurn(turnIndex);
                    }
                }
            }
            return '';
        }
        if (pawnCount.R >= 3 && pawnCount.B >= 3) {
            return '';
        }
        else if (pawnCount.R >= 3 && pawnCount.B < 3) {
            return 'B';
        }
        else if (pawnCount.B >= 3 && pawnCount.R < 3) {
            return 'R';
        }
    }
    function getValidMoves(board, row, col, captures, turnIndex) {
        var valid = [];
        var rMin = Math.max(row - 2, 0), rMax = Math.min(row + 2, 8);
        var cMin = Math.max(col - 2, 0), cMax = Math.min(col + 2, 8);
        for (var k = rMin; k <= rMax; k++) {
            for (var l = cMin; l <= cMax; l++) {
                try {
                    var move = createMove(board, row, col, k, l, captures, turnIndex);
                    valid.push(move);
                }
                catch (e) { }
            }
        }
        return valid;
    }
    function getPossibleMoves(board, captures, turnIndex) {
        var possibleMoves = [];
        var turnPawn = getPawnByTurn(turnIndex);
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (board[i][j] === turnPawn) {
                    possibleMoves = possibleMoves.concat(getValidMoves(board, i, j, captures, turnIndex));
                }
            }
        }
        return possibleMoves;
    }
    gameLogic.getPossibleMoves = getPossibleMoves;
    function getValidFromPositionsOnCapture(board, captures, turnIndex) {
        var DIRS = [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 }];
        var validPositions = [];
        var turnPawn = getPawnByTurn(turnIndex);
        for (var j = 0; j < captures.length; j++) {
            var row = captures[j].row, col = captures[j].col;
            for (var i = 0; i < DIRS.length; i++) {
                var dir = DIRS[i], pRow = row + dir.r, pCol = col + dir.c, nRow = row - dir.r, nCol = col - dir.c;
                if (board[pRow] && board[pRow][pCol] === turnPawn
                    && board[nRow] && board[nRow][nCol] === turnPawn) {
                    validPositions.push({ row: pRow, col: pCol }, { row: nRow, col: nCol });
                }
            }
        }
        return validPositions;
    }
    function getValidFromPositions(board, captures, turnIndex) {
        var turnPawn = getPawnByTurn(turnIndex);
        var validPositions = [];
        if (board[4][4] === turnPawn) {
            return [{ row: 4, col: 4 }];
        }
        else if (captures.length > 0) {
            return getValidFromPositionsOnCapture(board, captures, turnIndex);
        }
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (board[i][j] === turnPawn) {
                    validPositions.push({ row: i, col: j });
                }
            }
        }
        return validPositions;
    }
    gameLogic.getValidFromPositions = getValidFromPositions;
    function isValidFromPosition(board, row, col, captures, turnIndex) {
        var validPositions = getValidFromPositions(board, captures, turnIndex);
        for (var i = 0; i < validPositions.length; i++) {
            var valid = validPositions[i];
            if (row === valid.row && col === valid.col) {
                return true;
            }
        }
        return false;
    }
    function getValidToPositions(board, row, col, captures, turnIndex) {
        // Assuming {row, col} is a valid from position.
        var valid = getValidMoves(board, row, col, captures, turnIndex);
        var validPositions = [];
        for (var i = 0; i < valid.length; i++) {
            var v = valid[i];
            validPositions.push({ row: v[2].set.value.to_row, col: v[2].set.value.to_col });
        }
        return validPositions;
    }
    gameLogic.getValidToPositions = getValidToPositions;
    function checkMoveSteps(board, from_row, from_col, to_row, to_col, turnIndex) {
        var row_delta = to_row - from_row, col_delta = to_col - from_col, row_delta_dir = row_delta === 0 ? 0 : row_delta / Math.abs(row_delta), col_delta_dir = col_delta === 0 ? 0 : col_delta / Math.abs(col_delta), jump_row = from_row + row_delta_dir, jump_col = from_col + col_delta_dir;
        if (Math.abs(row_delta) > 1 || Math.abs(col_delta) > 1) {
            var sum_delta = row_delta + col_delta;
            if (sum_delta <= 4 && sum_delta % 2 === 0) {
                if (board[jump_row] && board[jump_row][jump_col] === getOppositePawnByTurn(turnIndex)) {
                    return true;
                }
                return false;
            }
            return false;
        }
        return true;
    }
    function checkMoveOnCapture(board, to_row, to_col, captures) {
        for (var i = 0; i < captures.length; i++) {
            var capture = captures[i];
            if (to_row === capture.row && to_col === capture.col) {
                return true;
            }
        }
        return false;
    }
    function isCaptured(board, row, col, turnIndex) {
        var DIRS = [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 }];
        var oppositePawn = getOppositePawnByTurn(turnIndex);
        for (var i = 0; i < DIRS.length; i++) {
            var dir = DIRS[i];
            if (board[row + dir.r] && board[row + dir.r][col + dir.c] === oppositePawn
                && board[row - dir.r] && board[row - dir.r][col - dir.c] === oppositePawn) {
                return true;
            }
        }
        return false;
    }
    function checkCaptures(board, to_row, to_col, captures, turnIndex) {
        var caps = [];
        var DIRS = [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 }];
        if (captures.length > 0) {
            for (var i = 0; i < captures.length; i++) {
                var cap = captures[i];
                if (isCaptured(board, cap.row, cap.col, turnIndex)) {
                    caps.push({ row: cap.row, col: cap.col });
                }
                for (var j = 0; j < DIRS.length; j++) {
                    var dir = DIRS[j];
                    var r1 = cap.row + dir.r;
                    var r2 = cap.row - dir.r;
                    var c1 = cap.col + dir.c;
                    var c2 = cap.col - dir.c;
                    if (board[r1][c1] === getPawnByTurn(turnIndex)
                        && isCaptured(board, r1, c1, turnIndex)) {
                        caps.push({ row: r1, col: c1 });
                    }
                    else if (board[r2][c2] === getPawnByTurn(turnIndex)
                        && isCaptured(board, r2, c2, turnIndex)) {
                        caps.push({ row: r2, col: c2 });
                    }
                }
            }
        }
        else if (isCaptured(board, to_row, to_col, turnIndex)) {
            caps.push({ row: to_row, col: to_col });
        }
        return caps;
    }
    function willCapture(board, row, col, turnIndex) {
        var DIRS = [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: -1 }];
        var turnPawn = getPawnByTurn(turnIndex);
        var oppositePawn = getOppositePawnByTurn(turnIndex);
        var captures = [];
        for (var i = 0; i < DIRS.length; i++) {
            var dir = DIRS[i];
            if (board[row + dir.r] && board[row + dir.r][col + dir.c] === oppositePawn &&
                board[row + 2 * dir.r] && board[row + 2 * dir.r][col + 2 * dir.c] === turnPawn) {
                captures.push({ row: row + dir.r, col: col + dir.c });
            }
        }
        for (var i = 0; i < DIRS.length; i++) {
            var dir = DIRS[i];
            if (board[row - dir.r] && board[row - dir.r][col - dir.c] === oppositePawn &&
                board[row - 2 * dir.r] && board[row - 2 * dir.r][col - 2 * dir.c] === turnPawn) {
                captures.push({ row: row - dir.r, col: col - dir.c });
            }
        }
        return captures;
    }
    function createMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove) {
        if (board === undefined) {
            board = getInitialBoard();
        }
        var turnPawn = getPawnByTurn(turnIndexBeforeMove);
        if (board[from_row] === undefined || board[from_row][from_col] !== turnPawn) {
            throw new Error("One can only move his own pawn!");
        }
        if (board[4][4] === turnPawn && from_row !== 4 && from_col !== 4) {
            throw new Error("One can only move his own pawn from the center block!");
        }
        if (board[to_row] === undefined || board[to_row][to_col] !== '') {
            throw new Error("One can only make a move in an empty position.");
        }
        if (getWinner(board, captures, turnIndexBeforeMove) !== '' || isTie(board)) {
            throw new Error("One can only make a move if the game is not over!");
        }
        if (!isValidFromPosition(board, from_row, from_col, captures, turnIndexBeforeMove)) {
            throw new Error("One can only capture using one of the capturing pawns.");
        }
        if (!checkMoveSteps(board, from_row, from_col, to_row, to_col, turnIndexBeforeMove)) {
            throw new Error("One can only make a one step move or jump once over opponent's pawn.");
        }
        if (captures && captures.length > 0 && !checkMoveOnCapture(board, to_row, to_col, captures)) {
            throw new Error("One can only move a pawn to a captured pawn.");
        }
        var boardAfterMove = angular.copy(board), changeTurn = false, firstOperation = {}, i;
        boardAfterMove[from_row][from_col] = '';
        var canCapture = willCapture(boardAfterMove, to_row, to_col, turnIndexBeforeMove);
        var newCaptures = checkCaptures(boardAfterMove, to_row, to_col, captures, turnIndexBeforeMove);
        captures = [];
        if (!(to_row === 4 && to_col === 4)) {
            boardAfterMove[to_row][to_col] = turnPawn;
            if (newCaptures.length > 0 && canCapture.length === 0) {
                /**
                 * If the move results in capture of the moved pawn, remove it from
                 * the board and change turn.
                 */
                for (i = 0; i < newCaptures.length; i++) {
                    boardAfterMove[newCaptures[i].row][newCaptures[i].col] = '';
                }
                captures = newCaptures;
                changeTurn = true;
            }
            else {
                captures = canCapture;
                if (captures.length === 0) {
                    changeTurn = true;
                }
                else {
                    for (i = 0; i < captures.length; i++) {
                        var cap = captures[i];
                        boardAfterMove[cap.row][cap.col] = '';
                    }
                }
            }
            var winner = getWinner(boardAfterMove, captures, turnIndexBeforeMove);
            if (winner !== '' || isTie(boardAfterMove)) {
                // Game over.
                firstOperation = { endMatch: { endMatchScores: winner === 'R' ? [1, 0] : winner === 'B' ? [0, 1] : [0, 0] } };
            }
            else if (changeTurn) {
                // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
                firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
            }
            else {
                firstOperation = { setTurn: { turnIndex: turnIndexBeforeMove } };
            }
        }
        else {
            firstOperation = { setTurn: { turnIndex: turnIndexBeforeMove } };
            boardAfterMove[4][4] = turnPawn;
        }
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'delta', value: { from_row: from_row, from_col: from_col,
                        to_row: to_row, to_col: to_col } } },
            { set: { key: 'captures', value: captures } }];
    }
    gameLogic.createMove = createMove;
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        try {
            var deltaValue = move[2].set.value;
            var from_row = deltaValue.from_row, from_col = deltaValue.from_col, to_row = deltaValue.to_row, to_col = deltaValue.to_col, captures = stateBeforeMove.captures || [], board = stateBeforeMove.board;
            var expectedMove = createMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        }
        catch (e) {
            //console.log(e.message);
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
;var game;
(function (game) {
    var selectedBlock = null;
    var validFromPositions = [];
    var validToPositions = [];
    var captures = [];
    var isYourTurn = false;
    var board = null;
    var delta = null;
    var rotate = false;
    var turnIndex;
    var numRows = 9, numCols = 9, nextZIndex = 81;
    var dragStartPos = null;
    var dragEl = null;
    var dragSet = false;
    var gameArea = null;
    game.isHelpModalShown = false;
    function init() {
        gameArea = document.getElementById("gameArea");
        dragAndDropService.addDragListener("gameArea", handleDrag);
        resizeGameAreaService.setWidthToHeight(1);
        //window.e2e_test_stateService = stateService;
        gameService.setGame({
            //gameDeveloperEmail: "jugalm9@gmail.com",
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
    }
    game.init = init;
    function handleDrag(type, cx, cy) {
        var size = getSquareWidthHeight();
        var x = Math.min(Math.max(cx - gameArea.offsetLeft, 0), gameArea.clientWidth - size.width);
        var y = Math.min(Math.max(cy - gameArea.offsetTop, 0), gameArea.clientHeight - size.height);
        var row = Math.floor(numRows * y / gameArea.clientHeight);
        var col = Math.floor(numCols * x / gameArea.clientWidth);
        if (type === "touchstart" && !dragEl) {
            /**
            * Drag started.
            */
            if (selectCell(row, col)) {
                $rootScope.$apply(function () {
                    dragStartPos = { row: row, col: col };
                    dragEl = document.getElementById("e2e_test_piece_" + dragStartPos.row + "x" + dragStartPos.col);
                    dragEl.style.zIndex = nextZIndex + "";
                });
            }
        }
        if (!dragEl) {
            return;
        }
        if (type === "touchend") {
            var from = dragStartPos;
            var to = { row: row, col: col };
            dragDone(from, to);
        }
        else {
            /**
            * Continue dragging.
            */
            setDraggingPieceTopLeft(getSquareTopLeft(row, col));
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            /**
            * Drag ended.
            */
            if (dragSet) {
                /**
                * If drag results in valid move, hide and reset piece after some time to avoid animation.
                */
                setTimeout(function () {
                    dragEl.style.display = 'none';
                    dragEl.style.left = '';
                    dragEl.style.top = '';
                    dragEl.style.display = 'block';
                    dragEl = null;
                }, 100);
            }
            else {
                dragEl.style.left = '';
                dragEl.style.top = '';
                dragEl = null;
            }
            dragStartPos = null;
        }
    }
    function setDraggingPieceTopLeft(topLeft) {
        var originalSize = getSquareTopLeft(dragStartPos.row, dragStartPos.col);
        var squareSize = getSquareWidthHeight();
        dragEl.style.left = topLeft.left - originalSize.left + 0.15 * squareSize.width + "px";
        dragEl.style.top = topLeft.top - originalSize.top + 0.15 * squareSize.height + "px";
    }
    function getSquareWidthHeight() {
        return {
            width: gameArea.clientWidth / numCols,
            height: gameArea.clientHeight / numRows
        };
    }
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return { top: row * size.height, left: col * size.width };
    }
    function dragDone(from, to) {
        selectCell(to.row, to.col);
        $rootScope.$apply();
    }
    function sendComputerMove() {
        var items = gameLogic.getPossibleMoves(board, captures, turnIndex);
        gameService.makeMove(items[Math.floor(Math.random() * items.length)]);
    }
    function updateUI(params) {
        board = params.stateAfterMove.board;
        delta = params.stateAfterMove.delta;
        captures = params.stateAfterMove.captures || [];
        if (board === undefined) {
            board = gameLogic.getInitialBoard();
            if (params.playMode === "playBlack") {
                rotate = true;
            }
            else {
                rotate = false;
            }
        }
        validFromPositions = gameLogic.getValidFromPositions(board, captures, params.turnIndexAfterMove);
        if (selectedBlock && selectedBlock.row === 4 && selectedBlock.col === 4) {
            validToPositions = gameLogic.getValidToPositions(board, 4, 4, captures, turnIndex);
        }
        isYourTurn = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        if (isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            isYourTurn = false;
            // to make sure the UI won't send another move.
            // Waiting 0.5 seconds to let the move animation finish; if we call aiService
            // then the animation is paused until the javascript finishes.
            $timeout(sendComputerMove, 500);
        }
    }
    function isValid(row, col) {
        for (var i = 0; i < validFromPositions.length; i++) {
            var pos = validFromPositions[i];
            if (row === pos.row && col === pos.col) {
                return true;
            }
        }
        return false;
    }
    function selectCell(row, col) {
        if (rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        log.info(["Clicked on cell:", row, col, isYourTurn]);
        if (!isYourTurn) {
            return false;
        }
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (isValid(row, col)) {
            selectedBlock = { row: row, col: col };
            validToPositions = gameLogic.getValidToPositions(board, row, col, captures, turnIndex);
        }
        else {
            if (selectedBlock !== null) {
                try {
                    var from = selectedBlock;
                    var move = gameLogic.createMove(board, from.row, from.col, row, col, captures, turnIndex);
                    if (row === 4 && col === 4) {
                        selectedBlock = { row: 4, col: 4 };
                    }
                    else {
                        selectedBlock = null;
                        validToPositions = [];
                    }
                    dragSet = true;
                    isYourTurn = false; // to prevent making another move
                    gameService.makeMove(move);
                }
                catch (e) {
                    log.info(["Cell is already full in position:", row, col]);
                    return false;
                }
            }
        }
        return true;
    }
    function getBlockClass(row, col) {
        if (rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        var classes = ['block'];
        if (getPiece(row, col) === '-') {
            classes.push('empty');
        }
        else {
            if (row === 4 && col === 4) {
                classes.push('center');
            }
            if (selectedBlock && selectedBlock.row === row && selectedBlock.col === col) {
                classes.push('selected');
            }
            if (isValid(row, col)) {
                classes.push('valid');
            }
            else {
                for (var i = 0; i < validToPositions.length; i++) {
                    var pos = validToPositions[i];
                    if (row === pos.row && col === pos.col) {
                        classes.push('validTo');
                        break;
                    }
                }
            }
            for (var i = 0; i < captures.length; i++) {
                pos = captures[i];
                if (row === pos.row && col === pos.col) {
                    classes.push('captured', gameLogic.getOppositePawnByTurn(turnIndex));
                }
            }
        }
        return classes;
    }
    game.getBlockClass = getBlockClass;
    function getPiece(row, col) {
        if (rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        return board[row][col];
    }
    game.getPiece = getPiece;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_BILOBA: "Rules of Biloba",
        RULES_SLIDE1: "Biloba is an abstract strategy board game for 2 players. On each turn, each player moves one friendly stone. A stone may move to an (orthogonal or diagonal) adjacent empty cell.",
        RULES_SLIDE2: "If a stone moves to the center cell, it must move again to an adjacent empty cell (no stone may stay at the center). A stone may also jump over one stone (of either color) landing on the immediate next empty cell.",
        RULES_SLIDE3: "An enemy stone is captured when sandwiched between two friendly stones (orthogonal or diagonal). After the removal of the captured stone, one of the two friendly stones must move to occupy the captured stone position.",
        RULES_SLIDE4: "A player loses if, at the beginning of his turn, he has less than three stones and is unable to capture enemy stones so that his opponent also have less than three stones. In this later case, the game is a draw.",
        CLOSE: "Close"
    });
    game.init();
});
;var aiService;
(function (aiService) {
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(board, captures, playerIndex, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        // Recal that a TicTacToe move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: board } }, null, { set: { key: 'captures', value: captures } }], playerIndex, getNextStates, getStateScoreForIndex0, 
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move) {
        // alphaBetaService also passes playerIndex,
        // in case you need it: getStateScoreForIndex0(move, playerIndex)
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        var moves = gameLogic.getPossibleMoves(move[1].set.value, move[3].set.value, playerIndex);
        return moves;
    }
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
