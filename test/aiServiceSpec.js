describe("aiService", function() {

  'use strict';

  var _aiService;

  beforeEach(module("myApp"));

  beforeEach(inject(function (aiService) {
    _aiService = aiService;
  }));

  it("R finds a winning move", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
          ['',  '',  '',  'B', '',  'B',  '',  '',  '' ],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  'R',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 0, {maxDepth: 1});

    var expectedMove =
        [ {endMatch: {endMatchScores: [1, 0]}},
          {set: {key: 'board', value:
            [
              ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
              ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
              ['',  '',  '',  'B', '',  'B',  '',  '',  '' ],
              ['',  '',  '',  '',  'R', '',   'R', '',  '' ],
              ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
              ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
              ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
              ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
              ['-', '-', '',  '',  '',  '',   '',  '-', '-']
          ]}},
          {set: {key: 'delta', value: {from_row: 4, from_col: 5, to_row: 3, to_col: 6} }},
          {set: {key: 'captures', value: [{row: 3, col: 5}] }}
        ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });


  it("B finds a winning move", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
          ['',  '',  '',  'B', '',  'B',  '',  '',  '' ],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  'R',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 1, {maxDepth: 1});

    expect(angular.equals(move[2].set.value, {from_row: 2, from_col: 3, to_row: 3, to_col: 3})).toBe(true);
  });

  it("R prevents an immediate win.", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
          ['',  '',  '',  'B', '',  'B',  '',  '',  '' ],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  'R',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 0, {maxDepth: 2});

    expect(move[2].set.value.from_row === 3 && move[2].set.value.from_col === 4).toBe(true);
  });

  it("B prevents an immediate win.", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  'B', 'B',   '',  '',  '-'],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  'R',  '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 1, {maxDepth: 2});

    expect(move[2].set.value.from_row === 3 && move[2].set.value.from_col === 5).toBe(true);
  });

  it("R finds a winning move that will lead to winning in 2 steps", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
          ['',  '',  '',  '',  '',  '',   '',  '',  'B'],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  'B'],
          ['',  '',  '',  '',  'R', '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 0, {maxDepth: 3});

    expect(move[2].set.value.from_row === 4 && move[2].set.value.from_col === 4).toBe(true);
  });

  it("B finds a winning move that will lead to winning in 2 steps", function() {
    var move = _aiService.createComputerMove(
        [
          ['-', '-', '',  '',  '',  '',   '',  '-', '-'],
          ['-', '',  '',  '',  '',  '',   '',  '',  '-'],
          ['',  '',  '',  '',  '',  'B',  '',  '',  'B'],
          ['',  '',  '',  '',  'R', 'B',  '',  '',  '' ],
          ['R', '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['',  '',  '',  '',  '',  '',   '',  '',  '' ],
          ['-', '',  '',  '',  '',  'R',  '',  '',  '-'],
          ['-', '-', '',  '',  '',  '',   '',  '-', '-']
      ], [], 1, {maxDepth: 3});

    expect(move[2].set.value.from_row === 2 && move[2].set.value.from_col === 5).toBe(true);
  });

});