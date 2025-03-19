import {initializeApp} from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBYLSD8fmnKvekAWbivkZhNIimSY5ztswk",
    authDomain: "canfindlah.firebaseapp.com",
    projectId: "canfindlah",
    storageBucket: "canfindlah.firebasestorage.app",
    messagingSenderId: "775402169315",
    appId: "1:775402169315:web:9c487c5f902189408a36d6",
    measurementId: "G-2TSPPQKYFQ",
    storageBucket: "canfindlah.firebasestorage.app"
  };

const firebaseApp = initializeApp(firebaseConfig);

const storageahh = getStorage(firebaseApp);

export default firebaseApp;
export const storage = storageahh