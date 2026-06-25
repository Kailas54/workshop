import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let role = 'student'; // Default role
    if (email === 'admin@test.com') role = 'admin';
    if (email === 'mentor@test.com') role = 'mentor';

    // Create default profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      name: name || email.split('@')[0],
      role: role,
      progress: 'not_started',
      batch: 'Batch 1',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), userProfile);
    return { user, profile: userProfile };
  } catch (error) {
    throw error;
  }
};

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user profile to get role
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { user, profile: docSnap.data() };
    } else {
      // Fallback if document doesn't exist
      const profile = { uid: user.uid, role: 'student', name: email.split('@')[0] };
      return { user, profile };
    }
  } catch (error) {
    throw error;
  }
};

export const logOut = async () => {
  return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        callback({ user, profile: docSnap.data() });
      } else {
        callback({ user, profile: { uid: user.uid, role: 'student', name: user.email.split('@')[0] } });
      }
    } else {
      callback(null);
    }
  });
};
