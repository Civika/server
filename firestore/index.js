// const firebase = require("firebase/app");
// require("firebase/firestore");
const admin = require("firebase-admin");
const serviceAccount = require("../civika-announcement-12bab31e8969.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// const firebaseConfig = {
//   apiKey: "AIzaSyAnTpcZepeOLS1kLUDo2NoXIPmfu3LyBF8",
//   authDomain: "civika-announcement.firebaseapp.com",
//   projectId: "civika-announcement",
//   storageBucket: "civika-announcement.appspot.com",
//   messagingSenderId: "926883263950",
//   appId: "1:926883263950:web:9b1f3e3d03982c130e679f",
// };

// firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

module.exports = db;
