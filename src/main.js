// Main entry point for AI-Powered Form Generator
import { FormGenerator } from './script.js';

// Force cache refresh
console.log('Loading fresh code...');

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing FormGenerator...');
        new FormGenerator();
        console.log('FormGenerator initialized successfully');
    } catch (error) {
        console.error('Error initializing FormGenerator:', error);
    }
}); 