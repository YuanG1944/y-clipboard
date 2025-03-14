import { invoke } from '@tauri-apps/api/core';
import { DBManageActEnum } from './type';

export const ExpireKey = 'expire';
export const WheelKey = 'wheel';
export enum WheelEnum {
  NORMAL = '1',
  REVERSE = '2',
}

export function clearHistory(): Promise<void> {
  return invoke(DBManageActEnum.CLEAR_HISTORY);
}

export function setExpire(value: string): Promise<void> {
  return invoke(DBManageActEnum.SET_CONFIG, { key: ExpireKey, value });
}

export function getExpire(): Promise<string> {
  return invoke(DBManageActEnum.GET_CONFIG, { key: ExpireKey });
}

export function setWheelDirection(value: string): Promise<void> {
  return invoke(DBManageActEnum.SET_CONFIG, { key: WheelKey, value });
}

export function getWheelDirection(): Promise<string> {
  return invoke(DBManageActEnum.GET_CONFIG, { key: WheelKey });
}

export function restartClearInterval(): Promise<string> {
  return invoke(DBManageActEnum.RESTART_CLEAR_HISTORY_INTERVAL);
}
