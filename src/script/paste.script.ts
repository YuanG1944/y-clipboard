import { applescript } from './apple/paste';
import { winscript } from './microsoft/paste';

type IPasteScriptFunc = () => Promise<void>;

const PasteScriptImplMap: Record<NodeJS.Platform, IPasteScriptFunc | undefined> = {
  aix: void 0,
  android: void 0,
  darwin: applescript,
  freebsd: void 0,
  haiku: void 0,
  linux: void 0,
  openbsd: void 0,
  sunos: void 0,
  win32: winscript,
  cygwin: void 0,
  netbsd: void 0,
};

export async function pastescript() {
  const p = process.platform;
  const f = PasteScriptImplMap[p];

  if (typeof f === 'function') {
    return await f();
  }
}
