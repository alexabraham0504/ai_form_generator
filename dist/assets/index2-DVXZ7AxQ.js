(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function e(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=e(n);fetch(n.href,s)}})();class w{constructor(t){this.apiKey=t,this.baseUrl="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"}async makeRequest(t){var e,o;try{const s=await(await fetch(`${this.baseUrl}?key=${this.apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],generationConfig:{temperature:.8,maxOutputTokens:4096,topP:.95}})})).json();if(console.log("🔎 Full Gemini API Response:",s),!s||!Array.isArray(s.candidates)||s.candidates.length===0)throw new Error(`No candidates returned. Raw response: ${JSON.stringify(s)}`);const r=s.candidates[0],a=(e=r==null?void 0:r.content)==null?void 0:e.parts,l=Array.isArray(a)&&((o=a[0])!=null&&o.text)?a[0].text:"";if(!l.trim())throw new Error("No valid text found in Gemini API response.");return l}catch(n){return console.error("❌ Gemini API Error:",n),""}}}class p{constructor(){var t,e,o;this.geminiApiKey=window.GEMINI_API_KEY||((e=(t=import.meta)==null?void 0:t.env)==null?void 0:e.VITE_GEMINI_API_KEY)||((o=process==null?void 0:process.env)==null?void 0:o.GEMINI_API_KEY),this.geminiAPI=new w(this.geminiApiKey),this.questions=[]}async generateSyntheticResponses(t,e,o){const{positive:n,neutral:s,negative:r}=o,a=t.questions.map((c,d)=>{const u=c.options?` [Options: ${c.options.join("|")}]`:"";return`Question ${d+1}: ${c.title}${u}`}).join(`
`),l=`Generate ${e} responses for this survey:

${a}

Make ${n}% positive, ${s}% neutral, and ${r}% negative responses.
For multiple choice questions, use only the given options.
For checkbox questions, pick 1-3 options.

Give realistic answers like a real person would.`;return await this.geminiAPI.makeRequest(l)}async generateResponsesWithAI(t,e){const o=this.geminiApiKey;if(!o||o.length<20)throw new Error("Missing or placeholder API key.");const n=`Generate ${e} human-like answers to the question: "${t}". Respond in plain text, each answer separated by a line break.`,s=await this.geminiAPI.makeRequest(n);if(!s||!s.trim())throw new Error("AI returned empty or invalid response");const r=s.split(`
`).map(a=>a.trim()).filter(Boolean).slice(0,e);if(r.length===0)throw new Error("No valid answers parsed from Gemini API response.");return r}addQuestion(t,e,o=[]){const n={text:t,type:e,options:o};window.questions.push(n),window.updatePreview();const s=document.getElementById("createFormSection");s&&window.questions.length>0&&s.classList.remove("hidden")}async generateQuestionsWithAI(t,e,o){try{const n=`Generate ${e} questions for a form titled "${t}". 
            
Question types to include: ${o.join(", ")}.

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

Make the questions relevant to the form title and realistic.`,s=await this.geminiAPI.makeRequest(n);try{const r=JSON.parse(s);if(r.questions&&Array.isArray(r.questions))return window.questions=[],r.questions.forEach(a=>{this.addQuestion(a.text,a.type,a.options||[])}),!0}catch(r){console.error("Failed to parse AI response:",s),console.error("Parse error:",r)}return!1}catch(n){return console.error("AI Form Generation Error:",n),!1}}async createGoogleForm(){var o,n,s;const t=document.getElementById("formTitle").value.trim();if(!t){alert("Please enter a form title");return}if(window.questions.length===0){alert("Please add at least one question");return}const e=document.getElementById("loadingModal");e&&(e.classList.remove("hidden"),e.classList.add("flex"));try{const r={title:t,questions:window.questions.map((d,u)=>({number:u+1,text:d.text,type:d.type,options:d.options||[]}))},a=((n=(o=import.meta)==null?void 0:o.env)==null?void 0:n.VITE_GOOGLE_APPS_SCRIPT_URL)||((s=process==null?void 0:process.env)==null?void 0:s.VITE_GOOGLE_APPS_SCRIPT_URL);if(!a)throw new Error("Google Apps Script URL not configured");const l=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!l.ok)throw new Error(`HTTP error! status: ${l.status}`);const c=await l.json();if(c.success&&c.formUrl){const d=document.getElementById("successModal"),u=document.getElementById("formLink");d&&u&&(u.href=c.formUrl,d.classList.remove("hidden"),d.classList.add("flex"))}else throw new Error(c.error||"Failed to create form")}catch(r){console.error("Error creating Google Form:",r),alert("Error creating form: "+r.message)}finally{e&&(e.classList.add("hidden"),e.classList.remove("flex"))}}clearForm(){window.questions=[],window.updatePreview();const t=document.getElementById("formTitle"),e=document.getElementById("questionText"),o=document.getElementById("optionsText"),n=document.getElementById("questionType");t&&(t.value=""),e&&(e.value=""),o&&(o.value=""),n&&(n.value="Short Answer");const s=document.getElementById("createFormSection");s&&s.classList.add("hidden")}}window.FormGenerator=p;console.log("Loading fresh code...");window.questions=[];window.currentOptionMethod="manual";window.aiGenerationStep=1;window.selectedQuestionCount=5;window.selectedQuestionTypes=["Short Answer","Paragraph","Multiple Choice","Checkboxes","Dropdown"];window.csvQuestions=[];window.importedQuestions=[];window.questionCounter=0;document.addEventListener("DOMContentLoaded",()=>{try{console.log("Initializing FormGenerator...");const i=new p;window.formGenerator=i,v(),console.log("FormGenerator initialized successfully")}catch(i){console.error("Error initializing FormGenerator:",i)}});function v(){const i=document.getElementById("questionType");i&&i.addEventListener("change",function(){const e=this.value,o=document.getElementById("optionsSection"),n=document.getElementById("paragraphSection");["Multiple Choice","Checkboxes","Dropdown"].includes(e)?(o.classList.remove("hidden"),n.classList.add("hidden")):e==="Paragraph"?(o.classList.add("hidden"),n.classList.remove("hidden")):(o.classList.add("hidden"),n.classList.add("hidden"))});const t=document.getElementById("csvFile");t&&t.addEventListener("change",function(e){const o=e.target.files[0];if(o){const n=new FileReader;n.onload=function(s){const r=s.target.result,a=y(r),l=document.getElementById("optionsText");l&&(l.value=a.join(`
`))},n.readAsText(o)}}),m("manual"),g()}function y(i){return i.trim().split(`
`).map(e=>{const o=e.indexOf(",");return o>-1?e.substring(0,o).trim():e.trim()}).filter(e=>e)}function m(i){window.currentOptionMethod=i;const t=document.getElementById("manualBtn"),e=document.getElementById("csvBtn"),o=document.getElementById("aiBtn"),n=document.getElementById("manualOptions"),s=document.getElementById("csvOptions"),r=document.getElementById("aiOptions");t&&(t.className=i==="manual"?"flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow":"flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"),e&&(e.className=i==="csv"?"flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow":"flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"),o&&(o.className=i==="ai"?"flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all btn-glow":"flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"),n&&n.classList.toggle("hidden",i!=="manual"),s&&s.classList.toggle("hidden",i!=="csv"),r&&r.classList.toggle("hidden",i!=="ai")}function f(){const i=document.getElementById("questionsPreview");if(!i)return;if(window.questions.length===0){i.innerHTML=`
            <div class="text-white/70 text-center py-12">
                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <p class="text-lg font-semibold">No questions added yet</p>
                <p class="text-sm opacity-75">Add your first question to see the list!</p>
            </div>
        `;return}const t=window.questions.map((e,o)=>`
        <div class="question-item bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all mb-4 relative" draggable="true">
            <div class="drag-handle absolute top-3 right-12 text-white/60 hover:text-white/80 cursor-move">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span class="question-number text-white font-bold text-xs">${o+1}</span>
                        </div>
                        <h4 class="text-white font-semibold text-base">${e.text}</h4>
                    </div>
                    <div class="flex items-center space-x-3 mb-2">
                        <span class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">${e.type}</span>
                        ${e.options&&e.options.length>0?`<span class="text-white/60 text-xs">${e.options.length} options</span>`:""}
                    </div>
                    ${e.options&&e.options.length>0?`
                        <div class="bg-white/5 rounded-lg p-3">
                            <p class="text-white/70 text-xs font-medium mb-2">Options:</p>
                            <div class="flex flex-wrap gap-1">
                                ${e.options.map(n=>`<span class="px-2 py-1 bg-white/10 text-white rounded text-xs">${n}</span>`).join("")}
                            </div>
                        </div>
                    `:""}
                </div>
                <button onclick="removeQuestion(${o})" class="text-red-400 hover:text-red-300 transition-colors ml-2 p-1 hover:bg-red-500/20 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join("");i.innerHTML=t}function x(i){window.questions.splice(i,1),f()}function g(){const i=document.getElementById("questionsPreview");i&&(i.addEventListener("dragstart",t=>{t.target.classList.contains("question-item")&&(t.target.classList.add("dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/html",t.target.outerHTML))}),i.addEventListener("dragend",t=>{t.target.classList.contains("question-item")&&t.target.classList.remove("dragging")}),i.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";const e=document.querySelector(".dragging");if(!e)return;const o=b(i,t.clientY);o?i.insertBefore(e,o):i.appendChild(e)}),i.addEventListener("drop",t=>{t.preventDefault(),h()}))}function b(i,t){return[...i.querySelectorAll(".question-item:not(.dragging)")].reduce((o,n)=>{const s=n.getBoundingClientRect(),r=t-s.top-s.height/2;return r<0&&r>o.offset?{offset:r,element:n}:o},{offset:Number.NEGATIVE_INFINITY}).element}function h(){document.querySelectorAll(".question-item").forEach((t,e)=>{const o=t.querySelector(".question-number");o&&(o.textContent=e+1)})}window.setOptionMethod=m;window.updatePreview=f;window.removeQuestion=x;window.initDragAndDrop=g;window.updateQuestionNumbers=h;
//# sourceMappingURL=index2-DVXZ7AxQ.js.map
