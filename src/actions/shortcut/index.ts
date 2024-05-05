import { invoke } from '@tauri-apps/api/tauri';
import { ShortcutActEnum } from './type';

export const PasteKey = 'paste';

export function setPasteShortcut(value: string): Promise<boolean> {
  return invoke(ShortcutActEnum.SET_PASTE_SHORTCUT, { value });
}

export function deletePasteShortcut(value: string): Promise<void> {
  if (!value) {
    return Promise.resolve();
  }
  return invoke(ShortcutActEnum.DEL_PASTE_SHORTCUT, { value });
}
