// Main entry point for AI-Powered Form Generator
import { FormGenerator } from './script.js';

// Force cache refresh
console.log('Loading fresh code...');

// Global variables that need to be accessible
window.questions = [];
window.currentOptionMethod = 'manual';
window.aiGenerationStep = 1;
window.selectedQuestionCount = 5;
window.selectedQuestionTypes = ['Short Answer', 'Paragraph', 'Multiple Choice', 'Checkboxes', 'Dropdown'];
window.csvQuestions = [];
window.importedQuestions = [];
window.questionCounter = 0;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing FormGenerator...');
        const formGenerator = new FormGenerator();
        
        // Make formGenerator globally accessible
        window.formGenerator = formGenerator;
        
        // Initialize the form functionality
        initializeFormFunctionality();
        
        console.log('FormGenerator initialized successfully');
    } catch (error) {
        console.error('Error initializing FormGenerator:', error);
    }
});

function initializeFormFunctionality() {
    // Initialize question type change handler
    const questionTypeSelect = document.getElementById('questionType');
    if (questionTypeSelect) {
        questionTypeSelect.addEventListener('change', function() {
            const type = this.value;
            const optionsSection = document.getElementById('optionsSection');
            const paragraphSection = document.getElementById('paragraphSection');
            
            if (['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(type)) {
                optionsSection.classList.remove('hidden');
                paragraphSection.classList.add('hidden');
            } else if (type === 'Paragraph') {
                optionsSection.classList.add('hidden');
                paragraphSection.classList.remove('hidden');
            } else {
                optionsSection.classList.add('hidden');
                paragraphSection.classList.add('hidden');
            }
        });
    }

    // Initialize CSV file handler
    const csvFileInput = document.getElementById('csvFile');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const csv = e.target.result;
                    const options = parseCSV(csv);
                    const optionsTextArea = document.getElementById('optionsText');
                    if (optionsTextArea) {
                        optionsTextArea.value = options.join('\n');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Set initial option method
    setOptionMethod('manual');
    
    // Initialize drag and drop
    initDragAndDrop();
}

// Helper function to parse CSV
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    return lines.map(line => {
        const firstComma = line.indexOf(',');
        return firstComma > -1 ? line.substring(0, firstComma).trim() : line.trim();
    }).filter(option => option);
}

// Function to set option method
function setOptionMethod(method) {
    window.currentOptionMethod = method;
    const manualBtn = document.getElementById('manualBtn');
    const csvBtn = document.getElementById('csvBtn');
    const aiBtn = document.getElementById('aiBtn');
    const manualOptions = document.getElementById('manualOptions');
    const csvOptions = document.getElementById('csvOptions');
    const aiOptions = document.getElementById('aiOptions');
    
    if (manualBtn) manualBtn.className = method === 'manual' ? 'flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow' : 'flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all';
    if (csvBtn) csvBtn.className = method === 'csv' ? 'flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow' : 'flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all';
    if (aiBtn) aiBtn.className = method === 'ai' ? 'flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow' : 'flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all';
    
    if (manualOptions) manualOptions.classList.toggle('hidden', method !== 'manual');
    if (csvOptions) csvOptions.classList.toggle('hidden', method !== 'csv');
    if (aiOptions) aiOptions.classList.toggle('hidden', method !== 'ai');
}

// Function to update questions preview
function updatePreview() {
    const preview = document.getElementById('questionsPreview');
    
    if (!preview) return;
    
    if (window.questions.length === 0) {
        preview.innerHTML = `
            <div class="text-white/70 text-center py-12">
                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <p class="text-lg font-semibold">No questions added yet</p>
                <p class="text-sm opacity-75">Add your first question to see the list!</p>
            </div>
        `;
        return;
    }

    // Simple list of questions with drag functionality
    const questionsHTML = window.questions.map((q, index) => `
        <div class="question-item bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all mb-4 relative" draggable="true">
            <div class="drag-handle absolute top-3 right-12 text-white/60 hover:text-white/80 cursor-move">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span class="question-number text-white font-bold text-xs">${index + 1}</span>
                        </div>
                        <h4 class="text-white font-semibold text-base">${q.text}</h4>
                    </div>
                    <div class="flex items-center space-x-3 mb-2">
                        <span class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">${q.type}</span>
                        ${q.options && q.options.length > 0 ? `<span class="text-white/60 text-xs">${q.options.length} options</span>` : ''}
                    </div>
                    ${q.options && q.options.length > 0 ? `
                        <div class="bg-white/5 rounded-lg p-3">
                            <p class="text-white/70 text-xs font-medium mb-2">Options:</p>
                            <div class="flex flex-wrap gap-1">
                                ${q.options.map(option => `<span class="px-2 py-1 bg-white/10 text-white rounded text-xs">${option}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <button onclick="removeQuestion(${index})" class="text-red-400 hover:text-red-300 transition-colors ml-2 p-1 hover:bg-red-500/20 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    preview.innerHTML = questionsHTML;
}

// Function to remove a question
function removeQuestion(index) {
    window.questions.splice(index, 1);
    updatePreview();
}

// Function to initialize drag and drop
function initDragAndDrop() {
    const previewContainer = document.getElementById('questionsPreview');
    
    if (!previewContainer) return;
    
    previewContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('question-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
        }
    });

    previewContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('question-item')) {
            e.target.classList.remove('dragging');
        }
    });

    previewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        const afterElement = getDragAfterElement(previewContainer, e.clientY);
        if (afterElement) {
            previewContainer.insertBefore(draggingElement, afterElement);
        } else {
            previewContainer.appendChild(draggingElement);
        }
    });

    previewContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        updateQuestionNumbers();
    });
}

// Helper function to determine drop position
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.question-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update question numbers after drag and drop
function updateQuestionNumbers() {
    const questionElements = document.querySelectorAll('.question-item');
    questionElements.forEach((element, index) => {
        const numberElement = element.querySelector('.question-number');
        if (numberElement) {
            numberElement.textContent = index + 1;
        }
    });
}

// Make functions globally accessible
window.setOptionMethod = setOptionMethod;
window.updatePreview = updatePreview;
window.removeQuestion = removeQuestion;
window.initDragAndDrop = initDragAndDrop;
window.updateQuestionNumbers = updateQuestionNumbers; 