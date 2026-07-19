<template>
  <!-- Overrides Nuxt Content's default prose table: markdown tables can be
       wider than a phone viewport, so they scroll inside this wrapper instead
       of stretching the whole page. -->
  <div class="prose-table-wrap">
    <table>
      <slot />
    </table>
  </div>
</template>
