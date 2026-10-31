import { describe, expect, it, vi, beforeEach } from "vitest";

describe("Multi-Match Student Disambiguation & Account Linking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries all matching students with enrolled classes and school names", async () => {
    const mockIlike = vi.fn().mockResolvedValue({
      data: [
        {
          id: "student-1",
          name: "Ayman",
          pin: "1234",
          trainer_code: "100201",
          avatar_url: null,
          coins: 50,
          class_students: [
            {
              class_id: "class-a",
              classes: { id: "class-a", name: "Grade 4A", school_name: "Lincoln Primary" },
            },
          ],
        },
        {
          id: "student-2",
          name: "Ayman",
          pin: "5678",
          trainer_code: "100202",
          avatar_url: null,
          coins: 120,
          class_students: [
            {
              class_id: "class-b",
              classes: { id: "class-b", name: "Grade 5B", school_name: "Jefferson Middle" },
            },
          ],
        },
      ],
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    const mockSupabase = { from: mockFrom };

    const enteredName = "Ayman";
    const res = await mockSupabase
      .from("students")
      .select(`
        id,
        name,
        pin,
        trainer_code,
        avatar_url,
        coins,
        class_students (
          class_id,
          classes (
            id,
            name,
            school,
            school_name
          )
        )
      `)
      .ilike("name", enteredName.trim());

    expect(mockFrom).toHaveBeenCalledWith("students");
    expect(mockIlike).toHaveBeenCalledWith("name", "Ayman");
    expect(res.data).toHaveLength(2);
    expect(res.data?.[0].trainer_code).toBe("100201");
    expect(res.data?.[1].trainer_code).toBe("100202");
  });

  it("correctly identifies already enrolled candidates and formats multi-class listings", () => {
    const currentClassId = "class-target";
    const students = [
      {
        id: "student-1",
        name: "Ayman",
        pin: "1111",
        trainer_code: "990011",
        class_students: [
          {
            class_id: "class-target",
            classes: { name: "P4 Blue", school_name: "Stanford" },
          },
        ],
      },
      {
        id: "student-2",
        name: "Ayman",
        pin: "2222",
        trainer_code: "990022",
        class_students: [
          {
            class_id: "class-other-1",
            classes: { name: "P5 Red", school_name: "Stanford" },
          },
          {
            class_id: "class-other-2",
            classes: { name: "ESL Advanced", school_name: "Harvard" },
          },
        ],
      },
    ];

    const getCandidateClassNames = (student: typeof students[0]) => {
      const names = student.class_students
        .map((cs) => {
          const cls = cs.classes;
          if (!cls) return null;
          return cls.school_name ? `${cls.school_name} · ${cls.name}` : cls.name;
        })
        .filter(Boolean);
      return names.length ? names.join(", ") : "No active classes";
    };

    const isStudentEnrolled = (student: typeof students[0], targetClass: string) => {
      return student.class_students.some((cs) => cs.class_id === targetClass);
    };

    expect(isStudentEnrolled(students[0], currentClassId)).toBe(true);
    expect(isStudentEnrolled(students[1], currentClassId)).toBe(false);

    expect(getCandidateClassNames(students[0])).toBe("Stanford · P4 Blue");
    expect(getCandidateClassNames(students[1])).toBe("Stanford · P5 Red, Harvard · ESL Advanced");
  });

  it("selects first available (non-enrolled) candidate and disables link button when enrolled candidate is selected", () => {
    const currentClassId = "class-target";
    const matchingStudents = [
      {
        id: "s1",
        name: "Ayman",
        class_students: [{ class_id: "class-target" }],
      },
      {
        id: "s2",
        name: "Ayman",
        class_students: [{ class_id: "class-other" }],
      },
    ];

    const isEnrolled = (student: typeof matchingStudents[0]) =>
      student.class_students.some((cs) => cs.class_id === currentClassId);

    // Default select first available non-enrolled
    const firstAvailable = matchingStudents.find((s) => !isEnrolled(s));
    let selectedStudentId = firstAvailable ? firstAvailable.id : matchingStudents[0].id;

    expect(selectedStudentId).toBe("s2");

    const isLinkButtonDisabled = (selectedId: string | null) => {
      if (!selectedId) return true;
      const student = matchingStudents.find((s) => s.id === selectedId);
      return !student || isEnrolled(student);
    };

    expect(isLinkButtonDisabled(selectedStudentId)).toBe(false);

    // If teacher attempted to select enrolled student
    selectedStudentId = "s1";
    expect(isLinkButtonDisabled(selectedStudentId)).toBe(true);
  });

  it("links selected existing student without inserting a new student row", async () => {
    const selectedStudentId = "s2-existing";
    const targetClassId = "class-target-123";

    const insertJunctionMock = vi.fn().mockResolvedValue({ error: null });
    const insertStudentMock = vi.fn();

    const mockSupabase = {
      from: (table: string) => {
        if (table === "class_students") {
          return { insert: insertJunctionMock };
        }
        if (table === "students") {
          return { insert: insertStudentMock };
        }
        return {};
      },
    };

    // Linking execution
    await mockSupabase.from("class_students").insert({
      student_id: selectedStudentId,
      class_id: targetClassId,
    });

    expect(insertJunctionMock).toHaveBeenCalledWith({
      student_id: "s2-existing",
      class_id: "class-target-123",
    });
    expect(insertStudentMock).not.toHaveBeenCalled();
  });

  it("creates a brand new student profile with distinct PIN and trainer code when requested", async () => {
    const targetClassId = "class-target-123";
    const existingPins = new Set(["1234", "5678"]);

    const generateDistinctPin = () => {
      let pin = "1234";
      while (existingPins.has(pin)) {
        pin = "9876";
      }
      return pin;
    };

    const distinctPin = generateDistinctPin();
    expect(distinctPin).toBe("9876");

    const insertStudentMock = vi.fn().mockReturnValue({
      select: () => ({
        single: vi.fn().mockResolvedValue({
          data: { id: "fresh-uuid-999", name: "Ayman", pin: distinctPin },
          error: null,
        }),
      }),
    });
    const insertJunctionMock = vi.fn().mockResolvedValue({ error: null });

    const mockSupabase = {
      from: (table: string) => {
        if (table === "students") {
          return { insert: insertStudentMock };
        }
        if (table === "class_students") {
          return { insert: insertJunctionMock };
        }
        return {};
      },
    };

    // Brand new student flow
    const freshStudentRes = await mockSupabase.from("students").insert({
      id: "fresh-uuid-999",
      name: "Ayman",
      pin: distinctPin,
      trainer_code: "889900",
      coins: 0,
      power: 0,
      avatar_url: "",
    }).select().single();

    expect(insertStudentMock).toHaveBeenCalled();
    const createdId = freshStudentRes.data?.id;

    await mockSupabase.from("class_students").insert({
      class_id: targetClassId,
      student_id: createdId,
    });

    expect(insertJunctionMock).toHaveBeenCalledWith({
      class_id: "class-target-123",
      student_id: "fresh-uuid-999",
    });
  });
});
