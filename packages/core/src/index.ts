/**
 * Public API for `@webmcpui/core` — agent-aware, framework-agnostic form
 * controls built on Lit.
 *
 * Importing this module does **not** register the custom elements; call
 * {@link defineComponents} to opt in (the CDN bundle does it automatically).
 * Each `<wmcp-*>` element is a good form control first and, when a WebMCP host
 * is present, exposes itself as a tool an agent can call.
 *
 * @example
 * ```ts
 * import { defineComponents } from '@webmcpui/core';
 * import '@webmcpui/tokens/css';
 *
 * defineComponents(); // registers <wmcp-input>, <wmcp-select>, …
 * ```
 *
 * @module
 */

export { WmcpFormControl, textFieldStyles } from './elements/form-control.js';
export { WmcpInput, type WmcpInputType } from './elements/input.js';
export { WmcpTextarea } from './elements/textarea.js';
export {
  WmcpSelect,
  type WmcpSelectItem,
  type WmcpSelectOption,
  type WmcpSelectOptionGroup,
} from './elements/select.js';
export { WmcpCheckbox } from './elements/checkbox.js';
export {
  WmcpRadio,
  WmcpRadioGroup,
  type WmcpRadioOption,
} from './elements/radio.js';
export {
  WmcpButton,
  type WmcpButtonVariant,
  type WmcpButtonSize,
  type WmcpButtonType,
} from './elements/button.js';
export { defineComponents } from './register.js';

// WebMCP exposure layer
export {
  exposeTool,
  isWebMCPAvailable,
  type WebMCPToolDefinition,
  type WebMCPToolResult,
  type WebMCPToolResultContent,
  type ToolDisposer,
  type JSONSchema,
} from './webmcp.js';

// Standard Schema validation
export {
  validateStandard,
  isStandardSchema,
  type StandardSchemaV1,
  type ValidationOutcome,
} from './standard-schema.js';
