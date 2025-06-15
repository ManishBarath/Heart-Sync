// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth , getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore , collection } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvEe97DytfQWZf4zd_5YSmRFUmDmzrqRA",
  authDomain: "heartsync-400a1.firebaseapp.com",
  projectId: "heartsync-400a1",
  storageBucket: "heartsync-400a1.firebasestorage.app",
  messagingSenderId: "972029475900",
  appId: "1:972029475900:web:29ddb7e148cea8edba5739",
  measurementId: "G-8DVTR01NL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');

