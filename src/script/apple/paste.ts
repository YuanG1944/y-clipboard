export const pasteForMac = `
tell application "System Events"
  key down control
  key code 118
  delay 0.05
  key up control
  delay 0.05
  key down command
  keystroke "v"
  key up command
end tell
`;
