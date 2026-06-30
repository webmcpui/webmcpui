// Postbuild: append the HTMLElementTagNameMap augmentation to the bundled npm
// declaration. JSR forbids `declare global` in published source, so the element
// files no longer carry `declare global` blocks; we re-add the typing here for
// npm/TS consumers (so `document.createElement('wmcp-input')` and
// `querySelector('wmcp-input')` resolve to the right element types). The JSR
// source graph stays clean. Runs after tsup so it never races the dts writer.
import { appendFile } from 'node:fs/promises';

const GLOBAL_DTS = `
declare global {
  interface HTMLElementTagNameMap {
    'wmcp-input': import('./index.js').WmcpInput;
    'wmcp-textarea': import('./index.js').WmcpTextarea;
    'wmcp-select': import('./index.js').WmcpSelect;
    'wmcp-checkbox': import('./index.js').WmcpCheckbox;
    'wmcp-radio': import('./index.js').WmcpRadio;
    'wmcp-radio-group': import('./index.js').WmcpRadioGroup;
    'wmcp-button': import('./index.js').WmcpButton;
    'wmcp-dialog': import('./index.js').WmcpDialog;
    'wmcp-menu': import('./index.js').WmcpMenu;
  }
}
`;

await appendFile(new URL('../dist/index.d.ts', import.meta.url), GLOBAL_DTS);
console.log('appended HTMLElementTagNameMap augmentation to dist/index.d.ts');
