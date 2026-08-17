import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration. These values identify this web app and may be
// safely included in the frontend. Keep service-account credentials private.
const firebaseConfig = {
  apiKey: "AIzaSyB3IUCjRlKOcqJCdIoJTw46cO6YYF1Bowg",
  authDomain: "barber-e699e.firebaseapp.com",
  projectId: "barber-e699e",
  storageBucket: "barber-e699e.firebasestorage.app",
  messagingSenderId: "686493631232",
  appId: "1:686493631232:web:c7f0c2e3cd972360bd29e5",
  measurementId: "G-8M2BN21PWW",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
