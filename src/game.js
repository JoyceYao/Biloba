angular.module('myApp').controller('gameController',
    ['$scope', '$log', '$timeout', 'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
    function ($scope, $log, $timeout, gameService, stateService, gameLogic, resizeGameAreaService) {

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
    window.handleDragEvent = handleDrag;

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

}]);