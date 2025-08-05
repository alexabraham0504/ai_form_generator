function doPost(e) {
  // Add CORS headers
  var output = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON);
  
  if (!e || !e.postData || !e.postData.contents) {
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: 'No POST data received' 
    }));
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var form = FormApp.create(data.title);

    data.questions.forEach(function(q) {
      if (q.type === 'Short Answer') {
        form.addTextItem().setTitle(q.text);
      } else if (q.type === 'Paragraph') {
        form.addParagraphTextItem().setTitle(q.text);
      } else if (q.type === 'Multiple Choice') {
        form.addMultipleChoiceItem().setTitle(q.text).setChoiceValues(q.options);
      } else if (q.type === 'Checkboxes') {
        form.addCheckboxItem().setTitle(q.text).setChoiceValues(q.options);
      } else if (q.type === 'Dropdown') {
        form.addListItem().setTitle(q.text).setChoiceValues(q.options);
      }
    });

    return output.setContent(JSON.stringify({ 
      success: true, 
      formUrl: form.getPublishedUrl() // Changed from getEditUrl() to getPublishedUrl()
    }));
  } catch (err) {
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: err.message 
    }));
  }
}

// Add this function to handle OPTIONS requests (preflight)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Alternative approach: Add a doGet function that handles both GET and POST
function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON);
    
  // Handle GET request with parameters
  if (e.parameter) {
    try {
      var title = e.parameter.title;
      var questionsStr = e.parameter.questions;
      
      if (!title || !questionsStr) {
        return output.setContent(JSON.stringify({ 
          success: false, 
          error: 'Missing title or questions parameter' 
        }));
      }
      
      var questions = JSON.parse(questionsStr);
      var form = FormApp.create(title);

      questions.forEach(function(q) {
        if (q.type === 'Short Answer') {
          form.addTextItem().setTitle(q.text);
        } else if (q.type === 'Paragraph') {
          form.addParagraphTextItem().setTitle(q.text);
        } else if (q.type === 'Multiple Choice') {
          form.addMultipleChoiceItem().setTitle(q.text).setChoiceValues(q.options);
        } else if (q.type === 'Checkboxes') {
          form.addCheckboxItem().setTitle(q.text).setChoiceValues(q.options);
        } else if (q.type === 'Dropdown') {
          form.addListItem().setTitle(q.text).setChoiceValues(q.options);
        }
      });

      return output.setContent(JSON.stringify({ 
        success: true, 
        formUrl: form.getPublishedUrl()
      }));
    } catch (err) {
      return output.setContent(JSON.stringify({ 
        success: false, 
        error: err.message 
      }));
    }
  }
  
  return output.setContent(JSON.stringify({ 
    success: false, 
    error: 'No parameters provided' 
  }));
}