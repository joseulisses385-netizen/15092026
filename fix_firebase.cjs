const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');
code = code.replace(
  "import { getFirestore, collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';",
  "import { getFirestore, collection, doc, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';"
);
code = code.replace(
  "export { collection, doc, getDocs, setDoc, getDoc };",
  "export { collection, doc, getDocs, setDoc, getDoc, deleteDoc };"
);
fs.writeFileSync('src/firebase.ts', code);
