/**
 * `@webmcpui/vue` — idiomatic, typed Vue components for webmcpui.
 *
 * Each component wraps the corresponding `@webmcpui/core` custom element, so
 * the WebMCP exposure, form association, and accessibility live once (in core)
 * and Vue consumers get typed props, `v-model`, `@event` listeners, and slots —
 * with no `isCustomElement` config required. Load `@webmcpui/tokens/css` for
 * the themed (shadcn-aligned) appearance, or omit it for an unstyled baseline.
 *
 * @module
 */

export { Button } from './button.js';
export { Input } from './input.js';
export { Dialog } from './dialog.js';
export { Tabs } from './tabs.js';
export { Switch } from './switch.js';
export { Badge } from './badge.js';
export { Separator } from './separator.js';
export { Tooltip } from './tooltip.js';
export { Alert } from './alert.js';
export { Progress } from './progress.js';
export { Avatar } from './avatar.js';

export type {
  WmcpButtonVariant,
  WmcpButtonSize,
  WmcpButtonType,
  WmcpInputType,
  WmcpBadgeVariant,
  WmcpAlertVariant,
} from '@webmcpui/core';
