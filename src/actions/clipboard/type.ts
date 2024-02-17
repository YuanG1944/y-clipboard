import { NativeImage, ReadBookmark } from 'electron';

export const BUFF_FORMAT = 'public/utf8-plain-text';

export type ArrChangeCallback = (clipHistoryArr: StorageItem[]) => void;

export interface StorageItem {
  id: string;
  text?: string;
  html?: string;
  rtf?: string;
  bookmark?: ReadBookmark;
  buffer?: Buffer;
  image?: string;
  formats: string[];
  timeStamp: number;
}

export interface TempItem {
  text: string;
  html: string;
  formats: string[];
}
