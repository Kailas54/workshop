import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArwDK5_QSPQyZWzoQ2sFvcHGiPhj-P8QA",
  authDomain: "workshop-cf714.firebaseapp.com",
  projectId: "workshop-cf714",
  storageBucket: "workshop-cf714.firebasestorage.app",
  messagingSenderId: "444836613052",
  appId: "1:444836613052:web:a664ba94b5468c14b839b9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
