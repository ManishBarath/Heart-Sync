import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Define the shape of your user profile (Firestore user)
export interface UserProfile {
  username?: string;
  userId: string;
  gender?: string;
  email?: string;
  uid?: string; // for compatibility
  shortId?: string; 
  partnerName?:string;
  partnerId?:string;
  // NEW: The short, unique ID for connecting
  profileImageURL?: string; // Added for profile
  bio?: string; // Added for profile
  [key: string]: any;
}

// Auth context type
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean | undefined;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
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

// --- NEW HELPER FUNCTIONS ---

/**
 * Generates a random alphanumeric string of a given length.
 * @param {number} length The desired length of the ID.
 * @returns {string} A random string.
 */
const generateShortId = (length: number): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a unique short ID by generating and checking against the Firestore 'users' collection.
 * @returns {Promise<string>} A unique short ID.
 */
const createUniqueShortId = async (): Promise<string> => {
  let shortId;
  let isUnique = false;
  const usersCollectionRef = collection(db, "users");

  while (!isUnique) {
    // We'll use a 6-character ID. You can increase this for more users.
    shortId = generateShortId(6);
    const q = query(usersCollectionRef, where("shortId", "==", shortId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If the query result is empty, the ID is unique
      isUnique = true;
    }
    // If it's not unique, the loop will run again, generating a new ID
  }

  return shortId!; // We can use the non-null assertion because the loop guarantees it's assigned.
};

// --- END OF NEW HELPER FUNCTIONS ---

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
        // We set the basic user info here, then fetch the rest.
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
      const userData = docSnap.data() as UserProfile; // Cast to UserProfile
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
      // After login, user data will be updated by the onAuthStateChanged listener
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

      // NEW: Generate the unique short ID
      const shortId = await createUniqueShortId();

      // MODIFIED: Add the shortId to the user document
      await setDoc(doc(db, "users", response.user.uid), {
        username,
        gender,
        userId: response.user.uid,
        email,
        shortId, // Save the new short ID
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
      value={{ user, isAuthenticated, login, logout, register,setUser }}
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