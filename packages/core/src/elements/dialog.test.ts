import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpDialog } from './dialog.js';

before(() => defineComponents());

describe('wmcp-dialog', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-dialog')).to.exist;
  });

  it('renders a native dialog wrapping slotted content', async () => {
    const el = await fixture<WmcpDialog>(
      html`<wmcp-dialog label="Confirm"><p>Body</p></wmcp-dialog>`,
    );
    const dialog = el.shadowRoot!.querySelector('dialog');
    expect(dialog).to.exist;
    expect(dialog!.querySelector('slot')).to.exist;
    expect(el.querySelector('p')?.textContent).to.equal('Body');
  });

  it('is closed by default', async () => {
    const el = await fixture<WmcpDialog>(html`<wmcp-dialog></wmcp-dialog>`);
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.false;
  });

  describe('open / close', () => {
    it('opens as a modal via show()', async () => {
      const el = await fixture<WmcpDialog>(html`<wmcp-dialog></wmcp-dialog>`);
      el.show();
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector('dialog')!;
      expect(el.open).to.be.true;
      expect(el.hasAttribute('open')).to.be.true;
      expect(dialog.open).to.be.true;
      // showModal puts it in the top layer (modal), not a plain open.
      expect(dialog.matches(':modal')).to.be.true;
    });

    it('opens non-modally when modal is false', async () => {
      const el = await fixture<WmcpDialog>(
        html`<wmcp-dialog .modal=${false}></wmcp-dialog>`,
      );
      el.show();
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector('dialog')!;
      expect(dialog.open).to.be.true;
      expect(dialog.matches(':modal')).to.be.false;
    });

    it('closes via close() and records a returnValue', async () => {
      const el = await fixture<WmcpDialog>(html`<wmcp-dialog open></wmcp-dialog>`);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.true;

      el.close('confirmed');
      await el.updateComplete;
      expect(el.open).to.be.false;
      expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.false;
      expect(el.returnValue).to.equal('confirmed');
    });

    it('syncs open=false when the native dialog closes (e.g. Escape)', async () => {
      const el = await fixture<WmcpDialog>(html`<wmcp-dialog open></wmcp-dialog>`);
      await el.updateComplete;

      // Native close — what Escape ultimately triggers — fires `close` as a
      // queued task, so wait for the host's re-dispatched event before asserting.
      const closed = oneEvent(el, 'close');
      el.shadowRoot!.querySelector('dialog')!.close();
      await closed;
      expect(el.open).to.be.false;
    });

    it('emits a composed open event', async () => {
      const el = await fixture<WmcpDialog>(html`<wmcp-dialog></wmcp-dialog>`);
      let opened = false;
      el.addEventListener('open', () => (opened = true));
      el.show();
      await el.updateComplete;
      expect(opened).to.be.true;
    });
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpDialog>(html`<wmcp-dialog name="booking"></wmcp-dialog>`);
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a no-arg open tool and opens the dialog when called', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpDialog>(
          html`<wmcp-dialog name="booking" label="Confirm booking" expose>
            <p>Review your appointment.</p>
          </wmcp-dialog>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const tool = agent.get('open_booking');
        expect(tool).to.exist;
        expect((tool!.inputSchema as any).properties).to.deep.equal({});

        const result = await agent.call('open_booking');
        await el.updateComplete;
        expect(el.open).to.be.true;
        expect(el.shadowRoot!.querySelector('dialog')!.open).to.be.true;
        expect(result.content[0]!.text).to.contain('Opened');
      } finally {
        agent.restore();
      }
    });

    it('honors a custom tool-name and reports an already-open dialog', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpDialog>(
          html`<wmcp-dialog name="x" tool-name="show_terms" open expose
            >Terms</wmcp-dialog
          >`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        expect(agent.get('show_terms')).to.exist;
        const result = await agent.call('show_terms');
        expect(result.content[0]!.text).to.contain('already open');
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpDialog>(
          html`<wmcp-dialog name="booking" expose></wmcp-dialog>`,
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
