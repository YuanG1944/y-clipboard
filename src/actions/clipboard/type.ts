// import { NativeImage, ReadBookmark } from 'electron';

export const BUFF_FORMAT = 'public/utf8-plain-text';

const base = '';

export enum ClipboardEnum {
  PASTE = base + 'paste',
  START_MONITOR_COMMAND = base + 'start_monitor',
  STOP_MONITOR_COMMAND = base + 'stop_monitor',
  TEXT_CHANGED = base + '://text-changed',
  HTML_CHANGED = base + '://html-changed',
  RTF_CHANGED = base + '://rtf-changed',
  FILES_CHANGED = base + '://files-changed',
  IMAGE_CHANGED = base + '://image-changed',
  IS_MONITOR_RUNNING_COMMAND = base + 'is_monitor_running',
  GET_HISTORY = base + 'get_history',
  GET_HISTORY_BY_PAGE = base + 'get_history_by_page',
  FIND_HISTORIES = base + 'find_histories',
  SET_HISTORY_STR = base + 'set_history_str',
  UPDATE_CREATE_TIME = base + 'update_pasted_create_time',
  UPDATE_ACTIVE = base + 'update_pasted_active',
  DELETE_HISTORIES = base + 'delete_items',
  GET_TAGS_ALL = base + 'get_tags_all',
  ADD_TAG = base + 'add_tag',
  SET_TAG = base + 'set_tag',
  DELETE_TAG = base + 'delete_tag',
  SUBSCRIBE_TAG = base + 'subscribe_history_to_tags',
  CANCEL_TAG = base + 'cancel_single_history_to_tags',
  HAS_TEXT_COMMAND = base + 'has_text',
  HAS_IMAGE_COMMAND = base + 'has_image',
  HAS_HTML_COMMAND = base + 'has_html',
  HAS_RTF_COMMAND = base + 'has_rtf',
  WRITE_TEXT_COMMAND = base + 'write_text',
  WRITE_HTML_COMMAND = base + 'write_html',
  WRITE_RTF_COMMAND = base + 'write_rtf',
  WRITE_FILES_PATH = base + 'write_files_path',
  OPEN_FILE_COMMAND = base + 'open_file',
  CLEAR_COMMAND = base + 'clear',
  READ_TEXT_COMMAND = base + 'read_text',
  READ_HTML_COMMAND = base + 'read_html',
  READ_RTF_COMMAND = base + 'read_rtf',
  READ_FILES_COMMAND = base + 'read_files',
  READ_IMAGE_BINARY_COMMAND = base + 'read_image_binary',
  READ_IMAGE_BASE64_COMMAND = base + 'read_image_base64',
  WRITE_IMAGE_BINARY_COMMAND = base + 'write_image_binary',
  WRITE_IMAGE_BASE64_COMMAND = base + 'write_image_base64',
  CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT = base + '://clipboard-monitor/status',
  MONITOR_UPDATE_EVENT = base + '://clipboard-monitor/update',
}

export type ArrChangeCallback = (clipHistoryArr: StorageItem[]) => void;

export interface StorageItem {
  id?: string;
  text?: string;
  html?: string;
  rtf?: string;
  buffer?: Buffer;
  files?: string[];
  image?: string;
  formats?: string[];
  create_time?: number;
  active?: ActiveEnum;
  deleted?: boolean;
  collect?: boolean;
  tags?: ITag[];
}

export interface TempItem {
  text: string;
  html: string;
  formats: string[];
}

export enum ActiveEnum {
  Text = 'text',
  Html = 'html',
  RTF = 'rtf',
  Image = 'image',
  Files = 'files',
}

export const ActiveTitle = {
  [ActiveEnum.Text]: 'Text',
  [ActiveEnum.RTF]: 'Format',
  [ActiveEnum.Html]: 'Html',
  [ActiveEnum.Image]: 'Image',
  [ActiveEnum.Files]: 'Files',
};

export const ActiveMapping = {
  [ActiveEnum.Files]: 0b10000,
  [ActiveEnum.Image]: 0b01000,
  [ActiveEnum.Text]: 0b00100,
  [ActiveEnum.RTF]: 0b00010,
  [ActiveEnum.Html]: 0b00001,
};

export interface ITag {
  id: string;
  name: string;
  createTime: number;
}

export interface FindHistoryReq {
  key?: string;
  tag?: string;
  page: number;
  page_size: number;
}
