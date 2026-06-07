// Public API for @webmcpui/core.
// Importing this module does NOT register the custom elements — call
// `defineComponents()` to opt in (the CDN bundle does this automatically).

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
