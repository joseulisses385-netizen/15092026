const fs = require('fs');

const storePath = 'data/store.json';
if (fs.existsSync(storePath)) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  
  if (store.settings) {
    store.settings.whatsappNumber = '5511989055683';
    store.settings.whatsappDisplay = '(11) 98905-5683';
    store.settings.supportPhone = '(11) 97520-8196';
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  console.log("Updated store.json");
} else {
  console.log("store.json not found");
}
