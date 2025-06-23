let cl = console.log;

const chessFontKey = {
  pawn: "o",
  bishop: "n",
  knight: "j",
  rook: "t",
  queen: "w",
  king: "l",
};

const letterSeq = "abcdefgh";

export class Board {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.size = this.element.clientWidth;
    this.cellSize = this.size / 8;
    this.pieces = [];
  }

  capturePiece(piece) {
    this.pieces = this.pieces.filter((p) => p !== piece);
    piece.element.classList.add("remove");
    setTimeout(() => piece.element.remove(), 500);
  }
}

export class Piece {
  constructor(name, col, row, clr, cellSize) {
    this.col = letterSeq[col - 1];
    this.row = row;
    this.x = letterSeq.indexOf(this.col) * cellSize;
    this.y = (this.row - 1) * cellSize;
    this.element = this.renderElement(name, clr);
    this.clr = clr;
  }

  renderElement(name, clr) {
    let element = document.createElement("div");
    element.classList.add("piece", name, clr);
    element.innerText = chessFontKey[name];
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    return element;
  }

  checkValidMove() {}

  movePiece(col, row, cellSize) {
    this.col = col;
    this.row = row;
    this.x = letterSeq.indexOf(this.col) * cellSize;
    this.y = (this.row - 1) * cellSize;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

export class Pawn extends Piece {
  constructor(name, col, row, clr, cellSize) {
    super(name, col, row, clr, cellSize);
    this.firstMove = true;
  }

  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const dir = { white: -1, black: 1 };
    const colDiff = Math.abs(letterSeq.indexOf(cCol) - letterSeq.indexOf(pCol));
    const rowDiff = cRow - pRow;

    const isFirstMove =
      this.firstMove &&
      pCol === cCol &&
      rowDiff === dir[pClr] * 2 &&
      !targetPiece;

    const isCaptureMove = colDiff === 1 && rowDiff === dir[pClr] && isOppPiece;
    const isNormalMove = pCol === cCol && rowDiff === dir[pClr] && !targetPiece;

    return {
      valid: isFirstMove || isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }

  movePiece(col, row, cellSize) {
    super.movePiece(col, row, cellSize);
    this.firstMove = false;
  }
}

export class Rook extends Piece {
  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    let piecesInWay = false;

    pieces.forEach((otherPiece) => {
      if (otherPiece === this) return;

      if (pCol === cCol && otherPiece.col === pCol) {
        const minRow = Math.min(pRow, cRow);
        const maxRow = Math.max(pRow, cRow);
        if (otherPiece.row > minRow && otherPiece.row < maxRow) {
          piecesInWay = true;
        }
      } else if (pRow === cRow && otherPiece.row === pRow) {
        const minCol = Math.min(
          letterSeq.indexOf(pCol),
          letterSeq.indexOf(cCol)
        );
        const maxCol = Math.max(
          letterSeq.indexOf(pCol),
          letterSeq.indexOf(cCol)
        );
        const otherCol = letterSeq.indexOf(otherPiece.col);
        if (otherCol > minCol && otherCol < maxCol) {
          piecesInWay = true;
        }
      }
    });

    if (piecesInWay) {
      return { valid: false, capture: { valid: false, piece: null } };
    }

    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const isNormalMove = (pCol === cCol || pRow === cRow) && !targetPiece;
    const isCaptureMove = (pCol === cCol || pRow === cRow) && isOppPiece;

    return {
      valid: isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }
}

export class Bishop extends Piece {
  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    const xDis = Math.abs(letterSeq.indexOf(cCol) - letterSeq.indexOf(pCol));
    const yDis = Math.abs(cRow - pRow);

    let piecesInWay = false;

    pieces.forEach((otherPiece) => {
      if (otherPiece === this) return;
      const otherCol = letterSeq.indexOf(otherPiece.col);

      const xDis = Math.abs(
        letterSeq.indexOf(otherPiece.col) - letterSeq.indexOf(pCol)
      );

      const yDis = Math.abs(otherPiece.row - pRow);

      if (
        otherPiece.row > Math.min(pRow, cRow) &&
        otherPiece.row < Math.max(pRow, cRow) &&
        otherCol > Math.min(letterSeq.indexOf(pCol), letterSeq.indexOf(cCol)) &&
        otherCol < Math.max(letterSeq.indexOf(pCol), letterSeq.indexOf(cCol)) &&
        xDis === yDis
      ) {
        piecesInWay = true;
      }
    });

    if (piecesInWay) {
      return { valid: false, capture: { valid: false, piece: null } };
    }

    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const isNormalMove = xDis === yDis && !targetPiece;
    const isCaptureMove = xDis === yDis && isOppPiece;

    return {
      valid: isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }
}

export class Knight extends Piece {
  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const rowDiff = Math.abs(cRow - pRow);
    const colDiff = Math.abs(letterSeq.indexOf(cCol) - letterSeq.indexOf(pCol));

    const hMove = rowDiff === 1 && colDiff === 2;
    const vMove = rowDiff === 2 && colDiff === 1;

    const isNormalMove = (hMove && !targetPiece) || (vMove && !targetPiece);
    const isCaptureMove = (hMove && isOppPiece) || (vMove && isOppPiece);

    return {
      valid: isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }
}

export class Queen extends Piece {
  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    const xDis = Math.abs(letterSeq.indexOf(cCol) - letterSeq.indexOf(pCol));
    const yDis = Math.abs(cRow - pRow);

    let piecesInWay = false;

    pieces.forEach((otherPiece) => {
      if (otherPiece === this) return;

      if (pCol === cCol && otherPiece.col === pCol) {
        const minRow = Math.min(pRow, cRow);
        const maxRow = Math.max(pRow, cRow);
        if (otherPiece.row > minRow && otherPiece.row < maxRow) {
          piecesInWay = true;
        }
      } else if (pRow === cRow && otherPiece.row === pRow) {
        const minCol = Math.min(
          letterSeq.indexOf(pCol),
          letterSeq.indexOf(cCol)
        );
        const maxCol = Math.max(
          letterSeq.indexOf(pCol),
          letterSeq.indexOf(cCol)
        );
        const otherCol = letterSeq.indexOf(otherPiece.col);
        if (otherCol > minCol && otherCol < maxCol) {
          piecesInWay = true;
        }
      }

      const otherCol = letterSeq.indexOf(otherPiece.col);

      const xDis = Math.abs(
        letterSeq.indexOf(otherPiece.col) - letterSeq.indexOf(pCol)
      );

      const yDis = Math.abs(otherPiece.row - pRow);

      if (
        otherPiece.row > Math.min(pRow, cRow) &&
        otherPiece.row < Math.max(pRow, cRow) &&
        otherCol > Math.min(letterSeq.indexOf(pCol), letterSeq.indexOf(cCol)) &&
        otherCol < Math.max(letterSeq.indexOf(pCol), letterSeq.indexOf(cCol)) &&
        xDis === yDis
      ) {
        piecesInWay = true;
      }
    });

    if (piecesInWay) {
      return { valid: false, capture: { valid: false, piece: null } };
    }

    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const isNormalMove =
      (xDis === yDis && !targetPiece) ||
      ((pCol === cCol || pRow === cRow) && !targetPiece);
    const isCaptureMove =
      (xDis === yDis && isOppPiece) ||
      ((pCol === cCol || pRow === cRow) && isOppPiece);

    return {
      valid: isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }
}

export class King extends Piece {
  checkValidMove(pieces, pCol, pRow, cCol, cRow, pClr) {
    const targetPiece = pieces.find((p) => p.col === cCol && p.row === cRow);
    const isOppPiece = targetPiece && targetPiece.clr !== pClr;

    const colDiff = Math.abs(letterSeq.indexOf(cCol) - letterSeq.indexOf(pCol));
    const rowDiff = Math.abs(cRow - pRow);
    const isOneCellDiff = colDiff <= 1 && rowDiff <= 1;

    const isCaptureMove = isOneCellDiff && isOppPiece;
    const isNormalMove = isOneCellDiff && !targetPiece;

    return {
      valid: isCaptureMove || isNormalMove,
      capture: { valid: isCaptureMove, piece: targetPiece },
    };
  }
}
