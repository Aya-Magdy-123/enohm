import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6hvFamn9FQCBltXR9GT_Hx0F0tOmbp68",
  authDomain: "enohm-pow.firebaseapp.com",
  projectId: "enohm-pow",
  storageBucket: "enohm-pow.firebasestorage.app",
  messagingSenderId: "1022959574591",
  appId: "1:1022959574591:web:1a6d42ccc9ab2a9a98628a",
  measurementId: "G-KY51PZ48QD"
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);