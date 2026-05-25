import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk for better caching
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
