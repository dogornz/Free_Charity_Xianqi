import { getConnection } from "./database.js";
import bcrypt from "bcrypt";

class UserDAO {
  /**
   * Create a new user account
   */
  async createUser(username, email, password, fullName = "") {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const [userResult] = await connection.execute(
        `INSERT INTO users (username, email, password_hash) 
         VALUES (?, ?, ?)`,
        [username, email, passwordHash],
      );

      const userId = userResult.insertId;

      // Create user profile with defaults
      await connection.execute(
        `INSERT INTO user_profiles (user_id, full_name, rank_points) 
         VALUES (?, ?, 500)`,
        [userId, fullName || username],
      );

      await connection.commit();

      return {
        success: true,
        user_id: userId,
        username: username,
        email: email,
        message: "User created successfully",
      };
    } catch (error) {
      await connection.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("username")) {
          throw new Error("Username already exists");
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists");
        }
      }
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Login user
   */
  async loginUser(username, password) {
    const connection = await getConnection();
    try {
      const [users] = await connection.execute(
        `SELECT u.user_id, u.username, u.email, u.password_hash, 
                p.full_name, p.avatar_url, p.rank_points, p.wins, p.losses, 
                p.draws
         FROM users u 
         LEFT JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.username = ? OR u.email = ?`,
        [username, username],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const user = users[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new Error("Incorrect password");
      }

      // Return user data without password
      const { password_hash, ...userDataWithoutPassword } = user;
      return {
        success: true,
        user: userDataWithoutPassword,
      };
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Get user by ID with profile
   */
  async getUserById(userId) {
    const connection = await getConnection();
    try {
      const [users] = await connection.execute(
        `SELECT u.user_id, u.username, u.email, u.created_at,
                p.profile_id, p.full_name, p.avatar_url,
                p.rank_points, p.wins, p.losses, p.draws
         FROM users u
         LEFT JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.user_id = ?`,
        [userId],
      );

      if (users.length === 0) {
        return null;
      }

      // Add default brightness
      const user = users[0];
      user.brightness = 50;
      return user;
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    const connection = await getConnection();
    try {
      const allowedFields = [
        "full_name",
        "avatar_url",
        "rank_points",
        "wins",
        "losses",
        "draws",
        "brightness",
        "sound_enabled",
        "volume",
      ];

      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(profileData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        return { success: false, message: "No valid fields to update" };
      }

      values.push(userId);

      await connection.execute(
        `UPDATE user_profiles SET ${updates.join(", ")} WHERE user_id = ?`,
        values,
      );

      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Update user brightness setting
   */
  async updateBrightness(userId, brightness) {
    return this.updateUserProfile(userId, { brightness });
  }

  /**
   * Update user sound settings
   */
  async updateSoundSettings(userId, soundEnabled, volume) {
    return this.updateUserProfile(userId, {
      sound_enabled: soundEnabled,
      volume: volume,
    });
  }

  /**
   * Get user stats
   */
  async getUserStats(userId) {
    const connection = await getConnection();
    try {
      const [stats] = await connection.execute(
        `SELECT rank_points, wins, losses, draws 
         FROM user_profiles WHERE user_id = ?`,
        [userId],
      );

      return stats.length > 0 ? stats[0] : null;
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Update game stats after a game
   */
  async updateGameStats(userId, result) {
    // result: 'win', 'loss', or 'draw'
    const connection = await getConnection();
    try {
      let updateQuery = "";
      let pointsGain = 0;

      switch (result.toLowerCase()) {
        case "win":
          updateQuery = "wins = wins + 1, points = points + 10";
          pointsGain = 10;
          break;
        case "loss":
          updateQuery = "losses = losses + 1, points = MAX(0, points - 5)";
          break;
        case "draw":
          updateQuery = "draws = draws + 1, points = points + 5";
          pointsGain = 5;
          break;
      }

      await connection.execute(
        `UPDATE user_profiles SET ${updateQuery} WHERE user_id = ?`,
        [userId],
      );

      return { success: true, pointsGain };
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Get top players leaderboard
   */
  async getLeaderboard(limit = 10, offset = 0) {
    const connection = await getConnection();
    try {
      const [players] = await connection.execute(
        `SELECT u.user_id, u.username, p.full_name, p.avatar_url, 
                p.rank_points, p.wins, p.losses, p.draws
         FROM users u
         LEFT JOIN user_profiles p ON u.user_id = p.user_id
         WHERE u.status = 'active'
         ORDER BY p.rank_points DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      return players;
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }

  /**
   * Check if user exists
   */
  async userExists(username, email) {
    const connection = await getConnection();
    try {
      const [users] = await connection.execute(
        `SELECT user_id FROM users WHERE username = ? OR email = ?`,
        [username, email],
      );

      return users.length > 0;
    } catch (error) {
      throw error;
    } finally {
      await connection.release();
    }
  }
}

export default new UserDAO();
