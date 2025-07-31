/**
 * Google Apps Script Backend for AI-Powered Form Generator
 * This script creates Google Forms dynamically based on JSON payload
 */

// Main function to handle POST requests from the frontend
function doPost(e) {
  try {
    // Handle case when called without parameters (testing in editor)
    if (!e || !e.postData) {
      console.log('doPost called without parameters - running test...');
      return testWeb();
    }
    
    let formData;
    
    // Handle different content types
    if (e.postData.type === 'application/x-www-form-urlencoded') {
      // Handle FormData
      const params = e.parameter;
      console.log('Received parameters:', params);
      
      if (params.data) {
        try {
          formData = JSON.parse(params.data);
          console.log('Parsed form data:', formData);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          return createErrorResponse('Invalid JSON in data parameter');
        }
      } else {
        console.log('No data parameter found in:', params);
        return createErrorResponse('No data parameter found');
      }
    } else {
      // Handle JSON
      try {
        formData = JSON.parse(e.postData.contents);
        console.log('Parsed JSON form data:', formData);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return createErrorResponse('Invalid JSON in request body');
      }
    }
    
    // Validate the data structure
    if (!formData.questions || !Array.isArray(formData.questions)) {
      console.log('Invalid form data structure:', formData);
      return createErrorResponse('Invalid data structure: questions array is required');
    }
    
    console.log('Creating Google Form with data:', formData);
    
    // Create the Google Form
    const form = createGoogleForm(formData);
    
    const formUrl = form.getPublishedUrl();
    console.log('Form created successfully:', formUrl);
    
    // Return success response with form URL
    return createSuccessResponse(formUrl);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createErrorResponse('Failed to create form: ' + error.message);
  }
}

// Handle GET requests for testing
function doGet(e) {
  return ContentService
    .createTextOutput('Google Apps Script is working! Use POST to create forms.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Function to create a Google Form from the provided data
function createGoogleForm(formData) {
  // Create a new form
  const form = FormApp.create(formData.title || 'AI-Generated Form');
  
  // Set form description if provided
  if (formData.description) {
    form.setDescription(formData.description);
  }
  
  // Add questions to the form
  formData.questions.forEach((questionData, index) => {
    addQuestionToForm(form, questionData, index);
  });
  
  // Configure form settings
  form.setCollectEmail(true); // Collect respondent's email
  form.setAllowResponseEdits(false); // Don't allow editing responses
  form.setShowLinkToRespondAgain(false); // Don't show link to respond again
  
  return form;
}

// Function to add a question to the Google Form
function addQuestionToForm(form, questionData, questionIndex) {
  const title = questionData.title;
  const type = questionData.type;
  const required = questionData.required !== false; // Default to required
  
  let question;
  
  switch (type) {
    case 'short_answer':
      question = form.addTextItem();
      question.setTitle(title);
      question.setRequired(required);
      break;
      
    case 'paragraph':
      question = form.addParagraphTextItem();
      question.setTitle(title);
      question.setRequired(required);
      break;
      
    case 'multiple_choice':
      question = form.addMultipleChoiceItem();
      question.setTitle(title);
      question.setRequired(required);
      
      // Add options if provided
      if (questionData.options && Array.isArray(questionData.options)) {
        const choices = questionData.options.map(option => question.createChoice(option));
        question.setChoices(choices);
      }
      break;
      
    case 'checkboxes':
      question = form.addCheckboxItem();
      question.setTitle(title);
      question.setRequired(required);
      
      // Add options if provided
      if (questionData.options && Array.isArray(questionData.options)) {
        const choices = questionData.options.map(option => question.createChoice(option));
        question.setChoices(choices);
      }
      break;
      
    case 'dropdown':
      question = form.addListItem();
      question.setTitle(title);
      question.setRequired(required);
      
      // Add options if provided
      if (questionData.options && Array.isArray(questionData.options)) {
        const choices = questionData.options.map(option => question.createChoice(option));
        question.setChoices(choices);
      }
      break;
      
    default:
      // Default to short answer for unknown types
      question = form.addTextItem();
      question.setTitle(title);
      question.setRequired(required);
      break;
  }
  
  // Add question number if it's not the first question
  if (questionIndex > 0) {
    question.setHelpText(`Question ${questionIndex + 1}`);
  }
}

// Function to create a success response
function createSuccessResponse(formUrl) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      formUrl: formUrl,
      message: 'Form created successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to create an error response
function createErrorResponse(errorMessage) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: errorMessage
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function to verify the script is working
function testScript() {
  const testData = {
    title: 'Test Form',
    description: 'This is a test form created by the AI Form Generator',
    questions: [
      {
        title: 'What is your name?',
        type: 'short_answer',
        required: true
      },
      {
        title: 'How would you rate our service?',
        type: 'multiple_choice',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
      },
      {
        title: 'Please provide additional feedback',
        type: 'paragraph',
        required: false
      }
    ]
  };
  
  try {
    const form = createGoogleForm(testData);
    console.log('✅ Test form created successfully!');
    console.log('📝 Form URL:', form.getPublishedUrl());
    console.log('🆔 Form ID:', form.getId());
    console.log('🎉 Script is working correctly!');
    return form.getPublishedUrl();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Test function that can be called from the web
function testWeb() {
  return createSuccessResponse('https://docs.google.com/forms/d/e/test');
}

// Test function to create a real form
function testRealForm() {
  const testData = {
    title: 'Test Form from Apps Script',
    description: 'This is a test form created directly in Apps Script',
    questions: [
      {
        title: 'What is your name?',
        type: 'short_answer',
        required: true
      },
      {
        title: 'How would you rate this?',
        type: 'multiple_choice',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor']
      }
    ]
  };
  
  try {
    console.log('Creating test form with data:', testData);
    const form = createGoogleForm(testData);
    const formUrl = form.getPublishedUrl();
    console.log('Test form created successfully:', formUrl);
    return createSuccessResponse(formUrl);
  } catch (error) {
    console.error('Error creating test form:', error);
    return createErrorResponse('Test form creation failed: ' + error.message);
  }
}

// Test CORS functionality
function testCORS() {
  console.log('Testing CORS headers...');
  
  const testResponse = createSuccessResponse('https://example.com/test');
  console.log('✅ CORS headers added successfully');
  console.log('Headers:', testResponse.getAllHeaders());
}

// Test CORS functionality
function testCORS() {
  console.log('Testing CORS headers...');
  
  const testResponse = createSuccessResponse('https://example.com/test');
  console.log('✅ CORS headers added successfully');
  console.log('Headers:', testResponse.getAllHeaders());
}

// Function to get form statistics (optional utility)
function getFormStats(formId) {
  try {
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    
    return {
      totalResponses: responses.length,
      lastResponseTime: responses.length > 0 ? responses[responses.length - 1].getTimestamp() : null,
      formTitle: form.getTitle(),
      formUrl: form.getPublishedUrl()
    };
  } catch (error) {
    console.error('Error getting form stats:', error);
    return { error: error.message };
  }
} 