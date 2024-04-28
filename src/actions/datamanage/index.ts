import { invoke } from '@tauri-apps/api/tauri';
import { DBManageActEnum } from './type';

export const ExpireKey = 'expire';

export function clearHistory(): Promise<void> {
  return invoke(DBManageActEnum.CLEAR_HISTORY);
}

export function setExpire(value: string): Promise<void> {
  return invoke(DBManageActEnum.SET_CONFIG, { key: ExpireKey, value });
}

export function getExpire(): Promise<string> {
  return invoke(DBManageActEnum.GET_CONFIG, { key: ExpireKey });
}

export function restartClearInterval(): Promise<string> {
  return invoke(DBManageActEnum.RESTART_CLEAR_HISTORY_INTERVAL);
}
