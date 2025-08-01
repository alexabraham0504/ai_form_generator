// AI-Powered Google Form Generator
// Main JavaScript file with all dynamic functionality

export class FormGenerator {
    constructor() {
        this.questionCounter = 0;
        
        // Load configuration from environment variables
        this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCFCT7OLJWcWsHYf1tNPetan2XDq2zEiJw';
        this.googleAppsScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwhjE1E8RS-Fqhwz4NhTfx-eSSqjHmoMPgN_bR5NoPtcyyq7R5YDnFuFGs3i5vfWrk9Aw/exec';
        this.debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
        this.cacheBusting = import.meta.env.VITE_CACHE_BUSTING !== 'false';
        
        console.log('Configuration loaded from environment variables');
        
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.addQuestion(); // Add first question by default
    }

    // Bind all event listeners
    bindEvents() {
        // Add question button
        document.getElementById('addQuestionBtn').addEventListener('click', () => {
            this.addQuestion();
        });

        // Generate questions button
        document.getElementById('generateQuestionsBtn').addEventListener('click', () => {
            this.generateQuestionsFromTitle();
        });

        // Shuffle questions button
        document.getElementById('shuffleQuestionsBtn').addEventListener('click', () => {
            this.shuffleQuestions();
        });

        // Add more questions button
        document.getElementById('addMoreQuestionsBtn').addEventListener('click', () => {
            this.addMoreQuestions();
        });

        // Back to welcome button
        document.getElementById('backToWelcomeBtn').addEventListener('click', () => {
            this.goBackToWelcome();
        });

        // Generate form button
        document.getElementById('generateFormBtn').addEventListener('click', () => {
            this.generateForm();
        });

        // Settings functionality removed - configuration is managed via environment variables

        // Export form button
        // Export form data button - DISABLED
        // document.getElementById('exportFormBtn').addEventListener('click', () => {
        //     this.exportFormData();
        // });

        // Delegate events for dynamically added elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-question-btn')) {
                this.removeQuestion(e.target.closest('.question-item'));
            }
            if (e.target.classList.contains('generate-ai-btn')) {
                this.generateAIOptions(e.target.closest('.question-item'));
            }
        });

        // Delegate change events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('question-type')) {
                this.handleQuestionTypeChange(e.target.closest('.question-item'));
            }
            if (e.target.classList.contains('csv-input')) {
                this.handleCSVUpload(e.target);
            }
        });

        // Delegate input events for options
        document.addEventListener('input', (e) => {
            if (e.target.closest('.options-input') && e.target.tagName === 'TEXTAREA') {
                this.updateOptionsDisplay(e.target.closest('.question-item'));
            }
        });
    }

    // Validate configuration from config.js
    validateConfiguration() {
        const issues = [];
        
        if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            issues.push('Gemini API key is not configured');
        }
        
        if (!this.googleAppsScriptUrl || this.googleAppsScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            issues.push('Google Apps Script URL is not configured');
        }
        
        if (issues.length > 0) {
            Swal.fire({
                title: 'Configuration Required',
                html: `
                    <div class="text-left">
                        <p class="mb-4">Please update the configuration in <code>.env.local</code>:</p>
                        <ul class="text-sm text-gray-700 space-y-1 list-disc list-inside">
                            ${issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                        <div class="mt-4 p-3 bg-blue-50 rounded-md">
                            <p class="text-sm text-blue-800">
                                <strong>How to configure:</strong><br>
                                1. Copy <code>env.example</code> to <code>.env.local</code><br>
                                2. Replace the placeholder values with your actual API keys<br>
                                3. Restart the development server
                            </p>
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Open Settings',
                showCancelButton: true,
                cancelButtonText: 'Later'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.showSettingsModal();
                }
            });
        }
    }

    // Show settings modal for viewing current configuration
    showSettingsModal() {
        Swal.fire({
            title: 'Configuration Status',
            html: `
                <div class="text-left">
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Current Configuration:</h4>
                        <div class="bg-gray-50 p-3 rounded-md text-sm">
                            <p><strong>Gemini API Key:</strong> ${this.geminiApiKey ? '✅ Configured' : '❌ Not configured'}</p>
                            <p><strong>Google Apps Script URL:</strong> ${this.googleAppsScriptUrl ? '✅ Configured' : '❌ Not configured'}</p>
                            <p><strong>Debug Mode:</strong> ${this.debugMode ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Configuration File:</h4>
                        <p class="text-sm text-gray-700 mb-2">All settings are managed in <code>.env.local</code></p>
                        <div class="bg-blue-50 p-3 rounded-md">
                            <p class="text-sm text-blue-800">
                                <strong>To update configuration:</strong><br>
                                1. Edit <code>.env.local</code> in your editor<br>
                                2. Replace placeholder values with your actual API keys<br>
                                3. Restart the development server
                            </p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <button onclick="testGeminiAPI()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors">
                            <i class="fas fa-test-tube mr-1"></i>
                            Test Gemini API
                        </button>
                    </div>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Close',
            confirmButtonText: 'Open Config File',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Try to open the config file (this won't work in browser, but shows intent)
                Swal.fire('Info', 'Please open .env.local in your code editor to modify the configuration.', 'info');
            }
        });

        // Add test function to global scope
        window.testGeminiAPI = async () => {
            const apiKey = this.geminiApiKey;
            if (!apiKey) {
                Swal.showValidationMessage('Please configure your API key first');
                return;
            }

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "Hello! Please respond with 'API is working' if you can see this message."
                            }]
                        }]
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    Swal.fire('✅ Success!', 'Gemini API is working correctly.', 'success');
                } else {
                    Swal.fire('❌ Error', 'Invalid response from API', 'error');
                }
                
            } catch (error) {
                console.error('API Test Error:', error);
                Swal.fire('❌ Error', `API Test Failed: ${error.message}`, 'error');
            }
        };
    }

    // Add a new question to the form
    addQuestion() {
        this.questionCounter++;
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        
        // Set question number
        questionElement.querySelector('.question-number').textContent = this.questionCounter;
        
        // Add to container
        document.getElementById('questionsContainer').appendChild(questionElement);
        
        // Update question numbers
        this.updateQuestionNumbers();
    }

    // Remove a question from the form
    removeQuestion(questionElement) {
        Swal.fire({
            title: 'Remove Question?',
            text: 'Are you sure you want to remove this question?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                questionElement.remove();
                this.updateQuestionNumbers();
            }
        });
    }

    // Update question numbers after adding/removing questions
    updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            question.querySelector('.question-number').textContent = index + 1;
        });
        this.questionCounter = questions.length;
    }

    // Handle question type change (show/hide options section)
    handleQuestionTypeChange(questionElement) {
        const questionType = questionElement.querySelector('.question-type').value;
        const optionsSection = questionElement.querySelector('.options-section');
        
        // Show options section for question types that need options
        const needsOptions = ['multiple_choice', 'checkboxes', 'dropdown'];
        if (needsOptions.includes(questionType)) {
            optionsSection.classList.remove('hidden');
        } else {
            optionsSection.classList.add('hidden');
        }
    }

    // Generate AI options using Gemini API
    async generateAIOptions(questionElement) {
        const questionTitle = questionElement.querySelector('.question-title').value;
        
        if (!questionTitle.trim()) {
            Swal.fire('Error', 'Please enter a question title first', 'error');
            return;
        }

        if (!this.geminiApiKey) {
            Swal.fire('Error', 'Please configure your Gemini API key first', 'error');
            return;
        }

        // Show loading state
        const aiBtn = questionElement.querySelector('.generate-ai-btn');
        const originalText = aiBtn.innerHTML;
        aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generating...';
        aiBtn.disabled = true;

        try {
            const prompt = `Generate 5 realistic response options for this question: "${questionTitle}". 
            Return only the options, one per line, without numbering or additional text. 
            Make them diverse and relevant to the question.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedOptions = data.candidates[0].content.parts[0].text.trim();
                
                // Update the textarea with generated options
                const textarea = questionElement.querySelector('.options-input textarea');
                textarea.value = generatedOptions;
                
                // Update the display
                this.updateOptionsDisplay(questionElement);
                
                Swal.fire('Success!', 'AI-generated options added successfully', 'success');
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Error generating AI options:', error);
            Swal.fire('Error', 'Failed to generate AI options. Please check your API key and try again.', 'error');
        } finally {
            // Restore button state
            aiBtn.innerHTML = originalText;
            aiBtn.disabled = false;
        }
    }

    // Handle CSV file upload
    handleCSVUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    Swal.fire('Error', 'Failed to parse CSV file', 'error');
                    return;
                }

                // Extract first column values
                const options = results.data
                    .map(row => Object.values(row)[0]) // Get first column
                    .filter(value => value && value.trim() !== '') // Remove empty values
                    .join('\n');

                // Update the textarea
                const questionElement = fileInput.closest('.question-item');
                const textarea = questionElement.querySelector('.options-input textarea');
                textarea.value = options;
                
                // Update the display
                this.updateOptionsDisplay(questionElement);
                
                Swal.fire('Success!', `Imported ${results.data.length} options from CSV`, 'success');
            },
            error: (error) => {
                Swal.fire('Error', 'Failed to read CSV file', 'error');
            }
        });
    }

    // Update the options display area
    updateOptionsDisplay(questionElement) {
        const textarea = questionElement.querySelector('.options-input textarea');
        const display = questionElement.querySelector('.options-display');
        
        const options = textarea.value
            .split('\n')
            .map(option => option.trim())
            .filter(option => option !== '');

        if (options.length > 0) {
            display.innerHTML = options.map(option => 
                `<div class="bg-gray-100 rounded px-2 py-1 mb-1 text-sm">${option}</div>`
            ).join('');
        } else {
            display.innerHTML = '<p class="text-gray-500 text-sm">Options will appear here...</p>';
        }
    }

    // Collect all form data
    collectFormData() {
        const questions = [];
        const questionElements = document.querySelectorAll('.question-item');
        
        questionElements.forEach((questionElement, index) => {
            const title = questionElement.querySelector('.question-title').value.trim();
            const type = questionElement.querySelector('.question-type').value;
            
            if (!title) {
                throw new Error(`Question ${index + 1} is missing a title`);
            }

            const questionData = {
                title: title,
                type: type,
                required: true // Default to required
            };

            // Add options for question types that need them
            const needsOptions = ['multiple_choice', 'checkboxes', 'dropdown'];
            if (needsOptions.includes(type)) {
                const textarea = questionElement.querySelector('.options-input textarea');
                const options = textarea.value
                    .split('\n')
                    .map(option => option.trim())
                    .filter(option => option !== '');

                if (options.length === 0) {
                    throw new Error(`Question "${title}" needs at least one option`);
                }

                questionData.options = options;
            }

            questions.push(questionData);
        });

        // Get the custom form title from the input field
        const formTitle = document.getElementById('formTitle').value.trim() || (import.meta.env.VITE_DEFAULT_FORM_TITLE || 'AI-Generated Form');
        
        return {
            title: formTitle,
            description: import.meta.env.VITE_DEFAULT_FORM_DESCRIPTION || 'Form created with AI-Powered Form Generator',
            questions: questions
        };
    }

    // Generate the Google Form
    async generateForm() {
        try {
            // Validate form data
            const formData = this.collectFormData();
            
            if (formData.questions.length === 0) {
                Swal.fire('Error', 'Please add at least one question', 'error');
                return;
            }

            if (!this.googleAppsScriptUrl) {
                // Show setup instructions instead of error
                this.showBackendSetupInstructions();
                return;
            }

            // Show loading overlay
            document.getElementById('loadingOverlay').classList.remove('hidden');

            // Send data to Google Apps Script using URL encoded format to avoid CORS issues
            const params = new URLSearchParams();
            params.append('data', JSON.stringify(formData));
            
            if (this.cacheBusting) {
                params.append('_t', Date.now()); // Cache buster
            }
            
            if (this.debugMode) {
                console.log('Sending request to:', this.googleAppsScriptUrl);
                console.log('Request body:', params.toString());
            }
            
            const response = await fetch(this.googleAppsScriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get response text first for debugging
            const responseText = await response.text();
            
            if (this.debugMode) {
                console.log('Raw response:', responseText);
                console.log('Response URL:', this.googleAppsScriptUrl);
            }
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                if (this.debugMode) {
                    console.error('Failed to parse JSON response:', responseText);
                    console.error('Response starts with:', responseText.substring(0, 100));
                }
                throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
            }
            
            if (result.success && result.formUrl) {
                // Show success message and form link
                this.showFormLink(result.formUrl);
                Swal.fire('Success!', 'Your Google Form has been created successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to create form');
            }

        } catch (error) {
            console.error('Error generating form:', error);
            Swal.fire('Error', `Failed to generate form: ${error.message}`, 'error');
        } finally {
            // Hide loading overlay
            document.getElementById('loadingOverlay').classList.add('hidden');
        }
    }

    // Show backend setup instructions
    showBackendSetupInstructions() {
        Swal.fire({
            title: 'Backend Setup Required',
            html: `
                <div class="text-left">
                    <p class="mb-4">To generate Google Forms, you need to set up the Google Apps Script backend.</p>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Quick Setup:</h4>
                        <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Go to <a href="https://script.google.com/" target="_blank" class="text-blue-600">Google Apps Script</a></li>
                            <li>Create a new project</li>
                            <li>Copy the code from <code>google-apps-script.gs</code></li>
                            <li>Deploy as web app (Anyone access)</li>
                            <li>Copy the web app URL</li>
                            <li>Add it to your <code>.env.local</code></li>
                        </ol>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Or use the detailed guide:</h4>
                        <p class="text-sm text-gray-700">Open <code>DEPLOYMENT.md</code> for step-by-step instructions.</p>
                    </div>
                    
                    <div class="bg-blue-50 p-3 rounded-md">
                        <p class="text-sm text-blue-800">
                            <strong>Note:</strong> You can still use all the form building and AI features without the backend!
                        </p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Open Settings',
            cancelButtonText: 'Later',
            width: '600px'
        }).then((result) => {
            if (result.isConfirmed) {
                this.showSettingsModal();
            }
        });
    }

    // Export form data as JSON
    exportFormData() {
        try {
            const formData = this.collectFormData();
            
            if (formData.questions.length === 0) {
                Swal.fire('Error', 'Please add at least one question before exporting', 'error');
                return;
            }

            // Create JSON file
            const jsonString = JSON.stringify(formData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `form-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Swal.fire('Success!', 'Form data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting form data:', error);
            Swal.fire('Error', 'Failed to export form data', 'error');
        }
    }

    // Show the generated form link
    showFormLink(formUrl) {
        const linkSection = document.getElementById('formLinkSection');
        const formLink = document.getElementById('formLink');
        
        formLink.href = formUrl;
        formLink.textContent = formUrl;
        linkSection.classList.remove('hidden');
        
        // Scroll to the link section
        linkSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Generate questions based on form title
    async generateQuestionsFromTitle() {
        const formTitle = document.getElementById('formTitle').value.trim();
        
        if (!formTitle) {
            Swal.fire('Error', 'Please enter a form title first', 'error');
            return;
        }

        if (!this.geminiApiKey) {
            Swal.fire('Error', 'Please configure your Gemini API key first', 'error');
            return;
        }

        // Show loading state
        const generateBtn = document.getElementById('generateQuestionsBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
        generateBtn.disabled = true;

        try {
            const prompt = `Generate 5 relevant questions for a form titled "${formTitle}". 
            
            IMPORTANT: Return ONLY valid JSON, no additional text or explanations.
            
            Use this exact format:
            [
                {
                    "title": "What is your favorite color?",
                    "type": "short_answer"
                },
                {
                    "title": "How would you rate our service?",
                    "type": "multiple_choice",
                    "options": ["Excellent", "Good", "Average", "Poor"]
                },
                {
                    "title": "Please describe your experience in detail.",
                    "type": "paragraph"
                }
            ]
            
            Make questions diverse and relevant to "${formTitle}". Include different question types: short_answer, paragraph, multiple_choice, checkboxes, dropdown.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedText = data.candidates[0].content.parts[0].text.trim();
                
                try {
                    // Try to parse as JSON
                    const questions = JSON.parse(generatedText);
                    
                    // Clear existing questions
                    document.getElementById('questionsContainer').innerHTML = '';
                    
                    // Add generated questions
                    questions.forEach(questionData => {
                        this.addQuestionWithData(questionData);
                    });
                    
                    Swal.fire('Success!', `Generated ${questions.length} questions for "${formTitle}"`, 'success');
                } catch (parseError) {
                    // If JSON parsing fails, try to extract questions from text
                    this.parseQuestionsFromText(generatedText, formTitle);
                }
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            Swal.fire('Error', 'Failed to generate questions. Please try again.', 'error');
        } finally {
            // Restore button state
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    // Parse questions from AI text response
    parseQuestionsFromText(text, formTitle) {
        console.log('Parsing text response:', text);
        
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const questions = JSON.parse(jsonMatch[0]);
                if (Array.isArray(questions) && questions.length > 0) {
                    // Clear existing questions
                    document.getElementById('questionsContainer').innerHTML = '';
                    
                    // Add parsed questions
                    questions.forEach(questionData => {
                        this.addQuestionWithData(questionData);
                    });
                    
                    Swal.fire('Success!', `Generated ${questions.length} questions for "${formTitle}"`, 'success');
                    return;
                }
            } catch (e) {
                console.log('JSON extraction failed:', e);
            }
        }
        
        // Fallback: Simple parsing logic
        const lines = text.split('\n').filter(line => line.trim());
        const questions = [];
        
        lines.forEach(line => {
            // Skip lines that look like JSON keys
            if (line.includes('"title":') || line.includes('"type":') || line.includes('"options":')) {
                return;
            }
            
            // Look for actual question text
            if (line.includes('?') || (line.includes(':') && line.length > 20)) {
                const questionText = line.replace(/^\d+\.\s*/, '').trim();
                if (questionText.length > 10 && !questionText.startsWith('"')) {
                    questions.push({
                        title: questionText,
                        type: 'short_answer'
                    });
                }
            }
        });

        if (questions.length > 0) {
            // Clear existing questions
            document.getElementById('questionsContainer').innerHTML = '';
            
            // Add parsed questions
            questions.slice(0, 5).forEach(questionData => {
                this.addQuestionWithData(questionData);
            });
            
            Swal.fire('Success!', `Generated ${questions.length} questions for "${formTitle}"`, 'success');
        } else {
            // Create some default questions based on the title
            const defaultQuestions = this.generateDefaultQuestions(formTitle);
            
            // Clear existing questions
            document.getElementById('questionsContainer').innerHTML = '';
            
            // Add default questions
            defaultQuestions.forEach(questionData => {
                this.addQuestionWithData(questionData);
            });
            
            Swal.fire('Info', `Generated ${defaultQuestions.length} default questions for "${formTitle}"`, 'info');
        }
    }

    // Go back to welcome page
    goBackToWelcome() {
        Swal.fire({
            title: 'Go Back to Welcome?',
            text: 'Are you sure you want to go back to the welcome page? Any unsaved changes will be lost.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, go back',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear the flag so user sees welcome page again
                localStorage.removeItem('hasSeenWelcome');
                // Navigate to welcome page
                window.location.href = '/';
            }
        });
    }

    // Generate default questions when AI fails
    generateDefaultQuestions(formTitle) {
        const titleLower = formTitle.toLowerCase();
        
        if (titleLower.includes('feedback') || titleLower.includes('survey')) {
            return [
                { title: "How satisfied are you with our service?", type: "multiple_choice", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
                { title: "What aspects could we improve?", type: "paragraph" },
                { title: "How likely are you to recommend us?", type: "multiple_choice", options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"] },
                { title: "What is your overall rating?", type: "multiple_choice", options: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"] },
                { title: "Any additional comments or suggestions?", type: "paragraph" }
            ];
        } else if (titleLower.includes('registration') || titleLower.includes('signup')) {
            return [
                { title: "What is your full name?", type: "short_answer" },
                { title: "What is your email address?", type: "short_answer" },
                { title: "What is your phone number?", type: "short_answer" },
                { title: "How did you hear about us?", type: "multiple_choice", options: ["Social Media", "Friend/Family", "Advertisement", "Search Engine", "Other"] },
                { title: "Any special requirements or preferences?", type: "paragraph" }
            ];
        } else {
            return [
                { title: "What is your main concern or question?", type: "paragraph" },
                { title: "How can we help you?", type: "paragraph" },
                { title: "What is your preferred contact method?", type: "multiple_choice", options: ["Email", "Phone", "Text", "In Person"] },
                { title: "When would you like us to respond?", type: "multiple_choice", options: ["Immediately", "Within 24 hours", "Within a week", "No rush"] },
                { title: "Any additional information we should know?", type: "paragraph" }
            ];
        }
    }

    // Add question with predefined data
    addQuestionWithData(questionData) {
        this.questionCounter++;
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        
        // Set question number
        questionElement.querySelector('.question-number').textContent = this.questionCounter;
        
        // Set question title
        questionElement.querySelector('.question-title').value = questionData.title || '';
        
        // Set question type
        if (questionData.type) {
            questionElement.querySelector('.question-type').value = questionData.type;
            this.handleQuestionTypeChange(questionElement);
        }
        
        // Set options if provided
        if (questionData.options && Array.isArray(questionData.options)) {
            const textarea = questionElement.querySelector('.options-input textarea');
            textarea.value = questionData.options.join('\n');
            this.updateOptionsDisplay(questionElement);
        }
        
        // Add to container
        document.getElementById('questionsContainer').appendChild(questionElement);
    }

    // Shuffle questions
    shuffleQuestions() {
        const questionsContainer = document.getElementById('questionsContainer');
        const questions = Array.from(questionsContainer.children);
        
        if (questions.length < 2) {
            Swal.fire('Info', 'Need at least 2 questions to shuffle', 'info');
            return;
        }

        // Fisher-Yates shuffle algorithm
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            questionsContainer.appendChild(questions[j]);
        }

        // Update question numbers
        this.updateQuestionNumbers();
        
        Swal.fire('Success!', 'Questions shuffled successfully', 'success');
    }

    // Add more questions based on existing ones
    async addMoreQuestions() {
        const formTitle = document.getElementById('formTitle').value.trim();
        const existingQuestions = document.querySelectorAll('.question-item');
        
        if (existingQuestions.length === 0) {
            Swal.fire('Info', 'Please generate some questions first', 'info');
            return;
        }

        if (!this.geminiApiKey) {
            Swal.fire('Error', 'Please configure your Gemini API key first', 'error');
            return;
        }

        // Show loading state
        const addMoreBtn = document.getElementById('addMoreQuestionsBtn');
        const originalText = addMoreBtn.innerHTML;
        addMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Adding...';
        addMoreBtn.disabled = true;

        try {
            const existingTitles = Array.from(existingQuestions).map(q => q.querySelector('.question-title').value);
            
            const prompt = `Based on the form "${formTitle}" and these existing questions:
            ${existingTitles.join('\n')}
            
            Generate 3 additional relevant questions that complement the existing ones.
            
            IMPORTANT: Return ONLY valid JSON, no additional text.
            
            Use this exact format:
            [
                {
                    "title": "What is your favorite feature?",
                    "type": "short_answer"
                },
                {
                    "title": "How often do you use our service?",
                    "type": "multiple_choice",
                    "options": ["Daily", "Weekly", "Monthly", "Rarely"]
                }
            ]`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedText = data.candidates[0].content.parts[0].text.trim();
                
                try {
                    const questions = JSON.parse(generatedText);
                    
                    // Add new questions
                    questions.forEach(questionData => {
                        this.addQuestionWithData(questionData);
                    });
                    
                    Swal.fire('Success!', `Added ${questions.length} more questions`, 'success');
                } catch (parseError) {
                    this.parseQuestionsFromText(generatedText, formTitle);
                }
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Error adding more questions:', error);
            Swal.fire('Error', 'Failed to add more questions. Please try again.', 'error');
        } finally {
            // Restore button state
            addMoreBtn.innerHTML = originalText;
            addMoreBtn.disabled = false;
        }
    }
}

// Note: This file is now imported by main.js 