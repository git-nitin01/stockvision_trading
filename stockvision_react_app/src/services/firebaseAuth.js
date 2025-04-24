import { setUser, removeUser, setLoading } from '../store/slices/authSlice';
import { closeAuth } from '../store/slices/popperSlice';
import { store } from '../store/index'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  FacebookAuthProvider
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase';

export const serializeUser = async (user) => {
  if (!user) return null;

  // Fetch the authentication token
  const token = await user.getIdToken(); // Fetch Firebase token

  // Extract timestamps
  const lastLoginAt = user.metadata?.lastLoginAt || null; // Last login timestamp
  const creationTime = user.metadata?.creationTime || null; // Account creation timestamp

  // Convert timestamps to numeric values for comparison
  const lastLoginTime = lastLoginAt ? new Date(lastLoginAt).getTime() : null;
  const creationTimestamp = creationTime ? new Date(creationTime).getTime() : null;

  // Determine if user is new based on first and last sign-in timestamps
  const isNewUser = lastLoginTime === creationTimestamp;

  return {
    user: {
      // Core user properties
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,

      // Authentication provider data (array of objects)
      providerData: user.providerData.map((provider) => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        photoURL: provider.photoURL,
      })),

      // Account metadata
      metadata: {
        creationTime: creationTime ? new Date(creationTimestamp).toISOString() : null, // When account was created
        lastSignInTime: lastLoginTime ? new Date(lastLoginTime).toISOString() : null, // Last sign-in time
        lastRefreshTime: user.metadata?.lastRefreshTime || null, // When auth state was last refreshed
      },

      // Tenant ID (for multi-tenant Firebase projects)
      tenantId: user.tenantId || null,

      // Custom claims (requires backend setup)
      customClaims: user.customClaims || null,

      // Check if the user is new
      isNewUser,
    },
    token, // Firebase authentication token
  };
};


export const authObserver = () => {
  store.dispatch(setLoading(true));
  onAuthStateChanged(firebaseAuth, async (user) => {
    if(user) {
      const token = user.stsTokenManager.accessToken;
      store.dispatch(setUser(await serializeUser(user)));
      store.dispatch(closeAuth());
    } else {
      store.dispatch(removeUser());
    }
    store.dispatch(setLoading(false));
  })
}

export const createUser = async (email, password) => {
  try{
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return {
      message: "User created successfully!",
      result
    };
  } catch(error) {
    throw error;
  }
}

export const login = async (email, password) => {
  try{
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return {
      message: "Successfully signed in!",
      result
    };
  } catch(error) {
    throw error;
  }
}

export const logout = async () => {
  try{
    await signOut(firebaseAuth);
    store.dispatch(removeUser());
    return "Successfully logged out!";
  } catch(error) {
    throw new Error(error);
  }
}

export const loginWithProvider = async (provider) => {
  try{
    let authProvider = null;
    if (provider === 'google') {
      authProvider = new GoogleAuthProvider();
    } else if (provider === 'fb') {
      authProvider = new FacebookAuthProvider();
      authProvider.addScope('email');
    }
    const result = await signInWithPopup(firebaseAuth, authProvider);
    return {
      message: `Successfully signed in using ${provider.toUpperCase()}`,
      result
    };;
  }catch(error){
    throw new Error(error);
  }
}

export const resetPassword = async (email) => {
  try{
    await sendPasswordResetEmail(firebaseAuth, email);
    return "Reset email sent!";
  } catch(error) {
    throw new Error(error);
  }
}