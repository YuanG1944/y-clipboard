import { resources } from '.';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
