import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpSwitch } from './switch.js';

before(() => defineComponents());

describe('wmcp-switch', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-switch')).to.exist;
  });

  it('renders a role=switch control and a label', async () => {
    const el = await fixture<WmcpSwitch>(
      html`<wmcp-switch label="Notifications"></wmcp-switch>`,
    );
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('role')).to.equal('switch');
    expect(el.shadowRoot!.querySelector('.label-text')?.textContent?.trim()).to.equal(
      'Notifications',
    );
  });

  it('toggles checked on change', async () => {
    const el = await fixture<WmcpSwitch>(html`<wmcp-switch></wmcp-switch>`);
    const input = el.shadowRoot!.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  describe('form association', () => {
    it('contributes nothing when off, its value when on', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-switch name="notify"></wmcp-switch></form>`,
      );
      const el = form.querySelector<WmcpSwitch>('wmcp-switch')!;
      expect(new FormData(form).has('notify')).to.be.false;

      el.checked = true;
      await el.updateComplete;
      expect(new FormData(form).get('notify')).to.equal('on');
    });

    it('restores its initial state on reset', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-switch name="n" checked></wmcp-switch></form>`,
      );
      const el = form.querySelector<WmcpSwitch>('wmcp-switch')!;
      el.checked = false;
      await el.updateComplete;
      form.reset();
      await el.updateComplete;
      expect(el.checked).to.be.true;
    });
  });

  describe('WebMCP exposure', () => {
    it('exposes a boolean tool and flips in both directions', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpSwitch>(
          html`<wmcp-switch name="notify" label="Notify" expose></wmcp-switch>`,
        );
        await el.updateComplete;

        const tool = agent.get('fill_notify');
        expect(tool).to.exist;
        expect((tool!.inputSchema as any).properties.checked.type).to.equal('boolean');

        const on = await agent.call('fill_notify', { checked: true });
        await el.updateComplete;
        expect(el.checked).to.be.true;
        expect(on.content[0]!.text).to.contain('on');

        await agent.call('fill_notify', { checked: false });
        await el.updateComplete;
        expect(el.checked).to.be.false;
      } finally {
        agent.restore();
      }
    });
  });
});
