import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Teacher Shell Admin Role Display', () => {
  const teacherShellJsPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
  const teacherShellJs = fs.readFileSync(teacherShellJsPath, 'utf8');

  it('ensures admin role label displays only "Admin" and does NOT show credit balance', () => {
    // Should NOT show 'Admin · Unlimited credits'
    expect(teacherShellJs).not.toContain("'Admin · Unlimited credits'");
    
    // Should set ts-role text to 'Admin' directly when isAdmin is true
    const roleMatch = teacherShellJs.match(/\$\('ts-role'\)\.textContent\s*=\s*isAdmin\s*\?\s*['"]([^'"]+)['"]/);
    expect(roleMatch).not.toBeNull();
    expect(roleMatch![1]).toBe('Admin');
  });

  it('preserves credit balance display for non-admin roles (school manager and teachers)', () => {
    expect(teacherShellJs).toContain("School Manager · ${credits ? `${credits} credits` : '0 credits'}");
    expect(teacherShellJs).toContain("Teacher · ${credits} credits");
  });
});
