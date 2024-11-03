// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path
  base: '/',
  // Assets directory
  publicDir: 'public',
  // Server configuration
  server: {
    port: 3000, // Change the port if needed
  },
});
