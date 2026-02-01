import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

/* ===========================
   EMAIL SIGNUP
=========================== */

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await sendEmailVerification(userCredential.user);

  return userCredential.user;
};

/* ===========================
   EMAIL LOGIN
=========================== */

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  if (!userCredential.user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your email before logging in.");
  }

  return userCredential.user;
};

/* ===========================
   GOOGLE LOGIN
=========================== */

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

/* ===========================
   LOGOUT
=========================== */

export const logoutUser = async () => {
  await signOut(auth);
};

/* ===========================
   PASSWORD RESET
=========================== */

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
