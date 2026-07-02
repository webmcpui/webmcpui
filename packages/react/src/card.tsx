import * as React from 'react';
import { createComponent } from '@lit/react';
import { WmcpCard } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpCard.tagName, WmcpCard);

/** `<Card>` — a presentational surface container (slot children). No WebMCP tool. */
export const Card = createComponent({
  tagName: WmcpCard.tagName,
  elementClass: WmcpCard,
  react: React,
});
Card.displayName = 'Card';
