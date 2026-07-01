import '@webmcpui/tokens/css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@webmcpui/react';
import { installFakeAgent } from '@webmcpui/core/testing';

// Install the fake WebMCP host BEFORE any element mounts, so the exposed
// <Button> registers its tool with us on connect. (In a real app the host is
// the browser's agent; here it's the test fake.)
const agent = installFakeAgent();

function App() {
  const [count, setCount] = React.useState(0);
  const [booked, setBooked] = React.useState(false);

  return (
    <div style={{ display: 'grid', gap: 24, color: 'var(--foreground)', width: 420 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>@webmcpui/react — Button</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
          Clicked {count}×
        </Button>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          onClick works
        </span>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <Button
          variant="primary"
          expose
          toolName="book_appointment"
          onClick={() => setBooked(true)}
        >
          Book appointment
        </Button>
        <button
          onClick={() => agent.call('book_appointment')}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--foreground)',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          ▶ Run agent → call book_appointment()
        </button>
        <span style={{ color: booked ? 'var(--brand)' : 'var(--muted-foreground)', fontSize: 14 }}>
          {booked ? '✓ Booked — the agent triggered the React button.' : 'Not booked yet.'}
        </span>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
