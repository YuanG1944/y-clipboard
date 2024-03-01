// import { NativeImage, ReadBookmark } from 'electron';

export const BUFF_FORMAT = 'public/utf8-plain-text';

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
  timestamp?: number;
  defaultActive?: ActiveEnum;
  collect?: boolean;
}

export interface TempItem {
  text: string;
  html: string;
  formats: string[];
}

export enum ActiveEnum {
  Text = 'text',
  Html = 'html',
  Image = 'image',
  File = 'files',
}

export const ActiveTitle = {
  [ActiveEnum.Text]: 'Text',
  [ActiveEnum.Html]: 'Format',
  [ActiveEnum.Image]: 'Image',
  [ActiveEnum.File]: 'File',
};

export const ActiveMapping = {
  [ActiveEnum.File]: 0b1000,
  [ActiveEnum.Image]: 0b0100,
  [ActiveEnum.Text]: 0b0010,
  [ActiveEnum.Html]: 0b0001,
};
