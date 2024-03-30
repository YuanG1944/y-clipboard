export const setStore = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const hasKeyStore = (key: string) => {
  const res = window.localStorage.getItem(key);
  return Boolean(res);
};

export const getStore = (key: string) => {
  const res = window.localStorage.getItem(key);
  try {
    return JSON.parse(res || '');
  } catch (error) {
    return '';
  }
};

export const removeStore = (key: string) => {
  window.localStorage.removeItem(key);
};

export const clearStore = () => {
  window.localStorage.clear();
};
