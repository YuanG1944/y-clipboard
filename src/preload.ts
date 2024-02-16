import clipboard from '@/actions/clipboard';
import { contextBridge } from 'electron';
import { hideWindow, paste } from './actions/windows';

clipboard.start();

contextBridge.exposeInMainWorld('eBridge', {
  paste,
  hideWindow,
  getClipHistory: clipboard.getClipHistory,
  writeSelected: clipboard.writeSelected,
  setStoreValue: clipboard.setStoreValue,
  getStoreValue: clipboard.getClipHistory,
});
