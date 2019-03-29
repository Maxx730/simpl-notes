const Files = require('./lib/data.js')
const {app, BrowserWindow, ipcMain } = require('electron')
const clipboard = require('electron-clipboard-extended')

let mainWindow;
let data;

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