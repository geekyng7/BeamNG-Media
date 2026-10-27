const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('node:path');
const https = require('node:https');
const { startBridge, stopBridge, getState, command } = require('./bridge.cjs');
let win;
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const request = https.get('https://api.github.com/repos/geekyng7/BeamNG-Media/releases/latest', {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'BeamNG-Media-Bridge' }, timeout: 8000
    }, response => {
      if (response.statusCode === 404) { response.resume(); reject(new Error('NO_RELEASE')); return; }
      if (response.statusCode !== 200) { response.resume(); reject(new Error('GitHub HTTP ' + response.statusCode)); return; }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; if (body.length > 128 * 1024) request.destroy(new Error('GitHub response too large')); });
      response.on('end', () => {
        try {
          const release = JSON.parse(body);
          const url = new URL(release.html_url || '');
          if (release.draft || release.prerelease || typeof release.tag_name !== 'string' || url.origin !== 'https://github.com' || !url.pathname.startsWith('/geekyng7/BeamNG-Media/releases/')) throw new Error('Invalid GitHub release metadata');
          resolve({ tag: release.tag_name, url: url.href });
        } catch (error) { reject(error); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('GitHub request timed out')));
    request.on('error', reject);
  });
}
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
ipcMain.handle('check-for-updates',async()=>{
  try {
    const release=await fetchLatestRelease(), currentVersion=app.getVersion();
    const parse=value=>{const normalized=value.startsWith('v')?value.slice(1):value;const parts=normalized.split('.');if(parts.length!==3||parts.some(part=>part===''||!Number.isInteger(Number(part))))return null;return parts.map(Number);};
    const latest=parse(release.tag), current=parse(currentVersion);
    if(!latest||!current)return{ok:false,error:'Release tag must match v1.2.3'};
    const updateAvailable=latest.some((n,i)=>n>current[i]&&latest.slice(0,i).every((v,j)=>v===current[j]));
    return{ok:true,currentVersion,latestVersion:release.tag,updateAvailable,releaseUrl:release.url};
  } catch(error) { return{ok:false,noRelease:error.message==='NO_RELEASE',error:error.message==='NO_RELEASE'?'':error.message}; }
});
ipcMain.handle('open-release',async(_event,value)=>{
  try { const url=new URL(value); if(url.origin!=='https://github.com'||!url.pathname.startsWith('/geekyng7/BeamNG-Media/releases/'))return false; await shell.openExternal(url.href); return true; }
  catch{return false;}
});
ipcMain.handle('open-beamng-folder',async()=>{const folder=path.join(process.env.LOCALAPPDATA||app.getPath('userData'),'BeamNG','BeamNG.drive','current');await shell.openPath(folder);});
ipcMain.handle('media-command',(_event,action,values)=>command(action,values));
app.on('before-quit',()=>{stopBridge();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
