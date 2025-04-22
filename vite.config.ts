import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/bomb-deffusal-challenge/', // Set the base to match your GitHub repository name
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure assets are handled correctly
    assetsInlineLimit: 0,
    // Make sure rollup properly bundles everything
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
