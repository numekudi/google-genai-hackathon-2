import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = JSON.parse(import.meta.env.FIREBASE_WEBAPP_CONFIG);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
