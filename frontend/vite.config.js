import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  define: {
    global: 'window', // ✅ fix lỗi sockjs-client (global is not defined)
  },
  server: {
    port: 5173,
    host: true, // Cho phép truy cập từ mạng LAN
    proxy: {
      '/api': {
        target:
          process.env.DOCKER_ENV === 'true'
            ? 'http://backend:8080'
            : 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
