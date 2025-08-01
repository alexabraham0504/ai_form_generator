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

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Serve welcome.html at root path
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'welcome.html'));
});

// Serve welcome.html at /welcome.html path
app.get('/welcome.html', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'welcome.html'));
});

// Handle all other routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌍 Network: http://0.0.0.0:${PORT}`);
}); 