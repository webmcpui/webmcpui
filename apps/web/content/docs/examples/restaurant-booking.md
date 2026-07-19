---
title: Book a table in one sentence
navTitle: Restaurant booking
description: One natural-language sentence becomes three filled selects and a confirmation dialog — all element-exposed tools.
group: Examples
groupOrder: 5
order: 3
---

# Book a table in one sentence

"Book a table for 4 on Friday at 7." That's the whole interaction. The agent fills the day, time, and party-size selects — each an enum-typed tool, so it can only pick values the form actually offers — and then opens the confirmation for you to approve.

::restaurant-booking-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `fill_day` | Element (`<wmcp-select expose>`) | Sets the day — enum of Monday–Sunday |
| `fill_time` | Element (`<wmcp-select expose>`) | Sets the time — enum of open slots |
| `fill_party_size` | Element (`<wmcp-select expose>`) | Sets the guest count — enum of 1–8 |
| `confirm_reservation` | Element (`<wmcp-dialog expose>`) | Opens the summary for the human to confirm |

## How it works

Unlike the [recipe cart](/docs/examples/recipe-cart), this page needs **zero custom tool code** — every tool comes from an exposed element:

```html
<wmcp-select name="day" label="Day" expose>
  <option>Monday</option>
  …
</wmcp-select>
```

A select's tool schema is an enum of its option values, which is the quiet superpower here: the agent literally cannot book "Fridayish at 7-ish" — it has to pick a real slot, the same ones a human would see in the dropdown. Validation is structural, not defensive.

Confirming is the human's click. The agent gets you to a filled form and an open dialog; the reservation happens when you say so.
