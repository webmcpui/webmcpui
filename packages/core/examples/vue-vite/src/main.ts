import { createApp } from 'vue'
import App from './App.vue'
import { defineComponents } from "@webmcpui/core";
import "@webmcpui/tokens/css";

defineComponents()

createApp(App).mount('#app')
