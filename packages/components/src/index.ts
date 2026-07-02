/**
 * Public API for `@webmcpui/components` — agent-aware web components
 * built on Lit.
 *
 * Importing this module does **not** register the custom elements; call
 * {@link defineComponents} to opt in (the CDN bundle does it automatically).
 * Each `<wmcp-*>` element is a good form control first and, when a WebMCP host
 * is present, exposes itself as a tool an agent can call.
 *
 * @example
 * ```ts
 * import { defineComponents } from '@webmcpui/components';
 * import '@webmcpui/tokens/css';
 *
 * defineComponents(); // registers <wmcp-input>, <wmcp-select>, …
 * ```
 *
 * @module
 */

export { WmcpFormControl, textFieldStyles } from "./elements/form-control.js";
export { WmcpInput, type WmcpInputType } from "./elements/input.js";
export { WmcpTextarea } from "./elements/textarea.js";
export {
  WmcpSelect,
  type WmcpSelectItem,
  type WmcpSelectOption,
  type WmcpSelectOptionGroup,
} from "./elements/select.js";
export { WmcpCheckbox } from "./elements/checkbox.js";
export {
  WmcpRadio,
  WmcpRadioGroup,
  type WmcpRadioOption,
} from "./elements/radio.js";
export { WmcpExposable } from "./elements/exposable.js";
export { WmcpAction } from "./elements/action.js";
export {
  WmcpButton,
  type WmcpButtonVariant,
  type WmcpButtonSize,
  type WmcpButtonType,
} from "./elements/button.js";
export { WmcpDialog } from "./elements/dialog.js";
export { WmcpMenu, type WmcpMenuItem } from "./elements/menu.js";
export { WmcpTabs, type WmcpTabInfo } from "./elements/tabs.js";
export {
  WmcpPopover,
  type WmcpPopoverPlacement,
  type WmcpPopoverTrigger,
} from "./elements/popover.js";
export {
  WmcpToast,
  type WmcpToastVariant,
  type WmcpToastOptions,
} from "./elements/toast.js";
export { WmcpSwitch } from "./elements/switch.js";
export { WmcpBadge, type WmcpBadgeVariant } from "./elements/badge.js";
export { WmcpSeparator } from "./elements/separator.js";
export { WmcpTooltip } from "./elements/tooltip.js";
export { WmcpAlert, type WmcpAlertVariant } from "./elements/alert.js";
export { WmcpProgress } from "./elements/progress.js";
export { WmcpAvatar } from "./elements/avatar.js";
export {
  defineComponents,
  allElements,
  type WmcpTagName,
  type WmcpElementConstructor as WmcpElementCtor,
} from "./register.js";

// WebMCP exposure layer
export {
  exposeTool,
  isWebMCPAvailable,
  type WebMCPToolDefinition,
  type WebMCPToolResult,
  type WebMCPToolResultContent,
  type ToolDisposer,
  type JSONSchema,
} from "@webmcpui/webmcp";

// Standard Schema validation
export {
  validateStandard,
  isStandardSchema,
  type StandardSchemaV1,
  type ValidationOutcome,
} from "./standard-schema.js";
