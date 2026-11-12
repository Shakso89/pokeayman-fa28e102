import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Teacher Shell Admin Role Display', () => {
  const teacherShellJsPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
  const teacherShellJs = fs.readFileSync(teacherShellJsPath, 'utf8');

  it('ensures sidebar role line does NOT repeat Admin or Teacher since the avatar badge already carries the role', () => {
    // Should NOT show 'Admin · Unlimited credits'
    expect(teacherShellJs).not.toContain("'Admin · Unlimited credits'");
    
    // The avatar badge carries the role; ts-role only displays credits if available
    expect(teacherShellJs).toContain("tsRoleEl.textContent = credits ? `${credits} credits` : '';");
    expect(teacherShellJs).toContain("tsRoleEl.hidden = !tsRoleEl.textContent;");
  });

  it('drops repetitive role text under the teacher name across all roles', () => {
    expect(teacherShellJs).not.toContain("Teacher · ${credits} credits");
    expect(teacherShellJs).not.toContain("School Manager · ${credits");
  });
});
