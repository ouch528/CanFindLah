// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyCk9coIXneZ3QnaHexlUBc-Op1s2-ZUJ6Q",
    authDomain: "canfindlah-test.firebaseapp.com",
    projectId: "canfindlah-test",
    storageBucket: "canfindlah-test.firebasestorage.app",
    messagingSenderId: "23605192075",
    appId: "1:23605192075:web:e223878baab9c409847b8e",
    measurementId: "G-XTS62G4PD7"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

export { db, storage }
