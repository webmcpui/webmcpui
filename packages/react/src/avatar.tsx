import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpAvatar } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpAvatar.tagName, WmcpAvatar);

/** `<Avatar>` — a typed React wrapper over `<wmcp-Avatar>`. */
export const Avatar = createComponent({ tagName: WmcpAvatar.tagName, elementClass: WmcpAvatar, react: React });
Avatar.displayName = 'Avatar';
