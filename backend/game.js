// Game Constants
const ROWS = 10;
const COLS = 9;
const RIVER_START = 5;
const RIVER_END = 4;
const ASSET_VERSION = Date.now();

// Game State
let gameState = {
  selectedSquare: null,
  validMoves: [],
  currentPlayer: "red", // 'red' or 'black'
  moveHistory: [],
  soundEnabled: true,
  volume: 50, // Volume level 0-100
  pieces: {},
  gameStatus: "playing", // 'playing', 'check', 'checkmate', 'stalemate'
  redKingPosition: null,
  blackKingPosition: null,
  lastMove: null,
};

// Initialize Game
document.addEventListener("DOMContentLoaded", () => {
  initializeBoard();
  setupEventListeners();
  initializeGame();
});

/**
 * Initialize the chessboard with squares
 */
function initializeBoard() {
  const boardElement = document.getElementById("chess-board");
  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const square = document.createElement("div");
      const squareId = `square-${row}-${col}`;
      square.className = "square";
      square.id = squareId;

      // Add checkerboard pattern
      if ((row + col) % 2 === 0) {
        square.classList.add("even");
      }

      // Add river styling (rows 4-5)
      if (row >= RIVER_START && row <= RIVER_END) {
        square.classList.add("river");
      }

      // Add grid line pattern
      if (row < ROWS - 1 && col < COLS - 1) {
        if (
          (row === 2 || row === 7) &&
          (col === 0 || col === 2 || col === 4 || col === 6 || col === 8)
        ) {
          square.dataset.crossLine = true;
        }
      }

      square.addEventListener("click", () => handleSquareClick(row, col));
      boardElement.appendChild(square);
    }
  }
}

/**
 * Initialize game pieces (starting position)
 */
function initializeGame() {
  gameState.pieces = {
    // Red pieces (bottom side - rows 7-9)
    "red-chariot-left": { type: "chariot", color: "red", row: 9, col: 0 },
    "red-horse-left": { type: "horse", color: "red", row: 9, col: 1 },
    "red-elephant-left": { type: "elephant", color: "red", row: 9, col: 2 },
    "red-advisor-left": { type: "advisor", color: "red", row: 9, col: 3 },
    "red-king": { type: "king", color: "red", row: 9, col: 4 },
    "red-advisor-right": { type: "advisor", color: "red", row: 9, col: 5 },
    "red-elephant-right": { type: "elephant", color: "red", row: 9, col: 6 },
    "red-horse-right": { type: "horse", color: "red", row: 9, col: 7 },
    "red-chariot-right": { type: "chariot", color: "red", row: 9, col: 8 },
    "red-cannon-left": { type: "cannon", color: "red", row: 7, col: 1 },
    "red-cannon-right": { type: "cannon", color: "red", row: 7, col: 7 },
    "red-pawn-a": { type: "pawn", color: "red", row: 6, col: 0 },
    "red-pawn-b": { type: "pawn", color: "red", row: 6, col: 2 },
    "red-pawn-c": { type: "pawn", color: "red", row: 6, col: 4 },
    "red-pawn-d": { type: "pawn", color: "red", row: 6, col: 6 },
    "red-pawn-e": { type: "pawn", color: "red", row: 6, col: 8 },

    // Black pieces (top side - rows 0-2)
    "black-chariot-left": { type: "chariot", color: "black", row: 0, col: 0 },
    "black-horse-left": { type: "horse", color: "black", row: 0, col: 1 },
    "black-elephant-left": { type: "elephant", color: "black", row: 0, col: 2 },
    "black-advisor-left": { type: "advisor", color: "black", row: 0, col: 3 },
    "black-king": { type: "king", color: "black", row: 0, col: 4 },
    "black-advisor-right": { type: "advisor", color: "black", row: 0, col: 5 },
    "black-elephant-right": {
      type: "elephant",
      color: "black",
      row: 0,
      col: 6,
    },
    "black-horse-right": { type: "horse", color: "black", row: 0, col: 7 },
    "black-chariot-right": { type: "chariot", color: "black", row: 0, col: 8 },
    "black-cannon-left": { type: "cannon", color: "black", row: 2, col: 1 },
    "black-cannon-right": { type: "cannon", color: "black", row: 2, col: 7 },
    "black-pawn-a": { type: "pawn", color: "black", row: 3, col: 0 },
    "black-pawn-b": { type: "pawn", color: "black", row: 3, col: 2 },
    "black-pawn-c": { type: "pawn", color: "black", row: 3, col: 4 },
    "black-pawn-d": { type: "pawn", color: "black", row: 3, col: 6 },
    "black-pawn-e": { type: "pawn", color: "black", row: 3, col: 8 },
  };

  renderPieces();
  startGameTimer();

  // Initialize king positions
  updateKingPositions();

  // Initialize audio element - autoplay will handle playback
  const audioElement = document.getElementById("move-sound");
  
  if (audioElement) {
    console.log("Audio element found:", audioElement);
    console.log(
      "Audio source:",
      audioElement.src || audioElement.querySelector("source")?.src,
    );
    // Set volume based on soundEnabled state
    audioElement.volume = gameState.soundEnabled ? gameState.volume / 100 : 0;

    // Small delay to ensure browser recognizes the autoplay and allows unmuting
    setTimeout(() => {
      if (audioElement) {
        // Unmute if sound is enabled (HTML has muted attribute by default for autoplay to work)
        audioElement.muted = !gameState.soundEnabled;
        console.log(
          "Audio muted:",
          audioElement.muted,
          "Volume:",
          audioElement.volume,
        );
      }
    }, 100);
  } else {
    console.error('Audio element with id="move-sound" not found!');
  }

  // Fallback: unmute on any user interaction if autoplay was blocked
  const enableAudioOnInteraction = () => {
    const audioElement = document.getElementById("move-sound");
    if (audioElement && gameState.soundEnabled) {
      audioElement.muted = false;
      console.log("Unmuted audio on user interaction");
    }
    // Remove listener after first interaction
    document.removeEventListener("click", enableAudioOnInteraction);
    document.removeEventListener("keydown", enableAudioOnInteraction);
    document.removeEventListener("touchstart", enableAudioOnInteraction);
  };

  document.addEventListener("click", enableAudioOnInteraction);
  document.addEventListener("keydown", enableAudioOnInteraction);
  document.addEventListener("touchstart", enableAudioOnInteraction);
}

/**
 * Render all pieces on the board
 */
function renderPieces() {
  // Clear all pieces first
  document.querySelectorAll(".piece-on-board").forEach((el) => el.remove());

  // If screen is mobile
  const isMobile = window.innerWidth <= 768;

  const assetFolder = isMobile ? "mobile" : "desktop";
  // Render each piece
  for (const [key, piece] of Object.entries(gameState.pieces)) {
    const squareId = `square-${piece.row}-${piece.col}`;
    const squareElement = document.getElementById(squareId);

    if (squareElement) {
      const pieceElement = document.createElement("div");
      pieceElement.className = `piece-on-board ${piece.color}`;

      // Load piece image from assets
      const pieceImageName = `${piece.type}_${piece.color}.png`;
      pieceElement.style.backgroundImage = `url('../assets/${assetFolder}/${pieceImageName}?${ASSET_VERSION}')`;

      pieceElement.dataset.pieceKey = key;
      pieceElement.addEventListener("click", (e) => {
        e.stopPropagation();
        selectPiece(key);
      });
      squareElement.innerHTML = ""; // Clear square before adding piece
      squareElement.appendChild(pieceElement);
    }
  }
}

/**
 * Handle square click
 */
function handleSquareClick(row, col) {
  // Prevent moves if game is over
  if (gameState.gameStatus !== "playing" && gameState.gameStatus !== "check") {
    return;
  }

  if (gameState.selectedSquare) {
    const [selectedRow, selectedCol] = gameState.selectedSquare;

    // Check if move is valid
    if (
      gameState.validMoves.some((move) => move[0] === row && move[1] === col)
    ) {
      movePiece(selectedRow, selectedCol, row, col);
    }

    clearSelection();
  }
}

/**
 * Select a piece
 */
function selectPiece(pieceKey) {
  const piece = gameState.pieces[pieceKey];

  // Check if this is the target square for a move (capturing opponent piece)
  if (gameState.selectedSquare) {
    const [selectedRow, selectedCol] = gameState.selectedSquare;

    // If clicking on an opponent piece, try to capture it
    if (piece.color !== gameState.currentPlayer) {
      if (
        gameState.validMoves.some(
          (move) => move[0] === piece.row && move[1] === piece.col,
        )
      ) {
        movePiece(selectedRow, selectedCol, piece.row, piece.col);
        clearSelection();
        return;
      }
    }

    // If clicking on own piece, clear previous selection and select new piece
    if (piece.color === gameState.currentPlayer) {
      clearSelection();
    } else {
      // Clicking on opponent piece that's not a valid move
      clearSelection();
      return;
    }
  }

  // Only allow selecting pieces of the current player
  if (piece.color !== gameState.currentPlayer) {
    return;
  }

  gameState.selectedSquare = [piece.row, piece.col];
  const legalMoves = calculateValidMoves(piece);

  // If piece has no legal moves (pinned or can't resolve check), don't allow selection
  if (legalMoves.length === 0) {
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    return;
  }

  gameState.validMoves = legalMoves;

  // Highlight selected square and valid moves
  highlightSquares();
}

/**
 * Check if a piece occupies a square
 */
function hasPieceAt(row, col) {
  return Object.values(gameState.pieces).some(
    (p) => p.row === row && p.col === col,
  );
}

/**
 * Get piece at a square
 */
function getPieceAt(row, col) {
  return Object.values(gameState.pieces).find(
    (p) => p.row === row && p.col === col,
  );
}

/**
 * Update king positions in gameState
 */
function updateKingPositions() {
  const redKing = Object.values(gameState.pieces).find(
    (p) => p.type === "king" && p.color === "red",
  );
  const blackKing = Object.values(gameState.pieces).find(
    (p) => p.type === "king" && p.color === "black",
  );

  if (redKing) {
    gameState.redKingPosition = [redKing.row, redKing.col];
  }
  if (blackKing) {
    gameState.blackKingPosition = [blackKing.row, blackKing.col];
  }
}

/**
 * Get king position for a color
 */
function getKingPosition(color) {
  return color === "red"
    ? gameState.redKingPosition
    : gameState.blackKingPosition;
}

/**
 * Get raw moves for a piece WITHOUT any check/pin filtering.
 * Used internally to detect attacks without causing infinite recursion.
 */
function getRawMoves(piece) {
  const { type } = piece;
  switch (type) {
    case "chariot":
      return getCharioMoves(piece);
    case "horse":
      return getHorseMoves(piece);
    case "elephant":
      return getElephantMoves(piece);
    case "advisor":
      return getAdvisorMoves(piece);
    case "king":
      return getKingMovesRaw(piece);
    case "cannon":
      return getCannonMoves(piece);
    case "pawn":
      return getPawnMoves(piece);
    default:
      return [];
  }
}

/**
 * King moves without facing-kings check (raw, used in attack detection)
 */
function getKingMovesRaw(piece) {
  const moves = [];
  const { row, col, color } = piece;
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (!isInPalace(newRow, newCol, color)) continue;
    if (!hasPieceAt(newRow, newCol)) {
      moves.push([newRow, newCol]);
    } else {
      const targetPiece = getPieceAt(newRow, newCol);
      if (targetPiece.color !== color) {
        moves.push([newRow, newCol]);
      }
    }
  }
  return moves;
}

/**
 * Check if a square is attacked by any piece of attackerColor,
 * given a temporary board state (pieces object).
 */
function isSquareAttackedBy(row, col, attackerColor, pieces) {
  const savedPieces = gameState.pieces;
  gameState.pieces = pieces;
  let attacked = false;
  for (const piece of Object.values(pieces)) {
    if (piece.color !== attackerColor) continue;
    const moves = getRawMoves(piece);
    if (moves.some((m) => m[0] === row && m[1] === col)) {
      attacked = true;
      break;
    }
  }
  gameState.pieces = savedPieces;
  return attacked;
}

/**
 * Check if kings are facing each other (flying general rule) in a given pieces state.
 */
function kingsAreFacing(pieces) {
  const redKing = Object.values(pieces).find(
    (p) => p.type === "king" && p.color === "red",
  );
  const blackKing = Object.values(pieces).find(
    (p) => p.type === "king" && p.color === "black",
  );
  if (!redKing || !blackKing) return false;
  if (redKing.col !== blackKing.col) return false;
  // Check if any piece stands between them on that column
  const minRow = Math.min(redKing.row, blackKing.row);
  const maxRow = Math.max(redKing.row, blackKing.row);
  for (const p of Object.values(pieces)) {
    if (p.type === "king") continue;
    if (p.col === redKing.col && p.row > minRow && p.row < maxRow) return false;
  }
  return true; // no piece between them → facing
}

/**
 * Simulate a move on a deep-copy of pieces, return new pieces object.
 */
function simulateMoveOnPieces(pieces, fromRow, fromCol, toRow, toCol) {
  // Deep copy
  const newPieces = {};
  for (const [k, p] of Object.entries(pieces)) {
    newPieces[k] = { ...p };
  }
  // Find moving piece
  const entry = Object.entries(newPieces).find(
    ([, p]) => p.row === fromRow && p.col === fromCol,
  );
  if (!entry) return newPieces;
  const [key, movingPiece] = entry;
  // Remove captured piece
  const capturedEntry = Object.entries(newPieces).find(
    ([k, p]) => p.row === toRow && p.col === toCol && k !== key,
  );
  if (capturedEntry) delete newPieces[capturedEntry[0]];
  // Move the piece
  newPieces[key].row = toRow;
  newPieces[key].col = toCol;
  return newPieces;
}

/**
 * After a simulated move (newPieces), check if kingColor's king is in check.
 */
function isKingInCheckAfterMove(kingColor, newPieces) {
  const king = Object.values(newPieces).find(
    (p) => p.type === "king" && p.color === kingColor,
  );
  if (!king) return false; // king captured – handled separately
  const enemyColor = kingColor === "red" ? "black" : "red";
  // Also check flying general
  if (kingsAreFacing(newPieces)) return true;
  return isSquareAttackedBy(king.row, king.col, enemyColor, newPieces);
}

/**
 * Check if a king is under attack by opponent pieces (current board state)
 */
function isKingAttacked(kingColor) {
  const king = Object.values(gameState.pieces).find(
    (p) => p.type === "king" && p.color === kingColor,
  );
  if (!king) return false;
  const enemyColor = kingColor === "red" ? "black" : "red";
  if (kingsAreFacing(gameState.pieces)) return true;
  return isSquareAttackedBy(king.row, king.col, enemyColor, gameState.pieces);
}

/**
 * Check if current player is in check
 */
function isInCheck() {
  return isKingAttacked(gameState.currentPlayer);
}

/**
 * Get ALL legal moves for a piece (filters out moves that leave own king in check / exposed or flying general)
 */
function getLegalMoves(piece) {
  const rawMoves = getRawMoves(piece);
  const legalMoves = [];
  for (const [toRow, toCol] of rawMoves) {
    const newPieces = simulateMoveOnPieces(
      gameState.pieces,
      piece.row,
      piece.col,
      toRow,
      toCol,
    );
    if (!isKingInCheckAfterMove(piece.color, newPieces)) {
      legalMoves.push([toRow, toCol]);
    }
  }
  return legalMoves;
}

/**
 * Check if current player is in checkmate
 */
function isInCheckmate() {
  if (!isInCheck()) return false;
  for (const piece of Object.values(gameState.pieces)) {
    if (piece.color !== gameState.currentPlayer) continue;
    if (getLegalMoves(piece).length > 0) return false;
  }
  return true;
}

/**
 * Check if game is in stalemate (not check but no legal moves)
 */
function isInStalemate() {
  if (isInCheck()) return false;
  for (const piece of Object.values(gameState.pieces)) {
    if (piece.color !== gameState.currentPlayer) continue;
    if (getLegalMoves(piece).length > 0) return false;
  }
  return true;
}

/**
 * Check if piece crossed the river
 */
function hasPickCrossedRiver(piece) {
  if (piece.color === "red") {
    return piece.row < RIVER_START; // Red moves up, crossed if row < 4
  } else {
    return piece.row > RIVER_END; // Black moves down, crossed if row > 5
  }
}

/**
 * Check if a position is within palace (Cung)
 * Red palace: rows 7-9, cols 3-5
 * Black palace: rows 0-2, cols 3-5
 */
function isInPalace(row, col, color) {
  if (color === "red") {
    return row >= 7 && row <= 9 && col >= 3 && col <= 5;
  } else {
    return row >= 0 && row <= 2 && col >= 3 && col <= 5;
  }
}

/**
 * Check if a diagonal move is valid (no blocking piece in the middle)
 */
function isDiagonalPathClear(fromRow, fromCol, toRow, toCol) {
  const rowDir = Math.sign(toRow - fromRow);
  const colDir = Math.sign(toCol - fromCol);
  let row = fromRow + rowDir;
  let col = fromCol + colDir;
  while (row !== toRow || col !== toCol) {
    if (hasPieceAt(row, col)) return false;
    row += rowDir;
    col += colDir;
  }
  return true;
}

/**
 * Check if straight line (for knight/horse) is clear
 */
function isKnightPathClear(fromRow, fromCol, toRow, toCol) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Knight moves in L-shape: 2 in one direction, 1 perpendicular
  if (rowDiff === 2 && colDiff === 1) {
    const blockRow = fromRow + Math.sign(toRow - fromRow);
    return !hasPieceAt(blockRow, fromCol);
  } else if (rowDiff === 1 && colDiff === 2) {
    const blockCol = fromCol + Math.sign(toCol - fromCol);
    return !hasPieceAt(fromRow, blockCol);
  }
  return false;
}

/**
 * Get valid moves for a chariot (車/车 - Rook)
 * Moves any number of squares horizontally or vertically
 */
function getCharioMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  // All four directions
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dRow, dCol] of directions) {
    let newRow = row + dRow;
    let newCol = col + dCol;

    while (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      if (hasPieceAt(newRow, newCol)) {
        const targetPiece = getPieceAt(newRow, newCol);
        if (targetPiece.color !== color) {
          moves.push([newRow, newCol]);
        }
        break;
      }
      moves.push([newRow, newCol]);
      newRow += dRow;
      newCol += dCol;
    }
  }

  return moves;
}

/**
 * Get valid moves for a horse (馬/马 - Knight)
 * Moves in L-shape: 2 squares in one direction, 1 perpendicular
 * Can be blocked by piece in the straight path
 */
function getHorseMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  // All 8 possible L-shaped movements
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dRow, dCol] of knightMoves) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      if (isKnightPathClear(row, col, newRow, newCol)) {
        if (!hasPieceAt(newRow, newCol)) {
          moves.push([newRow, newCol]);
        } else {
          const targetPiece = getPieceAt(newRow, newCol);
          if (targetPiece.color !== color) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Get valid moves for an elephant (象/象 - Bishop)
 * Moves 2 squares diagonally, can't cross river
 * Can be blocked by piece in the diagonal path
 */
function getElephantMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  // 4 diagonal directions
  const diagonals = [
    [-2, -2],
    [-2, 2],
    [2, -2],
    [2, 2],
  ];

  for (const [dRow, dCol] of diagonals) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      // Check river crossing
      const crossedRiver =
        color === "red" ? newRow < RIVER_START : newRow > RIVER_END;
      if (crossedRiver) continue; // Elephant can't cross river

      // Check if diagonal path is clear
      if (isDiagonalPathClear(row, col, newRow, newCol)) {
        if (!hasPieceAt(newRow, newCol)) {
          moves.push([newRow, newCol]);
        } else {
          const targetPiece = getPieceAt(newRow, newCol);
          if (targetPiece.color !== color) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Get valid moves for an advisor (士/士 - Adviser)
 * Moves 1 square diagonally within the palace only
 */
function getAdvisorMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  // 4 diagonal directions
  const diagonals = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  for (const [dRow, dCol] of diagonals) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Must stay in palace
    if (!isInPalace(newRow, newCol, color)) continue;

    if (!hasPieceAt(newRow, newCol)) {
      moves.push([newRow, newCol]);
    } else {
      const targetPiece = getPieceAt(newRow, newCol);
      if (targetPiece.color !== color) {
        moves.push([newRow, newCol]);
      }
    }
  }

  return moves;
}

/**
 * Get valid moves for a king (將/将 - King)
 * Moves 1 square horizontally or vertically within the palace.
 * Final legality (not moving into check, flying general) is handled by getLegalMoves.
 */
function getKingMoves(piece) {
  return getKingMovesRaw(piece);
}

/**
 * Get valid moves for a cannon (砲/炮 - Cannon)
 * Moves like chariot but to capture: must jump over exactly 1 piece
 */
function getCannonMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  // All four directions
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dRow, dCol] of directions) {
    let newRow = row + dRow;
    let newCol = col + dCol;
    let firstPieceFound = false;

    while (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      if (hasPieceAt(newRow, newCol)) {
        if (!firstPieceFound) {
          // First piece found - cannon cannot move to this or beyond until 1 piece crossed
          firstPieceFound = true;
          newRow += dRow;
          newCol += dCol;
          continue;
        } else {
          // Second piece found - this can be captured
          const targetPiece = getPieceAt(newRow, newCol);
          if (targetPiece.color !== color) {
            moves.push([newRow, newCol]);
          }
          break;
        }
      } else {
        // Empty square
        if (!firstPieceFound) {
          // Before crossing any piece, can move here
          moves.push([newRow, newCol]);
        }
        // After crossing 1 piece, only look for capture target
      }

      newRow += dRow;
      newCol += dCol;
    }
  }

  return moves;
}

/**
 * Get valid moves for a pawn (兵/兵 - Pawn)
 * Before crossing river: moves forward (away from starting side) only
 * After crossing river: moves forward and sideways
 */
function getPawnMoves(piece) {
  const moves = [];
  const { row, col, color } = piece;

  const hasPickCrossed = hasPickCrossedRiver(piece);

  if (color === "red") {
    // Red moves upward (row decreases)
    // Forward direction
    if (row > 0) {
      const newRow = row - 1;
      if (!hasPieceAt(newRow, col)) {
        moves.push([newRow, col]);
      } else {
        const targetPiece = getPieceAt(newRow, col);
        if (targetPiece.color !== color) {
          moves.push([newRow, col]);
        }
      }
    }

    // Sideways (only if crossed river)
    if (hasPickCrossed) {
      for (const newCol of [col - 1, col + 1]) {
        if (newCol >= 0 && newCol < COLS) {
          if (!hasPieceAt(row, newCol)) {
            moves.push([row, newCol]);
          } else {
            const targetPiece = getPieceAt(row, newCol);
            if (targetPiece.color !== color) {
              moves.push([row, newCol]);
            }
          }
        }
      }
    }
  } else {
    // Black moves downward (row increases)
    // Forward direction
    if (row < ROWS - 1) {
      const newRow = row + 1;
      if (!hasPieceAt(newRow, col)) {
        moves.push([newRow, col]);
      } else {
        const targetPiece = getPieceAt(newRow, col);
        if (targetPiece.color !== color) {
          moves.push([newRow, col]);
        }
      }
    }

    // Sideways (only if crossed river)
    if (hasPickCrossed) {
      for (const newCol of [col - 1, col + 1]) {
        if (newCol >= 0 && newCol < COLS) {
          if (!hasPieceAt(row, newCol)) {
            moves.push([row, newCol]);
          } else {
            const targetPiece = getPieceAt(row, newCol);
            if (targetPiece.color !== color) {
              moves.push([row, newCol]);
            }
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Calculate valid (legal) moves for a piece.
 * Uses getLegalMoves which filters for check, pin, and flying general.
 */
function calculateValidMoves(piece) {
  return getLegalMoves(piece);
}

/**
 * Tạo element ảnh target overlay lên ô cờ
 */
function createTargetOverlay(squareEl, imageName) {
  const isMobile = window.innerWidth <= 768;
  const assetFolder = isMobile ? "mobile" : "desktop";

  const img = document.createElement("img");
  img.src = `../assets/${assetFolder}/${imageName}?${ASSET_VERSION}`;
  img.className = "target-overlay";
  img.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: contain;
    pointer-events: none;
    z-index: 5;
  `;
  squareEl.style.position = "relative";
  squareEl.appendChild(img);
}

/**
 * Highlight selected square and valid moves bằng ảnh target-new.png
 */
function highlightSquares() {
  clearHighlights();

  if (gameState.selectedSquare) {
    for (const [moveRow, moveCol] of gameState.validMoves) {
      const squareEl = document.getElementById(`square-${moveRow}-${moveCol}`);
      if (squareEl) createTargetOverlay(squareEl, "target-new.png");
    }
  }
}

/**
 * Clear highlights — xoá target-overlay gợi ý nước đi (giữ lại last-move markers)
 */
function clearHighlights() {
  document
    .querySelectorAll(".square.selected, .square.valid-move")
    .forEach((el) => {
      el.classList.remove("selected", "valid-move");
    });
  document
    .querySelectorAll(".target-overlay:not(.target-last-move)")
    .forEach((el) => el.remove());
}

/**
 * Clear selection
 */
function clearSelection() {
  gameState.selectedSquare = null;
  gameState.validMoves = [];
  clearHighlights();
}

/**
 * Move a piece
 */
function movePiece(fromRow, fromCol, toRow, toCol) {
  // Find the piece
  const piece = Object.entries(gameState.pieces).find(
    ([key, p]) => p.row === fromRow && p.col === fromCol,
  );

  if (!piece) return;

  const [pieceKey, pieceObj] = piece;

  // Check for capture
  const capturedPieceKey = Object.entries(gameState.pieces).find(
    ([key, p]) => p.row === toRow && p.col === toCol,
  )?.[0];

  // Move piece
  pieceObj.row = toRow;
  pieceObj.col = toCol;

  // Update king positions if king moved
  if (pieceObj.type === "king") {
    updateKingPositions();
  }

  // Remove captured piece
  if (capturedPieceKey) {
    delete gameState.pieces[capturedPieceKey];
    addCapturedPiece(gameState.currentPlayer, capturedPieceKey);
  }

  // Add move to history
  const captureInfo = capturedPieceKey ? " x" : "";
  addMoveToHistory(
    `${pieceObj.type}${captureInfo}: ${fromRow},${fromCol} → ${toRow},${toCol}`,
  );

  // Play sound if enabled
  if (gameState.soundEnabled) {
    playBackGroundSound();
  }

  // Switch player
  switchPlayer();

  // Check game status after move
  if (isInCheckmate()) {
    gameState.gameStatus = "checkmate";
    showGameResult(
      `${gameState.currentPlayer === "red" ? "Đen" : "Đỏ"} chiếu hết! Game Over.`,
    );
  } else if (isInStalemate()) {
    gameState.gameStatus = "stalemate";
    showGameResult("Cờ bế tắc! Game Over.");
  } else if (isInCheck()) {
    gameState.gameStatus = "check";
    showCheckAlert(
      `${gameState.currentPlayer === "red" ? "Đỏ" : "Đen"} bị chiếu tướng!`,
    );
  } else {
    gameState.gameStatus = "playing";
  }

  // Lưu nước đi cuối để hiển thị marker
  gameState.lastMove = { fromRow, fromCol, toRow, toCol };

  // Re-render
  updatePiecePosition(pieceKey, fromRow, fromCol, toRow, toCol);
  clearSelection();
  showLastMoveMarkers();
}

function updatePiecePosition(pieceKey, fromRow, fromCol, toRow, toCol) {
  const fromSquare = document.getElementById(`square-${fromRow}-${fromCol}`);
  const toSquare = document.getElementById(`square-${toRow}-${toCol}`);

  const pieceEl = fromSquare.querySelector(".piece-on-board");

  if (!pieceEl) return;

  // Xóa quân bị ăn
  const targetPiece = toSquare.querySelector(".piece-on-board");
  if (targetPiece) targetPiece.remove();

  // Move DOM node (KHÔNG tạo mới)
  toSquare.appendChild(pieceEl);
}

/**
 * Show last move markers (target-old.png on from square, target-new.png on to square)
 */
function showLastMoveMarkers() {
  // Delete old last move markers
  document.querySelectorAll(".target-last-move").forEach((el) => el.remove());

  if (!gameState.lastMove) return;
  const { fromRow, fromCol, toRow, toCol } = gameState.lastMove;

  const oldSquare = document.getElementById(`square-${fromRow}-${fromCol}`);
  const newSquare = document.getElementById(`square-${toRow}-${toCol}`);

  if (oldSquare) {
    createTargetOverlay(oldSquare, "target-old.png");
    oldSquare
      .querySelector(".target-overlay:last-child")
      .classList.add("target-last-move");
  }
  if (newSquare) {
    createTargetOverlay(newSquare, "target-new.png");
    newSquare
      .querySelector(".target-overlay:last-child")
      .classList.add("target-last-move");
  }
}

/**
 * Switch current player
 */
function switchPlayer() {
  gameState.currentPlayer = gameState.currentPlayer === "red" ? "black" : "red";
}

/**
 * Show check alert to player
 */
function showCheckAlert(message) {
  // Create a temporary alert (can be enhanced with a modal later)
  const alertDiv = document.createElement("div");
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 100, 100, 0.9);
    color: white;
    padding: 20px 40px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    z-index: 9999;
    animation: fadeInOut 2s ease-in-out;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  // Remove after 2 seconds
  setTimeout(() => alertDiv.remove(), 2000);
}

/**
 * Show game result (checkmate, stalemate)
 */
function showGameResult(message) {
  const resultDiv = document.createElement("div");
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: #ffd700;
    padding: 30px 50px;
    border-radius: 8px;
    font-size: 24px;
    font-weight: bold;
    z-index: 9999;
    border: 3px solid #ffd700;
    text-align: center;
  `;
  resultDiv.innerHTML = `${message}<br><button style="margin-top: 15px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Thoát</button>`;
  document.body.appendChild(resultDiv);

  resultDiv.querySelector("button").addEventListener("click", () => {
    resultDiv.remove();
    location.reload(); // Reload to start new game
  });
}

/**
 * Add move to history
 */
function addMoveToHistory(moveText) {
  gameState.moveHistory.push(moveText);
  const movesList = document.getElementById("moves-list");
  const moveItem = document.createElement("div");
  moveItem.className = "move-item";
  moveItem.textContent = `${gameState.moveHistory.length}. ${moveText}`;
  movesList.appendChild(moveItem);

  // Auto-scroll to bottom
  movesList.scrollTop = movesList.scrollHeight;
}

/**
 * Add captured piece to display
 */
function addCapturedPiece(playerColor, capturedPieceKey) {
  const containerId =
    playerColor === "red"
      ? "player-captured-pieces"
      : "opponent-captured-pieces";
  const container = document.getElementById(containerId);

  // Get the piece info before it was deleted
  let pieceType = "chariot"; // default

  // Extract piece type from key (e.g., 'red-chariot-left' -> 'chariot')
  const typeMatch = capturedPieceKey.match(/-(\w+?)(?:-|$)/);
  if (typeMatch) {
    pieceType = typeMatch[1];
  }

  // Determine piece color (opposite of player color)
  const pieceColor = playerColor === "red" ? "black" : "red";

  const isMobile = window.innerWidth <= 768;
  const assetFolder = isMobile ? "mobile" : "desktop";

  const img = document.createElement("img");
  img.src = `../assets/${assetFolder}/${pieceType}_${pieceColor}.png?${ASSET_VERSION}`;
  img.draggable = false;

  container.appendChild(img);
}

/**
 * Play move sound
 */
function playBackGroundSound() {
  // For background music: just adjust volume and muted state
  const audioElement = document.getElementById("move-sound");

  if (audioElement) {
    // Set volume based on soundEnabled state
    audioElement.volume = gameState.soundEnabled ? gameState.volume / 100 : 0;
    audioElement.muted = !gameState.soundEnabled;

    // If paused and sound is enabled, try to play
    if (gameState.soundEnabled && audioElement.paused) {
      audioElement.play().catch(() => {
        // If HTML5 audio fails, use fallback beep
        playBeepSound();
      });
    }
  } else {
    // No audio element found, use fallback
    playBeepSound();
  }
}

/**
 * Play beep sound using Web Audio API (fallback)
 */
function playBeepSound() {
  // Always play beep, but volume depends on soundEnabled state
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const panner = audioContext.createStereoPanner();

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    // Apply volume based on soundEnabled state
    const volumeLevel = gameState.soundEnabled ? gameState.volume / 100 : 0;
    gainNode.gain.setValueAtTime(0.3 * volumeLevel, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.1,
    );

    // Stereo effect - center (0)
    panner.pan.value = 0;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}

/**
 * Start game timer
 */
function startGameTimer() {
  let playerTime = 300; // 5 minutes in seconds
  let opponentTime = 300;

  setInterval(() => {
    if (gameState.currentPlayer === "red") {
      playerTime--;
      document.getElementById("player-time").textContent =
        formatTime(playerTime);
    } else {
      opponentTime--;
      document.getElementById("opponent-time").textContent =
        formatTime(opponentTime);
    }
  }, 1000);
}

/**
 * Format time to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Settings button
  document.getElementById("settings-btn").addEventListener("click", () => {
    document.getElementById("settings-modal").classList.remove("hidden");
  });

  // Close settings modal
  document.getElementById("close-settings").addEventListener("click", () => {
    document.getElementById("settings-modal").classList.add("hidden");
  });

  // Sound toggle in settings - mutes/unmutes by setting volume to 0
  document.getElementById("sound-toggle").addEventListener("change", (e) => {
    gameState.soundEnabled = e.target.checked;
    // Apply volume change immediately to audio element
    const audioElement = document.getElementById("move-sound");
    if (audioElement) {
      audioElement.volume = gameState.soundEnabled ? gameState.volume / 100 : 0;
      audioElement.muted = !gameState.soundEnabled;
    }
    // Update button appearance
    updateSoundButtonDisplay();
  });

  // Sound button - toggles mute/unmute
  document.getElementById("sound-btn").addEventListener("click", () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    document.getElementById("sound-toggle").checked = gameState.soundEnabled;
    // Apply volume change immediately to audio element
    const audioElement = document.getElementById("move-sound");
    if (audioElement) {
      audioElement.volume = gameState.soundEnabled ? gameState.volume / 100 : 0;
      audioElement.muted = !gameState.soundEnabled;
      // Ensure playing if enabled
      if (gameState.soundEnabled && audioElement.paused) {
        audioElement.play().catch(() => {});
      }
    }
    // Update button appearance
    updateSoundButtonDisplay();
  });

  // Volume slider
  document.getElementById("volume-slider").addEventListener("input", (e) => {
    gameState.volume = parseInt(e.target.value);
    // Update volume display
    document.getElementById("volume-value").textContent =
      gameState.volume + "%";
    // Apply volume change to audio element
    const audioElement = document.getElementById("move-sound");
    if (audioElement && gameState.soundEnabled) {
      audioElement.volume = gameState.volume / 100;
      audioElement.muted = false; // Ensure not muted when adjusting volume
    }
  });

  // Brightness slider
  document
    .getElementById("brightness-slider")
    .addEventListener("input", (e) => {
      const brightness = e.target.value;
      document.documentElement.style.filter = `brightness(${brightness}%)`;
    });

  // Surrender button
  document.getElementById("surrender-btn").addEventListener("click", () => {
    document.getElementById("surrender-modal").classList.remove("hidden");
  });

  // Surrender modal - Cancel button
  document.getElementById("cancel-surrender").addEventListener("click", () => {
    document.getElementById("surrender-modal").classList.add("hidden");
  });

  // Surrender modal - Confirm button
  document.getElementById("confirm-surrender").addEventListener("click", () => {
    endGame("surrender");
    document.getElementById("surrender-modal").classList.add("hidden");
  });

  // Close surrender modal when clicking outside
  document.getElementById("surrender-modal").addEventListener("click", (e) => {
    if (e.target.id === "surrender-modal") {
      document.getElementById("surrender-modal").classList.add("hidden");
    }
  });

  // Chat send button
  document.getElementById("send-btn").addEventListener("click", sendMessage);

  // Chat input enter key
  document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Close modal when clicking outside
  document.getElementById("settings-modal").addEventListener("click", (e) => {
    if (e.target.id === "settings-modal") {
      document.getElementById("settings-modal").classList.add("hidden");
    }
  });
}

/**
 * Update sound button display
 */
function updateSoundButtonDisplay() {
  const soundBtn = document.getElementById("sound-btn");
  if (gameState.soundEnabled) {
    soundBtn.classList.remove("muted");
  } else {
    soundBtn.classList.add("muted");
  }
}

/**
 * Send chat message
 */
function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  const messageText = chatInput.value.trim();

  if (messageText === "") return;

  const messagesContainer = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "message player-message";
  messageDiv.innerHTML = `<span class="message-sender">Bạn:</span><span class="message-text">${escapeHtml(messageText)}</span>`;

  messagesContainer.appendChild(messageDiv);

  // Auto-scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Clear input
  chatInput.value = "";

  // Simulate opponent response after 2 seconds
  setTimeout(
    () => {
      const opponentMessageDiv = document.createElement("div");
      opponentMessageDiv.className = "message opponent-message";
      const responses = ["Tốt!", "OK!", "Haha", "Hay quá!", "Vậy được"];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      opponentMessageDiv.innerHTML = `<span class="message-sender">Đối Thủ:</span><span class="message-text">${randomResponse}</span>`;
      messagesContainer.appendChild(opponentMessageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    500 + Math.random() * 1500,
  );
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * End game
 */
function endGame(reason = "surrender") {
  if (reason === "surrender") {
    gameState.gameStatus = "checkmate";

    const loserLabel = gameState.currentPlayer === "red" ? "Đỏ" : "Đen";
    const winnerLabel = gameState.currentPlayer === "red" ? "Đen" : "Đỏ";

    const resultDiv = document.createElement("div");
    resultDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      color: #ffd700;
      padding: 30px 50px;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
      z-index: 9999;
      border: 3px solid #cc0000;
      text-align: center;
      min-width: 300px;
    `;

    resultDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"
           style="display:block;margin:0 auto 14px;">
        <rect x="10" y="8" width="4" height="48" rx="2" fill="#c8a96e"/>
        <polygon points="14,8 52,18 14,30" fill="#cc0000"/>
        <polygon points="33,13 34.5,17.5 39,17.5 35.5,20.5 37,25 33,22 29,25 30.5,20.5 27,17.5 31.5,17.5"
                 fill="#ffd700"/>
      </svg>
      <div style="color:#cc0000;font-size:20px;margin-bottom:6px;">
        Xỏ ${loserLabel} đầu hàng!
      </div>
      <div style="color:#ffd700;font-size:26px;margin-bottom:18px;">
        Xỏ ${winnerLabel} chiến thắng! 🏆
      </div>
      <button style="
        margin-top: 4px;
        padding: 10px 28px;
        font-size: 16px;
        cursor: pointer;
        background: #cc0000;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        letter-spacing: 1px;
      ">Chơi lại</button>
    `;

    document.body.appendChild(resultDiv);

    resultDiv.querySelector("button").addEventListener("click", () => {
      resultDiv.remove();
      location.reload();
    });
  }
}

let currentIsMobile = window.innerWidth <= 768;

window.addEventListener("resize", () => {
  const newIsMobile = window.innerWidth <= 768;

  // Chỉ update khi thực sự chuyển giữa mobile ↔ desktop
  if (newIsMobile !== currentIsMobile) {
    currentIsMobile = newIsMobile;
    renderPieces();
  }
});
