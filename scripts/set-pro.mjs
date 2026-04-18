// Quick script to manually set a user to Pro status
// Usage: node scripts/set-pro.mjs <user-email-or-uid>

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load service account
const serviceAccountPath = resolve('C:/Users/Computer/Downloads/slidesource-4e55d-firebase-adminsdk-fbsvc-28e2775f2d.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
  // List all users in the collection
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty) {
    console.log('No users found in Firestore.');
    return;
  }

  console.log(`Found ${snapshot.size} user(s):\n`);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`  UID: ${doc.id}`);
    console.log(`  Email: ${data.email || 'N/A'}`);
    console.log(`  isPro: ${data.isPro}`);
    console.log(`  ---`);

    // Set all users to Pro (since you just paid)
    if (!data.isPro) {
      await db.collection('users').doc(doc.id).update({
        isPro: true,
        upgradedAt: new Date().toISOString(),
        manualUpgrade: true,
      });
      console.log(`  ✅ Updated ${data.email || doc.id} to Pro!`);
    } else {
      console.log(`  Already Pro.`);
    }
    console.log('');
  }
}

main().catch(console.error);
