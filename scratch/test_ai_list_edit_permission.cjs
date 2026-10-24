const assert = require('assert');
const fs = require('fs');

console.log('--- Testing AI Vocab List Permissions & Generation ---');

// Test 1: Verify vocab-list-generator.js logic
const generatorCode = fs.readFileSync('C:/Users/ayman/Documents/Codex/2026-10-12/ch/work/pokeayman-fa28e102/public/pokeayman/vocab-list-generator.js', 'utf8');

assert(generatorCode.includes('ai_creator_teacher: teacherName'), 'vocab-list-generator should save ai_creator_teacher');
assert(generatorCode.includes('ai_creator_id: teacherId'), 'vocab-list-generator should save ai_creator_id');
assert(generatorCode.includes('created_by: teacherName'), 'vocab-list-generator should save created_by');

// Test 2: Verify index.html openVocabListEditor logic
const indexHtml = fs.readFileSync('C:/Users/ayman/Documents/Codex/2026-10-12/ch/work/pokeayman-fa28e102/public/pokeayman/index.html', 'utf8');

// Ensure no duplicate declaration of listSchool or listClass
const editorFnMatch = indexHtml.match(/function openVocabListEditor\(listId, listName\) \{([\s\S]*?)\nfunction/);
assert(editorFnMatch, 'Found openVocabListEditor');
const fnBody = editorFnMatch[1];

const listSchoolDeclCount = (fnBody.match(/const listSchool\s*=/g) || []).length;
const listClassDeclCount = (fnBody.match(/const listClass\s*=/g) || []).length;
assert.strictEqual(listSchoolDeclCount, 1, 'listSchool must be declared exactly once');
assert.strictEqual(listClassDeclCount, 1, 'listClass must be declared exactly once');

// Test 3: Functional permission simulation
function canManageClass(school, className, managedMap) {
  return Boolean(managedMap[`${school}::${className}`]);
}

function normalizeStudentIdentity(name) {
  return String(name || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function checkCanEditVocabList({
  currentRole,
  currentTeacher,
  currentTeacherRecordId,
  verifiedTeacherId,
  isAdmin,
  navSchool,
  navClass,
  managedClasses = {},
  listRecord
}) {
  let toastMsg = null;
  const toast = msg => { toastMsg = msg; };

  const selectedList = listRecord;
  const myTeacherId = String(verifiedTeacherId || currentTeacherRecordId || '').trim();
  const listSchool = String(selectedList.vocab_list_school || selectedList.school_name || '');
  const listClass = String(selectedList.vocab_list_class || selectedList.class_name || '');
  const isClassManager = canManageClass(listSchool, listClass, managedClasses);
  const isAiGen = Boolean(selectedList.is_ai_generated || selectedList.ai_generated || String(selectedList.vocab_list_id || '').startsWith('vocab-ai-'));
  const teacherKey = normalizeStudentIdentity(currentTeacher);
  const listOwnerKey = normalizeStudentIdentity(selectedList.teacher_name || selectedList.owner || selectedList.created_by || selectedList.ai_creator_teacher);
  const listTeacherId = String(selectedList.teacher_id || selectedList.ai_creator_id || '').trim();
  const isInCurrentClass = Boolean(navClass && (String(listClass).trim() === String(navClass).trim()));

  const ownedByCurrentTeacher = Boolean(
    isAdmin ||
    (myTeacherId && listTeacherId && listTeacherId === myTeacherId) ||
    (!listTeacherId && teacherKey && listOwnerKey && listOwnerKey === teacherKey) ||
    (teacherKey && listOwnerKey && listOwnerKey === teacherKey) ||
    isClassManager ||
    (isAiGen && (
      isClassManager ||
      isInCurrentClass ||
      !listTeacherId ||
      listOwnerKey === 'teacher' ||
      !listOwnerKey ||
      (teacherKey && listOwnerKey === teacherKey) ||
      (myTeacherId && listTeacherId === myTeacherId)
    ))
  );

  if (currentRole !== 'teacher' || (!isAdmin && !ownedByCurrentTeacher)) {
    toast('Only the list owner or an admin can edit this vocabulary list.');
    return { canEdit: false, error: toastMsg };
  }
  return { canEdit: true };
}

// Case A: Teacher created AI list with their name, viewing their class (even if verifiedTeacherId is empty!)
const resA = checkCanEditVocabList({
  currentRole: 'teacher',
  currentTeacher: 'Sarah',
  currentTeacherRecordId: '',
  verifiedTeacherId: '',
  isAdmin: false,
  navSchool: 'School 1',
  navClass: 'Class A',
  managedClasses: { 'School 1::Class A': true },
  listRecord: {
    __backendId: 'rec-ai-1',
    vocab_list_id: 'vocab-ai-12345',
    vocab_list_name: 'test111',
    vocab_list_school: 'School 1',
    vocab_list_class: 'Class A',
    teacher_name: 'Sarah',
    owner: 'Sarah',
    teacher_id: '',
    is_ai_generated: true
  }
});
assert.strictEqual(resA.canEdit, true, 'Teacher Sarah should be able to edit her AI list in Class A');

// Case B: Teacher in Class A editing an AI list that was generated with default 'Teacher'
const resB = checkCanEditVocabList({
  currentRole: 'teacher',
  currentTeacher: 'John',
  currentTeacherRecordId: 't-john-id',
  verifiedTeacherId: 't-john-id',
  isAdmin: false,
  navSchool: 'School 1',
  navClass: 'Class A',
  managedClasses: { 'School 1::Class A': true },
  listRecord: {
    __backendId: 'rec-ai-2',
    vocab_list_id: 'vocab-ai-67890',
    vocab_list_name: 'Science Words',
    vocab_list_school: 'School 1',
    vocab_list_class: 'Class A',
    teacher_name: 'Teacher',
    owner: 'Teacher',
    teacher_id: '',
    is_ai_generated: true
  }
});
assert.strictEqual(resB.canEdit, true, 'Teacher John managing Class A should be able to edit AI list with placeholder Teacher');

// Case C: Teacher from another class/school attempting to edit someone else's list in Class B without management rights
const resC = checkCanEditVocabList({
  currentRole: 'teacher',
  currentTeacher: 'OtherTeacher',
  currentTeacherRecordId: 't-other',
  verifiedTeacherId: 't-other',
  isAdmin: false,
  navSchool: 'School 2',
  navClass: 'Class X',
  managedClasses: { 'School 2::Class X': true },
  listRecord: {
    __backendId: 'rec-ai-3',
    vocab_list_id: 'vocab-ai-999',
    vocab_list_name: 'Class A Only',
    vocab_list_school: 'School 1',
    vocab_list_class: 'Class A',
    teacher_name: 'Sarah',
    owner: 'Sarah',
    teacher_id: 't-sarah',
    is_ai_generated: true
  }
});
assert.strictEqual(resC.canEdit, false, 'OtherTeacher should NOT be able to edit Sarah\'s list in another class');
assert.strictEqual(resC.error, 'Only the list owner or an admin can edit this vocabulary list.');

// Case D: Admin can edit any AI list
const resD = checkCanEditVocabList({
  currentRole: 'teacher',
  currentTeacher: 'Ayman',
  currentTeacherRecordId: '',
  verifiedTeacherId: 'ayman',
  isAdmin: true,
  navSchool: 'School 1',
  navClass: 'Class A',
  managedClasses: {},
  listRecord: {
    __backendId: 'rec-ai-4',
    vocab_list_id: 'vocab-ai-444',
    vocab_list_name: 'Any List',
    vocab_list_school: 'School 1',
    vocab_list_class: 'Class A',
    teacher_name: 'SomeoneElse',
    owner: 'SomeoneElse',
    teacher_id: 'someone-id',
    is_ai_generated: true
  }
});
assert.strictEqual(resD.canEdit, true, 'Admin Ayman should be able to edit any list');

console.log('All AI vocab list permission tests passed successfully!');
