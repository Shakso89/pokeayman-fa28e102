const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running test_unassigned_classes_lockdown.cjs ===');

const indexPath = path.join(__dirname, '..', 'public', 'pokeayman', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

const teacherShellPath = path.join(__dirname, '..', 'public', 'pokeayman', 'teacher-shell.js');
const teacherShellJs = fs.readFileSync(teacherShellPath, 'utf8').replace(/\r\n/g, '\n');

// --- 1. Test Emoji Removal & Minimization ---
console.log('--- 1. Testing Emoji Removal & Minimization ---');

// Check that My Classes doesn't have ⭐
assert.ok(!indexHtml.includes('⭐</span> My Classes'), 'My Classes header should not contain ⭐ emoji');
assert.ok(indexHtml.includes('My Classes <span'), 'My Classes header should render cleanly without emoji');

// Check that Other Classes in doesn't have 🏫
assert.ok(!indexHtml.includes('🏫</span> Other Classes in'), 'Other Classes header should not contain 🏫 emoji');
assert.ok(indexHtml.includes('Other Classes in ${escHtml(navSchool)}'), 'Other Classes header should render cleanly without emoji');

// Check that View Only badges don't have 👁
assert.ok(!indexHtml.includes('👁 View Only'), 'View Only badge should not contain 👁 emoji');
assert.ok(indexHtml.includes('title="View Only">View Only</span>'), 'gym-view-only-badge should contain only "View Only"');
assert.ok(!indexHtml.includes('<span>👁</span> View Only'), 'Banner badge should not contain 👁 emoji');

// Check student collection modal header
assert.ok(!indexHtml.includes('<span class="collection-kicker-icon">🎴</span>'), 'Collection kicker should not contain 🎴');
assert.ok(!indexHtml.includes('<span>🪙</span>\n              <span>${Number(student.coins'), 'Collection coins chip should not contain 🪙');
assert.ok(!indexHtml.includes('<span>📦</span>\n              <span>${pokemons.length}'), 'Collection count chip should not contain 📦');

// Check teacher shell school items
assert.ok(!teacherShellJs.includes('<div class="ts-school-item-name">🏫'), 'Teacher shell school items should not have 🏫 emoji');
assert.ok(!teacherShellJs.includes('<span class="ts-class-card-school">🏫'), 'Teacher shell class card school should not have 🏫 emoji');

console.log('✓ All requested emojis successfully removed and minimized.');

// --- 2. Test Lockdown of Unassigned Classes in index.html ---
console.log('--- 2. Testing Lockdown of Unassigned Classes in index.html ---');

// Check isViewOnly branch in renderTeacherDashboard
assert.ok(indexHtml.includes("tabsContainer.style.display = 'none'"), 'tabsContainer must be hidden in view-only mode');
assert.ok(indexHtml.includes("document.getElementById('class-subtab-students')?.classList.remove('hidden')"), 'Only students subtab should be visible in view-only mode');
assert.ok(indexHtml.includes("actionConsole.style.display = 'none'"), 'class-action-console must be hidden in view-only mode');

// Check tab click listener guard
assert.ok(indexHtml.includes("btn.dataset.classtab !== 'students' && currentRole === 'teacher' && navSchool && navClass && !canOpenClass(navSchool, navClass)"), 'class-view-tab click listener must block non-students tabs when unassigned');

// Check form submission guards
assert.ok(indexHtml.includes("document.getElementById('gift-all-form').addEventListener('submit', async e => {\n  e.preventDefault();\n  if (currentRole === 'teacher' && !canOpenClass(navSchool, navClass))"), 'gift-all-form must check teacher class assignment');
assert.ok(indexHtml.includes("document.getElementById('add-student-form').addEventListener('submit', async e => {\n  e.preventDefault(); \n  if (currentRole === 'teacher' && !canOpenClass(navSchool, navClass))"), 'add-student-form must check teacher class assignment');
assert.ok(indexHtml.includes("document.getElementById('award-form').addEventListener('submit', async e => {\n  e.preventDefault();\n  if (currentRole === 'teacher' && !canOpenClass(navSchool, navClass))"), 'award-form must check teacher class assignment');
assert.ok(indexHtml.includes("document.getElementById('quiz-form').addEventListener('submit', async e => {\n  e.preventDefault();\n  if (currentRole === 'teacher' && !canOpenClass(navSchool, navClass))"), 'quiz-form must check teacher class assignment');

// Check teacher assignment modal guard
assert.ok(indexHtml.includes("if (!canManageSchool(schoolName)) {\n    toast('Only Admins and School Managers can change teacher assignments.');\n    return;\n  }"), 'openAssignClassTeachersModal must require school manager permission');

console.log('✓ index.html security and view-only restrictions validated.');

// --- 3. Test Lockdown of Unassigned Classes in teacher-shell.js ---
console.log('--- 3. Testing Lockdown of Unassigned Classes in teacher-shell.js ---');

// onNav blocks non-student tabs
assert.ok(teacherShellJs.includes("if (cls !== 'students' && !g(() => canManageClass(navSchool, navClass) || canOpenClass(navSchool, navClass), false))"), 'teacher-shell onNav must block non-student tabs for unassigned classes');

// onHero blocks actions
assert.ok(teacherShellJs.includes("function onHero(e) {\n    const b = e.target.closest('[data-hero],[data-ts-add-student]'); if (!b) return;\n    if (!g(() => canManageClass(navSchool, navClass) || canOpenClass(navSchool, navClass), false))"), 'teacher-shell onHero must block actions for unassigned classes');

// openHeroActionDialog blocks actions
assert.ok(teacherShellJs.includes("function openHeroActionDialog(action, trigger) {\n    if (!g(() => canManageClass(navSchool, navClass) || canOpenClass(navSchool, navClass), false))"), 'teacher-shell openHeroActionDialog must block actions for unassigned classes');

// onRail blocks add student
assert.ok(teacherShellJs.includes("if (b.id === 'ts-rail-add') {\n      if (!g(() => canManageClass(navSchool, navClass) || canOpenClass(navSchool, navClass), false))"), 'teacher-shell onRail must block add student for unassigned classes');

// sync() hides controls when isClassViewOnly
assert.ok(teacherShellJs.includes("const isClassViewOnly = !!inClass && !g(() => canManageClass(navSchool, navClass) || canOpenClass(navSchool, navClass), false);"), 'teacher-shell sync must detect isClassViewOnly');
assert.ok(teacherShellJs.includes("b.style.display = (isClassViewOnly && b.dataset.tsClass !== 'students') ? 'none' : '';"), 'teacher-shell sync must hide non-student tabs for view-only class');
assert.ok(teacherShellJs.includes("if (heroActions) heroActions.style.display = isClassViewOnly ? 'none' : '';"), 'teacher-shell sync must hide hero actions for view-only class');
assert.ok(teacherShellJs.includes("if (railAdd) railAdd.style.display = isClassViewOnly ? 'none' : '';"), 'teacher-shell sync must hide rail add button for view-only class');
assert.ok(teacherShellJs.includes("if (quickAwardSection) quickAwardSection.style.display = isClassViewOnly ? 'none' : '';"), 'teacher-shell sync must hide quick award section for view-only class');

console.log('✓ teacher-shell.js security and view-only restrictions validated.');
console.log('\nAll unassigned classes lockdown and emoji removal tests passed! 🎉');
