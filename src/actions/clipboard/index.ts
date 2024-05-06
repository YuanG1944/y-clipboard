import { z } from 'zod';
import { invoke } from '@tauri-apps/api/tauri';
import { emit, listen, UnlistenFn } from '@tauri-apps/api/event';
import {
  ActiveEnum,
  ActiveMapping,
  ClipboardEnum,
  FindHistoryReq,
  ITag,
  StorageItem,
} from './type';

export const ClipboardChangedPayloadSchema = z.object({ value: z.string() });
export const ClipboardChangedFilesPayloadSchema = z.object({
  value: z.string().array(),
});
export type ClipboardChangedPayload = z.infer<typeof ClipboardChangedPayloadSchema>;

const moveToFirst = (storageArr: StorageItem[], id: string) => {
  const tempArr = storageArr;
  if (!id) return tempArr;
  const index = tempArr.findIndex((item) => item.id === id);
  if (index > 0) {
    const item = tempArr.splice(index, 1)[0];
    tempArr.unshift(item);
  }
  return tempArr;
};

export const defaultFormat = (format: string[]) => {
  const num = format.reduce((pre, item) => {
    return pre + (ActiveMapping?.[item as ActiveEnum] || 0);
  }, 0);

  if (num >> 4) {
    return ActiveEnum.File;
  }
  if (num >> 3) {
    return ActiveEnum.Image;
  }
  if (num >> 2) {
    return ActiveEnum.Text;
  }
  if (num >> 1) {
    return ActiveEnum.RTF;
  }
  if (num) {
    return ActiveEnum.Html;
  }
  return ActiveEnum.Text;
};

export const safeJsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return '';
  }
};

export async function findHistories(query: FindHistoryReq): Promise<StorageItem[]> {
  const clipboardHistoryStr =
    ((await invoke(ClipboardEnum.FIND_HISTORIES, { query })) as string) ?? '';
  const clipboardHistory: StorageItem[] = safeJsonParse(clipboardHistoryStr);
  return clipboardHistory;
}

export function setHistoryStr(historyArr: StorageItem[], currId: string = ''): Promise<void> {
  const temp = moveToFirst(historyArr, currId);
  const jsonStr = JSON.stringify(temp);
  return invoke(ClipboardEnum.SET_HISTORY_STR, { jsonStr });
}

export function updateCreateTime(id: string = ''): Promise<void> {
  if (!id) return Promise.resolve();
  return invoke(ClipboardEnum.UPDATE_CREATE_TIME, { id });
}

export function updateActive(id: string, active: string): Promise<void> {
  if (active && active) {
    return invoke(ClipboardEnum.UPDATE_ACTIVE, { id, active });
  }
  return Promise.resolve();
}

export function deleteItems(ids: string[] = []): Promise<void> {
  if (!ids.length) return Promise.resolve();
  const jsonStr = JSON.stringify(ids);
  return invoke(ClipboardEnum.DELETE_HISTORIES, { jsonStr });
}

export async function writeSelected(
  historyArr: StorageItem[],
  currId: string = '',
  switchFormatMap: Record<string, string> = {},
) {
  const curr = historyArr.find((item) => item.id === currId);

  const active = switchFormatMap[currId] || curr?.active;

  if (active === ActiveEnum.Text && curr?.text) {
    await writeText(curr?.text);
    return;
  }

  if (active === ActiveEnum.Html && curr?.html) {
    await writeHtml(curr?.html);
    return;
  }

  if (active === ActiveEnum.RTF && curr?.rtf) {
    await writeRtf(curr?.rtf);
    return;
  }

  if (active === ActiveEnum.Image && curr?.image) {
    await writeImageBase64(curr?.image);
    return;
  }

  if (active === ActiveEnum.File) {
    return;
  }
}

export async function getTagsAll(): Promise<ITag[]> {
  const tagsStr = ((await invoke(ClipboardEnum.GET_TAGS_ALL)) as string) ?? '';
  const tags: ITag[] = safeJsonParse(tagsStr);
  return tags;
}

export function setTag(id: string, name: string) {
  return invoke(ClipboardEnum.SET_TAG, { id, name });
}

export function addTag(name: string) {
  return invoke(ClipboardEnum.ADD_TAG, { name });
}

export function deleteTag(id: string) {
  return invoke(ClipboardEnum.DELETE_TAG, { id });
}

export function subscribeTag(historyId: string, tagId: string) {
  return invoke(ClipboardEnum.SUBSCRIBE_TAG, { historyId, tagId });
}

export function cancelTag(historyId: string, tagId: string) {
  return invoke(ClipboardEnum.CANCEL_TAG, { historyId, tagId });
}

export function hasText(): Promise<boolean> {
  return invoke(ClipboardEnum.HAS_TEXT_COMMAND);
}

export function hasHTML(): Promise<boolean> {
  return invoke(ClipboardEnum.HAS_HTML_COMMAND);
}

export function hasRTF(): Promise<boolean> {
  return invoke(ClipboardEnum.HAS_RTF_COMMAND);
}

export function hasImage(): Promise<boolean> {
  return invoke(ClipboardEnum.HAS_IMAGE_COMMAND);
}

export function writeText(text: string): Promise<void> {
  return invoke(ClipboardEnum.WRITE_TEXT_COMMAND, { text });
}

export function writeHtml(html: string): Promise<void> {
  return invoke(ClipboardEnum.WRITE_HTML_COMMAND, { html });
}

export function writeRtf(rtf: string): Promise<void> {
  return invoke(ClipboardEnum.WRITE_RTF_COMMAND, { rtf });
}

export function writeFilePath(files: string[]): Promise<void> {
  return invoke(ClipboardEnum.WRITE_FILES_PATH, { files });
}

export function openFile(filePath: string): Promise<void> {
  return invoke(ClipboardEnum.OPEN_FILE_COMMAND, { filePath });
}

export function clear(): Promise<void> {
  return invoke(ClipboardEnum.CLEAR_COMMAND);
}

export function readText(): Promise<string> {
  return invoke(ClipboardEnum.READ_TEXT_COMMAND);
}

export function readHtml(): Promise<string> {
  return invoke(ClipboardEnum.READ_HTML_COMMAND);
}

export function readRtf(): Promise<string> {
  return invoke(ClipboardEnum.READ_RTF_COMMAND);
}

export function readFiles(): Promise<string[]> {
  return invoke(ClipboardEnum.READ_FILES_COMMAND);
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function readImageBase64(): Promise<string> {
  return invoke(ClipboardEnum.READ_IMAGE_BASE64_COMMAND);
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
  return (invoke(ClipboardEnum.READ_IMAGE_BINARY_COMMAND) as Promise<number[]>).then(
    (img_arr: number[]) => {
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
    },
  );
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
  return invoke(ClipboardEnum.WRITE_IMAGE_BASE64_COMMAND, { base64Image: base64 });
}

export function writeImageBinary(bytes: number[]): Promise<void> {
  return invoke(ClipboardEnum.WRITE_IMAGE_BINARY_COMMAND, { bytes: bytes });
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
        await emit(ClipboardEnum.TEXT_CHANGED, { value: text });
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
        await emit(ClipboardEnum.IMAGE_CHANGED, { value: img });
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
  return listen(ClipboardEnum.MONITOR_UPDATE_EVENT, async (e) => {
    if (e.payload === 'clipboard update') {
      // todo: update the file part when clipboard-rs crate supports files
      try {
        const files = await readFiles();
        await emit(ClipboardEnum.FILES_CHANGED, { value: files });
      } catch (error) {
        let success = false;
        if (await hasImage()) {
          const img = await readImageBase64();
          if (img) await emit(ClipboardEnum.IMAGE_CHANGED, { value: img });
          success = true;
        }
        if (await hasHTML()) {
          await emit(ClipboardEnum.HTML_CHANGED, { value: await readHtml() });
          success = true;
        }
        if (await hasRTF()) {
          await emit(ClipboardEnum.RTF_CHANGED, { value: await readRtf() });
          success = true;
        }
        if (await hasText()) {
          await emit(ClipboardEnum.TEXT_CHANGED, { value: await readText() });
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
  return listen(ClipboardEnum.MONITOR_UPDATE_EVENT, cb);
}

export async function onTextUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.TEXT_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onHTMLUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.HTML_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onRTFUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.RTF_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onFilesUpdate(cb: (files: string[]) => void): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.FILES_CHANGED, (event) => {
    const files = ClipboardChangedFilesPayloadSchema.parse(event.payload).value;
    cb(files);
  });
}

export async function onImageUpdate(cb: (base64ImageStr: string) => void): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.IMAGE_CHANGED, (event) => {
    const base64ImageStr = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(base64ImageStr);
  });
}

/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
export function isMonitorRunning(): Promise<boolean> {
  return invoke(ClipboardEnum.IS_MONITOR_RUNNING_COMMAND).then((res) => z.boolean().parse(res));
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
  return invoke(ClipboardEnum.START_MONITOR_COMMAND);
}

/**
 * Stop clipboard monitor thread.
 */
export function stopMonitor(): Promise<void> {
  return invoke(ClipboardEnum.STOP_MONITOR_COMMAND);
}
/**
 * Listen to monitor status update. Instead of calling isMonitorRunning to get status of monitor,
 * "plugin:clipboard://clipboard-monitor/status" event is emitted from Tauri core when monitor status updates.
 * @param cb callback to be called when there is monitor status update
 */
export async function listenToMonitorStatusUpdate(
  cb: (running: boolean) => void,
): Promise<UnlistenFn> {
  return await listen(ClipboardEnum.CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT, (event) => {
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

export async function paste(): Promise<void> {
  await invoke(ClipboardEnum.PASTE);
}
