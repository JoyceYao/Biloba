module game {
  interface ITopLeft {
    top: number;
    left: number;
  }
  interface IWidthHeight {
    width: number;
    height: number;
  }
  let selectedBlock: IPosition = null;
  let validFromPositions: IPosition[] = [];
  let validToPositions: IPosition[] = [];
  let captures: IPosition[] = [];
  let isYourTurn = false;
  let board: Board = null;
  let delta: BoardDelta = null;
  let rotate = false;
  let turnIndex: number;
  let numRows = 9, numCols = 9, nextZIndex = 81;
  let dragStartPos: IPosition = null;
  var dragEl: HTMLElement = null;
  let dragSet = false;
  let gameArea: HTMLElement = null;
  export let isHelpModalShown: boolean = false;

  export function init() {
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
    })
  }

  function handleDrag(type: string, cx: number, cy: number): void {
    var size = getSquareWidthHeight();
    var x = Math.min(Math.max(cx - gameArea.offsetLeft, 0), gameArea.clientWidth - size.width);
    var y = Math.min(Math.max(cy - gameArea.offsetTop, 0), gameArea.clientHeight - size.height);
    var row = Math.floor( numRows * y / gameArea.clientHeight );
    var col = Math.floor( numCols * x / gameArea.clientWidth );

    if (type === "touchstart" && !dragEl) {
      /**
      * Drag started.
      */
      if(selectCell(row, col)){
        $rootScope.$apply(function(){
          dragStartPos = {row: row, col: col};
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
      var to = {row: row, col: col};
      dragDone(from, to);
    } else {
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
      } else {
        dragEl.style.left = '';
        dragEl.style.top = '';
        dragEl = null;
      }
      dragStartPos = null;
    }
  }

  function setDraggingPieceTopLeft(topLeft: ITopLeft): void {
    var originalSize = getSquareTopLeft(dragStartPos.row, dragStartPos.col);
    var squareSize = getSquareWidthHeight();
    dragEl.style.left = topLeft.left - originalSize.left + 0.15 * squareSize.width + "px";
    dragEl.style.top = topLeft.top - originalSize.top + 0.15 * squareSize.height +  "px";
  }

  function getSquareWidthHeight(): IWidthHeight {
    return {
      width: gameArea.clientWidth / numCols,
      height: gameArea.clientHeight / numRows
    };
  }

  function getSquareTopLeft(row: number, col: number): ITopLeft {
    var size = getSquareWidthHeight();
    return {top: row * size.height, left: col * size.width};
  }

  function dragDone(from: IPosition, to: IPosition): void {
    selectCell(to.row, to.col);
    $rootScope.$apply();
  }

  function sendComputerMove(): void {
    var items: IMove[] = gameLogic.getPossibleMoves(board, captures, turnIndex);
    gameService.makeMove(items[Math.floor(Math.random()*items.length)]);
  }

  function updateUI(params: IUpdateUI): void {
    board = params.stateAfterMove.board;
    delta = params.stateAfterMove.delta;
    captures = params.stateAfterMove.captures || [];
    if (board === undefined) {
      board = gameLogic.getInitialBoard();
      if (params.playMode === "playBlack") {
        rotate = true;
      } else {
        rotate = false;
      }
    }

    validFromPositions = gameLogic.getValidFromPositions(board, captures, params.turnIndexAfterMove);
    if(selectedBlock && selectedBlock.row === 4 && selectedBlock.col === 4) {
      validToPositions = gameLogic.getValidToPositions(board, 4, 4, captures, turnIndex);
    }

    isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
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

  function isValid(row: number, col: number): boolean {
    for (var i = 0; i < validFromPositions.length; i++) {
      var pos = validFromPositions[i];
      if (row === pos.row && col === pos.col) {
        return true;
      }
    }
    return false;
  }

  function selectCell(row: number, col: number): boolean {
    if (rotate) {
      row = 8 - row;
      col = 8 - col;
    }

    log.info(["Clicked on cell:", row, col, isYourTurn]);

    if (!isYourTurn) {
      return false;
    }

    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }

    if (isValid(row, col)) {
      selectedBlock = { row: row, col: col };
      validToPositions = gameLogic.getValidToPositions(board, row, col, captures, turnIndex);
    } else {
      if (selectedBlock !== null) {
        try {
          var from = selectedBlock;
          var move = gameLogic.createMove(board, from.row, from.col, row, col, captures, turnIndex);
          if (row === 4 && col === 4){
            selectedBlock = { row: 4, col: 4 };
          } else {
            selectedBlock = null;
            validToPositions = [];
          }
          dragSet = true;
          isYourTurn = false; // to prevent making another move
          gameService.makeMove(move);
        } catch (e) {
          log.info(["Cell is already full in position:", row, col]);
            return false;
        }
      }
    }
    return true;
  }

  export function getBlockClass(row: number, col: number): string[] {
    if (rotate) {
      row = 8 - row;
      col = 8 - col;
    }

    var classes = ['block'];
    if (getPiece(row, col) === '-'){
      classes.push('empty');
    } else {
      if (row === 4 && col === 4){
        classes.push('center');
      }

      if (selectedBlock && selectedBlock.row === row && selectedBlock.col === col){
        classes.push('selected');
      }

      if (isValid(row, col)) {
        classes.push('valid');
      } else {
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

  export function getPiece(row: number, col: number): string {
    if(rotate) {
      row = 8 - row;
      col = 8 - col;
    }
    return board[row][col];
  }

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_BILOBA: "Rules of Biloba",
    RULES_SLIDE1: "Biloba is an abstract strategy board game for 2 players. On each turn, each player moves one friendly stone. A stone may move to an (orthogonal or diagonal) adjacent empty cell.",
    RULES_SLIDE2: "If a stone moves to the center cell, it must move again to an adjacent empty cell (no stone may stay at the center). A stone may also jump over one stone (of either color) landing on the immediate next empty cell.",
    RULES_SLIDE3: "An enemy stone is captured when sandwiched between two friendly stones (orthogonal or diagonal). After the removal of the captured stone, one of the two friendly stones must move to occupy the captured stone position.",
    RULES_SLIDE4: "A player loses if, at the beginning of his turn, he has less than three stones and is unable to capture enemy stones so that his opponent also have less than three stones. In this later case, the game is a draw.",
    CLOSE:"Close"
  });

  game.init();
});
