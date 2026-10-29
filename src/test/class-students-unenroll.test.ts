import { describe, expect, it, vi, beforeEach } from "vitest";
import { removeStudentFromClass } from "../lib/class-students";
import { supabase } from "../integrations/supabase/client";

vi.mock("../integrations/supabase/client", () => {
  const deleteMock = vi.fn();
  const eqStudentMock = vi.fn();
  const eqClassMock = vi.fn();

  eqClassMock.mockResolvedValue({ error: null });
  eqStudentMock.mockReturnValue({ eq: eqClassMock });
  deleteMock.mockReturnValue({ eq: eqStudentMock });

  const fromMock = vi.fn((table: string) => {
    if (table === "class_students") {
      return {
        delete: deleteMock,
      };
    }
    return {
      delete: vi.fn(),
    };
  });

  return {
    supabase: {
      from: fromMock,
    },
  };
});

describe("removeStudentFromClass", () => {
  const mockClassId = "class-uuid-123";
  const mockStudentId = "student-uuid-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("strictly deletes from class_students junction table and never calls students table", async () => {
    await removeStudentFromClass(mockStudentId, mockClassId);

    expect(supabase.from).toHaveBeenCalledWith("class_students");
    expect(supabase.from).not.toHaveBeenCalledWith("students");

    const classStudentsInstance = (supabase.from as any)("class_students");
    expect(classStudentsInstance.delete).toHaveBeenCalled();
  });

  it("invalidates react query client cache for ['class_students', classId] if window.queryClient exists", async () => {
    const invalidateQueriesMock = vi.fn();
    (window as any).queryClient = {
      invalidateQueries: invalidateQueriesMock,
    };

    await removeStudentFromClass(mockStudentId, mockClassId);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ["class_students", mockClassId],
    });
  });

  it("throws the error with detailed error message when supabase returns an error", async () => {
    const errorEqClass = vi.fn().mockResolvedValue({
      error: { message: "violates foreign key constraint 'homework_submissions_fkey'" },
    });
    const errorEqStudent = vi.fn().mockReturnValue({ eq: errorEqClass });
    (supabase.from as any).mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: errorEqStudent }),
    });

    await expect(removeStudentFromClass(mockStudentId, mockClassId)).rejects.toThrow(
      "violates foreign key constraint 'homework_submissions_fkey'"
    );
  });
});
