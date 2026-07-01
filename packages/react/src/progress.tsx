import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpProgress } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpProgress.tagName, WmcpProgress);

/** `<Progress>` — a typed React wrapper over `<wmcp-Progress>`. */
export const Progress = createComponent({ tagName: WmcpProgress.tagName, elementClass: WmcpProgress, react: React });
Progress.displayName = 'Progress';
