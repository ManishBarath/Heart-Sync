import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Define the shape of your user profile (Firestore user)
export interface UserProfile {
  username?: string;
  userId: string;
  gender?: string;
  email?: string;
  uid?: string; // for compatibility
  [key: string]: any;
}

// Auth context type
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean | undefined;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: any; msg?: string }>;
  logout: () => Promise<{ success: boolean; msg?: string }>;
  register: (
    email: string,
    password: string,
    username: string,
    gender: string
  ) => Promise<{ success: boolean; data?: any; msg?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<
    boolean | undefined
  >(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          userId: firebaseUser.uid,
          email: firebaseUser.email ?? undefined,
          uid: firebaseUser.uid,
        });
        setIsAuthenticated(true);
        updateUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUser((prev) => ({
        ...prev!,
        ...userData,
        userId: userData.userId || userId,
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, data: response.user };
    } catch (error: any) {
      let msg = error.message;
      switch (error.code) {
        case "auth/user-not-found":
          msg = "No user found with this email.";
          break;
        case "auth/wrong-password":
          msg = "Incorrect password.";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format.";
          break;
        case "auth/invalid-credential":
          msg = "Invalid credentials. Please check your email and password.";
          break;
      }
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    gender: string
  ) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", response.user.uid), {
        username,
        gender,
        userId: response.user.uid,
        email,
      });
      return { success: true, data: response.user };
    } catch (error: any) {
      let msg = error.message;
      switch (error.code) {
        case "auth/email-already-in-use":
          msg = "Email already in use. Please try another email.";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format. Please enter a valid email.";
          break;
        case "auth/weak-password":
          msg = "Weak password. Please choose a stronger password.";
          break;
      }
      return { success: false, msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
