import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpBadge } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpBadge.tagName, WmcpBadge);

/** `<Badge>` — a presentational status pill (`variant` + children). No WebMCP tool. */
export const Badge = createComponent({
  tagName: WmcpBadge.tagName,
  elementClass: WmcpBadge,
  react: React,
});
Badge.displayName = 'Badge';
