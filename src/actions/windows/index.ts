import { WinActEnum } from './type';
import { unregisterAll } from '@tauri-apps/api/globalShortcut';
import { invoke } from '@tauri-apps/api/tauri';

export default class Windows {
  private static instance: Windows;

  constructor() {
    if (Windows.instance) {
      throw new Error('You can only create one instance of Windows!');
    }
    this.createWindow();
  }

  static getInstance() {
    if (!Windows.instance) {
      Windows.instance = new Windows();
    }
    return Windows.instance;
  }

  registerAllListener() {}

  hide() {
    setTimeout(() => {
      invoke(WinActEnum.HIDE_WIN);
    }, 400);
  }

  show() {
    invoke(WinActEnum.SHOW_WIN);
  }

  createWindow() {
    this.registerAllListener();
  }

  static async destroyWindows() {
    await unregisterAll();
  }
}
