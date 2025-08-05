# Google Apps Script Deployment Instructions

## To fix the "failed to create google form" issue:

### 1. Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the contents of `google-apps-script.gs` into the editor
4. Save the project with a name like "Form Builder Backend"

### 2. Deploy as Web App

1. Click on "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following settings:
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone"
4. Click "Deploy"
5. Authorize the script when prompted

### 3. Update the Frontend URL

1. Copy the Web App URL from the deployment
2. Replace the `GOOGLE_SCRIPT_URL` in `dist/index2.html` line 881:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_NEW_DEPLOYMENT_URL_HERE';
```

### 4. Test the Deployment

You can test if your Apps Script is working by visiting the deployment URL directly. It should show a JSON response.

### 5. Common Issues and Solutions

#### Issue: "Script not found" or "Access denied"
- Make sure the script is deployed as a web app
- Check that "Who has access" is set to "Anyone"
- Verify the deployment URL is correct

#### Issue: CORS errors
- The updated script now includes proper CORS headers
- Make sure you're using the updated `google-apps-script.gs` file

#### Issue: "Form creation failed"
- Check the browser console for detailed error messages
- The updated script provides better error reporting
- Make sure your Google account has permission to create forms

### 6. Alternative: Use a Test URL

If you want to test without deploying, you can use this test URL temporarily:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylw0vtssJ79gn31z8qwBiCeXIPIJBb95HzHjvBakGZmWLzYJFz74gncnUirkSP09pPLQ/exec';
```

### 7. Debugging Tips

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Try to create a form
4. Look for the request to your Apps Script URL
5. Check the response for error details

The updated script now includes:
- Better error handling
- CORS headers
- Flexible data format support
- Detailed error messages
- Fallback to GET requests if POST fails 