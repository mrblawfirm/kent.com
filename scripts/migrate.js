const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function createDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'mrb_law_firm'}`);
    console.log('✅ Database created successfully');
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'mrb_law_firm'}`);
    
    // Create appointments table
    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        practice_area ENUM(
          'corporate-law',
          'litigation', 
          'estate-planning',
          'real-estate',
          'family-law',
          'criminal-defense',
          'other'
        ) NOT NULL,
        preferred_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        consultation_type ENUM('in-person', 'video-call', 'phone-call') NOT NULL,
        case_description TEXT NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_date (preferred_date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createAppointmentsTable);
    console.log('✅ Appointments table created successfully');
    
    // Create practice_areas table for reference
    const createPracticeAreasTable = `
      CREATE TABLE IF NOT EXISTS practice_areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createPracticeAreasTable);
    console.log('✅ Practice areas table created successfully');
    
    // Create testimonials table
    const createTestimonialsTable = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        review TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTestimonialsTable);
    console.log('✅ Testimonials table created successfully');
    
    // Create admin users table (for future admin panel)
    const createAdminUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createAdminUsersTable);
    console.log('✅ Admin users table created successfully');
    
    console.log('🎉 All database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migrations
createDatabase().catch(console.error);