# Quick Fix for CORS Issue

## Immediate Solution

The CORS error you're seeing is because the Google Apps Script needs to be redeployed with the updated CORS headers. Here's how to fix it:

### Step 1: Deploy the Updated Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a **new project** (don't use an existing one)
3. Copy the entire contents of `google-apps-script.gs` into the editor
4. Save the project as "Form Builder Backend"

### Step 2: Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Choose **"Web app"** as the type
3. Set these exact settings:
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone"
4. Click **"Deploy"**
5. **Authorize** the script when prompted (allow all permissions)

### Step 3: Get Your New URL

1. After deployment, copy the **Web App URL**
2. It will look like: `https://script.google.com/macros/s/YOUR_NEW_ID/exec`

### Step 4: Update the Frontend

Replace the URL in `dist/index2.html` line 881:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_NEW_DEPLOYMENT_URL_HERE';
```

### Step 5: Test

1. Open `test-deployment.html` in your browser
2. Click "Test URL" to verify the deployment works
3. Try creating a form in your main application

## Alternative: Use a CORS Proxy (Temporary)

If you can't deploy immediately, you can use a CORS proxy temporarily:

1. Go to: https://cors-anywhere.herokuapp.com/corsdemo
2. Click "Request temporary access to the demo server"
3. The proxy will be enabled for your browser

## Why This Happens

- Google Apps Script requires proper CORS headers for cross-origin requests
- The `doOptions()` function handles preflight requests
- Without proper deployment, the CORS headers aren't sent

## Debugging

If you still get CORS errors:

1. **Check the deployment URL** - make sure it's correct
2. **Verify permissions** - the script must be set to "Anyone"
3. **Test the URL directly** - visit it in your browser
4. **Check browser console** - look for detailed error messages

The updated script now includes:
- Proper CORS headers in all functions
- `doOptions()` function for preflight requests
- Better error handling
- Fallback mechanisms in the frontend 