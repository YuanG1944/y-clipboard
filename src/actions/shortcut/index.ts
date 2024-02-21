// import { BrowserWindow, app, globalShortcut } from 'electron';
import { reopenWindowActions } from '@/actions/windows';

const actShortcut = 'CmdOrCtrl+shift+B';

export const registerShortcut = () =>
  // win: BrowserWindow
  {
    // globalShortcut.register(actShortcut, () => {
    //   if (!win.isVisible()) {
    //     reopenWindowActions(win);
    //     // address window flicker problem
    //     win.setOpacity(0);
    //     win.show();
    //     setTimeout(() => {
    //       win.setOpacity(1);
    //     }, 100);
    //   }
    // });
  };

export const unregisterAll = () => {
  // globalShortcut.unregisterAll();
};
