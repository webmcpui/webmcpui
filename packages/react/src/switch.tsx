import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpSwitch } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpSwitch.tagName, WmcpSwitch);

/** `<Switch>` — a typed React wrapper over `<wmcp-switch>` (boolean form
 *  control, WebMCP `fill_*` exposure in core). Control with `checked` + `onChange`. */
export const Switch = createComponent({
  tagName: WmcpSwitch.tagName,
  elementClass: WmcpSwitch,
  react: React,
  events: { onInput: 'input', onChange: 'change' },
});
Switch.displayName = 'Switch';
