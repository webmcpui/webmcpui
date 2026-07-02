import { defineComponent, h } from 'vue';
import { WmcpAvatar } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpAvatar.tagName, WmcpAvatar);

/** `<Avatar>` — a presentational avatar (`src`, `alt`, `fallback`). */
export const Avatar = defineComponent({
  name: 'WmcpAvatar',
  props: { src: String, alt: String, fallback: String },
  setup(props) {
    return () => {
      const bindings: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) if (v !== undefined) bindings[k] = v;
      return h(WmcpAvatar.tagName, bindings);
    };
  },
});
