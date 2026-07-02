import { defineComponent, h } from 'vue';
import { WmcpCard } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpCard.tagName, WmcpCard);

/** `<Card>` — a presentational surface container (slot children). No WebMCP tool. */
export const Card = defineComponent({
  name: 'WmcpCard',
  setup(_, { slots }) {
    return () => h(WmcpCard.tagName, null, slots.default?.());
  },
});
