import {initializeApp} from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyATE_rjRJ-PE_myx4_LOtCIpVvlurEV1Sw",
    authDomain: "canfindlah-29ea7.firebaseapp.com",
    projectId: "canfindlah-29ea7",
    storageBucket: "canfindlah-29ea7.firebasestorage.app",
    messagingSenderId: "526891168576",
    appId: "1:526891168576:web:caccd44466e2f0366a80a5",
    measurementId: "G-8HPPLNGZQ6"
  };
  

const firebaseApp = initializeApp(firebaseConfig);

const storageahh = getStorage(firebaseApp);

export default firebaseApp;
export const storage = storageahh