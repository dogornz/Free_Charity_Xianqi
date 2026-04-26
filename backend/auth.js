import express from "express";
import jwt from "jsonwebtoken";
import userDAO from "./userDAO.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your_secret_key_change_in_production";

/**
 * Middleware to verify JWT token
 */
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const exists = await userDAO.userExists(username, email);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Create user
    const result = await userDAO.createUser(
      username,
      email,
      password,
      fullName,
    );

    console.log("Registration successful:", result);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user_id: result.user_id,
      username: result.username,
      email: result.email,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, password",
      });
    }

    // Login
    const result = await userDAO.loginUser(username, password);

    // Generate JWT token
    const token = jwt.sign({ userId: result.user.user_id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token: token,
      user: result.user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /auth/user
 * Get current user data
 */
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await userDAO.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const result = await userDAO.updateUserProfile(req.userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const user = await userDAO.getUserById(req.userId);
    res.status(200).json({
      success: true,
      user: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /auth/brightness
 * Update brightness setting
 */
router.put("/brightness", verifyToken, async (req, res) => {
  try {
    const { brightness } = req.body;

    if (brightness === undefined || brightness < 0 || brightness > 100) {
      return res.status(400).json({
        success: false,
        message: "Brightness must be between 0 and 100",
      });
    }

    const result = await userDAO.updateBrightness(req.userId, brightness);

    res.status(200).json(result);
  } catch (error) {
    console.error("Update brightness error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /auth/sound
 * Update sound settings
 */
router.put("/sound", verifyToken, async (req, res) => {
  try {
    const { soundEnabled, volume } = req.body;

    if (volume === undefined || volume < 0 || volume > 100) {
      return res.status(400).json({
        success: false,
        message: "Volume must be between 0 and 100",
      });
    }

    const result = await userDAO.updateSoundSettings(
      req.userId,
      soundEnabled,
      volume,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Update sound error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /auth/leaderboard
 * Get leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;

    const players = await userDAO.getLeaderboard(limit, offset);

    res.status(200).json({
      success: true,
      players: players,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (client-side token deletion)
 */
router.post("/logout", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export { router, verifyToken };
