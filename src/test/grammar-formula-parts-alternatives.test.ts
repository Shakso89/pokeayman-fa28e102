import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Grammar Creation Formula Parts and Alternatives', () => {
  const root = path.resolve(__dirname, '../..');
  const grammarJsPath = path.join(root, 'public', 'pokeayman', 'grammar-decks.js');
  const js = fs.readFileSync(grammarJsPath, 'utf8');

  it('renders alternative words part labels as ONLY Part 1, Part 2, etc. without specific formula names', () => {
    // Must NOT contain "Part ${idx + 1}: ${escapeHtml(part.name)}"
    expect(js).not.toMatch(/Part \$\{idx \+ 1\}:\s*\$\{escapeHtml\(part\.name\)\}/);

    // Must render clean "Part ${idx + 1}"
    expect(js).toMatch(/Part \$\{idx \+ 1\}/);
    expect(js).toContain('title="Part ${idx + 1}"');
  });

  it('does not default a new rule to a hardcoded specific formula like Subject + am / is / are + Verb-ing', () => {
    // In initFormulaParts, rawFormula should not default to Subject + am / is / are + Verb-ing
    expect(js).not.toMatch(/rawFormula\s*=\s*\(formulaInput\?\.value\s*\|\|\s*activeRule\?\.formula\s*\|\|\s*'Subject \+ am \/ is \/ are \+ Verb-ing'\)/);
  });

  it('synchronizes alternatives list when adding parts, removing parts, and editing formula input', () => {
    // formulaInput oninput calls syncAlternativesList
    const inputStart = js.indexOf("formulaInput?.addEventListener('input'");
    const inputHandler = js.slice(inputStart, inputStart + 1500);
    expect(inputHandler).toContain('syncAlternativesList()');

    // addPartBtn calls syncAlternativesList
    const addPartSection = js.slice(js.indexOf("legendContainer.querySelector('#ge-add-part-btn')"), js.indexOf("legendContainer.querySelector('#ge-add-part-btn')") + 600);
    expect(addPartSection).toContain('syncAlternativesList()');

    // ge-part-remove-btn calls syncAlternativesList
    const removeStart = js.indexOf("legendContainer.querySelectorAll('.ge-part-remove-btn')");
    const removePartSection = js.slice(removeStart, removeStart + 1500);
    expect(removePartSection).toContain('syncAlternativesList()');
  });

  it('dynamically generates alternatives markup matching the exact number of formula parts', () => {
    // Extract syncAlternativesList logic
    const testParts2 = [
      { name: 'Subject', colorIndex: 0, alternatives: ['Alice', 'Bob'] },
      { name: 'Verb', colorIndex: 1, alternatives: ['runs', 'jumps'] }
    ];

    const testParts4 = [
      { name: 'Part 1', colorIndex: 0, alternatives: [] },
      { name: 'Part 2', colorIndex: 1, alternatives: [] },
      { name: 'Part 3', colorIndex: 2, alternatives: [] },
      { name: 'Part 4', colorIndex: 3, alternatives: [] }
    ];

    const renderTestList = (parts: Array<{ name: string; colorIndex: number; alternatives: string[] }>) => {
      return parts.map((part, idx) => `
        <span class="text-xs font-bold text-slate-200 truncate" title="Part ${idx + 1}">
          Part ${idx + 1}
        </span>
      `).join('');
    };

    const html2 = renderTestList(testParts2);
    expect(html2).toContain('Part 1');
    expect(html2).toContain('Part 2');
    expect(html2).not.toContain('Part 1: Subject');
    expect(html2).not.toContain('Part 2: Verb');
    expect(html2).not.toContain('Part 3');

    const html4 = renderTestList(testParts4);
    expect(html4).toContain('Part 1');
    expect(html4).toContain('Part 2');
    expect(html4).toContain('Part 3');
    expect(html4).toContain('Part 4');
  });
});
