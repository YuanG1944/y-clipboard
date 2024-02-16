import { clipboard, ipcRenderer } from 'electron';
import { ArrChangeCallback, StorageItem, TempItem } from './type';
import { v4 as uuid } from 'uuid';
import { StoreEnum, CLIP_HISTORY } from '@/actions/windows/type';

let timer: NodeJS.Timeout = null;
const clipHistory: StorageItem[] = [];

const setStoreValue = (value: StorageItem[]) => {
  ipcRenderer.send(StoreEnum.SET_STORE, CLIP_HISTORY, value);
};

const getStoreValue = () => ipcRenderer.sendSync(StoreEnum.GET_STORE, CLIP_HISTORY);

const getClipHistory = () => clipHistory;

const getPreCopy = () => clipHistory?.[0] ?? null;

const queryById = (id: string) => {
  return clipHistory.find(item => item.id === id);
};

const isSameElements = (pre: StorageItem, curr: TempItem) => {
  const strCurrFormat = curr.formats.join(',');
  if (strCurrFormat.includes('image')) return false;
  if (pre?.value && curr?.text && pre.value === curr.text) return true;
  return false;
};

const assembleCopyItem = (): StorageItem => {
  return {
    id: uuid(),
    value: clipboard.readText(),
    formats: clipboard.availableFormats(),
    timeStamp: new Date().getTime(),
  };
};

const clipboardOb = (cb: ArrChangeCallback) => () => {
  const preCopy = getPreCopy();
  const formats = clipboard.availableFormats();
  const text = clipboard.readText();

  if (
    isSameElements(preCopy, {
      text,
      formats,
    })
  ) {
    return;
  }

  const curr = assembleCopyItem();
  clipHistory.unshift(curr);
  cb(clipHistory);
};

const start = (cb: ArrChangeCallback = () => {}, duration = 500) => {
  if (!timer) {
    Object.assign(clipHistory, getStoreValue());
    timer = setInterval(clipboardOb(cb), duration);
  }
};

const stop = () => {
  clearInterval(timer);
  timer = null;
};

const writeSelected = (id: string) => {
  const curr = queryById(id);
  clipboard.writeText(String(curr.value));
};

export default {
  setStoreValue,
  getStoreValue,
  writeSelected,
  getClipHistory,
  start,
  stop,
};
