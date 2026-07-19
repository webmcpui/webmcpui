---
title: Email → CRM lead
navTitle: Email → CRM lead
description: Paste a messy inquiry email; the agent extracts contact, company, budget, and need, fills the lead form, and files it.
group: Examples
groupOrder: 5
order: 5
---

# Email → CRM lead

Every inquiry email means the same five minutes of retyping: who, where, how much, what do they want. Paste the email instead. The agent extracts the details, fills the form — budget snapped to your pipeline's real ranges — and clicks "Create lead". You see exactly what got filed, in a form you could still edit first.

::crm-lead-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `fill_contact` | Element (`<wmcp-input expose>`) | Sets the contact name |
| `fill_company` | Element (`<wmcp-input expose>`) | Sets the company |
| `fill_budget` | Element (`<wmcp-select expose>`) | Picks a budget range — enum of your real buckets |
| `fill_need` | Element (`<wmcp-textarea expose>`) | Summarizes what they're asking for |
| `create_lead` | Element (`<wmcp-button expose>`) | Saves the lead — same handler as a human click |

## How it works

The whole agent surface is declared in markup — five `expose` attributes:

```html
<wmcp-input name="contact" label="Contact" expose />
<wmcp-input name="company" label="Company" expose />
<wmcp-select name="budget" label="Budget" expose>
  <option>&lt; $5k</option>
  <option>$5–25k</option>
  <option>$25–100k</option>
  <option>$100k+</option>
</wmcp-select>
<wmcp-textarea name="need" label="What they need" expose />

<wmcp-button
  expose
  tool-name="create_lead"
  tool-description="Save the filled-in lead form as a new CRM lead."
  @click="createLead"
>
  Create lead
</wmcp-button>
```

Two things worth stealing:

- **The budget select is an enum.** The email says "$40,000"; the agent has to file it as `$25–100k` because those are the only values the tool accepts. Your pipeline stages stay clean no matter how the money was phrased.
- **`create_lead` runs the same `@click` handler** a human press would. There is no separate "agent API" to keep in sync with the UI — the button *is* the API.
