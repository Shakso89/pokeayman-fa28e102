import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Teacher Class Assignment & Tab Access (Teacher Emmo)', () => {
  let canOpenClass: any;
  let canManageClass: any;
  let getAssignedClasses: any;
  let allData: any[];

  beforeEach(() => {
    allData = [];
    const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const mockWindow: any = {
      allData,
      currentTeacher: 'Emmo',
      currentTeacherRecordId: 'uuid-emmo',
      currentRole: 'teacher',
      verifiedTeacherIdentity: () => 'uuid-emmo',
      isAymanTeacher: () => false,
      canAccessAdmin: () => false,
      getEffectiveTeacherRole: () => 'teacher',
      canManageSchool: () => false,
      getAssignedSchools: () => [],
      getTeachers: () => [
        { __backendId: 'uuid-emmo', teacher_name: 'Teacher Emmo', teacher_role: 'teacher' },
        { __backendId: 'uuid-ayman', teacher_name: 'Ayman', teacher_role: 'admin' },
      ],
      getClasses: (school: string) => {
        return allData.filter((r: any) => r.type === 'class' && r.school_name === school);
      },
    };

    const openClassMatch = htmlContent.match(/function canOpenClass\([\s\S]*?^window\.canOpenClass = canOpenClass;/m);
    const manageClassMatch = htmlContent.match(/function canManageClass\([\s\S]*?^\}/m);
    const assignedClassesMatch = htmlContent.match(/function getAssignedClasses\([\s\S]*?^window\.getAssignedClasses = getAssignedClasses;/m);
    const classTeacherNamesMatch = htmlContent.match(/function getClassTeacherNames\([\s\S]*?^window\.getClassTeacherNames = getClassTeacherNames;/m);
    const assignmentMatchesTeacherMatch = htmlContent.match(/function assignmentMatchesTeacher\([\s\S]*?^\}/m);

    expect(openClassMatch).not.toBeNull();
    expect(manageClassMatch).not.toBeNull();
    expect(assignedClassesMatch).not.toBeNull();

    const script = `
      ${assignmentMatchesTeacherMatch![0]}
      ${assignedClassesMatch![0]}
      ${classTeacherNamesMatch ? classTeacherNamesMatch[0] : ''}
      ${openClassMatch![0]}
      ${manageClassMatch![0]}
      return { canOpenClass, canManageClass, getAssignedClasses };
    `;

    const fn = new Function('allData', 'currentTeacher', 'currentTeacherRecordId', 'currentRole', 'verifiedTeacherIdentity', 'isAymanTeacher', 'canAccessAdmin', 'getEffectiveTeacherRole', 'canManageSchool', 'getAssignedSchools', 'getTeachers', 'getClasses', script);
    
    const context = fn(
      allData,
      mockWindow.currentTeacher,
      mockWindow.currentTeacherRecordId,
      mockWindow.currentRole,
      mockWindow.verifiedTeacherIdentity,
      mockWindow.isAymanTeacher,
      mockWindow.canAccessAdmin,
      mockWindow.getEffectiveTeacherRole,
      mockWindow.canManageSchool,
      mockWindow.getAssignedSchools,
      mockWindow.getTeachers,
      mockWindow.getClasses
    );

    canOpenClass = context.canOpenClass;
    canManageClass = context.canManageClass;
    getAssignedClasses = context.getAssignedClasses;
  });

  it('allows Teacher Emmo to open and manage class when assigned via assigned_teacher_ids (UUID)', () => {
    allData.push({
      type: 'class',
      school_name: 'Lincoln High',
      class_name: 'P5 Grammar Stars',
      assigned_teacher_ids: ['uuid-emmo'],
      assigned_teachers: ['Teacher Emmo'],
    });

    expect(canOpenClass('Lincoln High', 'P5 Grammar Stars', 'Emmo', 'uuid-emmo')).toBe(true);
    expect(canManageClass('Lincoln High', 'P5 Grammar Stars')).toBe(true);
  });

  it('allows Teacher Emmo to open and manage class when assigned via display name with "Teacher" prefix', () => {
    allData.push({
      type: 'class',
      school_name: 'Lincoln High',
      class_name: 'P5 Grammar Stars',
      assigned_teacher_ids: [],
      assigned_teachers: ['Teacher Emmo'],
    });

    expect(canOpenClass('Lincoln High', 'P5 Grammar Stars', 'Emmo', 'uuid-emmo')).toBe(true);
    expect(canManageClass('Lincoln High', 'P5 Grammar Stars')).toBe(true);
  });

  it('allows Teacher Emmo to open and manage class when assigned via teacher_class_assignment table row', () => {
    allData.push({
      type: 'class',
      school_name: 'Lincoln High',
      class_name: 'P5 Grammar Stars',
    });
    allData.push({
      type: 'teacher_class_assignment',
      assigned_school: 'Lincoln High',
      assigned_class: 'P5 Grammar Stars',
      assigned_teacher: 'Teacher Emmo',
      assigned_teacher_id: 'uuid-emmo',
    });

    expect(canOpenClass('Lincoln High', 'P5 Grammar Stars', 'Emmo', 'uuid-emmo')).toBe(true);
    expect(canManageClass('Lincoln High', 'P5 Grammar Stars')).toBe(true);
  });

  it('denies access to an unassigned class for Teacher Emmo', () => {
    allData.push({
      type: 'class',
      school_name: 'Lincoln High',
      class_name: 'Other Class',
      assigned_teacher_ids: ['uuid-other'],
      assigned_teachers: ['Teacher Jane'],
    });

    expect(canOpenClass('Lincoln High', 'Other Class', 'Emmo', 'uuid-emmo')).toBe(false);
    expect(canManageClass('Lincoln High', 'Other Class')).toBe(false);
  });
});
