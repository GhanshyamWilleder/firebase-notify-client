/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// This a service worker file for receiving push notifitications.
// See `Access registration token section` @ https://firebase.google.com/docs/cloud-messaging/js/client#retrieve-the-current-registration-token

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js")
// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCRSGFUtB_6bB1WQSk004JAid9BeUMAdPc",
  authDomain: "pwa-notify-app-2bf7f.firebaseapp.com",
  projectId: "pwa-notify-app-2bf7f",
  storageBucket: "pwa-notify-app-2bf7f.appspot.com",
  messagingSenderId: "885090363123",
  appId: "1:885090363123:web:0525be549066ea4ec8f986",
  measurementId: "G-S0D8P091M5",
}

firebase.initializeApp(firebaseConfig)

class CustomPushEvent extends Event {
  constructor(data) {
    super("push")

    Object.assign(this, data)
    this.custom = true
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener("push", (e) => {
  // Skip if event is our own custom event
  if (e.custom) return

  // Kep old event data to override
  const oldData = e.data

  // Create a new event to dispatch, pull values from notification key and put it in data key,
  // and then remove notification key
  const newEvent = new CustomPushEvent({
    data: {
      ehheh: oldData.json(),
      json() {
        const newData = oldData.json()
        newData.data = {
          ...newData.data,
          ...newData.notification,
        }
        delete newData.notification
        return newData
      },
    },
    waitUntil: e.waitUntil.bind(e),
  })

  // Stop event propagation
  e.stopImmediatePropagation()

  // Dispatch the new wrapped event
  dispatchEvent(newEvent)
})

// Retrieve firebase messaging
firebase.messaging()

// // Handle incoming messages while the app is not in focus (i.e in the background, hidden behind other tabs, or completely closed).
// messaging.onBackgroundMessage(function (payload) {
//   console.log("Received background message ", payload)
//   // Customize notification here
//   const notificationTitle = payload.notification.title
//   const notificationOptions = {
//     body: payload.notification.body,
//   }

//   self.registration.showNotification(notificationTitle, notificationOptions)
// })

function onBackgroundMessage() {
  const messaging = firebase.messaging();

  // [START messaging_on_background_message]
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notification = payload.data;   //-----> here is custom
    if (!notification) {
      console.warn('[firebase-messaging-sw.js] Unknown notification on message ', payload);
      return
    }

    // Customize notification here
    const notificationOptions = {
      ...notification,
      icon: '/img/icons/favicon-32x32.png'
    };

    self.registration.showNotification(
      notification.title,
      notificationOptions);
  });
}

onBackgroundMessage();
