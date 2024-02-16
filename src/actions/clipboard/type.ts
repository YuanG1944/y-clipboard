import { NativeImage, ReadBookmark } from 'electron';

export type ArrChangeCallback = (clipHistoryArr: StorageItem[]) => void;

export interface StorageItem {
  id: string;
  value: string | NativeImage | Buffer | ReadBookmark;
  formats: string[];
  timeStamp: number;
}

export interface TempItem {
  text: string;
  formats: string[];
}
