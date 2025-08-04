import { defineConfig, loadEnv } from 'vite'
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    root: '.',
    build: {
      rollupOptions: {
        input: 'index2.html'
      },
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true
    },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ai-form-generator.onrender.com',
      '.onrender.com'
    ]
  },
  define: {
    // Expose environment variables to the client
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    // Expose Vite environment variables
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    'import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL': JSON.stringify(env.VITE_GOOGLE_APPS_SCRIPT_URL),
    'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(env.VITE_DEBUG_MODE),
    'import.meta.env.VITE_CACHE_BUSTING': JSON.stringify(env.VITE_CACHE_BUSTING)
  },
  plugins: [
    {
      name: 'copy-welcome-html',
      writeBundle() {
        // Copy welcome.html to dist directory
        try {
          copyFileSync('welcome.html', 'dist/welcome.html')
          console.log('✅ welcome.html copied to dist directory')
        } catch (error) {
          console.error('❌ Error copying welcome.html:', error)
        }
      }
    }
  ]
  }
}) 