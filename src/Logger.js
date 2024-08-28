import React from "react"
import { useLogs } from "./LogContext"

const Logger = () => {
  const { logs } = useLogs()

  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "10px",
        right: "50px",
        backgroundColor: "black",
        color: "white",
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  )
}

export default Logger
