import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mrb_law_firm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute query function
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get single row
export async function queryRow(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    const rows = results as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get multiple rows
export async function queryRows(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results as any[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Close pool (for graceful shutdown)
export async function closePool() {
  await pool.end();
}

export default pool;