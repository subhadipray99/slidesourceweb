import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Phototidy License Key Importer
 * 
 * Usage:
 * 1. Add your keys to the `keysToAdd` array below.
 * 2. Run: node scripts/add-phototidy-keys.js
 */

// Load service account (using the same path as your other scripts)
const serviceAccountPath = resolve('C:/Users/Computer/Downloads/slidesource-4e55d-firebase-adminsdk-fbsvc-28e2775f2d.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// --- EDIT THESE KEYS ---
const keysToAdd = [
  "K7KE-RN8Q-GGQR",
  "R9L2-XP5M-TJ7V",
  "K7KE-RN8Q-GGQR",
  "M2N5-JL6V-WX3C"
];
// -----------------------

async function main() {
  console.log(`🚀 Starting Phototidy key import (${keysToAdd.length} keys)...`);

  const batch = db.batch();
  let count = 0;

  for (const key of keysToAdd) {
    const docRef = db.collection('phototidy_keys').doc(key);

    // Check if key already exists to avoid duplicates
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`  ⚠️ Skipping ${key} (already in database)`);
      continue;
    }

    batch.set(docRef, {
      key: key,
      status: "available",
      createdAt: new Date().toISOString(),
      ownerUid: null,
      ownerEmail: null,
      activatedAt: null,
    });
    count++;
  }

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Successfully added ${count} new keys to the inventory.`);
  } else {
    console.log("ℹ️ No new keys added.");
  }
}

main().catch(console.error);
