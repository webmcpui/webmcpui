/**
 * Register a `<wmcp-*>` custom element exactly once. `@lit/react`'s
 * `createComponent` wraps an element class but does not register it, so each
 * React component registers its own element as an import side effect. Guarded
 * so it's safe alongside core's `defineComponents()` and SSR (no `document`).
 */
export function defineOnce(
  tagName: string,
  elementClass: CustomElementConstructor,
): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
}
