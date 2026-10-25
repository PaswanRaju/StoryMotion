/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MediaPipe is imported only by the pose worker, so Vite would otherwise discover it
  // on the first Start Camera, re-optimize, and answer the worker's import with 504.
  optimizeDeps: { include: ['@mediapipe/tasks-vision'] },
  build: {
    rollupOptions: {
      input: { main: 'index.html', gestureDemo: 'gesture-demo.html' },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
})
