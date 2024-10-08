const { app, BrowserWindow, Menu, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');
const { dialog } = require('electron')
const trans = require('./translations/i18n');
require("electron-reload")(__dirname);
var notePath, noteName, i18n, titleText;

if (require('electron-squirrel-startup')) app.quit();

/**
 * Get image file path 
 */
ipcMain.on('image-path', (event, fileName) => {
  event.returnValue = path.join(notePath, "Box Notes Images", noteName + " Images", fileName);
})

const createWindow = () => {
  const mainWindow  = new BrowserWindow({
    width: 800,
    height: 600, 
    title: titleText,
    icon: './assets/icons/favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  const isMac = process.platform === 'darwin';

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: i18n.__('open-note'),
          click: async () => {
            let fileNote = dialog.showOpenDialogSync({
              properties: ['openFile'],
              filters: [
                { name: 'Box Notes', extensions: ['boxnote'] }
              ]
            })
            if(fileNote) {
              try {
                const data = fs.readFileSync(fileNote[0], 'utf8');
                noteName = path.basename(fileNote[0], '.boxnote');
                notePath = path.dirname(fileNote[0]);
                mainWindow.webContents.send('show-note', noteName, data)
                mainWindow.setTitle(titleText + " - " + fileNote[0]) 
              } catch (err) {
                console.error(err);
              }              
            }
          }
        },
        isMac ? { role: 'close',  label: i18n.__('exit-app')} : { role: 'quit', label: i18n.__('exit-app') }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  i18n = new trans
  titleText = i18n.__("title")
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on("open-file", function(event, filepath) {
    event.preventDefault();
    dialog.showErrorBox(i18n.__('tit-wrong-file'), i18n.__('msg-wrong-file')); 
    if(path.endsWith(filepath,'.boxnote')) {
        const data = fs.readFileSync(filepath, 'utf8');
        noteName = path.basename(filepath, '.boxnote');
        notePath = path.dirname(filepath);
        mainWindow.webContents.send('show-note', noteName, data)
        mainWindow.setTitle(titleText + " - " + filepath)
        filepath = null;
    } else {
      dialog.showErrorBox(i18n.__('tit-wrong-file'), i18n.__('msg-wrong-file'));    
    }
  });
})



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})