-- Migration: Create game tables for Xiangqi multiplayer
-- This migration creates tables for rooms, matches, moves, and messages

USE xiangqi_game;

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_user_id INT NOT NULL,
  guest_user_id INT NOT NULL,
  red_player_id INT NOT NULL,
  black_player_id INT NOT NULL,
  match_id INT,
  status ENUM('waiting_confirmation', 'playing', 'ended', 'closed') DEFAULT 'waiting_confirmation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_user_id) REFERENCES users(user_id),
  FOREIGN KEY (guest_user_id) REFERENCES users(user_id),
  FOREIGN KEY (red_player_id) REFERENCES users(user_id),
  FOREIGN KEY (black_player_id) REFERENCES users(user_id),
  INDEX idx_room_code (room_code),
  INDEX idx_host_user (host_user_id),
  INDEX idx_guest_user (guest_user_id),
  INDEX idx_status (status)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  match_id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  red_player_id INT NOT NULL,
  black_player_id INT NOT NULL,
  winner_id INT,
  result VARCHAR(20),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  FOREIGN KEY (red_player_id) REFERENCES users(user_id),
  FOREIGN KEY (black_player_id) REFERENCES users(user_id),
  FOREIGN KEY (winner_id) REFERENCES users(user_id),
  INDEX idx_room (room_id),
  INDEX idx_red_player (red_player_id),
  INDEX idx_black_player (black_player_id),
  INDEX idx_winner (winner_id)
);

-- Update rooms table to add match_id foreign key
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_match 
  FOREIGN KEY (match_id) REFERENCES matches(match_id);

-- Create moves table
CREATE TABLE IF NOT EXISTS moves (
  move_id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  turn_number INT NOT NULL,
  player_id INT NOT NULL,
  from_pos VARCHAR(10),
  to_pos VARCHAR(10),
  move_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(match_id),
  FOREIGN KEY (player_id) REFERENCES users(user_id),
  INDEX idx_match (match_id),
  INDEX idx_player (player_id),
  INDEX idx_turn (turn_number)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  FOREIGN KEY (sender_id) REFERENCES users(user_id),
  INDEX idx_room (room_id),
  INDEX idx_sender (sender_id),
  INDEX idx_sent_at (sent_at)
);

-- Add indexes for better query performance
CREATE INDEX idx_matches_created ON matches(created_at);
CREATE INDEX idx_moves_created ON moves(move_time);
CREATE INDEX idx_messages_created ON messages(sent_at);
