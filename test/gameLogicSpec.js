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
			[ {endMatch: {endMatchScores : [1, 0]}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 3, from_col: 7, to_row: 4, to_col: 6} } },
				{set: {key: 'captures', value: [{row: 3, col: 6}]}}
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


	it("allows only R pawns as valid from positions when it's R\'s turn.", function() {
		var board = _gameLogic.getInitialBoard(),
			expected = [];
		for( var i = 0; i < 9; i++ ) {
			for( var j = 0; j < 9; j++ ) {
				if(board[i][j] === 'R') {
					expected.push({row: i, col: j});
				}
			}
		}
		expect(_gameLogic.getValidFromPositions(board, [], 0)).toEqual(expected);
	});

	it("allows only B pawns as valid from positions when it's B\'s turn.", function() {
		var board = _gameLogic.getInitialBoard(),
			expected = [];
		for( var i = 0; i < 9; i++ ) {
			for( var j = 0; j < 9; j++ ) {
				if(board[i][j] === 'B') {
					expected.push({row: i, col: j});
				}
			}
		}
		expect(_gameLogic.getValidFromPositions(board, [], 1)).toEqual(expected);
	});

	it("allows only R at 4x4 as a valid from position when it is R\'s turn and an R is present at 4x4.", function() {
		var board = _gameLogic.getInitialBoard();
		board[4][4] = board[5][4];
		board[5][4] = '';
		expect(_gameLogic.getValidFromPositions(board, [], 0)).toEqual([{row: 4, col: 4}]);
	});

	it("allows an R at 5x4 in the intial board to move into only three valid positions within reach in row 4.", function() {
		var board = _gameLogic.getInitialBoard();
		expect(_gameLogic.getValidToPositions(board, 5, 4, [], 0)).toEqual([
			{row: 4, col: 3},
			{row: 4, col: 4},
			{row: 4, col: 5}
		]);
	});

	it("allows only four adjacent R\'s as valid from positions when a B is captured between them.", function() {
		var board = _gameLogic.getInitialBoard();
		board[4][5] = board[5][5];
		board[5][5] = board[3][5] = '';
		expect(_gameLogic.getValidFromPositions(board, [{row:5, col:5}], 0)).toEqual([
			{row: 5, col: 6},
			{row: 5, col: 4},
			{row: 6, col: 5},
			{row: 4, col: 5},
		]);
	});

	it("allows only four adjacent R\'s as valid from positions when a B is captured between them.", function() {
		var board = _gameLogic.getInitialBoard();
		board[4][5] = board[5][5];
		board[5][5] = board[3][5] = '';
		expect(_gameLogic.getValidFromPositions(board, [{row:5, col:5}], 0)).toEqual([
			{row: 5, col: 6},
			{row: 5, col: 4},
			{row: 6, col: 5},
			{row: 4, col: 5},
		]);
	});

	it("moving R to a position that can capture a B which itself is a position of capture allows R to capture first", function() {
		var board = getEmptyBoard();
		board[4][1] = board[5][2] = board[6][2] = 'R';
		board[4][2] = board[2][2] = board[4][3] = board[4][4] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[3][2] = 'R';
		boardAfterMove[4][1] = '';
		boardAfterMove[4][2] = '';


		expectMoveOk(0,
			{ board: board, captures:[] },
			[ {setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 4, from_col: 1, to_row: 3, to_col: 2} } },
				{set: {key: 'captures', value: [{row: 4, col: 2}]}}
			]
		);
	});

	it("moving R to a captured position while leaving another R in a capturing position results in the capture of the R", function() {
		var board = getEmptyBoard();
		board[5][2] = board[5][3] = board[3][2] = 'R';
		board[3][1] = board[3][3] = board[3][4] = 'B';

		var boardAfterMove = angular.copy(board);
		boardAfterMove[5][2] = '';
		boardAfterMove[3][2] = '';
		boardAfterMove[4][2] = 'R';

		expectMoveOk(0,
			{ board: board, captures:[{row: 4, col: 2}] },
			[ {setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: boardAfterMove}},
				{set: {key: 'delta', value: {from_row: 5, from_col: 2, to_row: 4, to_col: 2} } },
				{set: {key: 'captures', value: [{row: 3, col: 2}] }}
			]
		);
	});
});