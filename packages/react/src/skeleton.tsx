import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpSkeleton } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpSkeleton.tagName, WmcpSkeleton);

/** `<Skeleton>` — a decorative loading placeholder (size it with style). No WebMCP tool. */
export const Skeleton = createComponent({
  tagName: WmcpSkeleton.tagName,
  elementClass: WmcpSkeleton,
  react: React,
});
Skeleton.displayName = 'Skeleton';
