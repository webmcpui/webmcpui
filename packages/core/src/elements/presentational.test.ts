import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import type { WmcpBadge } from './badge.js';
import type { WmcpSeparator } from './separator.js';

before(() => defineComponents());

describe('presentational elements', () => {
  it('wmcp-badge renders its slotted content and reflects variant', async () => {
    const el = await fixture<WmcpBadge>(
      html`<wmcp-badge variant="destructive">3 failed</wmcp-badge>`,
    );
    expect(customElements.get('wmcp-badge')).to.exist;
    expect(el.getAttribute('variant')).to.equal('destructive');
    expect(el.shadowRoot!.querySelector('slot')).to.exist;
    expect(el.textContent?.trim()).to.equal('3 failed');
  });

  it('wmcp-separator registers with role=separator', async () => {
    const el = await fixture<WmcpSeparator>(html`<wmcp-separator></wmcp-separator>`);
    expect(customElements.get('wmcp-separator')).to.exist;
    expect(el.getAttribute('role')).to.equal('separator');
  });

  it('wmcp-separator marks vertical orientation for a11y', async () => {
    const el = await fixture<WmcpSeparator>(
      html`<wmcp-separator orientation="vertical"></wmcp-separator>`,
    );
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
  });
});
