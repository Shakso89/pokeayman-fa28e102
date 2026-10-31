import { describe, expect, it, vi, beforeEach } from "vitest";
import { adjustStudentCoins } from "@/lib/class-students";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    },
  };
});

describe("Strict UUID-Based Coin Adjustments & Activity Feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atomically increments student coins via RPC increment_student_coins targeting studentId UUID", async () => {
    const studentUuid = "11111111-2222-3333-4444-555555555555";
    const adminUuid = "admin-ayman-uuid";
    const amount = 100;

    (supabase.rpc as any).mockResolvedValueOnce({
      data: 250,
      error: null,
    });

    const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "coin_transactions") {
        return { insert: insertSpy };
      }
      return {};
    });

    const result = await adjustStudentCoins(studentUuid, amount, adminUuid, "Admin bonus");

    expect(result).toBe(250);
    expect(supabase.rpc).toHaveBeenCalledWith("increment_student_coins", {
      target_student_id: studentUuid,
      coin_delta: amount,
    });

    expect(supabase.from).toHaveBeenCalledWith("coin_transactions");
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: studentUuid,
        amount: amount,
        created_by: adminUuid,
        description: "Admin bonus",
      })
    );
  });

  it("falls back to direct select and update by UUID if RPC fails, never by student name", async () => {
    const studentUuid = "22222222-3333-4444-5555-666666666666";
    const adminUuid = "admin-ayman-uuid";
    const amount = 50;

    (supabase.rpc as any).mockResolvedValueOnce({
      data: null,
      error: { message: "function increment_student_coins does not exist" },
    });

    const selectSingleSpy = vi.fn().mockResolvedValue({
      data: { coins: 120 },
      error: null,
    });
    const selectEqSpy = vi.fn().mockReturnValue({ single: selectSingleSpy });
    const selectSpy = vi.fn().mockReturnValue({ eq: selectEqSpy });

    const updateEqSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });

    const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "students") {
        return {
          select: selectSpy,
          update: updateSpy,
        };
      }
      if (table === "coin_transactions") {
        return {
          insert: insertSpy,
        };
      }
      return {};
    });

    const result = await adjustStudentCoins(studentUuid, amount, adminUuid, "Class challenge");

    expect(result).toBe(170); // 120 + 50
    expect(selectSpy).toHaveBeenCalledWith("coins");
    expect(selectEqSpy).toHaveBeenCalledWith("id", studentUuid);

    expect(updateSpy).toHaveBeenCalledWith({ coins: 170 });
    expect(updateEqSpy).toHaveBeenCalledWith("id", studentUuid);

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: studentUuid,
        amount: 50,
      })
    );
  });

  it("throws an error if studentId is not provided", async () => {
    await expect(adjustStudentCoins("", 100, "admin")).rejects.toThrow(
      "Student ID (UUID) is required for coin adjustment."
    );
  });
});

describe("Student Activity Feed Matching & Deduplication in PokeAyman View", () => {
  function canonicalStudentId(student: any) {
    return String(student?.student_id || student?.id || student?.__backendId || student?.pie_id || student?.PIE_ID || student?.user_id || student?.profile_id || student?.account_id || '').trim();
  }

  function studentActivityMatches(record: any, student: any, allData: any[]) {
    if (!record || !student) return false;
    const id = canonicalStudentId(student);
    const ids = [record.student_id, record.studentId, record.pie_id, record.PIE_ID, record.student_record_id, record.profile_id, record.user_id, record.account_id, record.target_student_id]
      .filter(v => v !== undefined && v !== null && v !== '')
      .map(v => String(v).trim());
    const idSet = new Set([id, String(student.__backendId || '').trim(), String(student.id || '').trim()].filter(Boolean));
    if (ids.some(v => idSet.has(v))) return true;

    if (ids.length > 0) return false;

    const name = String(student.student_name || student.name || '').trim().toLocaleLowerCase();
    if (!name) return false;
    const t = String(record.type || '').toLowerCase();
    const studentsWithName = allData.filter(r => (r.type === 'student' || r.type === 'student_membership') && String(r.student_name || r.name || '').trim().toLowerCase() === name);
    if (studentsWithName.length <= 1) {
      if (['credit_log', 'coin_transactions', 'coin_transaction'].includes(t)) {
        return String(record.log_target || '').trim().toLocaleLowerCase() === name;
      }
      if (['pokemon', 'user_pokemons', 'pokemon_captures', 'pokemon_collected'].includes(t)) {
        return String(record.owner || '').trim().toLocaleLowerCase() === name;
      }
    }
    return false;
  }

  function getStudentMemberships(student: any, allData: any[]) {
    if (!student) return [];
    const id = canonicalStudentId(student);
    const result = new Map<string, any>();
    const addEntry = (school: string, className: string, classId: string = '') => {
      const s = String(school || '').trim();
      const c = String(className || '').trim();
      if (!s && !c) return;
      const key = (s ? `${s.toLowerCase()} / ${c.toLowerCase()}` : c.toLowerCase());
      if (!result.has(key)) {
        result.set(key, { id: classId || key, school_name: s, class_name: c, name: c, school: s });
      }
    };

    if (Array.isArray(student.classes)) {
      student.classes.forEach((cls: any) => addEntry(cls.school || cls.school_name, cls.name || cls.class_name, cls.id));
    }
    if (Array.isArray(student.class_students)) {
      student.class_students.forEach((cs: any) => {
        if (cs.classes) addEntry(cs.classes.school || cs.classes.school_name, cs.classes.name || cs.classes.class_name, cs.classes.id);
      });
    }
    const fromProfile = String(student.class_memberships || '').split('||').filter(Boolean);
    fromProfile.forEach((value: string) => {
      const parts = String(value).split(' / ');
      if (parts.length > 1) addEntry(parts[0], parts.slice(1).join(' / '));
      else if (String(value).trim()) addEntry('', String(value).trim());
    });

    allData.forEach(record => {
      const t = String(record.type || '').toLowerCase();
      if (!['student_membership','class_student','class_membership','membership'].includes(t)) return;
      const ids = [record.student_id, record.studentId].filter(Boolean).map(v => String(v).trim());
      if (id && ids.includes(id)) {
        const classRecord = allData.find(item => item.type === 'class' && (item.__backendId === record.class_id || (item.school_name === record.school_name && item.class_name === record.class_name)));
        if (classRecord) addEntry(classRecord.school_name, classRecord.class_name, classRecord.__backendId);
        else if (record.school_name || record.class_name) addEntry(record.school_name, record.class_name, record.class_id);
      }
    });

    return [...result.values()];
  }

  function formatActivityDateTime(timestamp: number) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
  }

  it("deduplicates joined class badges completely when student has duplicate memberships", () => {
    const student = {
      __backendId: "student-1",
      student_name: "Ayman",
      classes: [
        { id: "c1", school: "Stanford", name: "Steam" },
        { id: "c2", school: "Stanford", name: "Steam" }, // duplicate class name
      ],
      class_memberships: "Stanford / Steam||Stanford / Steam",
    };

    const allData = [
      { type: "class", __backendId: "c1", school_name: "Stanford", class_name: "Steam" },
      { type: "student_membership", student_id: "student-1", school_name: "Stanford", class_name: "Steam" },
    ];

    const memberships = getStudentMemberships(student, allData);
    expect(memberships).toHaveLength(1);
    expect(memberships[0].school_name).toBe("Stanford");
    expect(memberships[0].class_name).toBe("Steam");
  });

  it("prevents transaction and Pokémon feed desync across duplicate student names", () => {
    const studentAyman1 = { __backendId: "ayman-uuid-1", student_name: "Ayman" };
    const studentAyman2 = { __backendId: "ayman-uuid-2", student_name: "Ayman" };

    const allData = [
      { type: "student", __backendId: "ayman-uuid-1", student_name: "Ayman" },
      { type: "student", __backendId: "ayman-uuid-2", student_name: "Ayman" },
    ];

    const txForAyman1 = {
      type: "credit_log",
      student_id: "ayman-uuid-1",
      log_amount: 100,
      log_action: "Adjust",
      log_target: "Ayman",
    };

    const txForAyman2 = {
      type: "credit_log",
      student_id: "ayman-uuid-2",
      log_amount: 50,
      log_action: "Adjust",
      log_target: "Ayman",
    };

    const pokeForAyman1 = {
      type: "pokemon",
      student_id: "ayman-uuid-1",
      pokemon_name: "Feraligatr",
      pokemon_id: 160,
      owner: "Ayman",
    };

    // Ayman 1's feed strictly gets Ayman 1's records
    expect(studentActivityMatches(txForAyman1, studentAyman1, allData)).toBe(true);
    expect(studentActivityMatches(txForAyman2, studentAyman1, allData)).toBe(false);
    expect(studentActivityMatches(pokeForAyman1, studentAyman1, allData)).toBe(true);

    // Ayman 2's feed strictly gets Ayman 2's records
    expect(studentActivityMatches(txForAyman1, studentAyman2, allData)).toBe(false);
    expect(studentActivityMatches(txForAyman2, studentAyman2, allData)).toBe(true);
    expect(studentActivityMatches(pokeForAyman1, studentAyman2, allData)).toBe(false);
  });

  it("formats activity timestamps in MMM D, YYYY, h:mm A format", () => {
    const time = new Date("2026-10-31T12:49:00").getTime();
    const formatted = formatActivityDateTime(time);
    expect(formatted).toMatch(/Oct 31, 2026, 12:49 PM/);
  });
});
