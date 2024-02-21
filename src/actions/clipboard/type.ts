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
  size?: {
    height: number;
    width: number;
  };
  formats: string[];
  timeStamp: number;
  defaultActive: ActiveEnum;
  collect?: boolean;
}

export interface TempItem {
  text: string;
  html: string;
  formats: string[];
}

export enum ActiveEnum {
  Text = 'text/plain',
  Html = 'text/html',
  Image = 'image/png',
  File = 'text/uri-list',
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
