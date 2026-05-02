import { getConnection } from "./database.js";

// Store waiting players
const waitingPlayers = new Map();
// Store active rooms
const activeRooms = new Map();
// Store player to room mapping
const playerRooms = new Map();

/**
 * Generate random 6-digit room code
 */
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate random player role (red or black)
 */
function randomizePlayerRoles() {
  return Math.random() < 0.5
    ? { red: true, black: false }
    : { red: false, black: true };
}

/**
 * Add player to waiting queue
 */
async function addWaitingPlayer(userId, userInfo) {
  waitingPlayers.set(userId, {
    userId,
    username: userInfo.username,
    avatar: userInfo.avatar_url,
    joinedAt: Date.now(),
  });

  console.log(
    `✅ Player ${userId} added to waiting queue. Total waiting: ${waitingPlayers.size}`,
  );
  return waitingPlayers.get(userId);
}

/**
 * Remove player from waiting queue
 */
function removeWaitingPlayer(userId) {
  return waitingPlayers.delete(userId);
}

/**
 * Find match for a player (FIFO - first come first serve)
 */
function findMatch(currentUserId) {
  for (const [waitingUserId, playerInfo] of waitingPlayers) {
    if (waitingUserId !== currentUserId) {
      return { ...playerInfo };
    }
  }
  return null;
}

/**
 * Create new room after matching
 */
async function createRoom(player1Id, player1Info, player2Id, player2Info) {
  const connection = await getConnection();
  try {
    const roomCode = generateRoomCode();
    const roles = randomizePlayerRoles();

    // Determine red and black players
    const redPlayerId = roles.red ? player1Id : player2Id;
    const blackPlayerId = roles.black ? player1Id : player2Id;

    // Host will be red player (to keep room alive after game ends)
    const hostUserId = redPlayerId;
    const guestUserId = blackPlayerId;

    const createdAt = new Date();

    // Insert into rooms table
    const [roomResult] = await connection.execute(
      `INSERT INTO rooms (room_code, host_user_id, guest_user_id, red_player_id, black_player_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roomCode,
        hostUserId,
        guestUserId,
        redPlayerId,
        blackPlayerId,
        "waiting_confirmation",
        createdAt,
        createdAt,
      ],
    );

    const roomId = roomResult.insertId;

    // Create room object
    const room = {
      roomId,
      roomCode,
      hostUserId,
      guestUserId,
      redPlayerId,
      blackPlayerId,
      player1: {
        userId: player1Id,
        username: player1Info.username,
        avatar: player1Info.avatar_url,
        role: roles.red ? "red" : "black",
      },
      player2: {
        userId: player2Id,
        username: player2Info.username,
        avatar: player2Info.avatar_url,
        role: roles.black ? "black" : "red",
      },
      status: "waiting_confirmation", // waiting_confirmation -> playing -> ended -> closed
      startTime: null,
      endTime: null,
      createdAt,
    };

    // Store room
    activeRooms.set(roomId, room);
    playerRooms.set(player1Id, roomId);
    playerRooms.set(player2Id, roomId);

    // Remove from waiting
    removeWaitingPlayer(player1Id);
    removeWaitingPlayer(player2Id);

    console.log(`🎯 Room created: ${roomCode} (ID: ${roomId})`);
    return room;
  } catch (error) {
    console.error("❌ Error creating room:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Get room by roomCode
 */
async function getRoomByCode(roomCode) {
  const connection = await getConnection();
  try {
    const [rooms] = await connection.execute(
      `SELECT r.*, u1.username as host_username, u2.username as guest_username
       FROM rooms r
       LEFT JOIN users u1 ON r.host_user_id = u1.user_id
       LEFT JOIN users u2 ON r.guest_user_id = u2.user_id
       WHERE r.room_code = ?`,
      [roomCode],
    );

    if (rooms.length === 0) {
      return null;
    }

    return rooms[0];
  } catch (error) {
    console.error("❌ Error getting room:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Get room by roomId
 */
function getRoomById(roomId) {
  return activeRooms.get(roomId) || null;
}

/**
 * Get user's room
 */
function getUserRoom(userId) {
  const roomId = playerRooms.get(userId);
  return roomId ? activeRooms.get(roomId) : null;
}

/**
 * Update room status
 */
async function updateRoomStatus(roomId, status) {
  const connection = await getConnection();
  try {
    const room = activeRooms.get(roomId);
    if (!room) return null;

    room.status = status;
    if (status === "playing") room.startTime = new Date();
    if (status === "ended") room.endTime = new Date();

    await connection.execute(
      `UPDATE rooms SET status = ?, updated_at = ? WHERE room_id = ?`,
      [status, new Date(), roomId],
    );

    return room;
  } catch (error) {
    console.error("❌ Error updating room:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Start match - create match record
 */
async function startMatch(roomId) {
  const connection = await getConnection();
  try {
    const room = activeRooms.get(roomId);
    if (!room) return null;

    const now = new Date();

    // Insert into matches table
    const [matchResult] = await connection.execute(
      `INSERT INTO matches (room_id, red_player_id, black_player_id, start_time, turn_number)
       VALUES (?, ?, ?, ?, ?)`,
      [roomId, room.redPlayerId, room.blackPlayerId, now, 1],
    );

    const matchId = matchResult.insertId;

    // Update room with match info
    room.matchId = matchId;
    room.status = "playing";
    room.startTime = now;

    await connection.execute(
      `UPDATE rooms SET match_id = ?, status = ?, updated_at = ? WHERE room_id = ?`,
      [matchId, "playing", now, roomId],
    );

    return { matchId, ...room };
  } catch (error) {
    console.error("❌ Error starting match:", error);
    throw error;
  } finally {
    await connection.release();
  }
}
/**
 * Get match by matchId
 */
export async function getMatch(matchId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    "SELECT * FROM matches WHERE match_id = ?",
    [matchId]
  );
  connection.release();
  return rows[0];
}
/**
 * 
 * Hàm tăng turn
 */
export async function incrementTurn(matchId) {
  const connection = await getConnection();
  await connection.execute(
    "UPDATE matches SET turn_number = turn_number + 1 WHERE match_id = ?",
    [matchId]
  );
  connection.release();
}
/**
 * Save move
 */
async function saveMove(matchId, playerId, turnNumber, fromPos, toPos) {
  const connection = await getConnection();
  try {
    const [moveResult] = await connection.execute(
      `INSERT INTO moves (match_id, player_id, turn_number, from_pos, to_pos, move_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [matchId, playerId, turnNumber, fromPos, toPos, new Date()],
    );

    return moveResult.insertId;
  } catch (error) {
    console.error("❌ Error saving move:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * End match
 */
async function endMatch(matchId, winnerId, result) {
  const connection = await getConnection();
  try {
    const endTime = new Date();

    await connection.execute(
      `UPDATE matches SET winner_id = ?, result = ?, end_time = ? WHERE match_id = ?`,
      [winnerId, result, endTime, matchId],
    );

    // Update player stats
    if (winnerId) {
      await connection.execute(
        `UPDATE user_profiles SET wins = wins + 1 WHERE user_id = ?`,
        [winnerId],
      );
    }

    // Update loser stats
    const [match] = await connection.execute(
      `SELECT * FROM matches WHERE match_id = ?`,
      [matchId],
    );

    if (match.length > 0) {
      const loserId =
        match[0].red_player_id === winnerId
          ? match[0].black_player_id
          : match[0].red_player_id;
      if (loserId) {
        await connection.execute(
          `UPDATE user_profiles SET losses = losses + 1 WHERE user_id = ?`,
          [loserId],
        );
      }
    }

    return endTime;
  } catch (error) {
    console.error("❌ Error ending match:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Save chat message
 */
async function saveChatMessage(roomId, senderId, messageText) {
  const connection = await getConnection();
  try {
    const [messageResult] = await connection.execute(
      `INSERT INTO chat_messages (room_id, sender_id, message_text, sent_at)
       VALUES (?, ?, ?, ?)`,
      [roomId, senderId, messageText, new Date()],
    );

    return messageResult.insertId;
  } catch (error) {
    console.error("❌ Error saving message:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Kick player from room
 */
function kickPlayerFromRoom(userId) {
  const roomId = playerRooms.get(userId);
  if (roomId) {
    const room = activeRooms.get(roomId);
    if (room && room.guestUserId === userId) {
      playerRooms.delete(userId);
      return true;
    }
  }
  return false;
}

/**
 * Close room
 */
function closeRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (room) {
    playerRooms.delete(room.hostUserId);
    playerRooms.delete(room.guestUserId);
    activeRooms.delete(roomId);
    return true;
  }
  return false;
}

/**
 * Get waiting players count
 */
function getWaitingPlayersCount() {
  return waitingPlayers.size;
}

/**
 * Get room info for frontend
 */
function getRoomInfo(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return null;

  return {
    roomId,
    roomCode: room.roomCode,
    player1: room.player1,
    player2: room.player2,
    status: room.status,
    startTime: room.startTime,
    matchId: room.matchId,
  };
}

export {
  addWaitingPlayer,
  removeWaitingPlayer,
  findMatch,
  createRoom,
  getRoomByCode,
  getRoomById,
  getUserRoom,
  updateRoomStatus,
  startMatch,
  saveMove,
  endMatch,
  saveChatMessage,
  kickPlayerFromRoom,
  closeRoom,
  getWaitingPlayersCount,
  getRoomInfo,
};
