/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
// import { idbKeyval } from "../src/idbHelper.js" // Adjust the path if necessary
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js")

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

const idbKeyval = {
  get(key) {
    return new Promise((resolve) => {
      const openRequest = indexedDB.open("my-database", 1)
      openRequest.onupgradeneeded = () => {
        openRequest.result.createObjectStore("keyval")
      }
      openRequest.onsuccess = () => {
        const db = openRequest.result
        const tx = db.transaction("keyval", "readonly")
        const store = tx.objectStore("keyval")
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
      }
    })
  },
  set(key, value) {
    return new Promise((resolve) => {
      const openRequest = indexedDB.open("my-database", 1)
      openRequest.onupgradeneeded = () => {
        openRequest.result.createObjectStore("keyval")
      }
      openRequest.onsuccess = () => {
        const db = openRequest.result
        const tx = db.transaction("keyval", "readwrite")
        const store = tx.objectStore("keyval")
        store.put(value, key)
        tx.oncomplete = () => resolve()

        // Notify all clients of the change
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "notificationCountUpdated",
              notificationCount: value,
            })
          })
        })
      }
    })
  },
}

const updateNotificationCount = async () => {
  let count = parseInt(await idbKeyval.get("notificationCount")) || 0
  count += 1
  await idbKeyval.set("notificationCount", count)
  return count
}

const messaging = firebase.messaging()

messaging.onBackgroundMessage(async (payload) => {
  const notification = payload.data
  if (!notification) {
    console.warn(
      "[firebase-messaging-sw.js] Unknown notification on message ",
      payload
    )
    return
  }

  const notificationOptions = {
    ...notification,
    icon: "/img/icons/favicon-32x32.png",
  }

  // Update the notification count in IndexedDB
   await updateNotificationCount()
  // console.log(
  //   "[firebase-messaging-sw.js] Updated notification count to",
  //   newCount
  // )

  self.registration.showNotification(notification.title, notificationOptions)
})
