import React, { useState, useEffect } from "react"
import { requestForToken, onMessageListener } from "./firebase"
import { toast } from "react-toastify"

const Notification = () => {
  const [notification, setNotification] = useState({ title: "", body: "" })
  const notify = () => toast(<ToastDisplay />)

  function ToastDisplay() {
    return (
      <div>
        <p>
          <b>{notification?.title}</b>
        </p>
        <p>{notification?.body}</p>
      </div>
    )
  }

  useEffect(() => {
    if (notification?.title) {
      notify()
    }
  }, [notification])

  requestForToken()

  onMessageListener()
    .then((payload) => {
      console.log("payload: ", payload)
      setNotification({
        title: payload?.title,
        body: payload?.body,
      })
    })
    .catch((err) => console.log("failed: ", err))
}

export default Notification
