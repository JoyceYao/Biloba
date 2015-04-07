describe('Biloba', function() {

    'use strict';

    beforeEach(function() {
        browser.get('http://localhost:9000/game.min.html');
    });

    function getDiv(row, col) {
        return element(by.id('e2e_test_div_' + row + 'x' + col));
    }

    function getPiece(row, col) {
        return element(by.id('e2e_test_piece_' + row + 'x' + col));
    }

    function expectPiece(row, col, pieceKind) {
        if(pieceKind === '-'){
            pieceKind = '';
        }
        var expectedBaseClass = pieceKind === '' ? 'piece' : 'piece ';
        expect(getPiece(row, col).getAttribute('class')).toEqual(expectedBaseClass + pieceKind);  
         
    }

    function expectBoard(board) {
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                expectPiece(row, col, board[row][col]);
            }
        }
    }

    function clickDivsAndExpectPiece(deltaFrom, deltaTo, pieceKind) {
        getDiv(deltaFrom.row, deltaFrom.col).click();
        getDiv(deltaTo.row, deltaTo.col).click();

        expectPiece(deltaTo.row, deltaTo.col, pieceKind);
    }

    // playMode is either: 'passAndPlay', 'playAgainstTheComputer', 'onlyAIs',
    // or a number representing the playerIndex (-2 for viewer, 0 for white player, 1 for black player, etc)
    function setMatchState(matchState, playMode) {
        browser.executeScript(function(matchStateInJson, playMode) {
            var stateService = window.e2e_test_stateService;
            stateService.setMatchState(angular.fromJson(matchStateInJson));
            stateService.setPlayMode(angular.fromJson(playMode));
            angular.element(document).scope().$apply(); // to tell angular that things changes.
        }, JSON.stringify(matchState), JSON.stringify(playMode));
    }


    var initialBoard = [
        ['-',  '-',  '',  '',  'B', '',  '',  '-', '-'],
        ['-',  '',   '',  'B', 'B', 'B', '',  '',  '-'],
        ['',   '',   'B', 'B', 'B', 'B', 'B', '',  '' ],
        ['',   'B',  'B', 'B', 'B', 'B', 'B', 'B', '' ],
        ['',   '',   '',  '',  '',  '',  '',  '',  '' ],
        ['',   'R',  'R', 'R', 'R', 'R', 'R', 'R', '' ],
        ['',   '',   'R', 'R', 'R', 'R', 'R', '',  '' ],
        ['-',  '',   '',  'R', 'R', 'R', '',  '',  '-'],
        ['-',  '-',  '',  '',  'R', '',  '',  '-', '-']
    ];

    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('Biloba');
    });

    it('should have an initial Biloba board', function () {
        expectBoard(initialBoard);
    });

    it('should show R in 4x5 if I move it from 5x5', function () {
        clickDivsAndExpectPiece({row: 5, col: 5}, {row: 4, col: 5}, 'R');
        var board = JSON.parse(JSON.stringify(initialBoard));
        board[4][5] = board[5][5];
        board[5][5] = '';
        expectBoard(board);
    });

    it('should capture B in 5x5 if I move it from 3x5 by jumping over a R in 4x5', function () {
        clickDivsAndExpectPiece({row: 5, col: 5}, {row: 4, col: 5}, 'R');
        clickDivsAndExpectPiece({row: 3, col: 5}, {row: 5, col: 5}, '');

        var board = JSON.parse(JSON.stringify(initialBoard));
        board[4][5] = board[5][5];
        board[5][5] = board[3][5] = '';
        expectBoard(board);
    });


    it('should ignore moving opponent piece when self piece moved to center.', function () {
        clickDivsAndExpectPiece({row: 5, col: 4}, {row: 4, col: 4}, 'R');
        clickDivsAndExpectPiece({row: 3, col: 3}, {row: 4, col: 3}, 'R');

        var board = JSON.parse(JSON.stringify(initialBoard));
        board[4][3] = board[5][4];
        board[5][4] = '';
        expectBoard(board);
    });


    it('should ignore moving a piece to a non-empty cell', function () {
        clickDivsAndExpectPiece({row: 5, col: 5}, {row: 5, col: 4}, 'R');
        expectBoard(initialBoard);
    });

    it('should capture opponents piece when in between two of self pieces', function () {
        clickDivsAndExpectPiece({row: 5, col: 5}, {row: 4, col: 5}, 'R');
        clickDivsAndExpectPiece({row: 3, col: 5}, {row: 5, col: 5}, ''); // Piece captured.
        var board = JSON.parse(JSON.stringify(initialBoard));
        board[4][5] = 'R';
        board[3][5] = board[5][5] = '';
        expectBoard(board);
    });

    var delta1 = { from_row: 4, from_col: 6, to_row: 3, to_col: 6 };
    var board1 = [
        ['-',  '-', '',  '',  '',   '',   '',   '-',  '-' ],
        ['-',  '',  '',  '',  '',   'B',  '',   '',   '-' ],
        ['',   '',  '',  '',  '',   'B',  'B',  'R',  ''  ],
        ['',   '',  '',  '',  'R',  'R',  'R',  '',   ''  ],
        ['',   '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['',   '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['',   '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['-',  '',  '',  '',  '',   '',   '',   '',   '-' ],
        ['-',  '-', '',  '',  '',   '',   '',   '-',  '-' ]
    ];
    var captures1 = [];

    var delta2 = { from_row: 2, from_col: 6, to_row: 3, to_col: 7 };
    var board2 = [
        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ],
        ['-', '',  '',  '',  '',   'B',  '',   '',   '-' ],
        ['',  '',  '',  '',  '',   'B',  '',   'R',  ''  ],
        ['',  '',  '',  '',  'R',  'R',  'R',  'B',  ''  ],
        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['-', '',  '',  '',  '',   '',   '',   '',   '-' ],
        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ]
    ];
    var captures2 = [];

    var delta3 = { from_row: 3, from_col: 6, to_row: 4, to_col: 7 };
    var board3 = [
        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ],
        ['-', '',  '',  '',  '',   'B',  '',   '',   '-' ],
        ['',  '',  '',  '',  '',   'B',  '',   'R',  ''  ],
        ['',  '',  '',  '',  'R',  'R',  '',   '',   ''  ],
        ['',  '',  '',  '',  '',   '',   '',   'R',  ''  ],
        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['',  '',  '',  '',  '',   '',   '',   '',   ''  ],
        ['-', '',  '',  '',  '',   '',   '',   '',   '-' ],
        ['-', '-', '',  '',  '',   '',   '',   '-',  '-' ]
    ];
    var captures3 = [{row: 3, col: 7}];


    var matchState1 = {
        turnIndexBeforeMove: 1,
        turnIndex: 0,
        endMatchScores: null,
        lastMove: [{setTurn: {turnIndex: 0}},
            {set: {key: 'board', value: board2}},
            {set: {key: 'delta', value: delta2}},
            {set: {key: 'captures', value: captures2}}],
        lastState: {board: board1, delta: delta1, captures: captures1},
        currentState: {board: board2, delta: delta2, captures: captures2},
        lastVisibleTo: {},
        currentVisibleTo: {},
    };

    var matchState2 = {
        turnIndexBeforeMove: 0,
        turnIndex: -2,
        endMatchScores: [1, 0],
        lastMove: [{endMatch: {endMatchScores: [1, 0]}},
            {set: {key: 'board', value: board3}},
            {set: {key: 'delta', value: delta3}},
            {set: {key: 'captures', value: captures3}}],
        lastState: {board: board2, delta: delta2, captures: captures2},
        currentState: {board: board3, delta: delta3, captures: captures3},
        lastVisibleTo: {},
        currentVisibleTo: {},
    };

    it('can start from a match that is about to end, and win', function () {
        setMatchState(matchState1, 'passAndPlay');
        expectBoard(board2);
        clickDivsAndExpectPiece({row: 3, col: 6}, {row: 4, col: 7}, 'R');   // Winning click
    });

    it('cannot play if it is not your turn', function () {
        setMatchState(matchState1, 1);
        expectBoard(board2);
        clickDivsAndExpectPiece({row: 3, col: 6}, {row: 4, col: 7}, '');    // Can't move
        expectBoard(board2);
    });


    it('can\'t start from a match that ended', function () {
        setMatchState(matchState2, 'passAndPlay');
        expectBoard(board3);
        clickDivsAndExpectPiece({row: 2, col: 5}, {row: 4, col: 5}, '');   // Can't move B after game ended.
    });
});