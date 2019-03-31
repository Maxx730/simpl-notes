const Files = require('./lib/data.js')
const {app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const clipboard = require('electron-clipboard-extended')
const { toKeyEvent } = require('keyboardevent-from-electron-accelerator');

let mainWindow,shortWindow;
let data;
let lastKey = 0;
let fadeTimeout, shortcutIndex = 0;


function createWindow ( data ) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    applicationData: data
  })

mainWindow.loadFile('index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

ipcMain.on( 'save-data',( event,args ) => {
    Files.CreateFile( 'data/data.json',args,() => {
        console.log("FILE SUCCESSFULLY SAVED!")
        Files.CheckForFile( 'data',( file ) => {
            data = file;
            mainWindow.webContents.send( 'loaded-data',file )
        })
    })
})

ipcMain.on( 'apply-clipboard',(event,args) => {
    clipboard.writeText( args )
})

app.on('ready', () => {
    Files.CheckForFile( 'data',( file ) => {
        createWindow( file );
        data = file;
        mainWindow.webContents.on( 'did-finish-load',() => {
            mainWindow.webContents.send( 'loaded-data',file )
        })
    })

    shortWindow = new BrowserWindow({
      height: 100,
      width: 260,
      x: 20,
      y: 20,
      frame: false,
      useContentSize: true
    })

    shortWindow.loadFile('popup.html')
    shortWindow.hide()

    //ADD OUR GLOBAL KEYBOARD SHORTCUTS HERE.
    globalShortcut.register('CommandOrControl+Right',( event ) => {
      shortWindow.show()

      if ( shortcutIndex === data.clipboard.length - 1 ) {
        shortcutIndex = 0;
      } else {
        shortcutIndex++;
      }

      shortWindow.webContents.send('shortcut-tapped',data.clipboard[ shortcutIndex ])
      clipboard.writeText( data.clipboard[ shortcutIndex ] )

      clearTimeout( fadeTimeout )

      fadeTimeout = setTimeout( function() {
        shortWindow.hide()
      },5000 )
    })

    globalShortcut.register('CommandOrControl+Left',( event ) => {
      shortWindow.show()

      if ( shortcutIndex === 0 ) {
        shortcutIndex = data.clipboard.length - 1
      } else {
        shortcutIndex--;
      }

      shortWindow.webContents.send('shortcut-tapped',data.clipboard[ shortcutIndex ])
      clipboard.writeText( data.clipboard[ shortcutIndex ] )

      clearTimeout( fadeTimeout )

      fadeTimeout = setTimeout( function() {
        shortWindow.hide()
      },5000 )
    })

    globalShortcut.register('CommandOrControl+Enter',() => {
      shortWindow.hide()
    })
})

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

//Logic for jumpcut type features.
clipboard.on('text-changed', () => {
    if ( data !== undefined ) {
        data.clipboard.push( clipboard.readText() )
        Files.CreateFile( 'data/data.json',data,() => {
            mainWindow.webContents.send( 'loaded-data',data )
        })
    }
}).startWatching()
