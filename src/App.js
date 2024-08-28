import React, { useState, useCallback, useEffect } from "react"
import "./App.css"
import { ToastContainer, Zoom } from "react-toastify"
import Notification from "./firebaseNotifications/Notification"

const API_URL = "http://localhost:8000"

function App() {
  const [notificationCount, setNotificationCount] = useState(0)

  const updateNotificationCount = useCallback(() => {
    setNotificationCount((prevCount) => {
      const newCount = prevCount + 1
      console.log("Updating notification count to:", newCount) // Logging the count
      setAppBadge(newCount)
      return newCount
    })
  }, [])

  const resetNotificationCount = useCallback(() => {
    console.log("Resetting notification count") // Logging reset action
    setNotificationCount(0)
    clearAppBadge()
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "resetNotificationCount",
      })
    }
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

  useEffect(() => {
    let messageHandler

    messageHandler = (event) => {
      console.log("Message received from service worker:", event)
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
        resetNotificationCount()
      }
    })

    // Cleanup function to remove the event listener
    return () => {
      if (messageHandler) {
        navigator.serviceWorker.removeEventListener("message", messageHandler)
      }
    }
  }, [updateNotificationCount, resetNotificationCount])

  const sendNotification = async () => {
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

  return (
    <div className="App">
      <ToastContainer
        position="bottom-center"
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
      <Notification />
      <button id="subscribe" onClick={sendNotification}>
        Send
      </button>
      
      {notificationCount > 0 && (
        <div className="notification-badge">{notificationCount}</div>
      )}
    </div>
  )
}

export default App
