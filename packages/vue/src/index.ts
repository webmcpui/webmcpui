/**
 * `@webmcpui/vue` — idiomatic, typed Vue components for webmcpui.
 *
 * Each component wraps the corresponding `@webmcpui/core` custom element, so
 * the WebMCP exposure, form association, and accessibility live once (in core)
 * and Vue consumers get typed props, `@event` listeners, and slots — with no
 * `isCustomElement` config required. Load `@webmcpui/tokens/css` for the themed
 * (shadcn-aligned) appearance, or omit it for an unstyled baseline.
 *
 * @module
 */

export { Button } from './button.js';

export type {
  WmcpButtonVariant,
  WmcpButtonSize,
  WmcpButtonType,
} from '@webmcpui/core';
