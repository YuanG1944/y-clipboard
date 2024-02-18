import { BrowserWindow, screen, ipcMain, ipcRenderer, globalShortcut } from 'electron';
import { runAppleScript } from 'run-applescript';
import path from 'path';

import { registerShortcut } from '@/actions/shortcut';
import { StoreEnum, WinActEnum } from './type';
import { pasteForMac } from '@/script/apple/paste';
import { store } from '@/store';

const applescript = async () => {
  await runAppleScript(pasteForMac);
};

export const hideWindow = () => {
  ipcRenderer.send(WinActEnum.HIDE_WIN);
};

export const paste = () => {
  ipcRenderer.send(WinActEnum.PASTE);
};

export const showWindow = () => {
  ipcRenderer.send(WinActEnum.SHOW_WIN);
};

export const registerWindowActions = (win: BrowserWindow) => {
  win.on('blur', () => {
    setTimeout(() => {
      win.hide();
    }, 400);
  });

  ipcMain.on(WinActEnum.PASTE, () => {
    applescript();
  });

  ipcMain.on(WinActEnum.HIDE_WIN, () => {
    setTimeout(() => {
      win.hide();
    }, 400);
  });

  ipcMain.on(StoreEnum.SET_STORE, (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.on(StoreEnum.GET_STORE, (event, key) => {
    const value = store.get(key);
    event.returnValue = value;
  });
};

export const reopenWindowActions = (win: BrowserWindow) => {
  const { x, y } = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  win.setSize(currentDisplay.workAreaSize.width, currentDisplay.workAreaSize.height);
  win.setPosition(currentDisplay.workArea.x, currentDisplay.workArea.y);
  win.setSimpleFullScreen(true);
};

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    alwaysOnTop: true,
    // TODO 类型区别, Windows上为toolbar后续需要进行系统判断
    type: 'panel',
    resizable: false,
    show: true,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  registerShortcut(mainWindow);
  registerWindowActions(mainWindow);

  // globalShortcut.register('Alt+CommandOrControl+Shift+D', () => {
  mainWindow.webContents.openDevTools();
  // });
};
