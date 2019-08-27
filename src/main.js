// Modules to control application life and create native browser window
if (require('electron-squirrel-startup')) return;

const {app, BrowserWindow, autoUpdater, dialog} = require('electron')

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

const path = require('path')
const log = require('electron-log');
// const {autoUpdater} = require("electron-updater");

// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// log.info('App starting...');

const DOMAIN = 'http://localhost:9999';
const suffix = process.platform === 'darwin' ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : '';
autoUpdater.setFeedURL({
  url: `${DOMAIN}/Donut/6cc5674f8826743540f152dbfbb014d5/${process.platform}/${process.arch}${suffix}`,
  serverType: 'json',
});
setInterval(() => {
  autoUpdater.checkForUpdates()
}, 30000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (ev, info) => {
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (ev, info) => {
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (ev, err) => {
//   sendStatusToWindow('Error in auto-updater.');
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
//   sendStatusToWindow('Download progress...');
// })
// // autoUpdater.on('update-downloaded', (ev, info) => {
// //   sendStatusToWindow('Update downloaded; will install in 5 seconds');
// // });

// autoUpdater.on('update-downloaded', (ev, info) => {
//   // Wait 5 seconds, then quit and install
//   // In your application, you don't need to wait 5 seconds.
//   // You could call autoUpdater.quitAndInstall(); immediately
//   setTimeout(function() {
//     autoUpdater.quitAndInstall();  
//   }, 5000)
// })


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.