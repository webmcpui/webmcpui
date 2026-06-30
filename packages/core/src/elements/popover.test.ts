import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpPopover } from './popover.js';

before(() => defineComponents());

describe('wmcp-popover', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-popover')).to.exist;
  });

  it('renders a trigger and an anchored popover panel', async () => {
    const el = await fixture<WmcpPopover>(
      html`<wmcp-popover label="Details"><p>Body</p></wmcp-popover>`,
    );
    expect(el.shadowRoot!.querySelector('.trigger')).to.exist;
    const panel = el.shadowRoot!.querySelector('.panel')!;
    expect(panel.getAttribute('popover')).to.equal('auto');
    expect(panel.getAttribute('role')).to.equal('dialog');
    expect(el.querySelector('p')?.textContent).to.equal('Body');
  });

  it('is closed by default', async () => {
    const el = await fixture<WmcpPopover>(html`<wmcp-popover label="x"></wmcp-popover>`);
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.querySelector('.panel')!.matches(':popover-open')).to.be.false;
  });

  describe('open / close', () => {
    it('opens via show() and emits open', async () => {
      const el = await fixture<WmcpPopover>(html`<wmcp-popover label="x"><p>hi</p></wmcp-popover>`);
      const opened = oneEvent(el, 'open');
      el.show();
      await opened;
      expect(el.open).to.be.true;
      expect(el.shadowRoot!.querySelector('.panel')!.matches(':popover-open')).to.be.true;
    });

    it('closes via close() and emits close', async () => {
      const el = await fixture<WmcpPopover>(html`<wmcp-popover label="x"><p>hi</p></wmcp-popover>`);
      el.show();
      await oneEvent(el, 'open');
      const closed = oneEvent(el, 'close');
      el.close();
      await closed;
      expect(el.open).to.be.false;
    });
  });

  describe('tooltip mode', () => {
    it('uses role=tooltip and describes its trigger', async () => {
      const el = await fixture<WmcpPopover>(
        html`<wmcp-popover label="Help" trigger="hover"><span slot="trigger">?</span>Tip</wmcp-popover>`,
      );
      const panel = el.shadowRoot!.querySelector('.panel')!;
      expect(panel.getAttribute('role')).to.equal('tooltip');
      expect(panel.getAttribute('popover')).to.equal('manual');
      expect(el.shadowRoot!.querySelector('.trigger')!.getAttribute('aria-describedby')).to.equal(
        'wmcp-pop',
      );
    });

    it('opens on pointer enter', async () => {
      const el = await fixture<WmcpPopover>(
        html`<wmcp-popover label="Help" trigger="hover">Tip</wmcp-popover>`,
      );
      const opened = oneEvent(el, 'open');
      el.shadowRoot!.querySelector('.trigger')!.dispatchEvent(new Event('pointerenter'));
      await opened;
      expect(el.open).to.be.true;
    });
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpPopover>(html`<wmcp-popover name="details" label="Details">x</wmcp-popover>`);
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes an open tool and opens the popover when called', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpPopover>(
          html`<wmcp-popover name="details" label="Details" expose><p>More info</p></wmcp-popover>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const tool = agent.get('open_details');
        expect(tool).to.exist;
        expect((tool!.inputSchema as any).properties).to.deep.equal({});

        const result = await agent.call('open_details');
        await el.updateComplete;
        expect(el.open).to.be.true;
        expect(result.content[0]!.text).to.contain('Opened');
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpPopover>(
          html`<wmcp-popover name="details" expose>x</wmcp-popover>`,
        );
        await el.updateComplete;
        expect(agent.tools).to.have.length(1);
        el.remove();
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });
  });
});
