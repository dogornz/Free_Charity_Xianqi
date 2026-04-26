import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuration for XAMPP
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "xiangqi_game",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  charset: "utf8mb4",
  multipleStatements: false,
};

console.log("🔌 Database Config (XAMPP):");
console.log(`   Host: ${poolConfig.host}`);
console.log(`   Port: ${poolConfig.port}`);
console.log(`   User: ${poolConfig.user}`);
console.log(`   Database: ${poolConfig.database}`);

// Create connection pool
let pool;
try {
  pool = mysql.createPool(poolConfig);
  console.log("✅ Connection pool created");
} catch (error) {
  console.error("❌ Failed to create connection pool:", error.message);
  process.exit(1);
}

/**
 * Test connection to existing database (no table creation)
 */
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Test connection
    await connection.execute("SELECT 1");
    console.log("✅ Connected to database successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Get database pool
 */
function getPool() {
  return pool;
}

/**
 * Get a connection from the pool
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Close all connections
 */
async function closePool() {
  await pool.end();
}

export { initializeDatabase, getPool, getConnection, closePool };
