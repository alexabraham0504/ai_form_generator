import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});



// Serve welcome.html at root path
app.get('/', (req, res) => {
  console.log('Root path requested, serving welcome.html');
  res.sendFile(join(__dirname, 'dist', 'welcome.html'));
});

// Serve welcome.html at /welcome.html path
app.get('/welcome.html', (req, res) => {
  console.log('Welcome path requested, serving welcome.html');
  res.sendFile(join(__dirname, 'dist', 'welcome.html'));
});

// Serve index.html at /app path (main form page)
app.get('/app', (req, res) => {
  console.log('App path requested, serving index2.html');
  res.sendFile(join(__dirname, 'dist', 'index2.html'));
});

// Serve index.html at /index.html path (main form page) - for direct access
app.get('/index.html', (req, res) => {
  console.log('Index.html path requested, serving index2.html');
  res.sendFile(join(__dirname, 'dist', 'index2.html'));
});

// Serve static assets (CSS, JS, images) but NOT HTML files
app.use('/assets', express.static(join(__dirname, 'dist', 'assets')));

// Handle all other routes by serving welcome.html
app.get('*', (req, res) => {
  console.log('Wildcard path requested:', req.path, 'serving welcome.html');
  res.sendFile(join(__dirname, 'dist', 'welcome.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌍 Network: http://0.0.0.0:${PORT}`);
}); 