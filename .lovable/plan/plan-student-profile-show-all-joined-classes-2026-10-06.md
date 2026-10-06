# Plan: Student Profile — Show All Joined Classes

## Goal
A student's profile currently shows only one class. It should list **every class the student has joined**, in the sunny kid-friendly student theme.

## What changes

### 1. Collect all memberships
- In `public/pokeayman/index.html`, find where the student profile resolves its class (currently a single class lookup).
- Replace it with a lookup that gathers **all classes** whose roster contains the student (matching the same name/identity rules used at login), so a student enrolled in multiple classes sees them all.

### 2. Profile UI: class list
- In the student profile card (student dashboard), replace the single class label with a **"My Classes" section**:
  - One pill/card per joined class showing class name + school (e.g. "ESI · Stanford"), styled like the existing class-filter pills in the Study tab.
  - If the student is in only one class, it shows just that one; if none, a friendly "No classes yet" note.
- Keep the layout compact — chips wrap under the stats row, no page scroll added.

### 3. Consistency check
- Make sure the same "all joined classes" list is used anywhere the profile class is shown (profile panel, classmate dialog if applicable), so nothing still displays only the first class.

## Technical notes
- All changes live in `public/pokeayman/index.html` (logic) and `public/pokeayman/student-workspace.css` (styling) — scoped to the student dashboard, teacher/admin views untouched.
- No database or permission changes; this only reads data already saved.

## Verification
- Playwright as a real student enrolled in multiple classes: profile shows every class; narrow (390px) view checked; build log clean.
