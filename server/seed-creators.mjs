import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read creators from JSON
const creatorsPath = join(__dirname, 'data', 'creators.json');
const creatorsData = JSON.parse(readFileSync(creatorsPath, 'utf-8'));

async function seedCreators() {
  console.log('Starting to seed creators...');
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Found' : 'NOT FOUND'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const creator of creatorsData) {
      try {
        console.log(`\nSeeding creator: ${creator.name} (${creator.displayName})`);
        
        // 1. Create user account
        const [userResult] = await connection.execute(
          `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
           VALUES (?, ?, ?, 'seeded', 'user', NOW(), NOW(), NOW())`,
          [`creator-${creator.slug}`, creator.name, `${creator.slug}@creator.example.com`]
        );
        
        const userId = userResult.insertId;
        console.log(`  ✓ Created user (ID: ${userId})`);
        
        // 2. Create creator profile
        const socialLinks = creator.socialLinks || {};
        await connection.execute(
          `INSERT INTO creator_profiles (userId, bio, profilePhoto, category, twitterHandle, instagramHandle, youtubeChannel, website, followerCount, totalBookings, featured, verified, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())`,
          [
            userId,
            creator.bio,
            creator.photo,
            creator.category,
            socialLinks.twitter || null,
            socialLinks.instagram || null,
            socialLinks.youtube || null,
            socialLinks.website || socialLinks.portfolio || null,
            creator.followers,
            creator.servicesSold
          ]
        );
        console.log(`  ✓ Created creator profile`);
        
        // 3. Create creator token/currency
        await connection.execute(
          `INSERT INTO creator_tokens (creatorId, tokenName, tokenSymbol, initialPrice, currentPrice, totalSupply, circulatingSupply, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, 1000000, ?, NOW(), NOW())`,
          [
            userId,
            creator.currencyName,
            creator.currencySymbol,
            creator.currencyPrice,
            creator.currencyPrice,
            creator.customersCount * 50
          ]
        );
        console.log(`  ✓ Created currency: ${creator.currencySymbol} ($${creator.currencyPrice})`);
        
        // 4. Create services
        for (const service of creator.services) {
          await connection.execute(
            `INSERT INTO services (creatorId, title, description, tokenPrice, duration, availability, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 60, ?, 1, NOW(), NOW())`,
            [
              userId,
              service.title,
              service.description,
              service.price,
              service.availability
            ]
          );
        }
        console.log(`  ✓ Created ${creator.services.length} services`);
        
        console.log(`✅ Successfully seeded ${creator.displayName}`);
      } catch (error) {
        console.error(`❌ Error seeding ${creator.name}:`, error.message);
      }
    }
    
    console.log('\n✅ Seeding complete!');
    console.log(`Total creators seeded: ${creatorsData.length}`);
  } finally {
    await connection.end();
  }
  
  process.exit(0);
}

seedCreators().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
