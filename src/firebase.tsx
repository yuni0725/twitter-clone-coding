import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPB83Pl8-qzRhsBh2bvNmKmljP-fR2Tc8",
  authDomain: "twitter-clone-a0003.firebaseapp.com",
  projectId: "twitter-clone-a0003",
  storageBucket: "twitter-clone-a0003.appspot.com",
  messagingSenderId: "744599540958",
  appId: "1:744599540958:web:cad6bd1e402ba4b33e1e4f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
