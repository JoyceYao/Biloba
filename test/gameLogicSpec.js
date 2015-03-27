describe("In Biloba", function() {

	'use strict';
	
	var _gameLogic;

	beforeEach(module("myApp"));

	beforeEach(inject(function (gameLogic) {
		_gameLogic = gameLogic;
	}));

	function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
			move: move})).toBe(true);
	}

	function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
			move: move})).toBe(false);
	}
	
	function expectTie(board) {
		expect(_gameLogic.isTie(board)).toBe(true);
	}

	
	function expectIllegalCheckMoveStep(board, from_row, from_col, to_row, to_col, turnIndex) {
		expect(_gameLogic.checkMoveSteps(board, from_row, from_col, to_row, to_col, turnIndex )).toBe(false);
	}
	
/*	function expectIllegalCreateMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove) {
	expect(_gameLogic.createMove(board, from_row, from_col, to_row, to_col, captures, turnIndexBeforeMove)).toThrow(new Error("One can only make a one step move or jump once over opponent's pawn."));
	}*/
	
	function getEmptyBoard() {
			return [
					['-', '-', '',  '',  '',  '',  '',  '-', '-'],
					['-', '',  '',  '',  '',  '',  '',  '',  '-'],
					['',  '',  '',  '',  '',  '',  '',  '',  '' ],
					['',  '',  '',  '',  '',  '',  '',  '',  '' ],
					['',  '',  '',  '',  '',  '',  '',  '',  '' ],
					['',  '',  '',  '',  '',  '',  '',  '',  '' ],
					['',  '',  '',  '',  '',  '',  '',  '',  '' ],
					['-', '',  '',  '',  '',  '',  '',  '',  '-'],
					['-', '-', '',  '',  '',  '',  '',  '-', '-']
			];
	}

	it("moving B from 3x6 to 4x6 from initial state is legal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][6] = '';
		board[4][6] = 'B';

		expectMoveOk(1, {}, [
				{setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: board}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 6, to_row: 4, to_col: 6} } },
				{set: {key: 'captures', value: []}}
			]
		);
	});


	it("moving R from 5x7 to 4x7 after B moved from 3x6 to 4x6 is legal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][6] = '';
		board[4][6] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[5][7] = '';
		boardAfterMove[4][7] = 'R';

		expectMoveOk(0,
			{board: board, delta: {from_row: 3, from_col: 6, to_row: 4, to_col: 6}, captures: [] },
			[ {setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 5, from_col: 7, to_row: 4, to_col: 7} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});

	it("moving B to a non-empty position is illegal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][7] = '';

		expectIllegalMove(1, {}, [
				{setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: board}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 7, to_row: 3, to_col: 6} } },
				{set: {key: 'captures', value: []}}
			]
		);
	});


	it("moving B when it's R's turn is illegal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][7] = '';
		board[4][7] = 'B';

		expectIllegalMove(0, {}, [
				{setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: board}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 7, to_row: 4, to_col: 7} } },
				{set: {key: 'captures', value: []}}
			]
		);
	});

	it("moving R from 5x7 to 3x7 jumping over a B at 4x7 is legal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][7] = '';
		board[4][7] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[5][7] = '';
		boardAfterMove[3][7] = 'R';

		expectMoveOk(0,
			{ board: board, delta: {from_row: 3, from_col: 7, to_row: 4, to_col: 7}, captures: [] },
			[ {setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 5, from_col: 7, to_row: 3, to_col: 7} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});

	it("moving R to a position between two B's on either side where it will get captured is legal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][6] = '';
		board[4][6] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[5][6] = '';

		expectMoveOk(0,
			{ board: board, delta: {from_row: 3, from_col: 6, to_row: 4, to_col: 6}, captures: [] },
			[ {setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 5, from_col: 6, to_row: 3, to_col: 6} } },
				{set: {key: 'captures', value: [{row: 3, col: 6}]}}
			]
		);

	});

	it("moving B to a captured position after capturing an R is legal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][6] = '';
		board[4][6] = 'B';
		board[5][6] = '';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[2][6] = '';
		boardAfterMove[3][6] = 'B';

		expectMoveOk(1,
			{ board: board, delta: {from_row: 5, from_col: 6, to_row: 3, to_col: 6}, captures: [{row: 3, col: 6}] },
			[ {setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 2, from_col: 6, to_row: 3, to_col: 6} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});

	it("moving B to a non-captured position after capturing an R is illegal", function() {
		var board = _gameLogic.getInitialBoard();
		board[3][6] = '';
		board[4][6] = 'B';
		board[5][6] = '';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[2][6] = '';
		boardAfterMove[1][6] = 'B';

		expectIllegalMove(1,
			{ board: board, delta: {from_row: 5, from_col: 6, to_row: 3, to_col: 6}, captures: [{row: 3, col: 6}] },
			[ {setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 2, from_col: 6, to_row: 1, to_col: 6} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});


	it("R wins by capturing a B and leaving less than three B's on the board.", function() {
		var board = getEmptyBoard();
		board[2][5] = 'R';
		board[2][6] = 'R';
		board[3][7] = 'R';
		board[3][4] = 'B';
		board[3][5] = 'B';
		board[3][6] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[3][7] = '';
		boardAfterMove[4][6] = 'R';
		boardAfterMove[3][6] = '';

		expectMoveOk(0,
			{ board: board, captures: [] },
			[ {setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 7, to_row: 4, to_col: 6} } },
				{set: {key: 'captures', value: [{row: 3, col: 6}]}}
			]
		);

		var boardAfterMove2 = angular.copy(boardAfterMove);
		boardAfterMove2[4][6] = '';
		boardAfterMove2[3][6] = 'R';

		expectMoveOk(0,
			{ board: boardAfterMove, captures: [{row: 3, col: 6}] },
			[ {endMatch: {endMatchScores: [1, 0]}},
				{set: {key: 'board', value: boardAfterMove2}},
				{set: {key: 'delta', value: {from_row: 4, from_col: 6, to_row: 3, to_col: 6} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});

	it("cannot move after the game is over.", function() {
		var board = getEmptyBoard();
		board[2][5] = 'R';
		board[2][6] = 'R';
		board[3][4] = 'B';
		board[3][5] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[3][4] = '';
		boardAfterMove[3][3] = 'B';

		expectIllegalMove(1,
			{ board: board, captures: [] },
			[ {setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 4, to_row: 3, to_col: 3} } },
				{set: {key: 'captures', value: []}}
			]
		);

	});
	
	it("tie when each player has less than 3 pawns", function() {
		var board = getEmptyBoard();
		board[3][6] = 'R';
		board[4][6] = 'B';
		board[6][8] = 'R';
		board[7][8] = 'B';

		expectTie(board);
	});
	
	
	it("when the moving step is illegal", function() {
		var board = getEmptyBoard();
		board[3][6] = 'R';
		board[4][6] = 'B';
		board[6][8] = 'R';
		board[7][8] = 'B';
		board[4][5] = 'B';
		expectIllegalCheckMoveStep(board, -8,5,-3,5,0);
	});
	
	it("moving B when it's R's turn is illegal", function() {
		var board = getEmptyBoard();
		board[3][6] = 'R';
		board[4][6] = 'B';
		board[6][8] = 'R';
		board[7][8] = 'B';
		board[4][5] = 'B';
		board[2][2] = 'R';
		board[3][3] = 'R';

		expectIllegalMove(1, {}, [
			{setTurn: {turnIndex : 0}},
			{set: {key: 'board', value: board}},
			{set: {key: 'delta', value: {from_row: 4, from_col: 5, to_row: 1, to_col: 5} } },
			{set: {key: 'captures', value: []}}
			]
		);
	});

	it("ends in tie when a captured pawn results in the opponents piece being captured", function() {
	    var board = [
	        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ],
	        ['-', '',  '',  '',  '',   '',   '',   '',   '-' ],
	        ['',  '',  '',  '',  '',   '',   'B',  'R',  ''  ],
	        ['',  '',  '',  '',  '',   '',   'R',  'B',  ''  ],
	        ['',  '',  '',  '',  '',   '',   'R',  '',   'B' ],
	        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
	        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
	        ['-', '',  '',  '',  '',   '',   '',   '',   '-' ],
	        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ]
	    ];

	    var board2 = angular.copy(board);
	    board2[4][6] = board2[3][7] = '';
	    board2[4][7] = 'R';

		expectMoveOk(0, {board: board, captures: []}, [
			{setTurn: {turnIndex : 0}},
			{set: {key: 'board', value: board2}},
			{set: {key: 'delta', value: {from_row: 4, from_col: 6, to_row: 4, to_col: 7} } },
			{set: {key: 'captures', value: [{row: 3, col: 7}]}}
			]
		);

	    var board3 = angular.copy(board2);
	    board3[3][7] = '';
	    board3[4][7] = '';

		expectMoveOk(0, {board: board2, captures: [{row: 3, col: 7}]}, [
			{endMatch: {endMatchScores: [0, 0]}},
			{set: {key: 'board', value: board3}},
			{set: {key: 'delta', value: {from_row: 4, from_col: 7, to_row: 3, to_col: 7} } },
			{set: {key: 'captures', value: [{row: 3, col: 7}]}}
			]
		);
	});
	
});