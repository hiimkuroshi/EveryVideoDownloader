'use strict';

module.exports = {
  appId: 'com.everyvideo.desktop',
  productName: 'EveryVideo',
  directories: { output: 'dist', buildResources: 'desktop' },
  extraMetadata: { main: 'desktop/main.js' },
  asar: true,
  npmRebuild: false,
  files: [
    'desktop/main.js', 'desktop/icon.ico', 'server.js', 'lib/**/*.js',
    'public/*.html', 'public/*.css', 'public/*.js', 'public/help.json',
    'package.json',
  ],
  extraResources: [
    { from: 'core', to: 'core', filter: ['yt_dlp/**/*.py', 'yt_dlp/**/*.js', 'LICENSE'] },
    { from: '.runtime/python', to: '.runtime/python', filter: ['*.exe', '*.dll', '*.pyd', '*.zip', '*._pth', 'LICENSE.txt'] },
    { from: '.runtime/ffmpeg', to: '.runtime/ffmpeg', filter: ['ffmpeg.exe', 'ffprobe.exe'] },
    { from: '.runtime/aria2/aria2-1.37.0-win-64bit-build1', to: '.runtime/aria2', filter: ['aria2c.exe', 'COPYING', 'LICENSE.OpenSSL', 'AUTHORS'] },
    { from: '.runtime/playwright', to: '.runtime/playwright', filter: ['chromium_headless_shell-*/**/*', 'ffmpeg-*/**/*', 'winldd-*/**/*', '!.links{,/**/*}'] },
    { from: 'bin', to: 'bin', filter: ['folder_picker.exe'] },
    { from: 'scripts', to: 'scripts', filter: ['download-resolved-media.py'] },
    { from: 'desktop/THIRD-PARTY-NOTICES.txt', to: 'THIRD-PARTY-NOTICES.txt' },
    { from: 'desktop/licenses', to: 'licenses', filter: ['**/*'] },
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }, { target: 'portable', arch: ['x64'] }, { target: 'zip', arch: ['x64'] }],
    artifactName: 'EveryVideo-${version}-Portable-Folder-${arch}.${ext}',
    icon: 'desktop/icon.ico',
    requestedExecutionLevel: 'asInvoker',
    // Local builds have no publisher certificate. Keep metadata/icon editing enabled.
    signAndEditExecutable: true,
  },
  nsis: {
    artifactName: 'EveryVideo-${version}-Setup-x64.${ext}',
    oneClick: false, perMachine: false, allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true, createStartMenuShortcut: true,
    shortcutName: 'EveryVideo', uninstallDisplayName: 'EveryVideo',
    deleteAppDataOnUninstall: false, runAfterFinish: false,
    installerLanguages: ['en_US', 'vi_VN'],
  },
  portable: { artifactName: 'EveryVideo-${version}-Portable-x64.${ext}', requestExecutionLevel: 'user' },
};
