export enum FunctionKeyEnum {
  META_LEFT = 91,
  META_RIGHT = 93,
  ALT = 18,
  CTRL = 17,
  SHIFT = 16,
}

export enum UselessKeyEnum {
  ESC = 27,
  BACKSPACE = 8,
}

export interface IKeyCode {
  code: number[];
  value: string[];
}

export const darwinDefaultKey = {
  code: [91, 16, 66],
  value: ['MetaLeft', 'ShiftLeft', 'KeyB'],
};

export const winDefaultKey = {
  code: [17, 16, 66],
  value: ['ControlLeft', 'ShiftLeft', 'KeyB'],
};

export const functionKeyArray = Object.keys(FunctionKeyEnum).filter((item) => Number(item));
export const UselessKeyArray = Object.keys(UselessKeyEnum).filter((item) => Number(item));
