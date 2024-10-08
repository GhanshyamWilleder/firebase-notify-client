import React, { useState, useCallback, useEffect } from "react"
import "./App.css"
import { ToastContainer, Zoom } from "react-toastify"
import NotificationBox from "./firebaseNotifications/NotificationBox"
import { LogProvider } from "./LogContext"
import Logger from "./Logger"
import { idbKeyval } from "./idbHelper" // Adjust the path if necessary

const API_URL = "https://firebase-notify-server.onrender.com"

function App() {
  const [notificationCount, setNotificationCount] = useState(0)

  const updateNotificationCount = useCallback(() => {
    setNotificationCount((prevCount) => {
      const newCount = prevCount + 1
      // console.log("Updating notification count to:", newCount)
      setAppBadge(newCount)
      return newCount
    })
  }, [])

  const resetNotificationCount = useCallback(() => {
    // console.log("Resetting notification count")
    setNotificationCount(0)
    clearAppBadge()
    idbKeyval.set("notificationCount", 0) // Reset in IndexedDB as well
  }, [])

  const setAppBadge = (count) => {
    if (navigator.setAppBadge) {
      navigator.setAppBadge(count).catch((error) => {
        console.error("Failed to set app badge:", error)
      })
    } else {
      console.warn("setAppBadge is not supported in this browser")
    }
  }

  const clearAppBadge = () => {
    if (navigator.clearAppBadge) {
      navigator.clearAppBadge().catch((error) => {
        console.error("Failed to clear app badge:", error)
      })
    } else {
      console.warn("clearAppBadge is not supported in this browser")
    }
  }

  const fetchNotificationCount = async () => {
    // console.log("Fetching notification count from IndexedDB")
    const count = await idbKeyval.get("notificationCount")
    if (count !== undefined) {
      setNotificationCount(count)
      setAppBadge(count)
    }
  }
  let timerId = setInterval(() => {
    fetchNotificationCount()
  }, 20000)

  useEffect(() => {
    // Retrieve notification count from IndexedDB on load
    const messageHandler = (event) => {
      // console.log("Message received from service worker:", event)
      if (event.data.notificationCount !== undefined) {
        setNotificationCount(event.data.notificationCount)
        setAppBadge(event.data.notificationCount)
      } else {
        updateNotificationCount()
      }
    }

    navigator.serviceWorker.addEventListener("message", messageHandler)

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          resetNotificationCount()
        }, 2000)
      }
    })

    return () => {
      navigator.serviceWorker.removeEventListener("message", messageHandler)
      clearInterval(timerId)
    }
  }, [timerId, updateNotificationCount, resetNotificationCount])

  const sendNotification = async () => {
    const result = await Notification.requestPermission()
    if (result === "denied") {
      console.error("The user explicitly denied the permission request.")
      return
    }
    if (result === "granted") {
      console.info("The user accepted the permission request.")
    }
    const registration = await navigator.serviceWorker.getRegistration()
    const subscribed = await registration.pushManager.getSubscription()
    if (subscribed) {
      console.info("User is already subscribed.")
      return
    }

    const tokenId = localStorage.getItem("fcmToken") || ""
    try {
      const response = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Hello from the client!",
          body: "This is a notification from the client.",
          tokenId: tokenId,
        }),
      })
      if (response.ok) {
        console.log("Notification sent successfully")
      } else {
        console.error("Failed to send notification")
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
    }
  }

  const subscribeNotification = async () => {
    const result = await Notification.requestPermission()
    if (result === "denied") {
      console.error("The user explicitly denied the permission request.")
      return
    }
    if (result === "granted") {
      console.info("The user accepted the permission request.")
    }
    const registration = await navigator.serviceWorker.getRegistration()
    const subscribed = await registration.pushManager.getSubscription()
    if (subscribed) {
      console.info("User is already subscribed.")
      return
    }
    const tokenId = localStorage.getItem("fcmToken") || ""
    try {
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId: tokenId,
        }),
      })
      if (response.ok) {
        console.log("Subscribed to notifications")
      } else {
        console.error("Failed to subscribe to notifications")
      }
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error)
    }
  }

  const unsubscribeNotification = async () => {
    const tokenId = localStorage.getItem("fcmToken") || ""
    try {
      const response = await fetch(`${API_URL}/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId: tokenId,
        }),
      })
      if (response.ok) {
        console.log("Unsubscribed from notifications")
      } else {
        console.error("Failed to unsubscribe from notifications")
      }
    } catch (error) {
      console.error("Failed to unsubscribe from notifications:", error)
    }
  }

  return (
    <LogProvider>
      <div className="App">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Zoom}
          closeButton={false}
        />
        <NotificationBox />
        <button id="subscribe" onClick={sendNotification}>
          Send
        </button>
        <div style={{ display: "flex" }}>
          <button id="subscribe" onClick={subscribeNotification}>
            subscribe
          </button>

          <button id="subscribe" onClick={unsubscribeNotification}>
            unsubscribe
          </button>
        </div>
        <Logger />
        {notificationCount > 0 && (
          <div className="notification-badge">{notificationCount}</div>
        )}
      </div>
    </LogProvider>
  )
}

export default App
