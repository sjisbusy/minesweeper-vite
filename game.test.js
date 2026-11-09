import { expect, test } from 'vitest';
import {
  createBoardModel,
  generateMinesModel,
  countNeighborMinesModel,
  MINE_COUNT,
} from './game-logic.js';

test('тест 1: создание поля размером 9 на 9', function () {
  let testBoard = createBoardModel();

  expect(testBoard.length).toBe(9);
  expect(testBoard[0].length).toBe(9);
  expect(testBoard[0][0].isMine).toBe(false);
  expect(testBoard[0][0].isOpened).toBe(false);
});

test('тест 2: генерация мин в соответствии с константой MINE_COUNT', function () {
  let testBoard = createBoardModel();
  generateMinesModel(testBoard, 0, 0);

  let minesCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (testBoard[r][c].isMine === true) {
        minesCount++;
      }
    }
  }
  expect(minesCount).toBe(MINE_COUNT);
});

test('тест 3: проверка сейв-зоны (3х3) вокруг первого клика', function () {
  let testBoard = createBoardModel();
  generateMinesModel(testBoard, 4, 4);

  for (let r = 3; r <= 5; r++) {
    for (let c = 3; c <= 5; c++) {
      expect(testBoard[r][c].isMine).toBe(false);
    }
  }
});
