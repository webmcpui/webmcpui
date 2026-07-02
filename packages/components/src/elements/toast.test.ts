import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpToast } from './toast.js';

before(() => defineComponents());

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('wmcp-toast', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-toast')).to.exist;
  });

  it('renders an aria-live region', async () => {
    const el = await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
    const region = el.shadowRoot!.querySelector('[role="region"]')!;
    expect(region.getAttribute('aria-live')).to.equal('polite');
  });

  describe('primitive API', () => {
    it('shows a toast with title, message, and variant role', async () => {
      const el = await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
      el.show({ title: 'Saved', message: 'Your changes are saved.', variant: 'success', duration: 0 });
      await el.updateComplete;

      const toast = el.shadowRoot!.querySelector('.toast')!;
      expect(toast.getAttribute('data-variant')).to.equal('success');
      expect(toast.getAttribute('role')).to.equal('status');
      expect(el.shadowRoot!.querySelector('.title')!.textContent).to.equal('Saved');
      expect(el.shadowRoot!.querySelector('.message')!.textContent).to.equal(
        'Your changes are saved.',
      );
    });

    it('uses role=alert for errors', async () => {
      const el = await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
      el.show({ message: 'Card declined', variant: 'error', duration: 0 });
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.toast')!.getAttribute('role')).to.equal('alert');
    });

    it('dismisses by id and clears all', async () => {
      const el = await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
      const id = el.show({ message: 'One', duration: 0 });
      el.show({ message: 'Two', duration: 0 });
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(2);

      el.dismiss(id);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(1);

      el.clear();
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(0);
    });

    it('auto-dismisses after the duration', async () => {
      const el = await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
      el.show({ message: 'Briefly', duration: 30 });
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(1);

      await wait(60);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.toast')).to.have.length(0);
    });
  });

  describe('WebMCP read surface', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpToast>(html`<wmcp-toast></wmcp-toast>`);
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a no-arg read tool named read_notifications', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast expose></wmcp-toast>`);
        await el.updateComplete;
        const tool = agent.get('read_notifications');
        expect(tool).to.exist;
        expect((tool!.inputSchema as any).properties).to.deep.equal({});
      } finally {
        agent.restore();
      }
    });

    it('honors a custom name (read_<name>)', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast name="status" expose></wmcp-toast>`);
        await el.updateComplete;
        expect(agent.get('read_status')).to.exist;
      } finally {
        agent.restore();
      }
    });

    it('reports the notifications currently shown', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast expose></wmcp-toast>`);
        await el.updateComplete;
        el.show({ message: 'Payment received', variant: 'success', duration: 0 });

        const result = await agent.call('read_notifications');
        expect(result.content[0]!.text).to.contain('Payment received');
        expect(result.content[0]!.text).to.contain('success');
      } finally {
        agent.restore();
      }
    });

    it('reports recently-shown toasts once they have vanished', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast expose></wmcp-toast>`);
        await el.updateComplete;
        const id = el.show({ message: 'Export ready', duration: 0 });
        el.dismiss(id);

        const result = await agent.call('read_notifications');
        expect(result.content[0]!.text).to.contain('Recently shown');
        expect(result.content[0]!.text).to.contain('Export ready');
      } finally {
        agent.restore();
      }
    });

    it('says so when there is nothing to report', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast expose></wmcp-toast>`);
        await el.updateComplete;
        const result = await agent.call('read_notifications');
        expect(result.content[0]!.text).to.contain('No notifications');
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpToast>(html`<wmcp-toast expose></wmcp-toast>`);
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
