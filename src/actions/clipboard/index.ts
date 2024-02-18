import { clipboard, ipcRenderer } from 'electron';
import { ActiveEnum, ActiveMapping, ArrChangeCallback, StorageItem } from './type';
import { v4 as uuid } from 'uuid';
import { StoreEnum, CLIP_HISTORY } from '@/actions/windows/type';

let timer: NodeJS.Timeout = null;
let clipHistory: StorageItem[] = [];

export const defaultFormat = (format: string[]) => {
  const num = format.reduce((pre, item) => {
    return pre + (ActiveMapping?.[item as ActiveEnum] || 0);
  }, 0);
  if (num >> 3) {
    return ActiveEnum.File;
  }
  if (num >> 2) {
    return ActiveEnum.Image;
  }
  if (num >> 1) {
    return ActiveEnum.Text;
  }
  if (num) {
    return ActiveEnum.Html;
  }
  return ActiveEnum.Text;
};

const setStoreValue = (value: StorageItem[]) => {
  clipHistory = value;
  // ipcRenderer.send(StoreEnum.SET_STORE, CLIP_HISTORY, value);
};

const getStoreValue = () => ipcRenderer.sendSync(StoreEnum.GET_STORE, CLIP_HISTORY);

const getClipHistory = () => clipHistory;

const getPreCopy = () => clipHistory?.[0] ?? null;

const queryById = (id: string) => {
  return clipHistory.find(item => item.id === id);
};

const isSameElements = (pre: StorageItem, curr: StorageItem) => {
  if (!(curr?.text || '').trim() || !(curr?.html || '').trim()) return true;
  if (!pre?.text && !pre?.html) return false;
  if (curr.formats.includes(ActiveEnum.Image)) {
    if (pre?.html === curr?.html) return true;
  }
  if (pre?.text === curr?.text) return true;
  return false;
};

const assembleCopyItem = (): StorageItem => {
  const formats = clipboard.availableFormats();
  const defaultActive = defaultFormat(formats);

  const value: StorageItem = {
    id: uuid(),
    text: clipboard?.readText(),
    rtf: clipboard?.readRTF(),
    html: clipboard?.readHTML(),
    bookmark: clipboard?.readBookmark(),
    formats,
    defaultActive,
    timeStamp: new Date().getTime(),
  };

  // console.info('formats', clipboard.availableFormats());

  const image = clipboard.readImage();
  if (value.formats.includes(ActiveEnum.Image) && !image.isEmpty()) {
    value.image = image.toDataURL();
  }
  if (value.formats.includes(ActiveEnum.File)) {
    value.text = clipboard.readBuffer('public.file-url').toString();
  }

  return value;
};

const clipboardOb = (cb: ArrChangeCallback) => () => {
  const preCopy = getPreCopy();
  const curr = assembleCopyItem();

  if (isSameElements(preCopy, curr)) {
    return;
  }

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
  const active = curr.defaultActive;
  // if (curr.image && !curr.image.isEmpty()) {
  //   return clipboard.writeImage(curr.image);
  // }
  if (active === ActiveEnum.Text) {
    return clipboard.writeText(curr.text);
  }
  if (active === ActiveEnum.Html) {
    return clipboard.writeHTML(curr.html);
  }
};

export default {
  setStoreValue,
  getStoreValue,
  writeSelected,
  getClipHistory,
  start,
  stop,
};
