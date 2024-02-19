import { execSync } from 'child_process';

export const pasteForWindows = `$wshell = New-Object -ComObject wscript.shell;
$wshell.SendKeys("^(c)")`;

export const winscript = async () => {
  try {
    execSync(pasteForWindows, { shell: 'powershell.exe' });
  } catch (err) {
    console.error(err);
  }
};
