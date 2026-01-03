// Simple Admin Setup Script
// Run with: node setup-admin-simple.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Read the service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const USERS = [
  { email: 'admin@firepowersfx.com', password: 'Admin@123456', role: 'admin', name: 'Admin User' },
  { email: 'owner@firepowersfx.com', password: 'Owner@123456', role: 'owner', name: 'Owner User' }
];

async function setupUsers() {
  console.log('\n🚀 Starting Admin User Setup...\n');

  for (const userData of USERS) {
    try {
      console.log(`\n👤 Processing: ${userData.email}`);

      let user;
      try {
        // Try to get existing user
        user = await auth.getUserByEmail(userData.email);
        console.log(`   ✅ User exists in Authentication (UID: ${user.uid})`);
      } catch (error) {
        // User doesn't exist, create it
        console.log(`   📝 Creating user in Authentication...`);
        user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name
        });
        console.log(`   ✅ Created user (UID: ${user.uid})`);
        console.log(`   🔑 Password: ${userData.password}`);
      }

      // Set role in Firestore
      console.log(`   📝 Setting role in Firestore...`);
      await db.collection('user_roles').doc(user.uid).set({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`   ✅ Role set to: ${userData.role}`);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n✨ Setup Complete!\n');
  console.log('📋 Login Credentials:');
  console.log('━'.repeat(50));
  USERS.forEach(u => {
    console.log(`\n${u.name}:`);
    console.log(`   Email: ${u.email}`);
    console.log(`   Password: ${u.password}`);
    console.log(`   Role: ${u.role}`);
  });
  console.log('\n━'.repeat(50));
  console.log('\n💡 You can now sign in with these credentials!\n');

  process.exit(0);
}

setupUsers().catch(console.error);
