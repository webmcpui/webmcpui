import { defineComponent, h } from 'vue';
import { WmcpSkeleton } from '@webmcpui/core';
import { defineOnce } from './define.js';

defineOnce(WmcpSkeleton.tagName, WmcpSkeleton);

/** `<Skeleton>` — a decorative loading placeholder (size it with style). No WebMCP tool. */
export const Skeleton = defineComponent({
  name: 'WmcpSkeleton',
  setup() {
    return () => h(WmcpSkeleton.tagName);
  },
});
