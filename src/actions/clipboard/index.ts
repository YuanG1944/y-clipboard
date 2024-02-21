import { clipboard, ipcRenderer, nativeImage } from 'electron';
import { ActiveEnum, ActiveMapping, ArrChangeCallback, StorageItem } from './type';
import { v4 as uuid } from 'uuid';
import { StoreEnum, CLIP_HISTORY } from '@/actions/windows/type';

let timer: NodeJS.Timeout = null;
let clipHistory: StorageItem[] = [];

const moveToFirst = (storageArr: StorageItem[], id: string) => {
  const tempArr = storageArr;
  if (!id) return tempArr;
  const index = tempArr.findIndex((item) => item.id === id);
  if (index > -1) {
    const item = tempArr.splice(index, 1)[0];
    tempArr.unshift(item);
  }
  return tempArr;
};

export const defaultFormat = (format: string[]) => {
  const num = format.reduce((pre, item) => {
    return pre + (ActiveMapping?.[item as ActiveEnum] || 0);
  }, 0);
  // console.info('format-->', format);
  // console.info('num-->', num);
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

const setStoreValue = (value: StorageItem[], currId: string = '') => {
  clipHistory = moveToFirst(value, currId);
  // ipcRenderer.send(StoreEnum.SET_STORE, CLIP_HISTORY, value);
};

const getStoreValue = () => ipcRenderer.sendSync(StoreEnum.GET_STORE, CLIP_HISTORY);

const getClipHistory = () => clipHistory;

const getPreCopy = () => clipHistory?.[0] ?? null;

const queryById = (id: string) => {
  return clipHistory.find((item) => item.id === id);
};

const isSameElements = (pre: StorageItem, curr: StorageItem) => {
  if (curr.formats.includes(ActiveEnum.Image)) {
    if (pre?.html === curr?.html) return true;
    return false;
  }
  if (!(curr?.text || '').trim() || !(curr?.html || '').trim()) return true;
  if (!pre?.text && !pre?.html) return false;
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
    collect: false,
  };

  const image = clipboard.readImage();

  if (value.formats.includes(ActiveEnum.Image) && !image.isEmpty()) {
    const urlRegex = /img src="([^"]+)"/;
    const urls = value.html.match(urlRegex);
    value.formats = [...value.formats.filter((item) => item !== ActiveEnum.Html), ActiveEnum.Text];
    value.text = urls?.length === 2 ? urls[1] : '';
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
  console.info('preCopy-->', preCopy);
  console.info('curr-->', curr);

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
  const active = curr?.defaultActive;
  if (active === ActiveEnum.Text) {
    clipboard.writeText(curr.text);
    return;
  }
  if (active === ActiveEnum.Html) {
    clipboard.writeHTML(curr.html);
    return;
  }
  if (active === ActiveEnum.Image) {
    clipboard.writeHTML(curr.html);
    return;
  }
  if (active === ActiveEnum.File) {
    clipboard.writeBuffer('public.file-url', Buffer.from(curr.text, 'utf-8'));
    return;
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
