<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Dialog, Tabs } from '@webmcpui/vue';
import { agent } from './agent';

const count = ref(0);
const booked = ref(false);
const email = ref('');
const open = ref(false);
const active = ref('overview');

const muted = { color: 'var(--muted-foreground)', fontSize: '13px' } as const;
</script>

<template>
  <div :style="{ display: 'grid', gap: '28px', color: 'var(--foreground)', width: '440px' }">
    <h1 style="font-size: 20px; margin: 0">@webmcpui/vue — proving slice</h1>

    <section style="display: flex; flex-wrap: wrap; gap: 8px">
      <Button variant="primary" @click="count++">Button · clicked {{ count }}×</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
    </section>

    <section style="display: grid; gap: 6px">
      <Input v-model="email" type="email" label="Email" placeholder="you@example.com" />
      <span :style="muted">v-model: “{{ email }}”</span>
    </section>

    <section style="display: grid; gap: 6px">
      <Tabs v-model:active="active" label="Account">
        <section tab="overview" tab-label="Overview"><p style="margin: 0; color: var(--muted-foreground)">Overview panel.</p></section>
        <section tab="usage" tab-label="Usage"><p style="margin: 0; color: var(--muted-foreground)">12,480 requests.</p></section>
        <section tab="billing" tab-label="Billing"><p style="margin: 0; color: var(--muted-foreground)">Pro plan.</p></section>
      </Tabs>
      <span :style="muted">active tab: {{ active }}</span>
    </section>

    <section style="display: grid; gap: 8px">
      <Button variant="primary" @click="open = true">Open dialog</Button>
      <Dialog v-model:open="open" label="Confirm">
        <div style="display: grid; gap: 12px">
          <h3 style="margin: 0">Confirm booking</h3>
          <p style="margin: 0; color: var(--muted-foreground)">Tuesday, 3:00 PM?</p>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <Button variant="ghost" @click="open = false">Cancel</Button>
            <Button variant="primary" @click="booked = true; open = false">Confirm</Button>
          </div>
        </div>
      </Dialog>
    </section>

    <section style="display: grid; gap: 8px">
      <Button variant="primary" expose tool-name="book_appointment" @click="booked = true">
        Book (exposed)
      </Button>
      <button
        style="padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--foreground); cursor: pointer; width: fit-content"
        @click="agent.call('book_appointment')"
      >
        ▶ Run agent → book_appointment()
      </button>
      <span :style="{ color: booked ? 'var(--brand)' : 'var(--muted-foreground)', fontSize: '14px' }">
        {{ booked ? '✓ Booked.' : 'Not booked yet.' }}
      </span>
    </section>
  </div>
</template>
