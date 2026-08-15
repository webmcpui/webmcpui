/**
 * Safe access to `ElementInternals`.
 *
 * Form association is the one part of these components that needs a *real*
 * browser. Partial-DOM environments implement custom elements well enough to
 * construct and render, but stop short of form association, in two different
 * ways:
 *
 * - happy-dom has no `HTMLElement.prototype.attachInternals` at all, so the
 *   field initializer `this.attachInternals()` throws during construction —
 *   before a component can do anything.
 * - jsdom *does* return an `ElementInternals`, but its form-related members
 *   (`setFormValue`, `setValidity`, `form`, `validationMessage`) are absent, so
 *   the first `setFormValue()` in `connectedCallback` throws.
 *
 * Neither is a reason to hard-crash: everything else — rendering, validation,
 * WebMCP tool exposure — works fine there, and that is what those environments
 * are usually being used to test. So we feature-detect both levels and degrade,
 * with a single dev-mode warning per page so the missing `<form>` participation
 * is never a silent surprise.
 *
 * Real browsers take the same code path they always did: `attachInternals()`
 * exists, `setFormValue` exists, nothing is skipped.
 *
 * Internal module — not re-exported from `index.ts`.
 */

import { isDevEnv } from './webmcp.js';

/**
 * Attach `ElementInternals`, or return `null` where the platform doesn't
 * implement it (happy-dom). Callers must treat `null` as "no native form
 * participation" rather than an error.
 */
export function attachInternalsSafe(host: HTMLElement): ElementInternals | null {
  return typeof host.attachInternals === 'function'
    ? host.attachInternals()
    : null;
}

/**
 * Whether these internals can actually drive a native `<form>`. `setFormValue`
 * is the canary: an environment that has it (a real browser) has the rest of
 * the form-association surface too, and one that doesn't (jsdom) has none of it.
 */
export function supportsFormAssociation(
  internals: ElementInternals | null,
): boolean {
  return internals !== null && typeof internals.setFormValue === 'function';
}

// Page-global: every control and button that discovers form association is
// missing routes through the same latch, so a page full of them warns once.
let warnedNoFormAssociation = false;

/**
 * Warn — at most once per page, and only outside production — that native form
 * association is unavailable. Called from the paths that *would* have used it,
 * so a page that never needs form participation stays quiet.
 */
export function warnFormAssociationUnavailable(): void {
  if (warnedNoFormAssociation || !isDevEnv) return;
  warnedNoFormAssociation = true;
  console.warn(
    `[webmcpui] ElementInternals form association is not available in this ` +
      `environment (jsdom/happy-dom?). Controls will render, validate, and ` +
      `expose tools, but native <form> participation is disabled. Use a real ` +
      `browser for form tests: ` +
      `https://webmcpui.com/docs/testing#environments`,
  );
}
