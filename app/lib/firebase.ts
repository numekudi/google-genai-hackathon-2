import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase config or use environment variables
console.log(import.meta.env);
const firebaseConfig = JSON.parse(import.meta.env.FIREBASE_WEBAPP_CONFIG);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
