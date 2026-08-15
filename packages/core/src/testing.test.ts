import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from './register.js';
import { installFakeAgent } from './testing.js';
import type { FakeAgent } from './testing.js';
import type { WmcpInput } from './elements/input.js';

before(() => defineComponents());

type DocumentWithModelContext = Document & { modelContext?: unknown };
type NavigatorWithModelContext = Navigator & { modelContext?: unknown };

describe('installFakeAgent', () => {
  let agent: FakeAgent | undefined;

  afterEach(() => {
    agent?.restore();
    agent = undefined;
  });

  describe('default (surface: "both")', () => {
    it('stubs document.modelContext and navigator.modelContext with the same object', () => {
      agent = installFakeAgent();
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;

      expect(doc.modelContext).to.exist;
      expect(nav.modelContext).to.exist;
      expect(doc.modelContext).to.equal(nav.modelContext);
    });

    it('registers an exposed component exactly once', async () => {
      agent = installFakeAgent();
      await fixture<WmcpInput>(
        html`<wmcp-input name="both-surface" expose></wmcp-input>`,
      );

      const matches = agent.tools.filter((t) => t.name === 'fill_both-surface');
      expect(matches).to.have.length(1);
    });
  });

  describe('surface: "navigator"', () => {
    it('stubs only navigator.modelContext', () => {
      agent = installFakeAgent({ surface: 'navigator' });
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;

      expect(nav.modelContext).to.exist;
      expect(doc.modelContext).to.be.undefined;
    });

    it('still registers an exposed component via the fallback path', async () => {
      agent = installFakeAgent({ surface: 'navigator' });
      await fixture<WmcpInput>(
        html`<wmcp-input name="navigator-surface" expose></wmcp-input>`,
      );

      expect(agent.tools.map((t) => t.name)).to.include(
        'fill_navigator-surface',
      );
    });
  });

  describe('surface: "document"', () => {
    it('stubs only document.modelContext', () => {
      agent = installFakeAgent({ surface: 'document' });
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;

      expect(doc.modelContext).to.exist;
      expect(nav.modelContext).to.be.undefined;
    });

    it('registers an exposed component via the preferred path', async () => {
      agent = installFakeAgent({ surface: 'document' });
      await fixture<WmcpInput>(
        html`<wmcp-input name="document-surface" expose></wmcp-input>`,
      );

      expect(agent.tools.map((t) => t.name)).to.include(
        'fill_document-surface',
      );
    });
  });

  describe('restore()', () => {
    afterEach(() => {
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;
      delete doc.modelContext;
      delete nav.modelContext;
    });

    it('removes the stub when neither surface had a prior value', () => {
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;
      expect('modelContext' in doc).to.be.false;
      expect('modelContext' in nav).to.be.false;

      agent = installFakeAgent();
      expect('modelContext' in doc).to.be.true;
      expect('modelContext' in nav).to.be.true;

      agent.restore();
      agent = undefined;

      expect('modelContext' in doc).to.be.false;
      expect('modelContext' in nav).to.be.false;
    });

    it('restores a pre-existing value on both surfaces', () => {
      const doc = document as DocumentWithModelContext;
      const nav = navigator as NavigatorWithModelContext;
      const docSentinel = { sentinel: 'document' };
      const navSentinel = { sentinel: 'navigator' };
      doc.modelContext = docSentinel;
      nav.modelContext = navSentinel;

      agent = installFakeAgent();
      expect(doc.modelContext).to.not.equal(docSentinel);
      expect(nav.modelContext).to.not.equal(navSentinel);

      agent.restore();
      agent = undefined;

      expect(doc.modelContext).to.equal(docSentinel);
      expect(nav.modelContext).to.equal(navSentinel);
    });
  });
});
