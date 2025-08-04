// --- Gemini API Service ---
// Handles calling Gemini API and returning results.
export class GeminiAPIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
    }

    async makeRequest(prompt) {
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 4096,
                        topP: 0.95
                    }
                })
            });

            const data = await response.json();
            console.log("🔎 Full Gemini API Response:", data);
            
            if (!data || !Array.isArray(data.candidates) || data.candidates.length === 0) {
                throw new Error(`No candidates returned. Raw response: ${JSON.stringify(data)}`);
            }
            
            const candidate = data.candidates[0];
            const parts = candidate?.content?.parts;
            const text = Array.isArray(parts) && parts[0]?.text ? parts[0].text : '';
            
            if (!text.trim()) {
                throw new Error("No valid text found in Gemini API response.");
            }
            
            return text;
        } catch (error) {
            console.error("❌ Gemini API Error:", error);
            return '';
        }
    }
}

// --- Form Generator ---
// Encapsulates form (question/response) generation, using GeminiAPIService.
export class FormGenerator {
    constructor() {
        this.geminiApiKey = window.GEMINI_API_KEY
            || import.meta?.env?.VITE_GEMINI_API_KEY
            || process?.env?.GEMINI_API_KEY;
        this.geminiAPI = new GeminiAPIService(this.geminiApiKey);
        this.questions = [];
    }

    // Generate synthetic responses - simple approach like index2.html
    async generateSyntheticResponses(formData, numResponses, sentimentConfig) {
        const { positive, neutral, negative } = sentimentConfig;
        
        // Build questions list like index2.html does
        const questions = formData.questions.map((q, i) => {
            const options = q.options ? ` [Options: ${q.options.join('|')}]` : '';
            return `Question ${i + 1}: ${q.title}${options}`;
        }).join('\n');

        // Simple prompt like index2.html
        const prompt = `Generate ${numResponses} responses for this survey:

${questions}

Make ${positive}% positive, ${neutral}% neutral, and ${negative}% negative responses.
For multiple choice questions, use only the given options.
For checkbox questions, pick 1-3 options.

Give realistic answers like a real person would.`;

        // Get response from Gemini and return it exactly as-is
        return await this.geminiAPI.makeRequest(prompt);
    }

    // Example method: Generate responses for a question with AI
    async generateResponsesWithAI(questionTitle, numResponses) {
        const apiKey = this.geminiApiKey;
        if (!apiKey || apiKey.length < 20) throw new Error("Missing or placeholder API key.");
        const prompt = `Generate ${numResponses} human-like answers to the question: "${questionTitle}". Respond in plain text, each answer separated by a line break.`;
        const rawText = await this.geminiAPI.makeRequest(prompt);
        if (!rawText || !rawText.trim()) throw new Error("AI returned empty or invalid response");
        const answers = rawText.split('\n').map(ans => ans.trim()).filter(Boolean).slice(0, numResponses);
        if (answers.length === 0) throw new Error("No valid answers parsed from Gemini API response.");
        return answers;
    }

    // Add question to the form
    addQuestion(questionText, questionType, options = []) {
        const question = {
            text: questionText,
            type: questionType,
            options: options
        };
        window.questions.push(question);
        window.updatePreview();
        
        // Show create form section if we have questions
        const createFormSection = document.getElementById('createFormSection');
        if (createFormSection && window.questions.length > 0) {
            createFormSection.classList.remove('hidden');
        }
    }

    // Generate questions with AI
    async generateQuestionsWithAI(formTitle, questionCount, questionTypes) {
        try {
            const prompt = `Generate ${questionCount} questions for a form titled "${formTitle}". 
            
Question types to include: ${questionTypes.join(', ')}.

For each question, provide:
1. The question text
2. The question type
3. If it's a choice-based question (Multiple Choice, Checkboxes, Dropdown), provide 3-5 realistic options

Format the response as JSON:
{
  "questions": [
    {
      "text": "Question text here",
      "type": "Question type here",
      "options": ["option1", "option2", "option3"] // only for choice-based questions
    }
  ]
}

Make the questions relevant to the form title and realistic.`;

            const response = await this.geminiAPI.makeRequest(prompt);
            
            // Try to parse the response as JSON
            try {
                const parsed = JSON.parse(response);
                if (parsed.questions && Array.isArray(parsed.questions)) {
                    // Clear existing questions
                    window.questions = [];
                    
                    // Add new questions
                    parsed.questions.forEach(q => {
                        this.addQuestion(q.text, q.type, q.options || []);
                    });
                    
                    return true;
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', response);
                console.error('Parse error:', parseError);
            }
            
            return false;
        } catch (error) {
            console.error('AI Form Generation Error:', error);
            return false;
        }
    }

    // Create Google Form
    async createGoogleForm() {
        const title = document.getElementById('formTitle').value.trim();
        
        if (!title) {
            alert('Please enter a form title');
            return;
        }
        
        if (window.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        // Show loading modal
        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) {
            loadingModal.classList.remove('hidden');
            loadingModal.classList.add('flex');
        }

        try {
            // Prepare form data
            const formData = {
                title: title,
                questions: window.questions.map((q, index) => ({
                    number: index + 1,
                    text: q.text,
                    type: q.type,
                    options: q.options || []
                }))
            };

            // Call Google Apps Script to create the form
            const scriptUrl = import.meta?.env?.VITE_GOOGLE_APPS_SCRIPT_URL || process?.env?.VITE_GOOGLE_APPS_SCRIPT_URL;
            
            if (!scriptUrl) {
                throw new Error('Google Apps Script URL not configured');
            }

            const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.formUrl) {
                // Show success modal
                const successModal = document.getElementById('successModal');
                const formLink = document.getElementById('formLink');
                
                if (successModal && formLink) {
                    formLink.href = result.formUrl;
                    successModal.classList.remove('hidden');
                    successModal.classList.add('flex');
                }
            } else {
                throw new Error(result.error || 'Failed to create form');
            }

        } catch (error) {
            console.error('Error creating Google Form:', error);
            alert('Error creating form: ' + error.message);
        } finally {
            // Hide loading modal
            if (loadingModal) {
                loadingModal.classList.add('hidden');
                loadingModal.classList.remove('flex');
            }
        }
    }

    // Clear form
    clearForm() {
        window.questions = [];
        window.updatePreview();
        
        // Clear form inputs
        const formTitle = document.getElementById('formTitle');
        const questionText = document.getElementById('questionText');
        const optionsText = document.getElementById('optionsText');
        const questionType = document.getElementById('questionType');
        
        if (formTitle) formTitle.value = '';
        if (questionText) questionText.value = '';
        if (optionsText) optionsText.value = '';
        if (questionType) questionType.value = 'Short Answer';
        
        // Hide sections
        const createFormSection = document.getElementById('createFormSection');
        if (createFormSection) createFormSection.classList.add('hidden');
    }
}

// Make FormGenerator methods globally accessible
window.FormGenerator = FormGenerator;
