import React, { createContext, useContext, useState } from "react"

const LogContext = createContext()

export const useLogs = () => useContext(LogContext)

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message])
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  )
}
