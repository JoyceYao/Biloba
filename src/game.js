angular.module('myApp').controller('gameController',
    ['$scope', '$log', '$timeout', 'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
    function ($scope, $log, $timeout, gameService, stateService, gameLogic, resizeGameAreaService) {

    'use strict';

    $scope.selectedBlock = null;
    resizeGameAreaService.setWidthToHeight(1);

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

        if($scope.captures.length > 0) {
            var valid = gameLogic.getValidPositionsOnCapture($scope.board, $scope.captures, params.turnIndexAfterMove);
            $scope.selectedBlock = { row: valid[0].row, col: valid[0].col };
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

    $scope.cellClicked = function (row, col) {
        $log.info(["Clicked on cell:", row, col]);
        if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
            throw new Error("Throwing the error because URL has '?throwException'");
        }

        if( $scope.board[row][col] === gameLogic.getPawnByTurn($scope.turnIndex) ) {
            if($scope.selectedBlock && $scope.selectedBlock.row === 4 && $scope.selectedBlock.col) { 
                return;
            }
            $scope.selectedBlock = { row: row, col: col };
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
                    }
                    $scope.isYourTurn = false; // to prevent making another move
                    gameService.makeMove(move);
                } catch (e) {
                    $log.info(["Cell is already full in position:", row, col]);
                    return;
                }                
            }
        }
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