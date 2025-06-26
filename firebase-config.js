// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyByIW1_HX_YpnXexAYgdQu7lcVrbumdHbY",
  authDomain: "cursor-rosroc.firebaseapp.com",
  projectId: "cursor-rosroc",
  storageBucket: "cursor-rosroc.appspot.com",
  messagingSenderId: "43003673592",
  appId: "1:43003673592:web:placeholderappid"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth(); 