import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { WmcpButton } from './button.js';

before(() => defineComponents());

describe('wmcp-button', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-button')).to.exist;
  });

  it('renders a native button with slotted content', async () => {
    const el = await fixture<WmcpButton>(
      html`<wmcp-button>Save</wmcp-button>`,
    );
    const button = el.shadowRoot!.querySelector('button');
    expect(button).to.exist;
    expect(button!.querySelector('slot')).to.exist;
    expect(el.textContent?.trim()).to.equal('Save');
  });

  it('reflects variant and size as attributes', async () => {
    const el = await fixture<WmcpButton>(
      html`<wmcp-button variant="destructive" size="lg">Delete</wmcp-button>`,
    );
    expect(el.variant).to.equal('destructive');
    expect(el.size).to.equal('lg');
    expect(el.getAttribute('variant')).to.equal('destructive');
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('forwards clicks to light-DOM listeners (composed)', async () => {
    const el = await fixture<WmcpButton>(
      html`<wmcp-button>Go</wmcp-button>`,
    );
    let clicks = 0;
    el.addEventListener('click', () => (clicks += 1));
    el.shadowRoot!.querySelector('button')!.click();
    expect(clicks).to.equal(1);
  });

  it('sets the accessible name from an explicit label', async () => {
    const el = await fixture<WmcpButton>(
      html`<wmcp-button label="Close dialog">✕</wmcp-button>`,
    );
    expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-label')).to.equal(
      'Close dialog',
    );
  });

  describe('disabled', () => {
    it('does not fire click listeners when disabled', async () => {
      const el = await fixture<WmcpButton>(
        html`<wmcp-button disabled>Go</wmcp-button>`,
      );
      let clicks = 0;
      el.addEventListener('click', () => (clicks += 1));
      el.activate();
      expect(clicks).to.equal(0);
    });
  });

  describe('form participation', () => {
    it('submits the containing form on a submit button', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-button type="submit">Submit</wmcp-button>
        </form>`,
      );
      let submitted = false;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitted = true;
      });
      form.querySelector<WmcpButton>('wmcp-button')!.activate();
      expect(submitted).to.be.true;
    });

    it('resets the containing form on a reset button', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-button type="reset">Reset</wmcp-button>
        </form>`,
      );
      let reset = false;
      form.addEventListener('reset', () => (reset = true));
      form.querySelector<WmcpButton>('wmcp-button')!.activate();
      expect(reset).to.be.true;
    });

    it('does not submit on a plain button', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-button type="button">Noop</wmcp-button>
        </form>`,
      );
      let submitted = false;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitted = true;
      });
      form.querySelector<WmcpButton>('wmcp-button')!.activate();
      expect(submitted).to.be.false;
    });
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpButton>(html`<wmcp-button name="save">Save</wmcp-button>`);
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a no-arg action tool when [expose] is set', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpButton>(
          html`<wmcp-button name="save" tool-name="save_record" expose
            >Save</wmcp-button
          >`,
        );
        await el.updateComplete;

        const tool = agent.get('save_record');
        expect(tool).to.exist;
        expect((tool!.inputSchema as any).properties).to.deep.equal({});
      } finally {
        agent.restore();
      }
    });

    it('triggers the click action when the agent calls the tool', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpButton>(
          html`<wmcp-button name="go" expose>Go</wmcp-button>`,
        );
        await el.updateComplete;
        let clicks = 0;
        el.addEventListener('click', () => (clicks += 1));

        const result = await agent.call('click_go');
        expect(clicks).to.equal(1);
        expect(result.isError).to.not.equal(true);
        expect(result.content[0]!.text).to.contain('Go');
      } finally {
        agent.restore();
      }
    });

    it('submits the form when the agent calls a submit button', async () => {
      const agent = installFakeAgent();
      try {
        const form = await fixture<HTMLFormElement>(
          html`<form>
            <wmcp-button name="book" type="submit" expose>Book</wmcp-button>
          </form>`,
        );
        const el = form.querySelector<WmcpButton>('wmcp-button')!;
        await el.updateComplete;
        let submitted = false;
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          submitted = true;
        });

        const result = await agent.call('click_book');
        expect(submitted).to.be.true;
        expect(result.content[0]!.text).to.contain('submitted the form');
      } finally {
        agent.restore();
      }
    });

    it('refuses to activate a disabled button', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpButton>(
          html`<wmcp-button name="go" expose disabled>Go</wmcp-button>`,
        );
        await el.updateComplete;
        let clicks = 0;
        el.addEventListener('click', () => (clicks += 1));

        const result = await agent.call('click_go');
        expect(clicks).to.equal(0);
        expect(result.isError).to.be.true;
        expect(result.content[0]!.text).to.contain('disabled');
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpButton>(
          html`<wmcp-button name="go" expose>Go</wmcp-button>`,
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
