// Initialize Firebase using CDN ESM modules (no build tool required)
// If you later add specific products (Auth/Firestore/Storage), import them similarly.

// IMPORTANT: This file uses ESM in the browser. Ensure you load it with <script type="module">.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
// Example optional SDKs (uncomment as needed):
// import { getAuth } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
// import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
// import { getStorage } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCWsAQjAEL6ZCaabZKCx2X2zWkjdJAU_2c',
  authDomain: 'meig-35f38.firebaseapp.com',
  projectId: 'meig-35f38',
  storageBucket: 'meig-35f38.firebasestorage.app',
  messagingSenderId: '1086495475004',
  appId: '1:1086495475004:web:d34ba3fa397cc45b23ca39'
};

const app = initializeApp(firebaseConfig);

// Expose on window for quick debugging in DevTools
window.firebaseApp = app;

// If you plan to use a product, initialize it here and attach to window, e.g.:
// const auth = getAuth(app);
// window.firebaseAuth = auth;
// const db = getFirestore(app);
// window.firestore = db;
// const storage = getStorage(app);
// window.firebaseStorage = storage;

console.info('[Firebase] Initialized');
