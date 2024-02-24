// // import { clipboard, ipcRenderer, nativeImage } from 'electron';
// import { ActiveEnum, ActiveMapping, ArrChangeCallback, StorageItem } from './type';
// import { v4 as uuid } from 'uuid';
// import { StoreEnum, CLIP_HISTORY } from '@/actions/windows/type';

// let timer: number | null = null;
// let clipHistory: StorageItem[] = [];

// const moveToFirst = (storageArr: StorageItem[], id: string) => {
//   const tempArr = storageArr;
//   if (!id) return tempArr;
//   const index = tempArr.findIndex((item) => item.id === id);
//   if (index > -1) {
//     const item = tempArr.splice(index, 1)[0];
//     tempArr.unshift(item);
//   }
//   return tempArr;
// };

// export const defaultFormat = (format: string[]) => {
//   const num = format.reduce((pre, item) => {
//     return pre + (ActiveMapping?.[item as ActiveEnum] || 0);
//   }, 0);
//   // console.info('format-->', format);
//   // console.info('num-->', num);
//   if (num >> 3) {
//     return ActiveEnum.File;
//   }
//   if (num >> 2) {
//     return ActiveEnum.Image;
//   }
//   if (num >> 1) {
//     return ActiveEnum.Text;
//   }
//   if (num) {
//     return ActiveEnum.Html;
//   }
//   return ActiveEnum.Text;
// };

// const setStoreValue = (value: StorageItem[], currId: string = '') => {
//   clipHistory = moveToFirst(value, currId);
//   // ipcRenderer.send(StoreEnum.SET_STORE, CLIP_HISTORY, value);
// };

// const getStoreValue = () => {};

// const getClipHistory = () => clipHistory;

// const getPreCopy = () => clipHistory?.[0] ?? null;

// const queryById = (id: string) => {
//   return clipHistory.find((item) => item.id === id);
// };

// const isSameElements = (pre: StorageItem, curr: StorageItem) => {
//   // if (curr.formats.includes(ActiveEnum.Image)) {
//   //   if (pre?.html === curr?.html) return true;
//   //   return false;
//   // }
//   // if (!(curr?.text || '').trim() || !(curr?.html || '').trim()) return true;
//   // if (!pre?.text && !pre?.html) return false;
//   // if (pre?.text === curr?.text) return true;
//   return false;
// };

// const assembleCopyItem = (): StorageItem => {
//   // const formats = clipboard.availableFormats();
//   // const defaultActive = defaultFormat(formats);
//   // const value: StorageItem = {
//   //   id: uuid(),
//   //   text: clipboard?.readText(),
//   //   rtf: clipboard?.readRTF(),
//   //   html: clipboard?.readHTML(),
//   //   bookmark: clipboard?.readBookmark(),
//   //   formats,
//   //   defaultActive,
//   //   timeStamp: new Date().getTime(),
//   //   collect: false,
//   // };
//   // const image = clipboard.readImage();
//   // if (value.formats.includes(ActiveEnum.Image) && !image.isEmpty()) {
//   //   const urlRegex = /img src="([^"]+)"/;
//   //   const urls = value.html.match(urlRegex);
//   //   value.formats = [...value.formats.filter((item) => item !== ActiveEnum.Html), ActiveEnum.Text];
//   //   value.text = urls?.length === 2 ? urls[1] : '';
//   //   value.image = image.toDataURL();
//   // }
//   // if (value.formats.includes(ActiveEnum.File)) {
//   //   value.text = clipboard.readBuffer('public.file-url').toString();
//   // }
//   return {};
// };

// const clipboardOb = (cb: ArrChangeCallback) => () => {
//   const preCopy = getPreCopy();
//   const curr = assembleCopyItem();

//   if (isSameElements(preCopy, curr)) {
//     return;
//   }
//   console.info('preCopy-->', preCopy);
//   console.info('curr-->', curr);

//   clipHistory.unshift(curr);
//   cb(clipHistory);
// };

// const start = (cb: ArrChangeCallback = () => {}, duration = 500) => {
//   if (!timer) {
//     Object.assign(clipHistory, getStoreValue());
//     timer = setInterval(clipboardOb(cb), duration);
//   }
// };

// const stop = () => {
//   clearInterval(timer);
//   timer = null;
// };

// const writeSelected = (id: string) => {
//   const curr = queryById(id);
//   const active = curr?.defaultActive;
//   if (active === ActiveEnum.Text) {
//     // clipboard.writeText(curr.text);
//     return;
//   }
//   if (active === ActiveEnum.Html) {
//     // clipboard.writeHTML(curr.html);
//     return;
//   }
//   if (active === ActiveEnum.Image) {
//     // clipboard.writeHTML(curr.html);
//     return;
//   }
//   if (active === ActiveEnum.File) {
//     // clipboard.writeBuffer('public.file-url', Buffer.from(curr.text, 'utf-8'));
//     return;
//   }
// };

// export default {
//   setStoreValue,
//   getStoreValue,
//   writeSelected,
//   getClipHistory,
//   start,
//   stop,
// };

import { z } from 'zod';
import { invoke } from '@tauri-apps/api/tauri';
import { emit, listen, UnlistenFn } from '@tauri-apps/api/event';

export const START_MONITOR_COMMAND = 'plugin:clipboard|start_monitor';
export const STOP_MONITOR_COMMAND = 'plugin:clipboard|stop_monitor';
export const TEXT_CHANGED = 'plugin:clipboard://text-changed';
export const HTML_CHANGED = 'plugin:clipboard://html-changed';
export const RTF_CHANGED = 'plugin:clipboard://rtf-changed';
export const FILES_CHANGED = 'plugin:clipboard://files-changed';
export const IMAGE_CHANGED = 'plugin:clipboard://image-changed';
export const IS_MONITOR_RUNNING_COMMAND = 'plugin:clipboard|is_monitor_running';
export const GET_HISTORY = 'plugin:clipboard|get_history';
export const HAS_TEXT_COMMAND = 'plugin:clipboard|has_text';
export const HAS_IMAGE_COMMAND = 'plugin:clipboard|has_image';
export const HAS_HTML_COMMAND = 'plugin:clipboard|has_html';
export const HAS_RTF_COMMAND = 'plugin:clipboard|has_rtf';
export const WRITE_TEXT_COMMAND = 'plugin:clipboard|write_text';
export const WRITE_HTML_COMMAND = 'plugin:clipboard|write_html';
export const WRITE_RTF_COMMAND = 'plugin:clipboard|write_rtf';
export const CLEAR_COMMAND = 'plugin:clipboard|clear';
export const READ_TEXT_COMMAND = 'plugin:clipboard|read_text';
export const READ_HTML_COMMAND = 'plugin:clipboard|read_html';
export const READ_RTF_COMMAND = 'plugin:clipboard|read_rtf';
export const READ_FILES_COMMAND = 'plugin:clipboard|read_files';
export const READ_IMAGE_BINARY_COMMAND = 'plugin:clipboard|read_image_binary';
export const READ_IMAGE_BASE64_COMMAND = 'plugin:clipboard|read_image_base64';
export const WRITE_IMAGE_BINARY_COMMAND = 'plugin:clipboard|write_image_binary';
export const WRITE_IMAGE_BASE64_COMMAND = 'plugin:clipboard|write_image_base64';
export const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT = 'plugin:clipboard://clipboard-monitor/status';
export const MONITOR_UPDATE_EVENT = 'plugin:clipboard://clipboard-monitor/update';
export const ClipboardChangedPayloadSchema = z.object({ value: z.string() });
export const ClipboardChangedFilesPayloadSchema = z.object({
  value: z.string().array(),
});
export type ClipboardChangedPayload = z.infer<typeof ClipboardChangedPayloadSchema>;

export function getHistory(): Promise<String> {
  return invoke(GET_HISTORY);
}

export function hasText(): Promise<boolean> {
  return invoke(HAS_TEXT_COMMAND);
}

export function hasHTML(): Promise<boolean> {
  return invoke(HAS_HTML_COMMAND);
}

export function hasRTF(): Promise<boolean> {
  return invoke(HAS_RTF_COMMAND);
}

export function hasImage(): Promise<boolean> {
  return invoke(HAS_IMAGE_COMMAND);
}

export function writeText(text: string): Promise<void> {
  return invoke(WRITE_TEXT_COMMAND, { text });
}

export function writeHtml(html: string): Promise<void> {
  return invoke(WRITE_HTML_COMMAND, { html });
}

export function writeRtf(rtf: string): Promise<void> {
  return invoke(WRITE_RTF_COMMAND, { rtf });
}

export function clear(): Promise<void> {
  return invoke(CLEAR_COMMAND);
}

export function readText(): Promise<string> {
  return invoke(READ_TEXT_COMMAND);
}

export function readHtml(): Promise<string> {
  return invoke(READ_HTML_COMMAND);
}

export function readRtf(): Promise<string> {
  return invoke(READ_RTF_COMMAND);
}

export function readFiles(): Promise<string[]> {
  return invoke(READ_FILES_COMMAND);
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function readImageBase64(): Promise<string> {
  return invoke(READ_IMAGE_BASE64_COMMAND);
}

// export const readImageBase64 = readImage;

/**
 * Read clipboard image, get the data in binary format
 * int_array (Array<number>) is received from Tauri core, Uint8Array and Blob are transformed from int_array
 * @param format data type of returned value, "int_array" is the fastest
 * @returns
 */
export function readImageBinary(
  format: 'int_array' | 'Uint8Array' | 'Blob',
): Promise<number[] | Uint8Array | Blob> {
  return (invoke(READ_IMAGE_BINARY_COMMAND) as Promise<number[]>).then((img_arr: number[]) => {
    switch (format) {
      case 'int_array':
        return img_arr;
      case 'Uint8Array':
        return new Uint8Array(img_arr);
      case 'Blob':
        return new Blob([new Uint8Array(img_arr)]);
      default:
        return img_arr;
    }
  });
}

/**
 * Here is the transformation flow,
 * read clipboard image as Array<number> (int_array) -> int_array -> Uint8Array -> Blob -> ObjectURL
 * There are many layers which could make this function slow for large images.
 * @returns ObjectURL for clipboard image
 */
export function readImageObjectURL(): Promise<string> {
  return readImageBinary('Blob').then((blob) => {
    return URL.createObjectURL(blob as Blob);
  });
}

/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
export function writeImageBase64(base64: string): Promise<void> {
  return invoke(WRITE_IMAGE_BASE64_COMMAND, { base64Image: base64 });
}

export function writeImageBinary(bytes: number[]): Promise<void> {
  return invoke(WRITE_IMAGE_BINARY_COMMAND, { bytes: bytes });
}

/**
 * @deprecated since version v0.5.x
 * Brute force listen to clipboard text update.
 * Detect update by comparing current value with previous value every delay ms.
 * When there is a update, "plugin:clipboard://text-changed" is emitted.
 * You still need to listen to the event.
 *
 * @param delay check interval delay
 * @returns a stop running function that can be called when component unmounts
 */
export function startBruteForceTextMonitor(delay: number = 500) {
  let prevText: string = '';
  let active: boolean = true; // whether the listener should be running
  setTimeout(async function x() {
    try {
      const text = await readText();
      if (prevText !== text) {
        await emit(TEXT_CHANGED, { value: text });
      }
      prevText = text;
    } catch (error) {}
    if (active) setTimeout(x, delay);
  }, delay);
  return function () {
    active = false;
  };
}

/**
 * @deprecated since version v0.5.x
 * Brute force monitor clipboard image update by comparing current value with previous value.
 * When there is a update, "plugin:clipboard://image-changed" is emitted.
 * You still need to listen to the event.
 *
 * @param delay check interval delay
 * @returns stop running function that can be called to stop the monitor
 */
export function startBruteForceImageMonitor(delay: number = 1000) {
  let prevImg: string = '';
  let active: boolean = true; // whether the listener should be running
  setTimeout(async function x() {
    try {
      const img = await readImageBase64();
      if (prevImg !== img) {
        await emit(IMAGE_CHANGED, { value: img });
      }
      prevImg = img;
    } catch (error) {
      // ! when there is no image in clipboard, there may be error thrown, we ignore the error
    }
    if (active) setTimeout(x, delay);
  }, delay);
  return function () {
    active = false;
  };
}

/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * But this event doesn't tell us whether text or image is updated,
 * so this function will detect which is changed and emit the corresponding event
 * Event constant variables: TEXT_CHANGED or IMAGE_CHANGED
 * @returns unlisten function
 */
export function listenToClipboard(): Promise<UnlistenFn> {
  return listen(MONITOR_UPDATE_EVENT, async (e) => {
    if (e.payload === 'clipboard update') {
      // todo: update the file part when clipboard-rs crate supports files
      try {
        const files = await readFiles();
        await emit(FILES_CHANGED, { value: files });
      } catch (error) {
        let success = false;
        if (await hasImage()) {
          const img = await readImageBase64();
          if (img) await emit(IMAGE_CHANGED, { value: img });
          success = true;
        }
        if (await hasHTML()) {
          await emit(HTML_CHANGED, { value: await readHtml() });
          success = true;
        }
        if (await hasRTF()) {
          await emit(RTF_CHANGED, { value: await readRtf() });
          success = true;
        }
        if (await hasText()) {
          await emit(TEXT_CHANGED, { value: await readText() });
          success = true;
        }
        if (!success) {
          throw new Error('Unexpected Error: No proper clipboard type');
        }
      }
    }
  });
}

/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * However from this event we don't know whether it's text or image, no real data is returned.
 * Use with listenToClipboard function.
 * @param cb callback
 * @returns unlisten function
 */
export function onClipboardUpdate(cb: () => void) {
  return listen(MONITOR_UPDATE_EVENT, cb);
}

export async function onTextUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(TEXT_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onHTMLUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(HTML_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onRTFUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(RTF_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onFilesUpdate(cb: (files: string[]) => void): Promise<UnlistenFn> {
  return await listen(FILES_CHANGED, (event) => {
    const files = ClipboardChangedFilesPayloadSchema.parse(event.payload).value;
    cb(files);
  });
}

export async function onImageUpdate(cb: (base64ImageStr: string) => void): Promise<UnlistenFn> {
  return await listen(IMAGE_CHANGED, (event) => {
    const base64ImageStr = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(base64ImageStr);
  });
}

/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
export function isMonitorRunning(): Promise<boolean> {
  return invoke(IS_MONITOR_RUNNING_COMMAND).then((res) => z.boolean().parse(res));
}

/**
 * Start running mointor thread in Tauri core. This feature is added in v0.5.x.
 * Before v0.5.x, the monitor is started during setup when app starts.
 * After v0.5.x, this function must be called first to start monitor.
 * After monitor is started, events "plugin:clipboard://clipboard-monitor/update" will be emitted when there is clipboard update.
 * "plugin:clipboard://clipboard-monitor/status" event is also emitted when monitor status updates
 * Still have to listen to these events.
 */
export function startMonitor(): Promise<void> {
  return invoke(START_MONITOR_COMMAND);
}

/**
 * Stop clipboard monitor thread.
 */
export function stopMonitor(): Promise<void> {
  return invoke(STOP_MONITOR_COMMAND);
}
/**
 * Listen to monitor status update. Instead of calling isMonitorRunning to get status of monitor,
 * "plugin:clipboard://clipboard-monitor/status" event is emitted from Tauri core when monitor status updates.
 * @param cb callback to be called when there is monitor status update
 */
export async function listenToMonitorStatusUpdate(
  cb: (running: boolean) => void,
): Promise<UnlistenFn> {
  return await listen(CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT, (event) => {
    const newStatus = z.boolean().parse(event.payload);
    cb(newStatus);
  });
}

export function startListening(): Promise<() => Promise<void>> {
  return startMonitor()
    .then(() => listenToClipboard())
    .then((unListenClipboard) => {
      // return an unListen function that stop listening to clipboard update and stop the monitor
      return async () => {
        unListenClipboard();
        await stopMonitor();
      };
    });
}
