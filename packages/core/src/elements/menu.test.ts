import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpMenu } from './menu.js';

before(() => defineComponents());

describe('wmcp-menu', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-menu')).to.exist;
  });

  it('renders a trigger and a menu popover with items from <option> children', async () => {
    const el = await fixture<WmcpMenu>(
      html`<wmcp-menu label="Actions">
        <option value="edit">Edit</option>
        <option value="delete">Delete</option>
      </wmcp-menu>`,
    );
    expect(el.shadowRoot!.querySelector('.trigger')).to.exist;
    const menu = el.shadowRoot!.querySelector('[role="menu"]');
    expect(menu).to.exist;
    expect(menu!.hasAttribute('popover')).to.be.true;
    expect(el.shadowRoot!.querySelectorAll('[role="menuitem"]')).to.have.length(2);
  });

  it('reads items from the items property (overriding children)', async () => {
    const el = await fixture<WmcpMenu>(
      html`<wmcp-menu label="Go"><option value="x">X</option></wmcp-menu>`,
    );
    el.items = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ];
    await el.updateComplete;
    const items = el.shadowRoot!.querySelectorAll('[role="menuitem"]');
    expect(items).to.have.length(2);
    expect(items[0]!.textContent?.trim()).to.equal('Alpha');
  });

  describe('selection', () => {
    it('fires a composed select event on item click', async () => {
      const el = await fixture<WmcpMenu>(
        html`<wmcp-menu label="Actions">
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
        </wmcp-menu>`,
      );
      let detail: { value: string; label: string } | null = null;
      el.addEventListener('select', (e) => {
        detail = (e as CustomEvent).detail;
      });
      el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.item')[1]!.click();
      expect(detail).to.deep.equal({ value: 'delete', label: 'Delete' });
    });

    it('does not select a disabled item', async () => {
      const el = await fixture<WmcpMenu>(html`<wmcp-menu label="Go"></wmcp-menu>`);
      el.items = [{ value: 'a', label: 'Alpha', disabled: true }];
      await el.updateComplete;
      let fired = false;
      el.addEventListener('select', () => (fired = true));
      el.shadowRoot!.querySelector<HTMLButtonElement>('.item')!.click();
      expect(fired).to.be.false;
    });
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions"><option value="edit">Edit</option></wmcp-menu>`,
        );
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a parameterized tool whose item is an enum of values', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions" label="Actions" expose>
            <option value="edit">Edit</option>
            <option value="duplicate">Duplicate</option>
            <option value="delete" disabled>Delete</option>
          </wmcp-menu>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const tool = agent.get('select_actions');
        expect(tool).to.exist;
        const itemSchema = (tool!.inputSchema as any).properties.item;
        expect(itemSchema.type).to.equal('string');
        // Disabled items are excluded from the enum.
        expect(itemSchema.enum).to.deep.equal(['edit', 'duplicate']);
      } finally {
        agent.restore();
      }
    });

    it('selects an item when the agent calls the tool', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions" expose>
            <option value="edit">Edit</option>
            <option value="duplicate">Duplicate</option>
          </wmcp-menu>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        let detail: { value: string; label: string } | null = null;
        el.addEventListener('select', (e) => {
          detail = (e as CustomEvent).detail;
        });

        const result = await agent.call('select_actions', { item: 'duplicate' });
        expect(detail).to.deep.equal({ value: 'duplicate', label: 'Duplicate' });
        expect(result.content[0]!.text).to.contain('Duplicate');
      } finally {
        agent.restore();
      }
    });

    it('errors on an unknown or disabled item', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions" expose>
            <option value="edit">Edit</option>
            <option value="delete" disabled>Delete</option>
          </wmcp-menu>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const unknown = await agent.call('select_actions', { item: 'nope' });
        expect(unknown.isError).to.be.true;
        const disabled = await agent.call('select_actions', { item: 'delete' });
        expect(disabled.isError).to.be.true;
      } finally {
        agent.restore();
      }
    });

    it('refreshes the tool enum when items change', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions" expose>
            <option value="edit">Edit</option>
          </wmcp-menu>`,
        );
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        expect((agent.get('select_actions')!.inputSchema as any).properties.item.enum).to.deep.equal(['edit']);

        el.items = [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ];
        await el.updateComplete;
        expect((agent.get('select_actions')!.inputSchema as any).properties.item.enum).to.deep.equal(['one', 'two']);
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpMenu>(
          html`<wmcp-menu name="actions" expose>
            <option value="edit">Edit</option>
          </wmcp-menu>`,
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
