import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

async function run() {
  const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(cfg);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'products'));
  console.log(snap.docs.map(d => d.data().name));
  process.exit(0);
}
run();
