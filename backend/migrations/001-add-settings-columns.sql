-- Migration: Add settings columns to user_profiles table
-- This migration adds support for brightness, volume, sound_enabled, and auto_play settings

USE xiangqi_game;

-- Method 1: For MySQL 8.0+, use IF NOT EXISTS
-- Uncomment the section below if your MySQL version supports it

/*
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS brightness INT DEFAULT 80,
ADD COLUMN IF NOT EXISTS volume INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS auto_play BOOLEAN DEFAULT TRUE;
*/

-- Method 2: For older MySQL versions (5.7 and below)
-- Run these commands one by one

-- Check if columns exist and add them individually
SET @dbname = DATABASE();
SET @tablename = 'user_profiles';

-- Add brightness column
SET @columnname = 'brightness';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE (table_name = @tablename) 
   AND (table_schema = @dbname) 
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " INT DEFAULT 80")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add volume column
SET @columnname = 'volume';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE (table_name = @tablename) 
   AND (table_schema = @dbname) 
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " INT DEFAULT 50")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add sound_enabled column
SET @columnname = 'sound_enabled';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE (table_name = @tablename) 
   AND (table_schema = @dbname) 
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " BOOLEAN DEFAULT TRUE")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add auto_play column
SET @columnname = 'auto_play';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE (table_name = @tablename) 
   AND (table_schema = @dbname) 
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " BOOLEAN DEFAULT TRUE")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the columns were added
SELECT 'Checking columns...' as status;
SHOW COLUMNS FROM user_profiles WHERE Field IN ('brightness', 'volume', 'sound_enabled', 'auto_play');
