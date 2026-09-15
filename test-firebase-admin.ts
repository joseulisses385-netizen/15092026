import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function test() {
  const app = initializeApp();
  const db = getFirestore(app, 'ai-studio-doidasemeias-188c131d-cd27-4c00-a403-abcdaf5b141d');
  await db.collection('test').doc('ping').set({ ts: new Date().toISOString() });
  const doc = await db.collection('test').doc('ping').get();
  console.log('Admin SDK works! Value:', doc.data());
}

test().catch(console.error);
