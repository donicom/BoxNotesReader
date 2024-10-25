const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onShowNote: (callback) => ipcRenderer.on('show-note', (_event, title, value) => callback(title, value)),
    onBoxDir: (callback) => ipcRenderer.on('box-dir', (_event, tree) => callback(tree)),
    getImagePath: (fileName) => ipcRenderer.sendSync('image-path', fileName),
    openNote: (filepath) => ipcRenderer.sendSync('open-note', filepath),
    openPath: (dirpath) => ipcRenderer.sendSync('open-path', dirpath)
})