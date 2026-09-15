import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { collection, doc, getDocs, setDoc, getDoc, deleteDoc };
