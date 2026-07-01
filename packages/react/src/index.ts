/**
 * `@webmcpui/react` — idiomatic, typed React components for webmcpui.
 *
 * Each component wraps the corresponding `@webmcpui/core` custom element via
 * `@lit/react`, so the WebMCP exposure, form association, and accessibility
 * live once (in core) and React consumers get typed props, refs, and `on*`
 * event handlers. Load `@webmcpui/tokens/css` for the themed (shadcn-aligned)
 * appearance, or omit it for an unstyled baseline.
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

// Re-export the element-level types so consumers can annotate props/values.
export type {
  WmcpButtonVariant,
  WmcpButtonSize,
  WmcpButtonType,
  WmcpInputType,
  WmcpBadgeVariant,
  WmcpAlertVariant,
} from '@webmcpui/core';
