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

    // Add more methods such as generateQuestions, addManualQuestion, etc., as needed!
}
