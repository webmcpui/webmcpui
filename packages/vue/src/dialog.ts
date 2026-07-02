import { defineComponent, h } from 'vue';
import { WmcpDialog } from '@webmcpui/components';
import { defineOnce } from './define.js';

defineOnce(WmcpDialog.tagName, WmcpDialog);

/**
 * `<Dialog>` — a typed Vue wrapper over `<wmcp-dialog>` with `v-model:open`.
 * The modal behavior (native `<dialog>`, focus trap, WebMCP `open_*` exposure)
 * lives in core; this two-way-binds `open` and re-emits `open` / `close`.
 *
 * ```vue
 * <Dialog v-model:open="open" label="Confirm" expose>…</Dialog>
 * ```
 */
export const Dialog = defineComponent({
  name: 'WmcpDialog',
  props: {
    open: { type: Boolean, default: undefined },
    modal: { type: Boolean, default: undefined },
    staticBackdrop: { type: Boolean, default: undefined },
    label: String,
    name: String,
    expose: { type: Boolean, default: undefined },
    toolName: String,
    toolDescription: String,
  },
  emits: ['update:open', 'open', 'close'],
  setup(props, { slots, emit }) {
    return () => {
      const bindings: Record<string, unknown> = {
        onOpen: () => {
          emit('open');
          emit('update:open', true);
        },
        onClose: () => {
          emit('close');
          emit('update:open', false);
        },
      };
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) bindings[key] = value;
      }
      return h(WmcpDialog.tagName, bindings, slots.default?.());
    };
  },
});
