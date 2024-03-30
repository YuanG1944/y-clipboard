import { invoke } from '@tauri-apps/api/tauri';
import { ShortcutActEnum } from './type';

export function setPaste(value: string): Promise<boolean> {
  return invoke(ShortcutActEnum.SET_PASTE_SHORTCUT, { value });
}
