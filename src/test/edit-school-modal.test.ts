import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Edit School Modal UI Theme and Actions', () => {
  let indexHtml: string;

  beforeEach(() => {
    const indexPath = path.resolve(process.cwd(), 'public/pokeayman/index.html');
    indexHtml = fs.readFileSync(indexPath, 'utf-8');
  });

  it('does not contain the redundant "Manage Class Teachers" button in openEditSchoolModal', () => {
    // Extract openEditSchoolModal function body
    const fnMatch = indexHtml.match(/async function openEditSchoolModal[\s\S]*?\n\}/);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];

    // Ensure Manage Class Teachers button is not inside openEditSchoolModal
    expect(fnBody).not.toContain('Manage Class Teachers');
    expect(fnBody).not.toContain('es-manage-class-teachers');
  });

  it('uses ts-modal theme classes in openEditSchoolModal', () => {
    const fnMatch = indexHtml.match(/async function openEditSchoolModal[\s\S]*?\n\}/);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];

    // Check theme classes
    expect(fnBody).toContain('ts-modal-backdrop');
    expect(fnBody).toContain('ts-modal-card');
    expect(fnBody).toContain('ts-modal-header');
    expect(fnBody).toContain('ts-modal-title');
    expect(fnBody).toContain('ts-form-input');
    expect(fnBody).toContain('ts-teacher-row');
    expect(fnBody).toContain('ts-modal-list');
    expect(fnBody).toContain('ts-modal-btn-cancel');
    expect(fnBody).toContain('ts-modal-btn-save');
  });
});
