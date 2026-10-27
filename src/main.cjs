const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('node:path');
const { startBridge, stopBridge, getState, command } = require('./bridge.cjs');
let win;
Menu.setApplicationMenu(null);
function createWindow() {
  win = new BrowserWindow({ width:900,height:700,minWidth:740,minHeight:580,title:'BeamNG Media Bridge',backgroundColor:'#0b0e14',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true} });
  win.setMenuBarVisibility(false);
  win.webContents.on('before-input-event',(event,input)=>{
    const key=input.key.toLowerCase();
    if(input.key==='F12'||(input.control&&input.shift&&['i','j','c'].includes(key)))event.preventDefault();
  });
  win.webContents.on('devtools-opened',()=>win.webContents.closeDevTools());
  win.loadFile(path.join(__dirname,'..','renderer','index.html'));
  win.on('closed',()=>{win=null;});
}
app.whenReady().then(async()=>{createWindow();await startBridge(state=>win?.webContents.send('state',state));app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});}).catch(error=>{console.error('Bridge startup failed:',error);app.quit();});
ipcMain.handle('get-state',()=>getState());
ipcMain.handle('open-beamng-folder',async()=>{const folder=path.join(process.env.LOCALAPPDATA||app.getPath('userData'),'BeamNG','BeamNG.drive','current');await shell.openPath(folder);});
ipcMain.handle('media-command',(_event,action,values)=>command(action,values));
app.on('before-quit',()=>{stopBridge();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
