// app/firebase/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe_7wc2EtMWDaGQlraWh78wb5AMNs08_k",
  authDomain: "form-builder-remix.firebaseapp.com",
  projectId: "form-builder-remix",
  storageBucket: "form-builder-remix.firebasestorage.app",
  messagingSenderId: "294371899235",
  appId: "1:294371899235:web:4847efd8204b486e864556",
  measurementId: "G-LHLCCDPWQV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
