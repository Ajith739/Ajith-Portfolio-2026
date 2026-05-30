import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],

  // Esbuild options — removes console.log/info in production builds
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.info'],
  },

  build: {
    // Target modern browsers for smaller, faster output
    target: 'es2020',
    // Use esbuild for fast minification (built into Vite, no extra deps)
    minify: 'esbuild',
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk for better caching
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          // Separate the React runtime
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Increase chunk size warning limit (Three.js is inherently large)
    chunkSizeWarningLimit: 800,
  },

  // Dev server optimizations
  server: {
    hmr: {
      overlay: true,
    },
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom'],
  },
})
