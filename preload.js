const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onShowNote: (callback) => ipcRenderer.on('show-note', (_event, title, value) => callback(title, value)),
    getImagePath: (fileName) => ipcRenderer.sendSync('image-path', fileName)
})