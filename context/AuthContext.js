import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        UpdateUserData(user.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    }); 

    return () => unsubscribe();
  }, []);

  const UpdateUserData = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUser({
        ...user,
        username: userData.username,
        userId: userData.userId,
        gender: userData.gender});
    }
  }
  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, data: response.user };
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/user-not-found') {
        msg = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        msg = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Invalid email format.";
      }else if (error.code === 'auth/invalid-credential') {
        msg = "Invalid credentials. Please check your email and password.";
      }
      return { success: false, msg };
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  }

  const register = async (email, password, username, gender) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", response.user);

      await setDoc(doc(db, "users", response.user.uid), {
        username,
        gender,
        userId: response.user.uid,
        email
      });
      return { success: true, data: response.user }; 
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = "Email already in use. Please try another email.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Invalid email format. Please enter a valid email.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Weak password. Please choose a stronger password.";
      }
      return { success: false, msg };
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  ); 
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}