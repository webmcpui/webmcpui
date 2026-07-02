import '@webmcpui/tokens/css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Input, Dialog, Tabs } from '@webmcpui/react';
import { installFakeAgent } from '@webmcpui/components/testing';

// Install the fake WebMCP host BEFORE any element mounts.
const agent = installFakeAgent();

function App() {
  const [count, setCount] = React.useState(0);
  const [booked, setBooked] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState('overview');

  return (
    <div style={{ display: 'grid', gap: 28, color: 'var(--foreground)', width: 440 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>@webmcpui/react — proving slice</h1>

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
          Button · clicked {count}×
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        {/* @ts-expect-error value/onInput are element props via @lit/react */}
        <Input label="Email" type="email" value={email} onInput={(e: any) => setEmail(e.target.value)} placeholder="you@example.com" />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>controlled value: “{email}”</span>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        {/* @ts-expect-error active is an element prop */}
        <Tabs active={active} onChange={(e: any) => setActive(e.detail.value)}>
          <section tab="overview" tab-label="Overview"><p style={{ margin: 0, color: 'var(--muted-foreground)' }}>Overview panel.</p></section>
          <section tab="usage" tab-label="Usage"><p style={{ margin: 0, color: 'var(--muted-foreground)' }}>12,480 requests.</p></section>
          <section tab="billing" tab-label="Billing"><p style={{ margin: 0, color: 'var(--muted-foreground)' }}>Pro plan.</p></section>
        </Tabs>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>active tab: {active}</span>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>Open dialog</Button>
        {/* @ts-expect-error open is an element prop */}
        <Dialog open={open} label="Confirm" onClose={() => setOpen(false)}>
          <div style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ margin: 0 }}>Confirm booking</h3>
            <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>Tuesday, 3:00 PM?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => { setBooked(true); setOpen(false); }}>Confirm</Button>
            </div>
          </div>
        </Dialog>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <Button variant="primary" expose toolName="book_appointment" onClick={() => setBooked(true)}>
          Book (exposed)
        </Button>
        <button
          onClick={() => agent.call('book_appointment')}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', width: 'fit-content' }}
        >
          ▶ Run agent → book_appointment()
        </button>
        <span style={{ color: booked ? 'var(--brand)' : 'var(--muted-foreground)', fontSize: 14 }}>
          {booked ? '✓ Booked.' : 'Not booked yet.'}
        </span>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
