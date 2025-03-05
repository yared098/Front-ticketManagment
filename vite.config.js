// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',  // Use crypto-browserify for the frontend
      util: 'util',  // You might also need this if you're using util.promisify or similar
    },
  },
});
