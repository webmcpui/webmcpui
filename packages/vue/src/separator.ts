import { defineComponent, h, type PropType } from 'vue';
import { WmcpSeparator } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpSeparator.tagName, WmcpSeparator);

/** `<Separator>` — a presentational divider (`orientation`). No WebMCP tool. */
export const Separator = defineComponent({
  name: 'WmcpSeparator',
  props: { orientation: String as PropType<'horizontal' | 'vertical'> },
  setup(props) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) bindings[key] = value;
      }
      return h(WmcpSeparator.tagName, bindings);
    };
  },
});
