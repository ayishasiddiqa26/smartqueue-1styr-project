// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDWMkflOSHDnj5nOOd54YQarrYCyvCDKkw",
//   authDomain: "smartqueue-e53e2.firebaseapp.com",
//   projectId: "smartqueue-e53e2",
//   storageBucket: "smartqueue-e53e2.firebasestorage.app",
//   messagingSenderId: "1099456626468",
//   appId: "1:1099456626468:web:dadb8349cb2f2cdc3ffdb1"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Placeholder Firebase configuration for GitHub
// Replace with your actual config when deploying
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
