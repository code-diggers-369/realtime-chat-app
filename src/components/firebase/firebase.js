import firebase from "firebase";

var firebaseConfig = {
  ///// paste your firebase config here
};

firebase.initializeApp(firebaseConfig);

export const f = firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
