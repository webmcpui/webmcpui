import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpTabs } from './tabs.js';

before(() => defineComponents());

function tabsFixture() {
  return fixture<WmcpTabs>(html`
    <wmcp-tabs name="settings" label="Settings">
      <section tab="profile" tab-label="Profile">Profile panel</section>
      <section tab="billing" tab-label="Billing">Billing panel</section>
      <section tab="admin" tab-label="Admin" tab-disabled>Admin panel</section>
    </wmcp-tabs>
  `);
}

describe('wmcp-tabs', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-tabs')).to.exist;
  });

  it('renders a tablist from [tab] children', async () => {
    const el = await tabsFixture();
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabs).to.have.length(3);
    expect(el.shadowRoot!.querySelector('[role="tablist"]')).to.exist;
    expect(tabs[0]!.textContent?.trim()).to.equal('Profile');
  });

  it('defaults active to the first tab and hides the other panels', async () => {
    const el = await tabsFixture();
    await el.updateComplete;
    expect(el.active).to.equal('profile');
    const panels = el.querySelectorAll('[tab]');
    expect(panels[0]!.hasAttribute('hidden')).to.be.false;
    expect(panels[1]!.hasAttribute('hidden')).to.be.true;
    expect(panels[0]!.getAttribute('role')).to.equal('tabpanel');
  });

  it('switches on tab click, revealing the panel and firing change', async () => {
    const el = await tabsFixture();
    let detail: { value: string } | null = null;
    el.addEventListener('change', (e) => (detail = (e as CustomEvent).detail));

    el.shadowRoot!.querySelector<HTMLButtonElement>('.tab[data-value="billing"]')!.click();
    await el.updateComplete;

    expect(el.active).to.equal('billing');
    expect(detail).to.deep.equal({ value: 'billing' });
    const panels = el.querySelectorAll('[tab]');
    expect(panels[0]!.hasAttribute('hidden')).to.be.true;
    expect(panels[1]!.hasAttribute('hidden')).to.be.false;
    expect(
      el.shadowRoot!.querySelector('.tab[data-value="billing"]')!.getAttribute('aria-selected'),
    ).to.equal('true');
  });

  it('moves the active tab with the arrow keys', async () => {
    const el = await tabsFixture();
    el.shadowRoot!
      .querySelector('[role="tablist"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(el.active).to.equal('billing');
  });

  it('persists the active state by reflecting it as an attribute', async () => {
    const el = await tabsFixture();
    el.switchTo('billing');
    await el.updateComplete;
    expect(el.getAttribute('active')).to.equal('billing');
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await tabsFixture();
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a switch tool whose tab is an enum of enabled values', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTabs>(html`
          <wmcp-tabs name="settings" label="Settings" expose>
            <section tab="profile" tab-label="Profile">P</section>
            <section tab="billing" tab-label="Billing">B</section>
            <section tab="admin" tab-label="Admin" tab-disabled>A</section>
          </wmcp-tabs>
        `);
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const tool = agent.get('switch_settings');
        expect(tool).to.exist;
        const tabSchema = (tool!.inputSchema as any).properties.tab;
        expect(tabSchema.enum).to.deep.equal(['profile', 'billing']);
      } finally {
        agent.restore();
      }
    });

    it('switches the active tab when the agent calls the tool', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTabs>(html`
          <wmcp-tabs name="settings" expose>
            <section tab="profile" tab-label="Profile">P</section>
            <section tab="billing" tab-label="Billing">B</section>
          </wmcp-tabs>
        `);
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        let detail: { value: string } | null = null;
        el.addEventListener('change', (e) => (detail = (e as CustomEvent).detail));

        const result = await agent.call('switch_settings', { tab: 'billing' });
        await el.updateComplete;
        expect(el.active).to.equal('billing');
        expect(detail).to.deep.equal({ value: 'billing' });
        expect(result.content[0]!.text).to.contain('Billing');
      } finally {
        agent.restore();
      }
    });

    it('errors on an unknown or disabled tab', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTabs>(html`
          <wmcp-tabs name="settings" expose>
            <section tab="profile" tab-label="Profile">P</section>
            <section tab="admin" tab-label="Admin" tab-disabled>A</section>
          </wmcp-tabs>
        `);
        await el.updateComplete;
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        expect((await agent.call('switch_settings', { tab: 'nope' })).isError).to.be.true;
        expect((await agent.call('switch_settings', { tab: 'admin' })).isError).to.be.true;
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTabs>(html`
          <wmcp-tabs name="settings" expose>
            <section tab="profile" tab-label="Profile">P</section>
          </wmcp-tabs>
        `);
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
