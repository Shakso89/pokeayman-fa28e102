const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running test_vocab_generator_tender_dolphin.cjs ===');

const vocabJsPath = path.join(__dirname, '..', 'public', 'pokeayman', 'vocab-list-generator.js');
const vocabJs = fs.readFileSync(vocabJsPath, 'utf8');

const componentsCssPath = path.join(__dirname, '..', 'public', 'pokeayman', 'components.css');
const componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

const themeBridgeCssPath = path.join(__dirname, '..', 'public', 'pokeayman', 'theme-bridge.css');
const themeBridgeCss = fs.readFileSync(themeBridgeCssPath, 'utf8');

const apiRoutePath = path.join(__dirname, '..', 'src', 'routes', 'api', 'generate-vocab-list.ts');
const apiRoute = fs.readFileSync(apiRoutePath, 'utf8');

// --- 1. Testing Emoji Removal ---
console.log('--- 1. Testing Emoji Removal ---');
assert.ok(!vocabJs.includes('<span>⚡</span> Generate Vocabulary List'), 'Modal title should not have ⚡ emoji');
assert.ok(!vocabJs.includes('<span>📝</span> Write Words'), 'Write Words tab should not have 📝 emoji');
assert.ok(!vocabJs.includes('<span>📷</span> Upload Photo'), 'Upload Photo tab should not have 📷 emoji');
assert.ok(!vocabJs.includes('📸</div>'), 'Upload prompt should not have 📸 emoji');
assert.ok(!vocabJs.includes('<span>⏳</span> Generating...'), 'Submit button generating state should not have ⏳ emoji');
assert.ok(!vocabJs.includes('🎉 Generated'), 'Toast message should not have 🎉 emoji');
console.log('✓ All decorative emojis successfully removed from vocabulary generator.');

// --- 2. Testing Tender Dolphin UI (uiverse.io/akshat-patel28/tender-dolphin-38) ---
console.log('--- 2. Testing Tender Dolphin UI ---');
assert.ok(vocabJs.includes('class="tender-dolphin-dropzone"'), 'Must contain tender-dolphin-dropzone');
assert.ok(vocabJs.includes('class="tender-dolphin-input-div"'), 'Must contain tender-dolphin-input-div');
assert.ok(vocabJs.includes('class="tender-dolphin-icon"'), 'Must contain tender-dolphin-icon');
assert.ok(vocabJs.includes('polyline points="16 16 12 12 8 16"'), 'Must contain Uiverse SVG icon');

// Check CSS in components.css & theme-bridge.css
assert.ok(componentsCss.includes('.tender-dolphin-input-div'), 'components.css must define .tender-dolphin-input-div');
assert.ok(componentsCss.includes('html body.ts-bright .tender-dolphin-input-div'), 'components.css must support bright mode');
assert.ok(themeBridgeCss.includes('.tender-dolphin-input-div'), 'theme-bridge.css must define .tender-dolphin-input-div');
assert.ok(themeBridgeCss.includes('html body.ts-bright .tender-dolphin-input-div'), 'theme-bridge.css must support bright mode');
console.log('✓ Tender Dolphin UI markup and styles validated for dark and bright modes.');

// --- 3. Testing Word Count: "All" or Manually Entered ---
console.log('--- 3. Testing Word Count (All vs Manual Number Input) ---');
assert.ok(!vocabJs.includes('data-count="3"'), 'Hardcoded 3 words button should be removed');
assert.ok(!vocabJs.includes('data-count="5"'), 'Hardcoded 5 words button should be removed');
assert.ok(!vocabJs.includes('data-count="8"'), 'Hardcoded 8 words button should be removed');
assert.ok(!vocabJs.includes('data-count="10"'), 'Hardcoded 10 words button should be removed');

assert.ok(vocabJs.includes('id="vocab-gen-count-all"'), 'Must contain "All words" button');
assert.ok(vocabJs.includes('id="vocab-gen-custom-count-input"'), 'Must contain custom number input');
assert.ok(vocabJs.includes("selectedPhotoCount = 'all'"), 'Default selection should support all words');

// Backend API validation
assert.ok(apiRoute.includes("const isAll = input.count === 'all'"), 'API must handle count: "all"');
assert.ok(apiRoute.includes("Math.min(Math.max(Number(input.count) || 5, 1), 30)"), 'API must handle custom numeric counts');
console.log('✓ Word count controls and backend integration validated.');

// --- 4. Testing No AI Model Names in Status/Steps ---
console.log('--- 4. Testing Step Descriptions without AI Model Mentions ---');
assert.ok(!vocabJs.toLowerCase().includes('gemini'), 'vocab-list-generator.js must not contain any reference to "gemini"');
assert.ok(vocabJs.includes('Step 1/3: Writing contextual sentences...'), 'Step 1 must be clean descriptive step');
assert.ok(vocabJs.includes('Step 2/3: Finding illustrations'), 'Step 2 must be clean descriptive step');
assert.ok(vocabJs.includes('Step 3/3: Saving vocabulary list to classroom...'), 'Step 3 must be clean descriptive step');
assert.ok(vocabJs.includes('bl8-loader'), 'Bright-lizard-8 loader animation must be preserved');
console.log('✓ Generating screen displays clean numbered steps with preserved animation and zero model names.');

console.log('\nAll tests passed successfully! 🎉');
