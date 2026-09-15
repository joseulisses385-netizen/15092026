import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_SUPPLIERS, INITIAL_MANUFACTURERS } from './data/initialData';

async function seed() {
  console.log("Seeding data to actual DB...");

  // Clear products
  const productsSnap = await getDocs(collection(db, 'products'));
  for (const d of productsSnap.docs) {
    await deleteDoc(doc(db, 'products', d.id));
  }
  
  // Insert new products
  for (const p of INITIAL_PRODUCTS) {
    await setDoc(doc(db, 'products', p.id), p);
  }
  
  // Set settings
  await setDoc(doc(db, 'settings', 'main_settings'), INITIAL_SETTINGS);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
