const { app, BrowserWindow, Menu, ipcMain } = require('electron/main');
const path = require('node:path');
const { readFileSync, statSync } = require('node:fs');
const { dialog } = require('electron')
const trans = require('./translations/i18n');
const regedit = require('regedit');
const FileTree = require('./fileTree');
const promisifiedRegedit = require('regedit').promisified;
//require("electron-reload")(__dirname);

var notePath, noteName, i18n, titleText;

regedit.setExternalVBSLocation('resources/regedit/vbs');

if (require('electron-squirrel-startup')) app.quit();

/**
 * Get image file path 
 */
ipcMain.on('image-path', (event, fileName) => {
  event.returnValue = path.join(notePath, "Box Notes Images", noteName + " Images", fileName);
})

ipcMain.on('open-note', (event, filepath) => {
  let data = readFileSync(filepath, 'utf8');
  if(data) { 
    noteName = path.basename(filepath, '.boxnote');
    notePath = path.dirname(filepath);
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(titleText + " - " + filepath)    
  } else {
    dialog.showErrorBox(i18n.__("Note was not syncronized in local directory"), "");
    data = ""
  } 
  event.returnValue = data  
})

ipcMain.on('open-path', (event, dirpath) => {
  let treeFile = new FileTree(dirpath, "BOX")
  treeFile.build()
  event.returnValue = JSON.stringify(treeFile)  
})

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: titleText,
    icon: path.join(__dirname, 'assets/icons/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  //mainWindow.webContents.openDevTools();

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {

    //Get box sync dir, if Box Driver is installed
    let boxSyncDir = "";
    promisifiedRegedit.list(['HKCU\\Software\\Box\\Box\\preferences'])
    .then((entry) => {
        if(entry['HKCU\\Software\\Box\\Box\\preferences'].exists) {
          boxSyncDir = entry['HKCU\\Software\\Box\\Box\\preferences'].values['sync_directory_path'].value
        }
    })
    .finally(() => {
      var tree = null
      if(boxSyncDir) {
        treeFile = new FileTree(boxSyncDir, "BOX")
        treeFile.build()
        tree = JSON.stringify(treeFile)
      }      
      mainWindow.webContents.send('box-dir', tree)      
    })

    //If file is open from explorer the second argumet is the file path 
    if (process.argv.length > 1) {
      let filepath = process.argv[1];
      if (path.extname(filepath) == '.boxnote') {
        let stats = statSync(filepath, { throwIfNoEntry: false });
        if (stats && stats.isFile()) {
          const data = readFileSync(filepath, 'utf8');
          if(data) {
            noteName = path.basename(filepath, '.boxnote');
            notePath = path.dirname(filepath);
            mainWindow.webContents.send('show-note', noteName, data)
            mainWindow.setTitle(titleText + " - " + filepath)
          } else {
            dialog.showErrorBox(i18n.__("Note was not syncronized in local directory"), "");
          }          
        } else {
          dialog.showErrorBox(i18n.__("Note not exists"), "");
        }
      }
    }
  })

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
            if (fileNote) {
              try {
                const data = readFileSync(fileNote[0], 'utf8');
                if(data) {
                  noteName = path.basename(fileNote[0], '.boxnote');
                  notePath = path.dirname(fileNote[0]);
                  mainWindow.webContents.send('show-note', noteName, data)
                  mainWindow.setTitle(titleText + " - " + fileNote[0])
                } else {
                  dialog.showErrorBox(i18n.__("Note was not syncronized in local directory"), "");
                }  
              } catch (err) {
                console.error(err);
              }
            }
          }
        },
        isMac ? { role: 'close', label: i18n.__('exit-app') } : { role: 'quit', label: i18n.__('exit-app') }
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
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})