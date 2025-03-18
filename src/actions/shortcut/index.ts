import { invoke } from '@tauri-apps/api/core';
import { ShortcutActEnum } from './type';
import { platform as platformFn } from '@tauri-apps/plugin-os';
import { StoreKeyEnum } from '@/views/ConfigMenu/Hotkey';
import { getStore, hasKeyStore, setStore } from '@/utils/localStorage';
import { darwinDefaultKey, IKeyCode, winDefaultKey } from '@/utils/keyMap';

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

export const initPasteHotkey = () => {
  const platform = platformFn();
  let code;
  if (hasKeyStore(StoreKeyEnum.KEYCODE)) {
    code = (getStore(StoreKeyEnum.KEYCODE) as IKeyCode).code;
  } else {
    if (platform === 'macos') {
      code = darwinDefaultKey.code;
      setStore(StoreKeyEnum.KEYCODE, darwinDefaultKey);
    } else {
      code = winDefaultKey.code;
      setStore(StoreKeyEnum.KEYCODE, winDefaultKey);
    }
  }

  setPasteShortcut(code?.join('+'));
};
