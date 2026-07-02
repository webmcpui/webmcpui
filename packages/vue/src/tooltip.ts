import { defineComponent, h, type PropType, type VNode } from 'vue';
import {
  WmcpTooltip,
  type WmcpPopoverPlacement,
  type WmcpPopoverTrigger,
} from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpTooltip.tagName, WmcpTooltip);

/**
 * `<Tooltip>` — a typed Vue wrapper over `<wmcp-tooltip>`. Put the trigger in
 * the `#trigger` slot (or use `label`) and the tip text in the default slot.
 */
export const Tooltip = defineComponent({
  name: 'WmcpTooltip',
  props: {
    label: String,
    placement: String as PropType<WmcpPopoverPlacement>,
    trigger: String as PropType<WmcpPopoverTrigger>,
    name: String,
    expose: { type: Boolean, default: undefined },
    toolName: String,
    toolDescription: String,
  },
  setup(props, { slots }) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) if (v !== undefined) bindings[k] = v;
      const children: VNode[] = [];
      if (slots.trigger) children.push(h('span', { slot: 'trigger' }, slots.trigger()));
      if (slots.default) children.push(...slots.default());
      return h(WmcpTooltip.tagName, bindings, children);
    };
  },
});
