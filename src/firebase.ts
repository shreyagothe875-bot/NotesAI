import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKn0Okzge1fN_biIvy9FY2ySZ6EOMNqow",
  authDomain: "notesai-d2a14.firebaseapp.com",
  projectId: "notesai-d2a14",
  storageBucket: "notesai-d2a14.firebasestorage.app",
  messagingSenderId: "74886153313",
  appId: "1:74886153313:web:cbcdcde19bf67fc50b1620",
  measurementId: "G-3PFREHXW4Z"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Authentication and export it
export const auth = getAuth(firebaseApp);
export default firebaseApp;