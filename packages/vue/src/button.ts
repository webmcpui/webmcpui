import { defineComponent, h, type PropType } from 'vue';
import {
  WmcpButton,
  type WmcpButtonVariant,
  type WmcpButtonSize,
  type WmcpButtonType,
} from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpButton.tagName, WmcpButton);

/**
 * `<Button>` — an idiomatic, typed Vue wrapper over `<wmcp-button>`.
 *
 * Behavior (form-associated submit/reset, WebMCP action exposure, a11y) lives
 * in `@webmcpui/core`; this adds Vue ergonomics: typed props and a component
 * you can use in templates without configuring `isCustomElement` (the
 * `<wmcp-button>` tag only appears inside this render function). Attributes and
 * listeners (`@click`, `class`, `style`, …) fall through to the element.
 *
 * ```vue
 * <script setup>
 * import { Button } from '@webmcpui/vue';
 * import '@webmcpui/tokens/css';
 * </script>
 *
 * <template>
 *   <Button variant="primary" @click="save">Save</Button>
 *   <Button expose tool-name="book_appointment">Book</Button>
 * </template>
 * ```
 */
export const Button = defineComponent({
  name: 'WmcpButton',
  props: {
    variant: String as PropType<WmcpButtonVariant>,
    size: String as PropType<WmcpButtonSize>,
    type: String as PropType<WmcpButtonType>,
    disabled: { type: Boolean, default: undefined },
    expose: { type: Boolean, default: undefined },
    name: String,
    label: String,
    toolName: String,
    toolDescription: String,
  },
  setup(props, { slots }) {
    return () => {
      // Only forward defined props so we never clobber the element's own
      // defaults with `undefined`. Fallthrough attrs (incl. @click) merge onto
      // the single root element automatically.
      const bindings: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) bindings[key] = value;
      }
      return h(WmcpButton.tagName, bindings, slots.default?.());
    };
  },
});
