import { build } from 'vite';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function buildProject() {
  try {
    console.log('🚀 Starting build process...');
    
    // Build with Vite
    await build();
    console.log('✅ Vite build completed');
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist');
      console.log('📁 Created dist directory');
    }
    
    // Copy welcome.html to dist
    if (existsSync('welcome.html')) {
      copyFileSync('welcome.html', 'dist/welcome.html');
      console.log('✅ welcome.html copied to dist');
    } else {
      console.log('⚠️  welcome.html not found');
    }
    
    // Copy index2.html to dist (if not already there)
    if (existsSync('index2.html') && !existsSync('dist/index2.html')) {
      copyFileSync('index2.html', 'dist/index2.html');
      console.log('✅ index2.html copied to dist');
    }
    
    console.log('🎉 Build process completed successfully!');
    console.log('📁 Files in dist directory:');
    
    // List files in dist directory
    const fs = await import('fs');
    const files = fs.readdirSync('dist');
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject(); 