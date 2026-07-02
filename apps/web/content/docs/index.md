---
title: Introduction
navTitle: Introduction
description: Agent-aware web components for the WebMCP era — framework-agnostic form and interaction primitives with Standard Schema validation.
group: Getting started
groupOrder: 1
order: 1
---

# Introduction

**webmcpui** is a framework-agnostic, WebMCP-native web component library. Every element is a proper, accessible HTML control first and, when you opt in, also registers an imperative [WebMCP](/docs/webmcp) tool an agent can call.

Three families of primitives:

- **Form controls** expose a *value* an agent can set — `<wmcp-input>`, `<wmcp-textarea>`, `<wmcp-select>`, `<wmcp-checkbox>`, `<wmcp-radio>` / `<wmcp-radio-group>`. Shared behavior (form association, validation, WebMCP exposure, theming) lives in a `WmcpFormControl` base.
- **Interaction primitives** expose an *action* an agent can trigger — `<wmcp-button>`, `<wmcp-dialog>`, `<wmcp-menu>`, `<wmcp-tabs>`, `<wmcp-popover>`, `<wmcp-switch>`, `<wmcp-tooltip>` — or, for `<wmcp-toast>`, a *reading* an agent can perceive. They share a `WmcpAction` / `WmcpExposable` base.
- **Presentational primitives** are accessible, themed controls with no agent surface — `<wmcp-badge>`, `<wmcp-separator>`, `<wmcp-alert>`, `<wmcp-progress>`, `<wmcp-avatar>`.

Building in React or Vue? [`@webmcpui/react`](/docs/frameworks) and [`@webmcpui/vue`](/docs/frameworks) wrap these elements with typed, idiomatic components — same behavior, framework-native ergonomics.

## Why it exists

The same control a person operates by hand, an agent should be able to operate by calling a tool — fill a field, click a button, open a dialog, switch a tab, or read a notification. webmcpui's elements are good, accessible controls first; agent-exposure is additive and opt-in.

It's all feature-detected: with no agent present (the common case today), the WebMCP layer is a complete no-op, so your controls are always good HTML.

## One source of truth, two channels

Vanilla custom elements built with [Lit](https://lit.dev), distributed two ways:

- an **ESM package** for build tools (`@webmcpui/components`), and
- a single-file **CDN bundle** for no-build environments (Webflow, WordPress, plain HTML).

## Next steps

- [Installation](/docs/installation) — add it to your project, with or without a build step.
- [Validation](/docs/validation) — bring any Standard Schema validator.
- [WebMCP exposure](/docs/webmcp) — how elements become agent tools.
- [Testing](/docs/testing) — exercise exposure with the fake agent.
