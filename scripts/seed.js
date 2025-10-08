const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mrb_law_firm',
};

async function seedDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Seed practice areas
    const practiceAreas = [
      {
        slug: 'corporate-law',
        name: 'Corporate Law',
        description: 'Expert legal counsel for businesses of all sizes, from startups to established corporations.',
        icon: 'briefcase'
      },
      {
        slug: 'litigation',
        name: 'Litigation',
        description: 'Aggressive representation in court proceedings, with a track record of successful outcomes for our clients.',
        icon: 'scale'
      },
      {
        slug: 'estate-planning',
        name: 'Estate Planning',
        description: 'Comprehensive estate planning services to protect your assets and provide for your loved ones.',
        icon: 'document'
      },
      {
        slug: 'real-estate',
        name: 'Real Estate Law',
        description: 'Legal guidance for residential and commercial real estate transactions, development, and disputes.',
        icon: 'home'
      },
      {
        slug: 'family-law',
        name: 'Family Law',
        description: 'Compassionate representation for divorce, child custody, and other family legal matters.',
        icon: 'users'
      },
      {
        slug: 'criminal-defense',
        name: 'Criminal Defense',
        description: 'Strategic defense for individuals facing criminal charges, protecting your rights and freedom.',
        icon: 'shield'
      }
    ];
    
    for (const area of practiceAreas) {
      await connection.execute(
        `INSERT IGNORE INTO practice_areas (slug, name, description, icon) VALUES (?, ?, ?, ?)`,
        [area.slug, area.name, area.description, area.icon]
      );
    }
    console.log('✅ Practice areas seeded successfully');
    
    // Seed testimonials
    const testimonials = [
      {
        name: 'James Manayon',
        image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5373c3f8-62e8-484a-b65d-34b6bd3ac762.png',
        rating: 5,
        review: 'I recommend this law firm so approachable and so kind.'
      },
      {
        name: 'Blast Kasi',
        image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/afdcac29-51e5-4fd6-a864-93d24e2872e7.png',
        rating: 5,
        review: 'I suggest this firm, they give you good service.'
      },
      {
        name: 'Marlou Agadelo',
        image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7d2da713-75cd-4e8b-a5a3-e1a4041ee7a9.png',
        rating: 5,
        review: 'The staff is kind and approachable.'
      }
    ];
    
    for (const testimonial of testimonials) {
      await connection.execute(
        `INSERT IGNORE INTO testimonials (name, image_url, rating, review) VALUES (?, ?, ?, ?)`,
        [testimonial.name, testimonial.image_url, testimonial.rating, testimonial.review]
      );
    }
    console.log('✅ Testimonials seeded successfully');
    
    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(
      `INSERT IGNORE INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['admin', 'admin@mrblaw.com', hashedPassword, 'admin']
    );
    console.log('✅ Default admin user created (username: admin, password: admin123)');
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run seeding
seedDatabase().catch(console.error);