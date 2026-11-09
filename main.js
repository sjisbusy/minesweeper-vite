import confetti from 'canvas-confetti';
import {
  BOARD_SIZE,
  MINE_COUNT,
  createBoardModel,
  generateMinesModel,
  checkWinModel,
} from './game-logic.js';

let board = [];
let firstClick = false;
let gameOver = false;

function createBoard() {
  board = createBoardModel();
}

function renderBoard() {
  const boardContainer = document.getElementById('game-board');
  boardContainer.innerHTML = '';
  for (let rw = 0; rw < BOARD_SIZE; rw++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const kletDiv = document.createElement('div');
      kletDiv.classList.add('klet');
      kletDiv.dataset.row = rw;
      kletDiv.dataset.col = col;

      const cell = board[rw][col];

      if (cell.isOpened) {
        kletDiv.classList.add('opened');
        if (cell.isMine) {
          kletDiv.innerText = '💣';
          kletDiv.style.backgroundColor = '#e74c3c';
        } else if (cell.neighborMines > 0) {
          kletDiv.innerText = cell.neighborMines;
          kletDiv.dataset.mines = cell.neighborMines;
        }
      } else if (cell.isFlagged) {
        kletDiv.innerText = '🚩';
      }

      boardContainer.appendChild(kletDiv);
    }
  }
}

function handleLeftClick(evnt) {
  if (gameOver) return;

  const target = evnt.target;
  if (!target.classList.contains('klet')) return;

  const rw = parseInt(target.dataset.row);
  const col = parseInt(target.dataset.col);
  console.log('Клинк по ячейке', rw, col);

  if (!firstClick) {
    firstClick = true;
    generateMinesModel(board, rw, col);
  }
  openKlet(rw, col);
}

function openKlet(r, c) {
  if (board[r][c].isOpened || board[r][c].isFlagged) return;

  board[r][c].isOpened = true;

  const kletDiv = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  kletDiv.classList.add('opened');

  if (board[r][c].isMine) {
    if (kletDiv) {
      kletDiv.innerText = '💣';
      kletDiv.style.backgroundColor = '#e74c3c';
    }
    gameOver = true;
    document.body.classList.add('game-over-effect');
    setTimeout(() => {
      alert('💣💣💣! ВЫ ПРОИГРАЛИ !💣💣💣');
    }, 150);
  } else {
    if (board[r][c].neighborMines > 0) {
      kletDiv.innerText = board[r][c].neighborMines;
      kletDiv.dataset.mines = board[r][c].neighborMines;
    } else {
      if (kletDiv) kletDiv.innerText = '';

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
            openKlet(neighborRow, neighborCol);
          }
        }
      }
    }
  }
  if (!gameOver) {
    checkWin();
  }

  saveGame();
}

function resetGame() {
  firstClick = false;
  gameOver = false;

  document.body.classList.add('reset-flash-effect');

  createBoard();
  renderBoard();
  document.body.classList.remove('game-over-effect');
  document.body.classList.remove('game-win-effect');

  setTimeout(() => {
    document.body.classList.remove('reset-flash-effect');
  }, 200);

  updateMinesCounter();
  localStorage.removeItem('minesweeper_save');
}

function handleRightClick(evnt) {
  evnt.preventDefault();

  if (gameOver) return;

  const target = evnt.target;
  if (!target.classList.contains('klet')) return;

  const rw = parseInt(target.dataset.row);
  const col = parseInt(target.dataset.col);

  if (board[rw][col].isOpened) return;

  if (!board[rw][col].isFlagged) {
    let currentFlags = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].isFlagged) currentFlags++;
      }
    }
    if (currentFlags >= MINE_COUNT) {
      return;
    }
  }

  board[rw][col].isFlagged = !board[rw][col].isFlagged;

  if (board[rw][col].isFlagged) {
    target.innerText = '🚩';
  } else {
    target.innerText = '';
  }
  updateMinesCounter();
  saveGame();
}

function checkWin() {
  const isWin = checkWinModel(board);
  if (!isWin) return;

  gameOver = true;
  document.body.classList.add('game-win-effect');

  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

  setTimeout(() => {
    alert('🎉🎉🎉! ВЫ ПОБЕДИЛИ !🎉🎉🎉');
  }, 150);
}

function updateMinesCounter() {
  let flaggedCount = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].isFlagged) {
        flaggedCount++;
      }
    }
  }
  const counterEl = document.getElementById('mines-counter');
  if (counterEl) {
    counterEl.innerHTML = `Флаги: <span id="counter-val">${flaggedCount}</span>/${MINE_COUNT}`;
  }
}

function saveGame() {
  const gameState = {
    board: board,
    firstClick: firstClick,
    gameOver: gameOver,
  };
  localStorage.setItem('minesweeper_save', JSON.stringify(gameState));
}

function loadGame() {
  try {
    const savedData = localStorage.getItem('minesweeper_save');

    if (!savedData) {
      createBoard();
      renderBoard();
      return;
    }

    const gameState = JSON.parse(savedData);
    board = gameState.board;
    firstClick = gameState.firstClick;
    gameOver = gameState.gameOver;

    renderBoard();

    if (gameOver) {
      const hitMine = board.some((row) =>
        row.some((cell) => cell.isMine && cell.isOpened),
      );
      if (hitMine) document.body.classList.add('game-over-effect');
      else document.body.classList.add('game-win-effect');
    }
    updateMinesCounter();
  } catch (error) {
    console.warn('!сохранение было повреждено! запускаем новую игру..', error);
    localStorage.removeItem('minesweeper_save');
    createBoard();
    renderBoard();
  }
}

loadGame();
document
  .getElementById('game-board')
  .addEventListener('click', handleLeftClick);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document
  .getElementById('game-board')
  .addEventListener('contextmenu', handleRightClick);
