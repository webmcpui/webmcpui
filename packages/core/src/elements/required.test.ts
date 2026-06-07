import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import type { WmcpInput } from './input.js';
import type { WmcpCheckbox } from './checkbox.js';
import type { WmcpSelect } from './select.js';

before(() => defineComponents());

describe('required constraint validation', () => {
  it('is invalid at the form level from load, without showing the message', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wmcp-input name="email" required></wmcp-input></form>`,
    );
    const el = form.querySelector<WmcpInput>('wmcp-input')!;
    await el.updateComplete;
    await el.validate(false);

    // `:invalid` reflects ElementInternals validity without firing an event
    // (unlike checkValidity()/reportValidity(), which would reveal the error).
    expect(el.matches(':invalid')).to.be.true;
    expect(el.shadowRoot!.querySelector('.error')).to.not.exist;
    expect(el.hasAttribute('invalid')).to.be.false;
  });

  it('reveals the message when the form is reported', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wmcp-input name="email" required></wmcp-input></form>`,
    );
    const el = form.querySelector<WmcpInput>('wmcp-input')!;
    await el.updateComplete;
    await el.validate(false);

    form.reportValidity();
    await el.updateComplete;

    expect(el.hasAttribute('invalid')).to.be.true;
    expect(el.shadowRoot!.querySelector('.error')?.textContent).to.contain(
      'required',
    );
  });

  it('becomes valid once filled', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wmcp-input name="email" required></wmcp-input></form>`,
    );
    const el = form.querySelector<WmcpInput>('wmcp-input')!;
    await el.setValueFromAgent('someone@example.com');
    await el.updateComplete;

    expect(form.checkValidity()).to.be.true;
    expect(el.hasAttribute('invalid')).to.be.false;
  });

  it('honors a custom required-message', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wmcp-input
          name="email"
          required
          required-message="We need your email"
        ></wmcp-input>
      </form>
    `);
    const el = form.querySelector<WmcpInput>('wmcp-input')!;
    await el.updateComplete;
    await el.validate(false);
    form.reportValidity();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.error')?.textContent).to.contain(
      'We need your email',
    );
  });

  it('treats an unchecked required checkbox as missing', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wmcp-checkbox name="terms" required></wmcp-checkbox></form>`,
    );
    const el = form.querySelector<WmcpCheckbox>('wmcp-checkbox')!;
    await el.updateComplete;
    await el.validate(false);
    expect(form.checkValidity()).to.be.false;

    el.checked = true;
    await el.validate();
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('treats a required select with no choice as missing', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wmcp-select name="plan" required placeholder="Choose…">
          <option value="pro">Pro</option>
        </wmcp-select>
      </form>
    `);
    const el = form.querySelector<WmcpSelect>('wmcp-select')!;
    await el.updateComplete;
    await el.validate(false);
    expect(form.checkValidity()).to.be.false;

    await el.setValueFromAgent('pro');
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });
});
