import { defineComponent, h, type PropType } from 'vue';
import {
  WmcpInput,
  type WmcpInputType,
  type StandardSchemaV1,
} from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpInput.tagName, WmcpInput);

/**
 * `<Input>` — a typed Vue wrapper over `<wmcp-input>` with `v-model` support.
 * Form association, Standard Schema validation, and WebMCP `fill_*` exposure
 * live in core; this maps `v-model` to the element's `value` and re-emits
 * `input` / `change`.
 *
 * ```vue
 * <Input v-model="email" type="email" label="Email" :schema="emailSchema" expose />
 * ```
 */
export const Input = defineComponent({
  name: 'WmcpInput',
  props: {
    modelValue: String,
    type: String as PropType<WmcpInputType>,
    label: String,
    name: String,
    placeholder: String,
    required: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    helperText: String,
    requiredMessage: String,
    expose: { type: Boolean, default: undefined },
    toolName: String,
    toolDescription: String,
    schema: {
      type: Object as PropType<StandardSchemaV1<unknown, unknown>>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { emit }) {
    return () => {
      const bindings: Record<string, unknown> = {
        onInput: (e: Event) => {
          emit('update:modelValue', (e.target as HTMLInputElement).value);
          emit('input', e);
        },
        onChange: (e: Event) => emit('change', e),
      };
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined) continue;
        // v-model maps onto the element's `value` property.
        if (key === 'modelValue') bindings.value = value;
        else bindings[key] = value;
      }
      return h(WmcpInput.tagName, bindings);
    };
  },
});
