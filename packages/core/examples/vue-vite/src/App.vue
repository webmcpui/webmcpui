<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WmcpInput, StandardSchemaV1 } from '@webmcpui/core'

const emailInput = ref<WmcpInput | null>(null)
const output = ref('—')

const emailSchema: StandardSchemaV1 = {
  '~standard': {
    version: 1,
    vendor: 'demo',
    validate: (v: unknown) =>
      typeof v === 'string' && v.includes('@')
        ? { value: v }
        : { issues: [{ message: 'Enter a valid email address' }] },
  },
}

onMounted(() => {
  if (emailInput.value) emailInput.value.schema = emailSchema
})

function onSubmit(e: Event) {
  const data = Object.fromEntries(
    new FormData(e.target as HTMLFormElement).entries(),
  )
  output.value = JSON.stringify(data, null, 2)
}
</script>

<template>
  <h1>Vue 3 + Vite</h1>
  <p>
    These inputs are <code>&lt;wmcp-*&gt;</code> custom elements used inside a
    Vue 3 app. The <code>isCustomElement</code> option in
    <code>vite.config.ts</code> tells Vue's compiler to pass them through as
    native elements rather than resolving them as Vue components.
  </p>

  <form @submit.prevent="onSubmit">
    <wmcp-input
      label="Full name"
      name="name"
      helper-text="As it should appear on the booking"
      expose
    />

    <wmcp-input
      ref="emailInput"
      label="Email"
      name="email"
      type="email"
      placeholder="you@example.com"
      required
      expose
    />

    <wmcp-select label="Plan" name="plan" placeholder="Choose a plan…" expose>
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="enterprise">Enterprise</option>
    </wmcp-select>

    <wmcp-textarea
      label="Notes"
      name="notes"
      rows="4"
      helper-text="Anything else we should know?"
      expose
    />

    <wmcp-checkbox
      label="Subscribe to the newsletter"
      name="subscribe"
      value="yes"
      expose
    />

    <button type="submit">Submit</button>
  </form>

  <h2>Submitted values</h2>
  <pre>{{ output }}</pre>
</template>

<style>
body {
  font-family: ui-sans-serif, system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  max-width: 32rem;
  margin: 4rem auto;
  padding: 0 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: stretch;
}

wmcp-input,
wmcp-select,
wmcp-textarea {
  width: 100%;
}

button {
  align-self: start;
  height: 2.25rem;
  padding: 0 1rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
}

pre {
  background: var(--muted);
  padding: 0.75rem;
  border-radius: var(--radius);
}
</style>
