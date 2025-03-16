import { resources } from '@/locale';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
