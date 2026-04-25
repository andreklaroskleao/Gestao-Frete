import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASay7R8Zv0RfIjyNk8IX1WCFcqHXVQ27s",
  authDomain: "gestao-frete-4eb08.firebaseapp.com",
  projectId: "gestao-frete-4eb08",
  storageBucket: "gestao-frete-4eb08.firebasestorage.app",
  messagingSenderId: "509337140725",
  appId: "1:509337140725:web:fb4e6bcec1812a7f0df4bc",
  measurementId: "G-Y0GR98M29D"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;