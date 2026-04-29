// Socket.io Game Client
let socket = null;
let currentUser = null;
let currentRoom = null;
let currentMatch = null;

/**
 * Initialize Socket.io connection
 */
function initializeSocket(userId, userInfo) {
  // Import socket.io from CDN if not already imported
  if (typeof io === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
    script.onload = () => {
      setupSocket(userId, userInfo);
    };
    document.head.appendChild(script);
  } else {
    setupSocket(userId, userInfo);
  }
}
/**
 * Check if there's a roomCode in URL to rejoin
 */
function getRoomCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("roomCode");
}

/**
 * Check if user is returning to game from matching
 */
function isReturningFromMatching() {
  const params = new URLSearchParams(window.location.search);
  return params.get("matched") === "true";
}
/**
 * Setup socket connection
 */
function setupSocket(userId, userInfo) {
  socket = io(window.location.origin, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  currentUser = { userId, ...userInfo };

  socket.on("connect", () => {
    console.log("✅ Connected to server");

    const roomId = localStorage.getItem("roomId");

    if (roomId) {
      socket.emit("joinGame", {
        userId: currentUser.userId,
        roomId: roomId,
      });
    }
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
    showMessage("Error: " + error.message, "error");
  });

  socket.on("disconnect", () => {
    console.log("📴 Disconnected from server");
    showMessage("Disconnected from server", "warning");
  });

  // Game events
  setupGameEventListeners();
}

/**
 * Setup game event listeners
 */
function setupGameEventListeners() {
  /**
   * Waiting players count update
   */
  socket.on("waitingPlayersUpdate", (data) => {
    console.log(`⏳ Waiting players: ${data.count}`);
    updateWaitingCount(data.count);
  });

  /**
   * Waiting for opponent
   */
  socket.on("waitingForOpponent", (data) => {
    console.log("⏳ " + data.message);
    showMessage(data.message, "info");
  });

  /**
   * Match found
   */
  socket.on("matchFound", (data) => {
    console.log("🎯 Match found!", data);
    currentRoom = {
      roomId: localStorage.getItem("roomId"),
    };

    // Determine current player role
    const myRole =
      data.player1Id === currentUser.userId
        ? data.player1.role
        : data.player2.role;

    // Update game state
    gameState.userRole = myRole;
    gameState.userId = currentUser.userId;
    gameState.matchId = data.matchId;
    gameState.roomId = data.roomId;
    gameState.roomCode = data.roomCode;

    // Update player info
    const redPlayer =
      myRole === "red"
        ? currentUser.username
        : data.player1Id === currentUser.userId
          ? data.player2.username
          : data.player1.username;
    const blackPlayer =
      myRole === "black"
        ? currentUser.username
        : data.player1Id === currentUser.userId
          ? data.player2.username
          : data.player1.username;

    updatePlayerNames(redPlayer, blackPlayer);

    showMessage("Match found! Starting game...", "success");

    localStorage.setItem("roomId", data.roomId);
    // Navigate to game if needed
    if (window.location.pathname !== "/game") {
      window.location.href = "/game";
    }
  });

  /**
   * Game ready
   */
  socket.on("gameReady", (data) => {
    console.log("🎮 Game ready!", data);
    gameState.roomId = data.roomId;
    gameState.roomCode = data.roomCode;
    gameState.userRole = data.myRole;

    updatePlayerNames(data.redPlayerName, data.blackPlayerName);
    showMessage("Game is ready! Let's play!", "success");
  });

  /**
   * Game started
   */
  socket.on("gameStarted", (data) => {
    console.log("🎮 Game started!", data);
    gameState.matchId = data.matchId;
    gameState.currentPlayer = "red";
    gameState.gameStatus = "playing";
    gameState.matchId = data.matchId;

    showMessage("Game started! Red plays first.", "success");

    // Start timer
    if (typeof startTimer === "function") {
      startTimer();
    }
  });

  /**
   * Move made
   */
  socket.on("moveMade", (data) => {
    console.log("📍 Move received:", data);

    if (gameState.userRole === "red" && gameState.currentPlayer === "black") {
      // Opponent moved
      handleRemoteMove(data.fromPos, data.toPos);
      gameState.currentPlayer = "red";
    } else if (
      gameState.userRole === "black" &&
      gameState.currentPlayer === "red"
    ) {
      // Opponent moved
      handleRemoteMove(data.fromPos, data.toPos);
      gameState.currentPlayer = "black";
    }

    addMoveToHistory(data);
  });

  /**
   * New message
   */
  socket.on("newMessage", (data) => {
    console.log("💬 New message:", data);
    addChatMessage(
      data.senderName,
      data.messageText,
      data.senderId === currentUser.userId,
    );
  });

  /**
   * Match ended
   */
  socket.on("matchEnded", (data) => {
    console.log("🏁 Match ended!", data);
    gameState.gameStatus = "ended";
    currentRoom = data;

    const message =
      data.winnerId === currentUser.userId ? "🎉 You won!" : "😔 You lost!";

    showMessage(message, "info");

    // Show end match options
    if (data.hostUserId === currentUser.userId) {
      // Host - can wait for new match
      showWaitForNewMatch(data.roomCode);
    } else {
      // Guest - prompt for confirmation
      showNewMatchConfirmation(data.roomId);
    }
  });

  /**
   * Host left
   */
  socket.on("hostLeft", (data) => {
    console.log("👤 Host left the room");
    showMessage("Host left the room", "warning");
  });

  /**
   * Guest left
   */
  socket.on("guestLeft", (data) => {
    console.log("👤 Guest left the room");
    showMessage("Guest left the room", "warning");
  });

  /**
   * Player kicked
   */
  socket.on("playerKicked", (data) => {
    console.log("🚫 Player kicked:", data);
    showMessage("You were kicked from the room: " + data.reason, "error");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  });

  /**
   * Match declined
   */
  socket.on("matchDeclined", (data) => {
    console.log("❌ Match declined");
    showMessage("Host declined new match. Closing room...", "warning");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  });

  /**
   * New match started
   */
  socket.on("newMatchStarted", (data) => {
    console.log("🎮 New match started!", data);
    gameState.matchId = data.matchId;
    gameState.currentPlayer = "red";
    gameState.gameStatus = "playing";
    gameState.moveHistory = [];
    gameState.validMoves = [];
    gameState.selectedSquare = null;

    // Reset board
    initializeGame();
    startTimer();

    showMessage("New match started!", "success");
  });
}

/**
 * Join waiting queue
 */
function joinWaitingQueue() {
  if (!socket || !currentUser) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("joinQueue", {
    userId: currentUser.userId,
    username: currentUser.username,
    avatarUrl: currentUser.avatar_url,
  });

  showMessage("Joined waiting queue...", "info");
}

/**
 * Join game room
 */
function joinGame() {
  if (!socket || !currentRoom) {
    console.error("Room not found");
    return;
  }

  socket.emit("joinGame", {
    userId: currentUser.userId,
    roomId: currentRoom.roomId,
  });
}

/**
 * Join room by code
 */
function joinRoomByCode(roomCode) {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("joinRoomByCode", {
    userId: currentUser.userId,
    roomCode: roomCode,
  });
}

/**
 * Send move
 */
function sendMove(matchId, fromPos, toPos, turnNumber) {
  if (!socket || !currentRoom) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("makeMove", {
    matchId: matchId,
    playerId: currentUser.userId,
    fromPos: fromPos,
    toPos: toPos,
    turnNumber: turnNumber,
  });
}

/**
 * Send chat message
 */
function sendChatMessage(messageText) {
  if (!socket || !currentRoom) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("sendMessage", {
    roomId: currentRoom.roomId,
    messageText: messageText,
  });
}

/**
 * End match
 */
function endMatch(matchId, winnerId, result) {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("endMatch", {
    matchId: matchId,
    winnerId: winnerId,
    result: result,
  });
}

/**
 * Resign match
 */
function resignMatch(matchId) {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("resign", {
    matchId: matchId,
    playerId: currentUser.userId,
  });
}

/**
 * Leave room
 */
function leaveRoom() {
  if (!socket || !currentRoom) {
    console.error("Room not found");
    return;
  }

  socket.emit("leaveRoom", {
    roomId: currentRoom.roomId,
  });

  window.location.href = "/dashboard";
}

/**
 * Confirm new match
 */
function confirmNewMatch(confirmed = true) {
  if (!socket || !currentRoom) {
    console.error("Room not found");
    return;
  }

  socket.emit("confirmNewMatch", {
    roomId: currentRoom.roomId,
    userId: currentUser.userId,
    confirmed: confirmed,
  });
}

/**
 * Update player names
 */
function updatePlayerNames(redPlayerName, blackPlayerName) {
  const redPlayerEl = document.getElementById("opponent-name");
  const blackPlayerEl = document.getElementById("player-name");

  if (gameState.userRole === "red") {
    if (redPlayerEl) redPlayerEl.textContent = blackPlayerName;
    if (blackPlayerEl) blackPlayerEl.textContent = redPlayerName;
  } else {
    if (redPlayerEl) redPlayerEl.textContent = redPlayerName;
    if (blackPlayerEl) blackPlayerEl.textContent = blackPlayerName;
  }
}

/**
 * Add move to history
 */
function addMoveToHistory(moveData) {
  const movesList = document.getElementById("moves-list");
  if (!movesList) return;

  const moveEl = document.createElement("div");
  moveEl.className = "move-item";
  moveEl.innerHTML = `
    <span class="move-number">${gameState.moveHistory.length + 1}.</span>
    <span class="move-from">${moveData.fromPos}</span>
    <span class="move-arrow">→</span>
    <span class="move-to">${moveData.toPos}</span>
  `;

  movesList.appendChild(moveEl);
  movesList.scrollTop = movesList.scrollHeight;
}

/**
 * Add chat message
 */
function addChatMessage(senderName, messageText, isOwn = false) {
  const chatMessages = document.getElementById("chat-messages");
  if (!chatMessages) return;

  const messageEl = document.createElement("div");
  messageEl.className = `message ${isOwn ? "player-message" : "opponent-message"}`;
  messageEl.innerHTML = `
    <span class="message-sender">${senderName}:</span>
    <span class="message-text">${messageText}</span>
  `;

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Show message
 */
function showMessage(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Create notification element
  const notif = document.createElement("div");
  notif.className = `notification notification-${type}`;
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${
      type === "error"
        ? "#ff4444"
        : type === "success"
          ? "#44ff44"
          : type === "warning"
            ? "#ffaa44"
            : "#4444ff"
    };
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

/**
 * Update waiting count display
 */
function updateWaitingCount(count) {
  const countEl = document.getElementById("waiting-players-count");
  if (countEl) {
    countEl.textContent = `${count} player${count !== 1 ? "s" : ""} waiting`;
  }
}

/**
 * Show wait for new match
 */
function showWaitForNewMatch(roomCode) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "new-match-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Game Ended</h2>
      </div>
      <div class="modal-body">
        <p>Room Code: <strong>${roomCode}</strong></p>
        <p>Share this code with your friend to play another match!</p>
        <p>Waiting for opponent to join...</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn" onclick="leaveRoom()">Leave Room</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Show new match confirmation
 */
function showNewMatchConfirmation(roomId) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "confirm-match-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>New Match?</h2>
      </div>
      <div class="modal-body">
        <p>The host wants to play another match. Do you want to continue?</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel-btn" onclick="confirmNewMatch(false)">Decline</button>
        <button class="modal-btn confirm-btn" onclick="confirmNewMatch(true)">Accept</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Handle remote move (placeholder for game logic)
 */
function handleRemoteMove(fromPos, toPos) {
  // This will be handled by main game.js logic
  console.log(`Remote move: ${fromPos} → ${toPos}`);
}

/**
 * Start timer (placeholder)
 */
function startTimer() {
  console.log("⏱️ Timer started");
}

// Export for use in game.html
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeSocket,
    joinWaitingQueue,
    joinGame,
    sendMove,
    sendChatMessage,
    endMatch,
    resignMatch,
    leaveRoom,
  };
}
