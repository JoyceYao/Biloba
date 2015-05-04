// You need to define a single method:
// function handleDragEvent(type, clientX, clientY) {...}
// type is either: "touchstart", "touchmove", "touchend", "touchcancel", "touchleave"
(function () {
  'use strict';

  var isMouseDown = false;

  function touchHandler(event) {
    var touch = event.changedTouches[0];
    handleEvent(event, event.type, touch.clientX, touch.clientY);
  }

  function mouseDownHandler(event) {
    isMouseDown = true;
    handleEvent(event, "touchstart", event.clientX, event.clientY);
  }

  function mouseMoveHandler(event) {
    if (isMouseDown) {
      handleEvent(event, "touchmove", event.clientX, event.clientY);
    }
  }

  function mouseUpHandler(event) {
    isMouseDown = false;
    handleEvent(event, "touchend", event.clientX, event.clientY);
  }

  function handleEvent(event, type, clientX, clientY) {
    event.preventDefault(); // Prevents generating mouse events for touch.
    handleDragEvent(type, clientX, clientY, event);
  }

  window.addEventListener("load", function () {
    var gameArea = document.getElementById("gameArea");
    if (!gameArea) {
      throw new Error("You must have <div id='gameArea'>...</div>");
    }
    gameArea.addEventListener("touchstart", touchHandler, true);
    gameArea.addEventListener("touchmove", touchHandler, true);
    gameArea.addEventListener("touchend", touchHandler, true);
    gameArea.addEventListener("touchcancel", touchHandler, true);
    gameArea.addEventListener("touchleave", touchHandler, true);
    gameArea.addEventListener("mousedown", mouseDownHandler, true);
    gameArea.addEventListener("mousemove", mouseMoveHandler, true);
    gameArea.addEventListener("mouseup", mouseUpHandler, true);
  }, false );
  
})();;angular.module('myApp', []).factory('gameLogic', function() {

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
            firstOperation = {};

        captures = [];
        boardAfterMove[from_row][from_col] = '';

        if(!(to_row === 4 && to_col === 4)) { 

            if(isCaptured(board, to_row, to_col, turnIndexBeforeMove)) {
                /** 
                 * If the move results in capture of the moved pawn, remove it from
                 * the board and change turn.
                 */
                boardAfterMove[to_row][to_col] = '';
                captures = [ {row: to_row, col: to_col} ];
                changeTurn = true;
            }
            else {
                boardAfterMove[to_row][to_col] = turnPawn;
                captures = willCapture(boardAfterMove, to_row, to_col, turnIndexBeforeMove);
                if( captures.length === 0 ) {
                    changeTurn = true;
                }
                else {
                    for(var i = 0; i < captures.length; i++) {
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
                //console.log(move[1], expectedMove[1]);
                return false;
            }
        } catch (e) {
           // console.log(e.message);
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
});;angular.module('myApp')
  .controller('gameController',
      ['$rootScope', '$scope', '$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 'aiService',
       'resizeGameAreaService', '$translate', 'dragAndDropService',
      function ($rootScope, $scope, $log, $timeout,
        gameService, stateService, gameLogic, aiService,
        resizeGameAreaService, $translate, dragAndDropService ) {

    'use strict';

    var gameArea = document.getElementById("gameArea"),
        numRows = 9, numCols = 9,
        dragStartPos = null, dragEl = null, nextZIndex = 81, dragSet = false;

    function handleDrag(type, cx, cy) {
        var size = getSquareWidthHeight();
        var x = Math.min(Math.max(cx - gameArea.offsetLeft, 0), gameArea.clientWidth - size.width),
            y = Math.min(Math.max(cy - gameArea.offsetTop, 0), gameArea.clientHeight - size.height);

        var row = Math.floor( numRows * y / gameArea.clientHeight ),
            col = Math.floor( numCols * x / gameArea.clientWidth );

        if (type === "touchstart" && !dragEl) {
            /**
             * Drag started.
             */
            if(selectCell(row, col)){
                $scope.$apply(function(){
                    dragStartPos = {row: row, col: col};
                    dragEl = document.getElementById("e2e_test_piece_" + dragStartPos.row + "x" + dragStartPos.col);
                    dragEl.style['z-index'] = nextZIndex;
                });
            }
        }

        if (!dragEl) {
            return;
        }

        if (type === "touchend") {
            var from = dragStartPos;
            var to = {row: row, col: col};
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
            if(dragSet) {
               /**
                * If drag results in valid move, hide and reset piece after some time to avoid animation. 
                */
                setTimeout(function(){
                    dragEl.style.display = 'none';
                    dragEl.style.left = '';
                    dragEl.style.top = '';
                    dragEl.style.display = 'block';
                    dragEl = null;
                },100);
            }
            else {
                dragEl.style.left = '';
                dragEl.style.top = '';
                dragEl = null;                
            }
            dragStartPos = null;
        }
    }
    dragAndDropService.addDragListener("gameArea", handleDrag);

    function setDraggingPieceTopLeft(topLeft) {
        var originalSize = getSquareTopLeft(dragStartPos.row, dragStartPos.col);
        var squareSize = getSquareWidthHeight();
        dragEl.style.left = topLeft.left - originalSize.left + 0.15 * squareSize.width + "px";
        dragEl.style.top = topLeft.top - originalSize.top + 0.15 * squareSize.height +  "px";
    }

    function getSquareWidthHeight() {
        return {
            width: gameArea.clientWidth / numCols,
            height: gameArea.clientHeight / numRows
        };
    }

    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return {top: row * size.height, left: col * size.width};
    }

    $scope.selectedBlock = null;
    $scope.validToPositions = [];
    resizeGameAreaService.setWidthToHeight(1);

    function dragDone(from, to) {
        selectCell(to.row, to.col);
        $scope.$apply();
    }

    function sendComputerMove() {
        var items = gameLogic.getPossibleMoves($scope.board, $scope.captures, $scope.turnIndex);
        gameService.makeMove(items[Math.floor(Math.random()*items.length)]);
    }

    function updateUI(params) {
        $scope.board = params.stateAfterMove.board;
        $scope.delta = params.stateAfterMove.delta;
        $scope.captures = params.stateAfterMove.captures || [];
        if ($scope.board === undefined) {
            $scope.board = gameLogic.getInitialBoard();
            if (params.playMode === "playBlack") {
                $scope.rotate = true;
            } else {
                $scope.rotate = false;
            }
        }

        $scope.validFromPositions = gameLogic.getValidFromPositions($scope.board, $scope.captures, params.turnIndexAfterMove);
        if($scope.selectedBlock && $scope.selectedBlock.row === 4 && $scope.selectedBlock.col === 4) {
            $scope.validToPositions = gameLogic.getValidToPositions($scope.board, 4, 4, $scope.captures, $scope.turnIndex);                        
        }
        
        $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;

        if ($scope.isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
            $scope.isYourTurn = false; // to make sure the UI won't send another move.
            // Waiting 0.5 seconds to let the move animation finish; if we call aiService
            // then the animation is paused until the javascript finishes.
            $timeout(sendComputerMove, 500);
        }
    }

    window.e2e_test_stateService = stateService;

    function isValid(row, col) {
        for(var i = 0; i < $scope.validFromPositions.length; i++) {
            var pos = $scope.validFromPositions[i];
            if(row === pos.row && col === pos.col) {
                return true;
            }
        }
        return false;
    }

    function selectCell(row, col) {
        if($scope.rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        $log.info(["Clicked on cell:", row, col, $scope.isYourTurn]);

        if(!$scope.isYourTurn) {
            return false;
        }
        
        if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
            throw new Error("Throwing the error because URL has '?throwException'");
        }

        if( isValid(row, col) ) {
            $scope.selectedBlock = { row: row, col: col };
            $scope.validToPositions = gameLogic.getValidToPositions($scope.board, row, col, $scope.captures, $scope.turnIndex);
        }
        else {
            if( $scope.selectedBlock !== null ) {
                try {
                    var from = $scope.selectedBlock;
                    var move = gameLogic.createMove($scope.board, from.row, from.col, row, col, $scope.captures, $scope.turnIndex);
                    if(row === 4 && col === 4){
                        $scope.selectedBlock = { row: 4, col: 4 };
                    }
                    else {
                        $scope.selectedBlock = null;
                        $scope.validToPositions = [];
                    }
                    dragSet = true;
                    $scope.isYourTurn = false; // to prevent making another move
                    gameService.makeMove(move);
                } catch (e) {
                    $log.info(["Cell is already full in position:", row, col]);
                    return false;
                }                
            }
        }
        return true;     
    }

    $scope.getBlockClass = function(row, col) {
        if($scope.rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        var classes = ['block'];
        if($scope.getPiece(row, col) === '-'){
            classes.push('empty');
        }
        else {
            if(row === 4 && col === 4){
                classes.push('center');
            }

            if($scope.selectedBlock && $scope.selectedBlock.row === row && $scope.selectedBlock.col === col){
                classes.push('selected');
            }

            var i, pos;

            if(isValid(row, col)) {
                classes.push('valid');
            }
            else{
                for(i = 0; i < $scope.validToPositions.length; i++) {
                    pos = $scope.validToPositions[i];
                    if(row === pos.row && col === pos.col) {
                        classes.push('validTo');
                        break;
                    }
                }                
            }

            for(i = 0; i < $scope.captures.length; i++) {
                pos = $scope.captures[i];
                if(row === pos.row && col === pos.col) {
                    classes.push('captured', gameLogic.getOppositePawnByTurn($scope.turnIndex));
                }
            }
        }
        return classes;
    };

    $scope.getPiece = function(row, col) {
        if($scope.rotate) {
            row = 8 - row;
            col = 8 - col;
        }
        return $scope.board[row][col];
    };

    gameService.setGame({
        gameDeveloperEmail: "jugalm9@gmail.com",
        minNumberOfPlayers: 2,
        maxNumberOfPlayers: 2,
        isMoveOk: gameLogic.isMoveOk,
        updateUI: updateUI
    });

}]);;angular.module('myApp').factory('aiService',
    ["alphaBetaService", "gameLogic",
      function(alphaBetaService, gameLogic) {

  'use strict';
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
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: board}}, null, {set: {key: 'captures', value: captures}}],
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move) { // alphaBetaService also passes playerIndex, in case you need it: getStateScoreForIndex0(move, playerIndex)
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
/*    for(var i = 0; i<moves.length; i++) {
      prettyPrintMove(moves[i]);
    }*/
    return moves;
  }

  function getDebugStateToString(move) {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }

  return {createComputerMove: createComputerMove};
}]);