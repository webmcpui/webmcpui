import { defineComponent, h } from 'vue';
import { WmcpSpinner } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpSpinner.tagName, WmcpSpinner);

/** `<Spinner>` — an indeterminate loading indicator (`label` for a11y). No WebMCP tool. */
export const Spinner = defineComponent({
  name: 'WmcpSpinner',
  props: { label: String },
  setup(props) {
    return () => {
      const bindings: Record<string, unknown> = {};
      if (props.label !== undefined) bindings.label = props.label;
      return h(WmcpSpinner.tagName, bindings);
    };
  },
});
