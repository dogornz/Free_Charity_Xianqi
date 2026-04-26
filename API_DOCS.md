# 🔌 API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### Register (Đăng Kí)
**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "fullName": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "user_id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "message": "User created successfully"
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "Username already exists" | "Email already exists"
}
```

---

### Login (Đăng Nhập)
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "rank": "Novice",
    "points": 0,
    "wins": 0,
    "losses": 0,
    "draws": 0,
    "brightness": 50,
    "sound_enabled": true,
    "volume": 50
  },
  "message": "Login successful"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "User not found" | "Incorrect password" | "Account is banned"
}
```

---

### Get Current User (Lấy Thông Tin User)
**Endpoint:** `GET /auth/user`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "status": "active",
    "profile_id": 1,
    "full_name": "Test User",
    "avatar_url": "https://...",
    "gender": "male",
    "country": "Vietnam",
    "bio": "...",
    "rank": "Novice",
    "points": 100,
    "wins": 5,
    "losses": 2,
    "draws": 1,
    "brightness": 50,
    "sound_enabled": true,
    "volume": 50
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "No token provided" | "Invalid token"
}
```

---

## User Profile

### Update Profile (Cập Nhật Hồ Sơ)
**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "full_name": "string (optional)",
  "avatar_url": "string (optional)",
  "gender": "male|female|other (optional)",
  "country": "string (optional)",
  "bio": "string (optional)",
  "rank": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { /* Updated user object */ },
  "message": "Profile updated successfully"
}
```

---

### Update Brightness (Cập Nhật Độ Sáng)
**Endpoint:** `PUT /auth/brightness`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "brightness": 0-100
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Brightness updated"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Brightness must be between 0 and 100"
}
```

---

### Update Sound Settings (Cập Nhật Âm Thanh)
**Endpoint:** `PUT /auth/sound`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "soundEnabled": true|false,
  "volume": 0-100
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sound settings updated"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Volume must be between 0 and 100"
}
```

---

## Leaderboard

### Get Leaderboard (Lấy Xếp Hạng)
**Endpoint:** `GET /auth/leaderboard?limit=10&offset=0`

**Headers:**
```
No auth required
```

**Query Parameters:**
- `limit` (optional): 1-100, default: 10
- `offset` (optional): Pagination offset, default: 0

**Response (200):**
```json
{
  "success": true,
  "players": [
    {
      "user_id": 1,
      "username": "player1",
      "full_name": "Player One",
      "avatar_url": "https://...",
      "rank": "Gold I",
      "points": 5000,
      "wins": 150,
      "losses": 50,
      "draws": 10
    },
    {
      "user_id": 2,
      "username": "player2",
      "full_name": "Player Two",
      "avatar_url": "https://...",
      "rank": "Silver III",
      "points": 3500,
      "wins": 100,
      "losses": 60,
      "draws": 5
    }
  ]
}
```

---

## Session

### Logout (Đăng Xuất)
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: username, email, password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided" | "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Rate Limiting
Currently not implemented. Can be added using express-rate-limit.

---

## CORS
Allowed origins: `http://localhost:3000` (configurable via .env)

---

## JWT Token Format

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "iat": 1234567890,
  "exp": 1241167890
}
```

**Expiration:** 7 days from creation

---

## Examples

### Register Example
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "MyPassword123",
    "fullName": "New User"
  }'
```

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "MyPassword123"
  }'
```

### Get User Example
```bash
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Update Brightness Example
```bash
curl -X PUT http://localhost:3000/api/auth/brightness \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"brightness": 75}'
```

### Get Leaderboard Example
```bash
curl -X GET "http://localhost:3000/api/auth/leaderboard?limit=20&offset=0"
```

---

**API Version:** 1.0.0  
**Last Updated:** 2026-04-26  
**Base URL:** http://localhost:3000/api
