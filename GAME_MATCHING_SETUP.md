# 🎮 Hướng Dẫn Setup Hệ Thống Matching & Socket.io

## 📋 Tóm Tắt Các Thay Đổi

### 1. **Backend** 
- ✅ Cập nhật `package.json` - thêm Socket.io
- ✅ Tạo `game-service.js` - quản lý matching, rooms, moves, chat
- ✅ Cập nhật `server.js` - tích hợp Socket.io events
- ✅ Tạo migration `002-create-game-tables.sql` - tạo tables

### 2. **Frontend**
- ✅ Tạo `game-client.js` - Socket.io client cho game page
- ✅ Tạo `dashboard.js` - Socket.io client cho dashboard
- ✅ Copy `game.js` từ backend sang frontend - tích hợp socket calls
- ✅ Cập nhật `game.html` - thêm script imports
- ✅ Cập nhật `dashboard.html` - thêm script import

## 🚀 Hướng Dẫn Setup

### Bước 1: Cài Đặt Dependencies

```bash
cd d:\CO_TUONG\backend
npm install
```

### Bước 2: Tạo Database Tables

Chạy migration SQL file:

```sql
-- Mở MySQL client hoặc PhpMyAdmin
-- Chạy file: d:\CO_TUONG\backend\migrations\002-create-game-tables.sql
```

**Hoặc chạy bằng MySQL CLI:**

```bash
mysql -u root -p xiangqi_game < d:\CO_TUONG\backend\migrations\002-create-game-tables.sql
```

### Bước 3: Khởi Động Server

```bash
cd d:\CO_TUONG\backend
npm start
```

Server sẽ chạy tại: `http://localhost:3000`
WebSocket sẽ lắng nghe tại: `ws://localhost:3000`

## 📊 Database Schema

### `rooms` Table
```sql
- room_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- room_code (VARCHAR(6), UNIQUE) - Mã phòng 6 số ngẫu nhiên
- host_user_id (INT, FOREIGN KEY) - Người giữ phòng (không thoát)
- guest_user_id (INT, FOREIGN KEY) - Khách mời
- red_player_id (INT, FOREIGN KEY) - Người chơi quân đỏ
- black_player_id (INT, FOREIGN KEY) - Người chơi quân đen
- match_id (INT, FOREIGN KEY) - Liên kết đến match hiện tại
- status (ENUM) - waiting_confirmation | playing | ended | closed
- created_at, updated_at
```

### `matches` Table
```sql
- match_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- room_id (INT, FOREIGN KEY)
- red_player_id, black_player_id (INT, FOREIGN KEY)
- winner_id (INT, FOREIGN KEY, NULL)
- result (VARCHAR(20)) - checkmate | stalemate | resign | draw
- start_time, end_time, created_at
```

### `moves` Table
```sql
- move_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- match_id (INT, FOREIGN KEY)
- turn_number (INT)
- player_id (INT, FOREIGN KEY)
- from_pos, to_pos (VARCHAR(10)) - Format: "0,1" (row,col)
- move_time (TIMESTAMP)
```

### `messages` Table
```sql
- message_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- room_id (INT, FOREIGN KEY)
- sender_id (INT, FOREIGN KEY)
- message_text (TEXT)
- sent_at (TIMESTAMP)
```

## 🔌 Socket.io Events

### Từ Client → Server

#### Matching
- `joinQueue` - Tham gia queue tìm đối thủ
- `joinRoomByCode` - Vào phòng bằng room code
- `joinGame` - Vào phòng sau khi match found

#### Gameplay
- `makeMove` - Gửi nước đi
- `resign` - Nâng đầu hàng
- `endMatch` - Kết thúc trận

#### Chat & Room
- `sendMessage` - Gửi tin nhắn
- `leaveRoom` - Rời phòng
- `confirmNewMatch` - Xác nhận trận mới

### Từ Server → Client

#### Matching
- `waitingPlayersUpdate` - Số người đang chờ
- `waitingForOpponent` - Đang chờ đối thủ
- `matchFound` - Tìm thấy đối thủ
- `gameReady` - Game sẵn sàng
- `gameStarted` - Trò chơi bắt đầu

#### Gameplay
- `moveMade` - Nước đi từ đối thủ
- `matchEnded` - Trận kết thúc
- `matchDeclined` - Từ chối trận mới

#### Chat & Notifications
- `newMessage` - Tin nhắn từ đối thủ
- `playerKicked` - Người chơi bị kick
- `hostLeft` / `guestLeft` - Người chơi rời phòng
- `error` - Lỗi từ server

## 💡 Luồng Xử Lý

### 1. **Matching Flow**
```
Dashboard "Chơi" button
    ↓
joinQueue event → Server
    ↓
Server tìm opponent từ waitingPlayers map
    ↓
matchFound event (nếu có opponent)
    ↓
createRoom (room_code random 6 số, host/guest assigned)
    ↓
Player 1 & 2 đều nhận matchFound
    ↓
Navigate → /game page
    ↓
joinGame event
    ↓
startMatch (tạo match record trong DB)
```

### 2. **Room Management**
```
Game Over (match ended)
    ↓
updateRoomStatus('ended')
    ↓
Host ở lại phòng, Guest có thể rời
    ↓
Host có thể chờ guest nhập room_code
    ↓
Nếu guest join → showNewMatchConfirmation
    ↓
Nếu cả 2 đồng ý → startMatch mới
    ↓
Nếu 1 người từ chối → kickPlayerFromRoom(guest_id)
```

### 3. **Move & Chat Sync**
```
Player A di chuyển quân
    ↓
makeMove event + move validation
    ↓
saveMove to DB
    ↓
moveMade event broadcast to room
    ↓
Player B nhận move + render
```

## 🔐 User Role Assignment

Khi match found:
- **Host User ID** = Red Player (luôn)
- **Guest User ID** = Black Player (luôn)
- **Ngẫu nhiên player 1/2** nhưng được phân vai trò đúng

```javascript
// Example:
// Player 1 (từ dashboard click) → Random role
// Player 2 (waiting) → Opposite role

// Sau matching:
if (roles.red) {
  redPlayer = player1Id;
  blackPlayer = player2Id;
} else {
  redPlayer = player2Id;
  blackPlayer = player1Id;
}

// Host logic:
hostUserId = redPlayerId;  // Luôn là người chơi đỏ
guestUserId = blackPlayerId; // Luôn là người chơi đen
```

## 📱 File Paths

```
d:\CO_TUONG\
├── backend/
│   ├── server.js (✅ updated)
│   ├── game-service.js (✅ NEW)
│   ├── game.js (✅ updated)
│   ├── package.json (✅ updated)
│   └── migrations/
│       └── 002-create-game-tables.sql (✅ NEW)
└── frontend/
    ├── game.html (✅ updated)
    ├── game.js (✅ NEW - copied from backend)
    ├── game-client.js (✅ NEW)
    ├── dashboard.html (✅ updated)
    └── dashboard.js (✅ NEW)
```

## 🐛 Troubleshooting

### Issue: "Socket not initialized"
- Kiểm tra localStorage có userData không
- Kiểm tra server có chạy không
- Kiểm tra browser console có lỗi không

### Issue: "Room not found"
- Kiểm tra room code có đúng không
- Kiểm tra room status (ended vs playing)
- Kiểm tra host_user_id matching

### Issue: Move không sync
- Kiểm tra matchId có được gửi không
- Kiểm trace Socket.io events trong console
- Kiểm tra player role có đúng không

### Issue: Database connection
- Kiểm tra MySQL đang chạy
- Kiểm tra .env file
- Kiểm tra user/password/database name

## 🎯 Next Steps

1. **Restart Backend Server**
   ```bash
   cd backend
   npm install  # Cài Socket.io
   npm start
   ```

2. **Run Migration**
   - Mở MySQL client
   - Chạy file `002-create-game-tables.sql`

3. **Test Matching**
   - Mở 2 browser tabs
   - Login với 2 tài khoản khác
   - Click "Chơi" button trên cả 2
   - Match found sẽ trigger

4. **Verify Database**
   ```sql
   SELECT * FROM rooms;
   SELECT * FROM matches;
   SELECT * FROM moves;
   SELECT * FROM messages;
   ```

## 📝 Notes

- Rooms tồn tại lâu dài (chỉ close khi host thoát)
- Matches mới có thể được tạo trong cùng room
- Guest được kick nếu từ chối trận mới
- Moves được lưu với turn_number (0-indexed)
- Chat messages được lưu per room

---

**Created**: 2026-04-30
**Version**: 1.0
**Status**: Ready for Testing
