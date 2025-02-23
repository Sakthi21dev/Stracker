const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },  
  });

  // Note: The error "Storage key corresponds to invalid origin" is logged by DevTools when using the file:// protocol.
  // This is benign. To avoid it, consider serving your app via a local HTTP server and use mainWindow.loadURL() instead.
  // Example (if using a local server):
  // mainWindow.loadURL('http://localhost:3000/index.html');

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
