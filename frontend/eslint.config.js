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
		global: 'globalThis',
	},
	server: {
		port: 5173,
		host: true, // Allow external connections
		proxy: {
			'/api': {
				target:
					process.env.DOCKER_ENV === 'true'
						? 'http://backend:8080'
						: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			'/ws': {
				target:
					process.env.DOCKER_ENV === 'true'
						? 'http://backend:8080'
						: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
				ws: true, // Enable WebSocket proxying
			},
		},
	},
});
