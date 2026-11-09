export const BOARD_SIZE = 9;
export const MINE_COUNT = 10;

export function createBoardModel() {
  let board = [];
  for (let rw = 0; rw < BOARD_SIZE; rw++) {
    let row = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let klet = {
        isMine: false,
        isOpened: false,
        isFlagged: false,
        neighborMines: 0,
      };
      row.push(klet);
    }
    board.push(row);
  }
  return board;
}

export function generateMinesModel(board, firstRow, firstCol) {
  let placedMines = 0;
  while (placedMines < MINE_COUNT) {
    let r = Math.floor(Math.random() * BOARD_SIZE);
    let c = Math.floor(Math.random() * BOARD_SIZE);
    let isSafeZone = Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1;
    if (!isSafeZone && !board[r][c].isMine) {
      board[r][c].isMine = true;
      placedMines++;
    }
  }
  countNeighborMinesModel(board);
}

export function countNeighborMinesModel(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].isMine) continue;
      let minesFound = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let neighborRow = r + i;
          let neighborCol = c + j;
          if (
            neighborRow >= 0 &&
            neighborRow < BOARD_SIZE &&
            neighborCol >= 0 &&
            neighborCol < BOARD_SIZE
          ) {
            if (board[neighborRow][neighborCol].isMine) {
              minesFound++;
            }
          }
        }
      }
      board[r][c].neighborMines = minesFound;
    }
  }
}

export function checkWinModel(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c].isMine && !board[r][c].isOpened) {
        return false;
      }
    }
  }
  return true;
}
