export const isDev = () => {
  console.info('isDev', import.meta.env.DEV);
  return import.meta.env.DEV;
};
