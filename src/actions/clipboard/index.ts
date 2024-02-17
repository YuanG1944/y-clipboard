import { clipboard, ipcRenderer } from 'electron';
import { ArrChangeCallback, BUFF_FORMAT, StorageItem, TempItem } from './type';
import { v4 as uuid } from 'uuid';
import { StoreEnum, CLIP_HISTORY } from '@/actions/windows/type';

let timer: NodeJS.Timeout = null;
const clipHistory: StorageItem[] = [];

const formatToString = (format: string[]) => format.join(',');

const setStoreValue = (value: StorageItem[]) => {
  ipcRenderer.send(StoreEnum.SET_STORE, CLIP_HISTORY, value);
};

const getStoreValue = () => ipcRenderer.sendSync(StoreEnum.GET_STORE, CLIP_HISTORY);

const getClipHistory = () => clipHistory;

const getPreCopy = () => clipHistory?.[0] ?? null;

const queryById = (id: string) => {
  return clipHistory.find(item => item.id === id);
};

const isSameElements = (pre: StorageItem, curr: StorageItem) => {
  if (!pre?.text && !pre?.html) return false;
  if (!(curr?.text || '').trim() && !(curr?.html || '').trim()) return true;
  if (formatToString(curr.formats).includes('image')) {
    // console.info('pre', pre.html);
    // console.info('pre', curr.html);
    if (pre?.html === curr?.html) return true;
  }
  if (pre?.text === curr?.text) return true;
  return false;
};

const assembleCopyItem = (): StorageItem => {
  const value: StorageItem = {
    id: uuid(),
    text: clipboard?.readText(),
    rtf: clipboard?.readRTF(),
    html: clipboard?.readHTML(),
    bookmark: clipboard?.readBookmark(),
    formats: clipboard.availableFormats(),
    timeStamp: new Date().getTime(),
  };

  const image = clipboard.readImage();
  if (formatToString(value.formats).includes('image') && !image.isEmpty()) {
    value.image = image.toDataURL();
  }
  if (formatToString(value.formats).includes('uri')) {
    value.text = clipboard.readBuffer('public.file-url').toString();
  }
  // console.info('value-->', value);

  return value;
};

const clipboardOb = (cb: ArrChangeCallback) => () => {
  const preCopy = getPreCopy();
  const curr = assembleCopyItem();

  // console.info(isSameElements(preCopy, curr));

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
  // if (curr.image && !curr.image.isEmpty()) {
  //   return clipboard.writeImage(curr.image);
  // }
  if (curr.text) {
    return clipboard.writeText(curr.text);
  }
  if (curr.rtf) {
    return clipboard.writeRTF(curr.rtf);
  }
  if (curr.html) {
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
