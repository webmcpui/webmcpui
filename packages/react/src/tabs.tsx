import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpTabs } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpTabs.tagName, WmcpTabs);

/**
 * `<Tabs>` — a typed React wrapper over `<wmcp-tabs>`. Holds the persistent
 * `active` tab and exposes the WebMCP `switch_*` tool (in core). Pass the
 * panels as children (`<section tab="…" tab-label="…">`); read/track the active
 * tab via the `active` prop and `onChange`.
 */
export const Tabs = createComponent({
  tagName: WmcpTabs.tagName,
  elementClass: WmcpTabs,
  react: React,
  events: {
    onChange: 'change',
  },
});
Tabs.displayName = 'Tabs';
