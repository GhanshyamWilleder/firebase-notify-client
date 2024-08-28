// Firebase Cloud Messaging Configuration File.
// Read more at https://firebase.google.com/docs/cloud-messaging/js/client && https://firebase.google.com/docs/cloud-messaging/js/receive

import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyCRSGFUtB_6bB1WQSk004JAid9BeUMAdPc",
  authDomain: "pwa-notify-app-2bf7f.firebaseapp.com",
  projectId: "pwa-notify-app-2bf7f",
  storageBucket: "pwa-notify-app-2bf7f.appspot.com",
  messagingSenderId: "885090363123",
  appId: "1:885090363123:web:0525be549066ea4ec8f986",
  measurementId: "G-S0D8P091M5",
}

initializeApp(firebaseConfig)

const messaging = getMessaging()

export const requestForToken = () => {
  // The method getToken(): Promise<string> allows FCM to use the VAPID key credential
  // when sending message requests to different push services
  return getToken(messaging, {
    vapidKey: `BMXhYpt6oZ88Vme5Xo0CyrzpJeSr8RzEQR1EQW5Dq3he-KKFt2yczUTT7-D_VX5p7p5mWAVSN6-dte3vOpk9wvs`,
  }) //to authorize send requests to supported web push services
    .then((currentToken) => {
      if (currentToken) {
        //setting the token in the local storage
        console.log("current token for client: ", currentToken)

        if (
          localStorage.getItem("fcmToken") &&
          currentToken !== localStorage.getItem("fcmToken")
        ) {
          localStorage.setItem("fcmToken", currentToken)
        } else if (!localStorage.getItem("fcmToken")) {
          localStorage.setItem("fcmToken", currentToken)
        }
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        )
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err)
    })
}

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker `messaging.onBackgroundMessage` handler.
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload?.data)
    })
  })
