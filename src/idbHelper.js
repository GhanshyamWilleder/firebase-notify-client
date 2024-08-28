// idbHelper.js
export const idbKeyval = {
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
      }
    })
  },
}
