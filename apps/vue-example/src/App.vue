<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@webmcpui/vue';
import { agent } from './agent';

const count = ref(0);
const booked = ref(false);

function runAgent() {
  agent.call('book_appointment');
}
</script>

<template>
  <div :style="{ display: 'grid', gap: '24px', color: 'var(--foreground)', width: '420px' }">
    <h1 style="font-size: 20px; margin: 0">@webmcpui/vue — Button</h1>

    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>

    <div style="display: flex; align-items: center; gap: 12px">
      <Button variant="primary" @click="count++">Clicked {{ count }}×</Button>
      <span style="color: var(--muted-foreground); font-size: 14px">@click works</span>
    </div>

    <div style="display: grid; gap: 8px">
      <Button
        variant="primary"
        expose
        tool-name="book_appointment"
        @click="booked = true"
      >
        Book appointment
      </Button>
      <button
        style="
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--foreground);
          cursor: pointer;
          width: fit-content;
        "
        @click="runAgent"
      >
        ▶ Run agent → call book_appointment()
      </button>
      <span :style="{ color: booked ? 'var(--brand)' : 'var(--muted-foreground)', fontSize: '14px' }">
        {{ booked ? '✓ Booked — the agent triggered the Vue button.' : 'Not booked yet.' }}
      </span>
    </div>
  </div>
</template>
