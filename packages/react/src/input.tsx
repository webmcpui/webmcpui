import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpInput } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpInput.tagName, WmcpInput);

/**
 * `<Input>` — a typed React wrapper over `<wmcp-input>`. Form association,
 * Standard Schema validation, and WebMCP `fill_*` exposure live in core; this
 * surfaces the element's props (`value`, `type`, `label`, `required`, `schema`,
 * `expose`, …) plus `onInput` / `onChange`. Control it with `value` + `onInput`.
 */
export const Input = createComponent({
  tagName: WmcpInput.tagName,
  elementClass: WmcpInput,
  react: React,
  events: {
    onInput: 'input',
    onChange: 'change',
  },
});
Input.displayName = 'Input';
