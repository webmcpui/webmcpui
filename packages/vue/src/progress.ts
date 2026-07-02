import { defineComponent, h } from 'vue';
import { WmcpProgress } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpProgress.tagName, WmcpProgress);

/** `<Progress>` — a presentational progress bar (`value`, `max`, `indeterminate`). */
export const Progress = defineComponent({
  name: 'WmcpProgress',
  props: {
    value: Number,
    max: Number,
    indeterminate: { type: Boolean, default: undefined },
  },
  setup(props) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) if (v !== undefined) bindings[k] = v;
      return h(WmcpProgress.tagName, bindings);
    };
  },
});
