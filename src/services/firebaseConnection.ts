
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyChTq0FNaNhL8aLqHzWd1Gj77pXwoiRw_s",
    authDomain: "tarefasauth.firebaseapp.com",
    projectId: "tarefasauth",
    storageBucket: "tarefasauth.appspot.com",
    messagingSenderId: "156439790135",
    appId: "1:156439790135:web:399d4b8ae37e6b7d20b5b2",
    measurementId: "G-C8YPHWT20B"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseapp);

export {db};
