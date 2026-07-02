import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpSpinner } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpSpinner.tagName, WmcpSpinner);

/** `<Spinner>` — an indeterminate loading indicator (`label` for a11y). No WebMCP tool. */
export const Spinner = createComponent({
  tagName: WmcpSpinner.tagName,
  elementClass: WmcpSpinner,
  react: React,
});
Spinner.displayName = 'Spinner';
