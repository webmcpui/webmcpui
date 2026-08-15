import { expect } from '@open-wc/testing';
import { z } from 'zod';
import { defineComponents } from '../register.js';
import { installFakeAgent, type FakeAgent } from '../testing.js';
import type { WmcpInput } from '../elements/input.js';
import type { WmcpSelect } from '../elements/select.js';
import type { WmcpButton } from '../elements/button.js';
import type { WmcpToast } from '../elements/toast.js';

before(() => defineComponents());

/**
 * This is the audit as a test.
 *
 * Every other spec in this package proves one element's contract in
 * isolation. This one plays the part of the thing those contracts exist for
 * — a WebMCP agent — and drives a realistic booking form the way an agent
 * actually would: read the registered tools, call them with both bad and
 * good input, and judge success only by what the tool *said happened*, never
 * by peeking at internal state the agent could not see. It is meant to keep
 * failing loudly, forever, in CI, if the truthful-result contract on
 * `<wmcp-button type="submit">` — or the fill/validate/submit pipeline it
 * depends on — ever regresses.
 *
 * Deliberately not built with `@open-wc/testing`'s `fixture()`: that helper
 * tears every fixture off the page in a global `afterEach`, which would
 * disconnect (and so unregister) our elements between the `it`s that make up
 * this one continuous scenario. We build and tear down the DOM by hand
 * instead, once for the whole `describe`.
 */
describe('agent drives a booking form', () => {
  let agent: FakeAgent;
  let container: HTMLElement;
  let form: HTMLFormElement;
  let emailEl: WmcpInput;
  let partyEl: WmcpSelect;
  let bookEl: WmcpButton;
  let toastEl: WmcpToast;
  let submitCount: number;

  before(async () => {
    // Install the fake WebMCP host before anything connects, so every
    // element's connectedCallback registers its tool with it — exactly the
    // order a real page load would produce with an agent already attached.
    agent = installFakeAgent();

    container = document.createElement('div');
    container.innerHTML = `
      <form>
        <wmcp-input name="email" label="Email" type="email" required expose></wmcp-input>
        <wmcp-select name="party" label="Party size" expose>
          <option value="" disabled selected>Choose a party size…</option>
          <option value="2">2 guests</option>
          <option value="4">4 guests</option>
          <option value="6">6 guests</option>
        </wmcp-select>
        <wmcp-button name="book" type="submit" expose>Book</wmcp-button>
        <wmcp-toast expose></wmcp-toast>
      </form>
    `;
    document.body.appendChild(container);

    form = container.querySelector('form')!;
    emailEl = container.querySelector('wmcp-input')!;
    partyEl = container.querySelector('wmcp-select')!;
    bookEl = container.querySelector('wmcp-button')!;
    toastEl = container.querySelector('wmcp-toast')!;

    // A realistic submit handler: it's the thing whose having-run (not the
    // click, not the tool call) is what "submitted" is allowed to mean, and
    // it's what actually produces the notification the agent reads at the
    // end. preventDefault keeps the (nonexistent) navigation from tearing
    // down the test page — same trick as button.test.ts.
    submitCount = 0;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitCount += 1;
      const email = new FormData(form).get('email');
      toastEl.show({
        title: 'Booked',
        message: `Reservation confirmed for ${email}.`,
        variant: 'success',
        duration: 0,
      });
    });

    // Standard Schema validator set as a property, not an attribute — the
    // zod major resolved here (4.x) implements `~standard` natively, so no
    // adapter is needed.
    emailEl.schema = z.email('Enter a valid email');

    await Promise.all([
      emailEl.updateComplete,
      partyEl.updateComplete,
      bookEl.updateComplete,
      toastEl.updateComplete,
    ]);
  });

  after(() => {
    agent.restore();
    container.remove();
  });

  it('registers the tools an agent needs to drive the form', () => {
    expect(agent.get('fill_email'), 'fill_email').to.exist;
    expect(agent.get('fill_party'), 'fill_party').to.exist;
    expect(agent.get('click_book'), 'click_book').to.exist;
    expect(agent.get('read_notifications'), 'read_notifications').to.exist;
  });

  it('rejects an invalid email and surfaces the zod message', async () => {
    const result = await agent.call('fill_email', { value: 'not-an-email' });
    expect(result.isError).to.be.true;
    expect(result.content[0]!.text).to.contain('Enter a valid email');
  });

  it('refuses to submit while the email is invalid, and truthfully reports nothing happened', async () => {
    const result = await agent.call('click_book');
    expect(result.isError).to.be.true;
    expect(result.content[0]!.text).to.contain('was not submitted');
    // The truthful-result contract only holds if this is actually true: no
    // `submit` event reached the form's own handler.
    expect(submitCount).to.equal(0);
  });

  it('accepts a valid email, then a party size', async () => {
    const emailResult = await agent.call('fill_email', {
      value: 'ada@example.com',
    });
    expect(emailResult.isError, emailResult.content[0]?.text).to.not.equal(
      true,
    );

    const partyResult = await agent.call('fill_party', { value: '4' });
    expect(partyResult.isError, partyResult.content[0]?.text).to.not.equal(
      true,
    );
    expect(partyEl.value).to.equal('4');
  });

  it('submits the form exactly once and reports success truthfully', async () => {
    const result = await agent.call('click_book');
    expect(result.isError).to.not.equal(true);
    expect(result.content[0]!.text).to.contain('submitted the form');
    expect(submitCount).to.equal(1);
  });

  it("lets the agent read the toast the submit handler raised, round-tripping its content", async () => {
    const result = await agent.call('read_notifications');
    expect(result.content[0]!.text).to.contain('Booked');
    expect(result.content[0]!.text).to.contain('ada@example.com');
  });
});
