import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXm6fpOSP9c0vYs5BzEpS8TbJCgJuW5_Q",
  authDomain: "chat-9f009.firebaseapp.com",
  projectId: "chat-9f009",
  storageBucket: "chat-9f009.firebasestorage.app",
  messagingSenderId: "1013977913663",
  appId: "1:1013977913663:web:24143d12438dcd14ab1b8a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)


