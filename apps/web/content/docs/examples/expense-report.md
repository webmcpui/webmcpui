---
title: Receipt → expense report
navTitle: Receipt → expense
description: Paste receipt text; the agent fills vendor, amount, date, and category, and files the expense row.
group: Examples
groupOrder: 5
order: 6
---

# Receipt → expense report

The chore everyone defers until the end of the month. Paste the receipt — crumpled text and all — and the agent files it: vendor from the header, amount from the total line, date, and a category picked from *your* chart of accounts, not free text.

::expense-report-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `fill_vendor` | Element (`<wmcp-input expose>`) | Sets where the money went |
| `fill_amount` | Element (`<wmcp-input type="number" expose>`) | Sets the total — schema says `number`, not string |
| `fill_date` | Element (`<wmcp-input expose>`) | Sets the date |
| `fill_category` | Element (`<wmcp-select expose>`) | Picks Meals / Travel / Software / Office — enum |
| `add_expense` | Element (`<wmcp-button expose>`) | Appends the row to the report |

## How it works

Same shape as the [CRM lead](/docs/examples/crm-lead) example — the agent surface is all markup:

```html
<wmcp-input name="amount" label="Amount ($)" type="number" expose />
<wmcp-select name="category" label="Category" expose>
  <option>Meals</option>
  <option>Travel</option>
  <option>Software</option>
  <option>Office</option>
</wmcp-select>
```

Note the typed schema: `type="number"` on the input makes the tool's `value` a JSON Schema `number`, so "$19.50" arrives as `19.5`, not a string to sanitize later. And the category enum means expense reports stop growing creative new categories like "food stuff" — the agent can only file into buckets that exist.
