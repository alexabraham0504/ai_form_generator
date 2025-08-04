import { readFileSync, writeFileSync } from 'fs';

function cleanAllConflicts(filename) {
    try {
        console.log(`Cleaning all conflicts in ${filename}...`);
        let content = readFileSync(filename, 'utf8');
        
        // Remove all conflict markers and their content
        // This regex matches: <<<<<<< HEAD ... ======= ... >>>>>>> commit-hash
        content = content.replace(/<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> [a-f0-9]+/g, '');
        
        // Remove any remaining individual conflict markers
        content = content.replace(/<<<<<<< HEAD/g, '');
        content = content.replace(/=======/g, '');
        content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
        
        // Clean up any extra whitespace that might be left
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        writeFileSync(filename, content, 'utf8');
        console.log(`✅ Cleaned ${filename}`);
    } catch (error) {
        console.error(`❌ Error cleaning ${filename}:`, error.message);
    }
}

// Clean the files
cleanAllConflicts('index2.html');
cleanAllConflicts('welcome.html');

console.log('🎉 All conflict markers removed!'); 