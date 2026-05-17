import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
  },
  plugins: [
    tailwindcss(),
    vue(),
  ],
});
