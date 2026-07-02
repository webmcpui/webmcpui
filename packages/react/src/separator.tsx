import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpSeparator } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpSeparator.tagName, WmcpSeparator);

/** `<Separator>` — a presentational divider (`orientation`). No WebMCP tool. */
export const Separator = createComponent({
  tagName: WmcpSeparator.tagName,
  elementClass: WmcpSeparator,
  react: React,
});
Separator.displayName = 'Separator';
