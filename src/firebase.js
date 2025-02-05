import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDZP3DVhQDvgCuRQyCss1r2C_Kr8DWdv2k",
  authDomain: "education-quiz-app.firebaseapp.com",
  projectId: "education-quiz-app",
  storageBucket: "education-quiz-app.firebasestorage.app",
  messagingSenderId: "1089349108787",
  appId: "1:1089349108787:web:87fb9cc2c1aff78da7cf46",
  databaseURL: "https://education-quiz-app-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);