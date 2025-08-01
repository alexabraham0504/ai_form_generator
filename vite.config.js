import { defineConfig } from 'vite'
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
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
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  define: {
    // Expose environment variables to the client
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
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
}) 