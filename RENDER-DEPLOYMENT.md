# Render Deployment Guide for AI-Powered Form Generator

This guide will help you deploy your AI-Powered Form Generator to Render while keeping your API keys secure.

## 🚀 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **API Keys Ready**: Have your Gemini API key and Google Apps Script URL ready

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify Repository Structure**:
   ```
   your-repo/
   ├── src/
   │   ├── main.js
   │   └── script.js
   ├── index.html
   ├── welcome.html
   ├── package.json
   ├── vite.config.js
   ├── env.example
   ├── google-apps-script.gs
   ├── .gitignore
   └── README.md
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 3: Create New Web Service

1. **Click "New +"** in your Render dashboard
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:

   **Basic Settings:**
   - **Name**: `ai-form-generator` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`

   **Build & Deploy Settings:**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Root Directory**: Leave empty (or `./` if needed)

### Step 4: Configure Environment Variables

**This is the most important step!** Here's where you add your API keys securely:

1. **Go to your service dashboard**
2. **Click "Environment" tab**
3. **Add these environment variables**:

   ```
   VITE_GEMINI_API_KEY = your_actual_gemini_api_key_here
   VITE_GOOGLE_APPS_SCRIPT_URL = your_actual_google_apps_script_url_here
   VITE_DEFAULT_FORM_TITLE = AI-Generated Form
   VITE_DEFAULT_FORM_DESCRIPTION = Form created with AI-Powered Form Generator
   VITE_AI_MODEL = gemini-2.5-pro
   VITE_AI_MAX_OPTIONS = 5
   VITE_DEBUG_MODE = false
   VITE_CACHE_BUSTING = true
   ```

   **Important**: Replace `your_actual_gemini_api_key_here` and `your_actual_google_apps_script_url_here` with your real values.

### Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Check build logs** for any errors

## 🔒 Security Best Practices

### ✅ What Render Handles Securely:
- **Environment variables** are encrypted and secure
- **API keys** are never exposed in your code
- **Build process** runs in isolated environment
- **HTTPS** is automatically enabled

### ❌ What You Should Never Do:
- **Don't hardcode API keys** in your source code
- **Don't commit `.env.local`** to your repository
- **Don't share your API keys** in public repositories

## 🛠️ Troubleshooting

### Common Issues and Solutions:

#### 1. Build Fails
```bash
# Check your package.json has correct scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port $PORT"
  }
}
```

#### 2. Environment Variables Not Working
- **Check variable names** start with `VITE_`
- **Verify no typos** in variable names
- **Restart deployment** after adding variables

#### 3. API Calls Fail
- **Verify API keys** are correct in Render environment
- **Check CORS settings** in your Google Apps Script
- **Test locally** with same environment variables

#### 4. Port Issues
```javascript
// In vite.config.js, ensure proper port handling
export default defineConfig({
  server: {
    port: process.env.PORT || 3000
  },
  preview: {
    port: process.env.PORT || 3000
  }
})
```

## 📊 Monitoring Your Deployment

### Render Dashboard Features:
- **Build logs** - See what happened during deployment
- **Runtime logs** - Monitor your application
- **Metrics** - CPU, memory usage
- **Auto-deploy** - Automatic updates when you push to GitHub

### Health Checks:
- **Automatic health checks** every 30 seconds
- **Custom health check endpoint** (optional)
- **Email notifications** for failed deployments

## 🔄 Continuous Deployment

### Automatic Updates:
1. **Make changes** to your code
2. **Push to GitHub** main branch
3. **Render automatically** detects changes
4. **Builds and deploys** new version
5. **Zero downtime** deployment

### Manual Deployments:
- **Manual deploy** from Render dashboard
- **Rollback** to previous versions
- **Preview deployments** for testing

## 💰 Cost Optimization

### Free Tier:
- **512 MB RAM**
- **0.1 CPU**
- **750 hours/month**
- **Perfect for development/testing**

### Paid Plans:
- **$7/month** for more resources
- **Custom domains**
- **SSL certificates**
- **Better performance**

## 🚀 Advanced Configuration

### Custom Domain:
1. **Add custom domain** in Render dashboard
2. **Update DNS records** with your domain provider
3. **SSL certificate** is automatically provisioned

### Environment-Specific Variables:
```bash
# Development
VITE_DEBUG_MODE = true
VITE_API_URL = https://dev-api.example.com

# Production
VITE_DEBUG_MODE = false
VITE_API_URL = https://api.example.com
```

### Health Check Endpoint:
```javascript
// Add to your main.js or create a separate endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

## 📱 Testing Your Deployment

### After Deployment:
1. **Visit your Render URL** (e.g., `https://ai-form-generator.onrender.com`)
2. **Test the welcome page** loads correctly
3. **Test form generation** with AI
4. **Test Google Form creation**
5. **Check all features** work as expected

### Common Test Cases:
- ✅ Welcome page loads
- ✅ Form title input works
- ✅ AI question generation works
- ✅ Question management (shuffle, add more) works
- ✅ Google Form creation works
- ✅ Back to welcome button works

## 🔧 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key | ✅ Yes | None |
| `VITE_GOOGLE_APPS_SCRIPT_URL` | Your Google Apps Script URL | ✅ Yes | None |
| `VITE_DEFAULT_FORM_TITLE` | Default form title | ❌ No | "AI-Generated Form" |
| `VITE_DEFAULT_FORM_DESCRIPTION` | Default form description | ❌ No | "Form created with AI-Powered Form Generator" |
| `VITE_AI_MODEL` | AI model to use | ❌ No | "gemini-2.5-pro" |
| `VITE_AI_MAX_OPTIONS` | Max AI-generated options | ❌ No | 5 |
| `VITE_DEBUG_MODE` | Enable debug mode | ❌ No | false |
| `VITE_CACHE_BUSTING` | Enable cache busting | ❌ No | true |

## 🆘 Support

### Render Support:
- **Documentation**: [docs.render.com](https://docs.render.com)
- **Community**: [community.render.com](https://community.render.com)
- **Email Support**: Available on paid plans

### Common Commands:
```bash
# Check deployment status
curl https://your-app.onrender.com/health

# View logs
# (Available in Render dashboard)

# Restart service
# (Available in Render dashboard)
```

---

**Remember**: Your API keys are safe in Render's environment variables. Never commit them to your repository! 🔒 