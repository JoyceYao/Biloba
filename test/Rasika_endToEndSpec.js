describe('Biloba', function() {

    'use strict';

    beforeEach(function() {
        browser.get('http://localhost:9000/index.min.html');
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

    it('should ignore moving a piece to a non-valid cell', function () {
        clickDivsAndExpectPiece({row: 5, col: 5}, {row: 4, col: 8}, '');
        expectBoard(initialBoard);
    });

    it('should allow moving self piece again when moved to center.', function () {
        clickDivsAndExpectPiece({row: 5, col: 4}, {row: 4, col: 4}, 'R');
        clickDivsAndExpectPiece({row: 4, col: 4}, {row: 4, col: 5}, 'R');

        var board = JSON.parse(JSON.stringify(initialBoard));
        board[4][5] = board[5][4];
        board[5][4] = '';
        expectBoard(board);
    });

});