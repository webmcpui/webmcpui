import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpTooltip } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpTooltip.tagName, WmcpTooltip);

/** `<Tooltip>` — a typed React wrapper over `<wmcp-Tooltip>`. */
export const Tooltip = createComponent({ tagName: WmcpTooltip.tagName, elementClass: WmcpTooltip, react: React, events: { onOpen: 'open', onClose: 'close' } });
Tooltip.displayName = 'Tooltip';
