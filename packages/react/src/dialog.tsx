import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpDialog } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpDialog.tagName, WmcpDialog);

/**
 * `<Dialog>` — a typed React wrapper over `<wmcp-dialog>`. The modal behavior
 * (native `<dialog>`, focus trap, WebMCP `open_*` exposure) lives in core.
 * Drive it with the `open` prop or a `ref` (`ref.current.show()` / `.close()`);
 * `onOpen` / `onClose` fire on state changes.
 */
export const Dialog = createComponent({
  tagName: WmcpDialog.tagName,
  elementClass: WmcpDialog,
  react: React,
  events: {
    onOpen: 'open',
    onClose: 'close',
  },
});
Dialog.displayName = 'Dialog';
