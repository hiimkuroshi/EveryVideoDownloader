'use strict';

const { app, BrowserWindow, dialog, session, shell } = require('electron');
const { spawn, execFile } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

app.setName('EveryVideo');
app.setAppUserModelId('com.everyvideo.desktop');
if (process.env.EVERYVIDEO_DATA_DIR) app.setPath('userData', path.resolve(process.env.EVERYVIDEO_DATA_DIR));

let mainWindow;
let backend;
let quitting = false;
let backendOrigin;

function log(message) {
  const directory = app.getPath('userData');
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'desktop.log');
  if (fs.existsSync(file) && fs.statSync(file).size > 512 * 1024) fs.renameSync(file, `${file}.old`);
  fs.appendFileSync(file, `${new Date().toISOString()} ${message}\n`);
}

function stopBackend() {
  return new Promise(resolve => {
    if (!backend?.pid || backend.exitCode !== null) return resolve();
    if (process.platform === 'win32') {
      const taskkill = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
      execFile(taskkill, ['/pid', String(backend.pid), '/t', '/f'], { windowsHide: true, timeout: 10000 }, () => resolve());
    } else {
      backend.kill('SIGTERM');
      backend.once('exit', resolve);
    }
  });
}

async function startBackend(token) {
  const resources = app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '..');
  const data = app.getPath('userData');
  fs.mkdirSync(data, { recursive: true });
  const downloads = process.env.EVERYVIDEO_DOWNLOADS_DIR || path.join(app.getPath('downloads'), 'EveryVideo');
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: '0',
    EVERYVIDEO_DESKTOP_TOKEN: token,
    EVERYVIDEO_RESOURCES_DIR: resources,
    EVERYVIDEO_DATA_DIR: data,
    EVERYVIDEO_DOWNLOADS_DIR: downloads,
    EVERYVIDEO_PYTHON: path.join(resources, '.runtime', 'python', 'python.exe'),
    EVERYVIDEO_ARIA2C: path.join(resources, '.runtime', 'aria2', 'aria2c.exe'),
    PLAYWRIGHT_BROWSERS_PATH: path.join(resources, '.runtime', 'playwright'),
    PYTHONDONTWRITEBYTECODE: '1',
  };
  // A caller's NODE_OPTIONS must not inject code into the packaged backend.
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  backend = spawn(process.execPath, [path.join(app.getAppPath(), 'server.js')], {
    cwd: data, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  backend.stdout.resume();
  backend.stderr.resume();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Backend startup timed out.')), 30000);
    const finish = (error, port) => {
      clearTimeout(timer);
      backend.removeListener('error', onError);
      backend.removeListener('exit', onExit);
      if (error) reject(error);
      else resolve(port);
    };
    const onError = error => finish(error);
    const onExit = code => finish(new Error(`Backend stopped during startup (code ${code}).`));
    backend.once('error', onError);
    backend.once('exit', onExit);
    backend.once('message', message => {
      if (message?.type !== 'ready' || !Number.isInteger(message.port)) return finish(new Error('Invalid backend response.'));
      finish(null, message.port);
      backend.once('exit', code => {
        if (quitting) return;
        log(`Backend stopped unexpectedly (code ${code}).`);
        dialog.showErrorBox('EveryVideo', 'Dịch vụ tải đã dừng. Vui lòng mở lại EveryVideo.');
        app.quit();
      });
    });
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow?.isMinimized()) mainWindow.restore();
    mainWindow?.show();
    mainWindow?.focus();
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', event => {
    if (quitting) return;
    event.preventDefault();
    quitting = true;
    stopBackend().finally(() => app.quit());
  });

  app.whenReady().then(async () => {
    const token = randomBytes(32).toString('hex');
    const port = await startBackend(token);
    backendOrigin = `http://127.0.0.1:${port}`;
    const browserSession = session.defaultSession;
    await browserSession.cookies.set({
      url: backendOrigin, name: 'everyvideo_session', value: token,
      httpOnly: true, sameSite: 'strict', path: '/',
    });
    browserSession.setPermissionRequestHandler((contents, permission, callback) => {
      callback(contents.getURL().startsWith(`${backendOrigin}/`)
        && ['clipboard-sanitized-write', 'clipboard-read'].includes(permission));
    });
    mainWindow = new BrowserWindow({
      title: 'EveryVideo', width: 1440, height: 960, minWidth: 960, minHeight: 680,
      backgroundColor: '#0A0E15', show: false, autoHideMenuBar: true,
      icon: path.join(__dirname, 'icon.ico'),
      webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webviewTag: false },
    });
    mainWindow.removeMenu();
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
      return { action: 'deny' };
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (new URL(url).origin !== backendOrigin) event.preventDefault();
    });
    mainWindow.once('ready-to-show', () => mainWindow.show());
    await mainWindow.loadURL(backendOrigin);
    log(`Started EveryVideo ${app.getVersion()}.`);
  }).catch(error => {
    log(`Startup failed: ${error.message}`);
    dialog.showErrorBox('EveryVideo', `Không thể mở ứng dụng.\n${error.message}`);
    app.quit();
  });
}
