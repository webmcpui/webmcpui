import { defineComponent, h, type PropType } from 'vue';
import { WmcpAlert, type WmcpAlertVariant } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpAlert.tagName, WmcpAlert);

/** `<Alert>` — a presentational inline callout (`variant`, `title`, slot). */
export const Alert = defineComponent({
  name: 'WmcpAlert',
  props: { variant: String as PropType<WmcpAlertVariant>, title: String },
  setup(props, { slots }) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) if (v !== undefined) bindings[k] = v;
      return h(WmcpAlert.tagName, bindings, slots.default?.());
    };
  },
});
