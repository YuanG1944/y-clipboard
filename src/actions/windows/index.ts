import { WinActEnum, WinTool } from './type';
import { register, unregisterAll, isRegistered } from '@tauri-apps/api/globalShortcut';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

export default class Windows {
  private static instance: Windows;
  // private pasteShortcut = 'CommandOrControl+Shift+B';
  // private devToolShortcut = 'f12';

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

  // async registerGlobalKeyBoard() {
  //   if (!(await isRegistered(this.pasteShortcut))) {
  //     await register(this.pasteShortcut, () => {
  //       this.show();
  //     });
  //   }

  //   if (!(await isRegistered(this.devToolShortcut))) {
  //     await register(this.devToolShortcut, () => {
  //       invoke(WinTool.DEVTOOL);
  //     });
  //   }
  // }

  registerAllListener() {
    appWindow.onFocusChanged((event) => {
      console.info('window change', event);
    });
  }

  hide() {
    setTimeout(() => {
      invoke(WinActEnum.HIDE_WIN);
    }, 400);
  }

  show() {
    invoke(WinActEnum.SHOW_WIN);
  }

  createWindow() {
    // this.registerGlobalKeyBoard();
    this.registerAllListener();
  }

  static async destroyWindows() {
    await unregisterAll();
  }
}
