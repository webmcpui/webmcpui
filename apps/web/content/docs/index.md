---
title: Introduction
navTitle: Introduction
description: Agent-aware web components for the WebMCP era — framework-agnostic form primitives with Standard Schema validation.
group: Getting started
groupOrder: 1
order: 1
---

# Introduction

**webmcpui** is a framework-agnostic, WebMCP-native web component library. Phase 1 ships form primitives — shared behavior (form association, validation, WebMCP exposure, theming) lives in a `WmcpFormControl` base class, and each element is a thin subclass that supplies its control and specifics.

Shipped so far: `<wmcp-input>`, `<wmcp-textarea>`, `<wmcp-select>`, `<wmcp-checkbox>`, `<wmcp-radio>` / `<wmcp-radio-group>`.

## Why it exists

The same form a person fills in by typing, an agent should be able to fill by calling a tool. webmcpui's elements are proper, accessible, form-associated controls first — and, when you opt in, they also register imperative [WebMCP](/docs/webmcp) tools an agent can discover and call.

It's all additive and feature-detected: with no agent present (the common case today), the WebMCP layer is a complete no-op, so your inputs are always good form controls.

## One source of truth, two channels

Vanilla custom elements built with [Lit](https://lit.dev), distributed two ways:

- an **ESM package** for build tools (`@webmcpui/core`), and
- a single-file **CDN bundle** for no-build environments (Webflow, WordPress, plain HTML).

## Next steps

- [Installation](/docs/installation) — add it to your project, with or without a build step.
- [Validation](/docs/validation) — bring any Standard Schema validator.
- [WebMCP exposure](/docs/webmcp) — how elements become agent tools.
- [Testing](/docs/testing) — exercise exposure with the fake agent.
