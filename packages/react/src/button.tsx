import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpButton } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpButton.tagName, WmcpButton);

/**
 * `<Button>` — an idiomatic, typed React wrapper over `<wmcp-button>`.
 *
 * All the behavior (form-associated submit/reset, WebMCP action exposure, a11y)
 * lives in `@webmcpui/components`; this adds React ergonomics: typed props
 * (`variant`, `size`, `type`, `disabled`, `expose`, `toolName`, …), `ref`
 * forwarding to the element, and the composed `click` surfaced as `onClick`.
 *
 * ```tsx
 * import { Button } from '@webmcpui/react';
 * import '@webmcpui/tokens/css';
 *
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button expose toolName="book_appointment">Book</Button>
 * ```
 */
export const Button = createComponent({
  tagName: WmcpButton.tagName,
  elementClass: WmcpButton,
  react: React,
  events: {
    onClick: 'click',
  },
});
Button.displayName = 'Button';
