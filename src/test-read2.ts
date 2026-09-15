import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const snap = await getDocs(collection(db, 'products'));
  console.log(snap.docs.map(d => d.data().name));
  process.exit(0);
}
run();
