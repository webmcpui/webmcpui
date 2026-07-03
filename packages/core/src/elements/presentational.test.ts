import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import type { WmcpBadge } from './badge.js';
import type { WmcpSeparator } from './separator.js';
import type { WmcpAlert } from './alert.js';
import type { WmcpProgress } from './progress.js';
import type { WmcpAvatar } from './avatar.js';
import type { WmcpTooltip } from './tooltip.js';

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

  it('wmcp-alert renders title + message and roles by severity', async () => {
    const err = await fixture<WmcpAlert>(
      html`<wmcp-alert variant="error" title="Failed">Card declined</wmcp-alert>`,
    );
    expect(err.getAttribute('role')).to.equal('alert');
    expect(err.shadowRoot!.querySelector('.title')?.textContent).to.equal('Failed');
    const info = await fixture<WmcpAlert>(html`<wmcp-alert>Heads up</wmcp-alert>`);
    expect(info.getAttribute('role')).to.equal('status');
  });

  it('wmcp-alert re-evaluates role when variant changes at runtime', async () => {
    // Regression: role was set once in connectedCallback and went stale on an
    // info→error escalation, so the error was never announced assertively.
    const el = await fixture<WmcpAlert>(html`<wmcp-alert>Heads up</wmcp-alert>`);
    expect(el.getAttribute('role')).to.equal('status');
    el.variant = 'error';
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('alert');
    el.variant = 'info';
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('status');
  });

  it('wmcp-separator syncs aria-orientation when orientation changes', async () => {
    // Regression: aria-orientation was set once and not cleared when flipped
    // back to horizontal.
    const el = await fixture<WmcpSeparator>(
      html`<wmcp-separator orientation="vertical"></wmcp-separator>`,
    );
    await el.updateComplete;
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
    el.orientation = 'horizontal';
    await el.updateComplete;
    expect(el.hasAttribute('aria-orientation')).to.be.false;
  });

  it('wmcp-progress wires progressbar a11y from value/max', async () => {
    const el = await fixture<WmcpProgress>(
      html`<wmcp-progress value="30" max="120"></wmcp-progress>`,
    );
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('progressbar');
    expect(el.getAttribute('aria-valuenow')).to.equal('30');
    expect(el.getAttribute('aria-valuemax')).to.equal('120');
    // Indeterminate when value is omitted.
    const ind = await fixture<WmcpProgress>(html`<wmcp-progress></wmcp-progress>`);
    await ind.updateComplete;
    expect(ind.hasAttribute('aria-valuenow')).to.be.false;
  });

  it('wmcp-progress clamps aria-valuenow to max and survives max<=0', async () => {
    // Regression: aria-valuenow was reported unclamped (could exceed max) and the
    // width calc divided by max with no guard for max<=0 (NaN/Infinity).
    const over = await fixture<WmcpProgress>(
      html`<wmcp-progress value="200" max="100"></wmcp-progress>`,
    );
    await over.updateComplete;
    expect(over.getAttribute('aria-valuenow')).to.equal('100');
    const bar = over.shadowRoot!.querySelector('.bar') as HTMLElement;
    expect(bar.style.width).to.equal('100%');

    const zeroMax = await fixture<WmcpProgress>(
      html`<wmcp-progress value="10" max="0"></wmcp-progress>`,
    );
    await zeroMax.updateComplete;
    const zbar = zeroMax.shadowRoot!.querySelector('.bar') as HTMLElement;
    // No NaN/Infinity in the width; bar collapses to 0.
    expect(zbar.style.width === '0%' || zbar.style.width === '').to.be.true;
    expect(zeroMax.getAttribute('aria-valuenow')).to.equal('0');
  });

  it('wmcp-avatar shows the image, falling back to text on error', async () => {
    const el = await fixture<WmcpAvatar>(
      html`<wmcp-avatar src="/x.png" alt="Ada" fallback="AD"></wmcp-avatar>`,
    );
    expect(el.shadowRoot!.querySelector('img')).to.exist;
    el.shadowRoot!.querySelector('img')!.dispatchEvent(new Event('error'));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).to.not.exist;
    expect(el.shadowRoot!.textContent).to.contain('AD');
  });

  it('wmcp-tooltip is a hover-mode popover (role=tooltip)', async () => {
    const el = await fixture<WmcpTooltip>(
      html`<wmcp-tooltip label="Help">Tip</wmcp-tooltip>`,
    );
    expect(customElements.get('wmcp-tooltip')).to.exist;
    expect(el.trigger).to.equal('hover');
    expect(el.shadowRoot!.querySelector('.panel')!.getAttribute('role')).to.equal(
      'tooltip',
    );
  });
});
