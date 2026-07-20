<script setup lang="ts">
// The flagship example: paste a recipe, the agent turns it into a filled
// grocery cart. The cart's tools are page-level (`exposeTool`) because a cart
// is a dynamic collection, not a single control; checkout is an element tool
// on <wmcp-dialog> — the agent opens it, the human places the order.

const agent = useDemoAgent();

const cart = ref<{ item: string; quantity: string }[]>([]);
const ordered = ref(false);
const checkoutRef = ref<(HTMLElement & { close: (v?: string) => void }) | null>(null);

const samples = [
  {
    label: 'Weeknight pasta',
    text: `Garlic butter pasta

Ingredients:
- 1 lb spaghetti
- 6 cloves garlic
- 1/2 cup butter
- 1 cup grated parmesan
- 1 bunch parsley
- 1 tsp chili flakes

Boil the spaghetti until al dente. Melt the butter, sizzle the garlic,
toss everything with parmesan, parsley, and chili flakes.`,
  },
  {
    label: 'Taco night',
    text: `Street-style tacos

Ingredients:
- 1 lb ground beef
- 12 corn tortillas
- 1 white onion
- 2 limes
- 1 bunch cilantro
- 1 cup salsa verde
- 8 oz queso fresco

Brown the beef, warm the tortillas, top with onion, cilantro,
salsa verde, queso fresco, and a squeeze of lime.`,
  },
];

// The deterministic stand-in for the agent's planning step: pull the
// ingredient list out of the pasted text. A real WebMCP host brings a real
// model; the tools it calls are exactly the ones below.
function parseIngredients(text: string): { item: string; quantity: string }[] {
  const block = /ingredients:?\s*\n([\s\S]*?)(?:\n\s*\n|$)/i.exec(text)?.[1] ?? text;
  const unit =
    '(?:cups?|tbsp|tsp|oz|lbs?|g|kg|ml|l|cloves?|cans?|bunch(?:es)?|sticks?|slices?)';
  const line = new RegExp(
    `^\\s*[-•*]?\\s*([\\d/.,½¼¾⅓⅔]+(?:\\s*${unit})?)\\s+(.{2,})$`,
    'i',
  );
  const out: { item: string; quantity: string }[] = [];
  for (const raw of block.split('\n')) {
    const m = line.exec(raw.trim());
    if (m) out.push({ quantity: m[1]!.trim(), item: m[2]!.trim().toLowerCase() });
  }
  return out;
}

const pageTools = [
  {
    name: 'add_to_cart',
    description: 'Add an item to the grocery cart, with an optional quantity.',
    inputSchema: {
      type: 'object',
      properties: {
        item: { type: 'string', description: 'The grocery item to add.' },
        quantity: { type: 'string', description: 'Amount, e.g. "2" or "1 lb".' },
      },
      required: ['item'],
    },
    execute: ({ item, quantity }: Record<string, unknown>) => {
      cart.value.push({ item: String(item), quantity: String(quantity ?? '1') });
      return {
        content: [
          {
            type: 'text' as const,
            text: `Added ${String(quantity ?? '1')} ${String(item)} — cart has ${cart.value.length} item${cart.value.length === 1 ? '' : 's'}.`,
          },
        ],
      };
    },
  },
  {
    name: 'remove_from_cart',
    description: 'Remove an item from the grocery cart by name.',
    inputSchema: {
      type: 'object',
      properties: {
        item: { type: 'string', description: 'The grocery item to remove.' },
      },
      required: ['item'],
    },
    execute: ({ item }: Record<string, unknown>) => {
      const name = String(item).toLowerCase();
      const before = cart.value.length;
      cart.value = cart.value.filter((c) => c.item !== name);
      const removed = before - cart.value.length;
      return {
        content: [
          {
            type: 'text' as const,
            text: removed
              ? `Removed ${String(item)} — ${cart.value.length} items left.`
              : `No "${String(item)}" in the cart.`,
          },
        ],
        isError: !removed,
      };
    },
  },
  {
    name: 'read_cart',
    description: 'Read the current contents of the grocery cart.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => ({
      content: [
        {
          type: 'text' as const,
          text: cart.value.length
            ? `Cart: ${cart.value.map((c) => `${c.quantity} ${c.item}`).join(', ')}.`
            : 'The cart is empty.',
        },
      ],
    }),
  },
];

async function onOpen() {
  await agent.start(pageTools);
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text.length > 90 ? `${text.slice(0, 87)}…` : text);
    const ingredients = parseIngredients(text);
    if (!ingredients.length) {
      agent.note('No ingredient list found — paste a recipe with an "Ingredients:" section.');
      return;
    }
    agent.note(`Found ${ingredients.length} ingredients — adding them to the cart.`);
    for (const ing of ingredients) {
      await agent.call('add_to_cart', { item: ing.item, quantity: ing.quantity }, 350);
    }
    await agent.call('read_cart');
    await agent.call('open_checkout');
  });
}

function removeItem(item: string) {
  cart.value = cart.value.filter((c) => c.item !== item);
}

function placeOrder() {
  ordered.value = true;
  checkoutRef.value?.close('ordered');
  agent.say('user placed the order');
}

function cancelCheckout() {
  checkoutRef.value?.close('cancelled');
}

function reset() {
  cart.value = [];
  ordered.value = false;
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="grocer.example.com"
    title="Recipe → grocery cart"
    description="Paste any recipe; the agent adds every ingredient to your cart and hands you the checkout."
    icon="lucide:shopping-cart"
    :tools="agent.tools.value"
    :log="agent.log.value"
    :running="agent.running.value"
    :show-run="false"
    @open="onOpen"
    @close="agent.stop"
    @reset="reset"
  >
    <template #prompt>
      <DemoPrompt
        multiline
        :samples="samples"
        :running="agent.running.value"
        placeholder="Paste a recipe here — the agent will pick out the ingredients…"
        button-label="Send to agent"
        @send="onSend"
      />
    </template>

    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="flex items-center justify-between text-sm font-medium text-foreground">
          Your cart
          <span class="font-mono text-xs text-muted-foreground">
            {{ cart.length }} item{{ cart.length === 1 ? '' : 's' }}
          </span>
        </p>

        <p v-if="!cart.length" class="mt-3 text-sm text-muted-foreground">
          Cart is empty — send the agent a recipe.
        </p>
        <ul v-else class="mt-3 space-y-1.5">
          <li
            v-for="c in cart"
            :key="c.item"
            class="flex items-center gap-2 text-sm text-foreground"
          >
            <span class="w-16 shrink-0 font-mono text-xs text-muted-foreground">
              {{ c.quantity }}
            </span>
            <span class="flex-1 capitalize">{{ c.item }}</span>
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground"
              :aria-label="`Remove ${c.item}`"
              @click="removeItem(c.item)"
            >
              <Icon name="lucide:x" class="h-3.5 w-3.5" />
            </button>
          </li>
        </ul>

        <p v-if="ordered" class="mt-3 text-sm text-brand">✓ Order placed — delivery tomorrow.</p>
      </div>

      <wmcp-dialog
        ref="checkoutRef"
        name="checkout"
        label="Checkout"
        tool-name="open_checkout"
        tool-description="Open the checkout for the user to review the cart and place the order."
        expose
      >
        <div class="space-y-4" style="font-family: inherit">
          <h3 class="text-base font-semibold text-foreground">Checkout</h3>
          <p class="text-sm text-muted-foreground">
            {{ cart.length }} item{{ cart.length === 1 ? '' : 's' }} ready for delivery.
            Placing the order stays your click — the agent only got you here.
          </p>
          <div class="flex justify-end gap-2">
            <wmcp-button variant="ghost" @click="cancelCheckout">Keep shopping</wmcp-button>
            <wmcp-button variant="primary" @click="placeOrder">Place order</wmcp-button>
          </div>
        </div>
      </wmcp-dialog>
    </template>
  </DemoStage>
</template>
