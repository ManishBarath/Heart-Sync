// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Platform } from "react-native";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import * as firebaseAuth from "firebase/auth";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore , collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDERID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};
    const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth: firebaseAuth.Auth;

if (Platform.OS === 'web') {
  auth = firebaseAuth.getAuth(app); // use default auth for web
} else {
  auth = firebaseAuth.initializeAuth(app, {
    persistence: reactNativePersistence(AsyncStorage),
  });
}

export const db = getFirestore(app);
const storage = getStorage(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');

export { auth , storage};