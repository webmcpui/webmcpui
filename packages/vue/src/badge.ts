import { defineComponent, h, type PropType } from 'vue';
import { WmcpBadge, type WmcpBadgeVariant } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpBadge.tagName, WmcpBadge);

/** `<Badge>` — a presentational status pill (`variant` + slot). No WebMCP tool. */
export const Badge = defineComponent({
  name: 'WmcpBadge',
  props: { variant: String as PropType<WmcpBadgeVariant> },
  setup(props, { slots }) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) bindings[key] = value;
      }
      return h(WmcpBadge.tagName, bindings, slots.default?.());
    };
  },
});
