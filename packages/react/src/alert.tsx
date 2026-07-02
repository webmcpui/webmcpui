import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpAlert } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpAlert.tagName, WmcpAlert);

/** `<Alert>` — a typed React wrapper over `<wmcp-Alert>`. */
export const Alert = createComponent({ tagName: WmcpAlert.tagName, elementClass: WmcpAlert, react: React });
Alert.displayName = 'Alert';
