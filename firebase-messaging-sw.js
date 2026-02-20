importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBmbAg30WzmoSpSn8WW70TkWHJkIKqdayjo",
  authDomain: "my-chat-33ec0.firebaseapp.com",
  projectId: "my-chat-33ec0",
  storageBucket: "my-chat-33ec0.firebasestorage.app",
  messagingSenderId: "811904126379",
  appId: "1:811904126379:web:66f0f1d33fe210983296ee"
});

const messaging = firebase.messaging();

// 🔔 Background notifications (when app is closed/minimized)
messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/192.png",
    badge: "/192.png"
  });
});