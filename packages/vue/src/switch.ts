import { defineComponent, h } from 'vue';
import { WmcpSwitch } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpSwitch.tagName, WmcpSwitch);

/** `<Switch>` — a typed Vue wrapper over `<wmcp-switch>` with `v-model` (boolean).
 *  Form association + WebMCP `fill_*` exposure live in core. */
export const Switch = defineComponent({
  name: 'WmcpSwitch',
  props: {
    modelValue: { type: Boolean, default: undefined },
    label: String,
    name: String,
    required: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    expose: { type: Boolean, default: undefined },
    toolName: String,
    toolDescription: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    return () => {
      const bindings: Record<string, unknown> = {
        onChange: (e: Event) => {
          emit('update:modelValue', (e.target as HTMLInputElement).checked);
          emit('change', e);
        },
      };
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined) continue;
        if (key === 'modelValue') bindings.checked = value;
        else bindings[key] = value;
      }
      return h(WmcpSwitch.tagName, bindings);
    };
  },
});
