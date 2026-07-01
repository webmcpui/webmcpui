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

// Re-export the element-level types so consumers can annotate props/values.
export type {
  WmcpButtonVariant,
  WmcpButtonSize,
  WmcpButtonType,
} from '@webmcpui/core';
