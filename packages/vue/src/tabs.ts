import { defineComponent, h } from 'vue';
import { WmcpTabs } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpTabs.tagName, WmcpTabs);

/**
 * `<Tabs>` — a typed Vue wrapper over `<wmcp-tabs>` with `v-model:active`.
 * Holds the persistent active tab and exposes the WebMCP `switch_*` tool (in
 * core). Pass the panels as slotted `<section tab="…" tab-label="…">` children.
 *
 * ```vue
 * <Tabs v-model:active="active" label="Account" expose>
 *   <section tab="overview" tab-label="Overview">…</section>
 * </Tabs>
 * ```
 */
export const Tabs = defineComponent({
  name: 'WmcpTabs',
  props: {
    active: String,
    label: String,
    name: String,
    expose: { type: Boolean, default: undefined },
    toolName: String,
    toolDescription: String,
  },
  emits: ['update:active', 'change'],
  setup(props, { slots, emit }) {
    return () => {
      const bindings: Record<string, unknown> = {
        onChange: (e: CustomEvent<{ value: string }>) => {
          emit('change', e);
          emit('update:active', e.detail?.value);
        },
      };
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) bindings[key] = value;
      }
      return h(WmcpTabs.tagName, bindings, slots.default?.());
    };
  },
});
