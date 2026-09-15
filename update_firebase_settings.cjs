const admin = require('firebase-admin');

async function run() {
  const app = admin.initializeApp();
  const { getFirestore } = require('firebase-admin/firestore');
  const db = getFirestore(app, 'ai-studio-doidasemeias-188c131d-cd27-4c00-a403-abcdaf5b141d');
  
  const settingsRef = db.collection('settings').doc('main_settings');
  const doc = await settingsRef.get();
  
  if (doc.exists) {
    await settingsRef.update({
      whatsappNumber: '5511989055683',
      whatsappDisplay: '(11) 98905-5683'
    });
    console.log('Firebase settings updated successfully!');
  } else {
    console.log('No settings doc found in Firebase yet.');
  }
}
run().catch(console.error);
