// Add this script tag in your HTML before firebase-config.js:
// <script src="firebase-app.js"></script>

// Loads Firebase JS SDKs from CDN
const scriptApp = document.createElement('script');
scriptApp.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
document.head.appendChild(scriptApp);

const scriptAuth = document.createElement('script');
scriptAuth.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
document.head.appendChild(scriptAuth);

const scriptFirestore = document.createElement('script');
scriptFirestore.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';
document.head.appendChild(scriptFirestore);

const scriptStorage = document.createElement('script');
scriptStorage.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js';
document.head.appendChild(scriptStorage); 