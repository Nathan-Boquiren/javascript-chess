let cl = console.log;

import { Board, Pawn, Rook, Bishop, Knight, Queen, King } from "./classes.js";

// Variables
let turnToggle = true;
let playerTurn = turnToggle ? "white" : "black";

// Create Board
const board = new Board("board");
board.element.style.setProperty("--cell-size", `${board.cellSize}px`);

for (let i = 1; i <= 8; i++) {
  const letterSeq = "abcdefgh";

  const row = document.createElement("div");
  row.classList.add("row", `row-${i}`);

  for (let j = 0; j < letterSeq.length; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (i % 2 !== 0) {
      cell.classList.add(j % 2 === 0 ? "white" : "black");
    } else if (i % 2 === 0) {
      cell.classList.add(j % 2 === 0 ? "black" : "white");
    }

    cell.dataset.row = i;
    cell.dataset.col = letterSeq[j];
    row.append(cell);
  }

  board.element.append(row);
}

// DOM Elements
const cells = document.querySelectorAll(".cell");

// Create Pieces

const pieceConfig = [
  { type: "pawn", x: [1, 2, 3, 4, 5, 6, 7, 8], y: 2, clr: "black" },
  { type: "rook", x: [1, 8], y: 1, clr: "black" },
  { type: "knight", x: [2, 7], y: 1, clr: "black" },
  { type: "bishop", x: [3, 6], y: 1, clr: "black" },
  { type: "king", x: [5], y: 1, clr: "black" },
  { type: "queen", x: [4], y: 1, clr: "black" },
  { type: "pawn", x: [1, 2, 3, 4, 5, 6, 7, 8], y: 7, clr: "white" },
  { type: "rook", x: [1, 8], y: 8, clr: "white" },
  { type: "knight", x: [2, 7], y: 8, clr: "white" },
  { type: "bishop", x: [3, 6], y: 8, clr: "white" },
  { type: "king", x: [5], y: 8, clr: "white" },
  { type: "queen", x: [4], y: 8, clr: "white" },
];

const classes = {
  pawn: Pawn,
  rook: Rook,
  bishop: Bishop,
  knight: Knight,
  queen: Queen,
  king: King,
};

board.pieces = pieceConfig.flatMap(({ type, x, y, clr }) => {
  if (!classes[type]) throw new Error(`Invalid piece type: ${type}`);
  return x.map((xPos) => new classes[type](type, xPos, y, clr, board.cellSize));
});

// Pieces

let pieceSelected = null;

board.pieces.forEach((piece) => board.element.append(piece.element));

board.pieces.forEach((piece) => {
  const el = piece.element;

  el.addEventListener("click", () => {
    if (piece.clr !== playerTurn) return;

    if (pieceSelected === piece) {
      el.classList.remove("selected");
      pieceSelected = null;
    } else {
      board.pieces.forEach((p) => p.element.classList.remove("selected"));
      el.classList.add("selected");
      pieceSelected = piece;
    }
  });
});

// User Move

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!pieceSelected) return;

    const checkMoveResults = pieceSelected.checkValidMove(
      board.pieces,
      pieceSelected.col,
      pieceSelected.row,
      cell.dataset.col,
      Number(cell.dataset.row),
      pieceSelected.clr
    );

    const validMove = checkMoveResults.valid;

    if (!validMove) return;

    const captureMove = checkMoveResults.capture.valid;
    const pieceToCapture = checkMoveResults.capture.piece;

    if (captureMove) board.capturePiece(pieceToCapture);

    pieceSelected.movePiece(
      cell.dataset.col,
      Number(cell.dataset.row),
      board.cellSize
    );

    cl(`${pieceSelected.type} to ${cell.dataset.col}${cell.dataset.row}`);

    detectCheck(pieceSelected);

    pieceSelected.element.classList.remove("selected");
    pieceSelected = null;

    turnToggle = !turnToggle;
    playerTurn = turnToggle ? "white" : "black";

    setTimeout(() => {
      botMove();
    }, 500);
  });
});

let oppCheck = false;

// Bot Move

function botMove() {
  if (playerTurn !== "black") return;

  if (oppCheck) {
    handleOppCheck();
    return;
  }

  const botPieces = board.pieces.filter((p) => p.clr === "black");
  const cells = document.querySelectorAll(".cell");

  const movablePieces = [];

  botPieces.forEach((piece) => {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      const checkMoveResults = piece.checkValidMove(
        board.pieces,
        piece.col,
        piece.row,
        cell.dataset.col,
        Number(cell.dataset.row),
        piece.clr
      );

      const validMove = checkMoveResults.valid;

      if (validMove) {
        movablePieces.push({
          piece: piece,
          cell: cell,
          moveDetails: checkMoveResults,
        });
      }
    }
  });

  const captureMoves = movablePieces.filter((m) => m.moveDetails.capture.valid);

  const chosenMoves = captureMoves.length >= 1 ? captureMoves : movablePieces;

  const randIdx = Math.floor(Math.random() * chosenMoves.length);
  const selectedPiece = chosenMoves[randIdx];
  const cell = selectedPiece.cell;
  const captureMove = selectedPiece.moveDetails.capture.valid;
  const pieceToCapture = selectedPiece.moveDetails.capture.piece;

  if (captureMove) board.capturePiece(pieceToCapture);

  selectedPiece.piece.movePiece(
    cell.dataset.col,
    Number(cell.dataset.row),
    board.cellSize
  );

  cl(`${selectedPiece.piece.type} to ${cell.dataset.col}${cell.dataset.row}`);

  detectCheck(selectedPiece.piece);

  turnToggle = !turnToggle;
  playerTurn = turnToggle ? "white" : "black";
}

function handleOppCheck() {
  cl("bot check");
}

// Detect Check and Checkmate

function detectCheck(piece) {
  const oppClr = piece.clr === "white" ? "black" : "white";

  const oppKing = board.pieces.find(
    (p) => p.clr === oppClr && p.type === "king"
  );

  const checkResults = piece.checkValidMove(
    board.pieces,
    piece.col,
    piece.row,
    oppKing.col,
    Number(oppKing.row),
    piece.clr
  );

  if (!checkResults.valid) return;

  const isCheck = checkResults.capture.valid;
  if (isCheck) {
    showCheckMsg();
    oppCheck = true;
  }
}

function showCheckMsg() {
  const checkMsg = document.getElementById("check-msg");
  checkMsg.classList.add("show");
  setTimeout(() => {
    checkMsg.classList.remove("show");
  }, 1500);
}
