/* eslint-disable react-hooks/exhaustive-deps */
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { useLogs } from "../LogContext"
import { useEffect, useCallback } from "react"

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

export function Firebase() {
  const { addLog } = useLogs()

  const requestPermissionLoop = useCallback(() => {
    const askPermission = () =>
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            addLog("Notification permission granted.")
            //check if the service worker is available
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then(() => {
                requestForToken()
              })
            } else {
              addLog("Service worker not available.")
            }
          } else {
            addLog("Notification permission denied. Asking again...")
          }
        })
        .catch((err) => {
          addLog(`Error requesting notification permission: ${err}`)
        })

    askPermission()
  }, [addLog])

  const requestForToken = useCallback(() => {
    getToken(messaging, {
      vapidKey:
        "BMXhYpt6oZ88Vme5Xo0CyrzpJeSr8RzEQR1EQW5Dq3he-KKFt2yczUTT7-D_VX5p7p5mWAVSN6-dte3vOpk9wvs",
    })
      .then((currentToken) => {
        if (currentToken) {
          console.log("current token for client: ", currentToken)
          addLog("current token for client: " + currentToken)

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
          addLog("No registration token available.")
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err)
        addLog("An error occurred while retrieving token: " + err.message)
      })
  }, [addLog])

  useEffect(() => {
    addLog("Firebase initialized")
    requestPermissionLoop()
  }, [])

  const onMessageListener = () =>
    new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload?.data)
      })
    })

  return { requestForToken, onMessageListener }
}
