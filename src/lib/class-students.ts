import { supabase as typedSupabase } from "@/integrations/supabase/client";

// Roster tables are not in the generated schema types; query them untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;

export interface StudentRosterItem {
  id: string;
  name: string;
  pin: string;
  avatar_url: string | null;
  coins: number;
  power: number;
}

/**
 * Fetch students enrolled in a specific class from class_students joining students.
 */
export const fetchClassStudents = async (classId: string): Promise<StudentRosterItem[]> => {
  const { data, error } = await supabase
    .from('class_students')
    .select(`
      student_id,
      student:students!inner (
        id,
        name,
        pin,
        avatar_url,
        coins,
        power
      )
    `)
    .eq('class_id', classId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching class roster:', error);
    // Fallback if join syntax or alias differs
    try {
      const { data: junctionRows, error: jErr } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);
      if (!jErr && Array.isArray(junctionRows) && junctionRows.length > 0) {
        const studentIds = junctionRows.map((r: any) => r.student_id);
        const { data: stData, error: sErr } = await supabase
          .from('students')
          .select('id, name, pin, avatar_url, coins, power')
          .in('id', studentIds);
        if (!sErr && stData) {
          return stData as StudentRosterItem[];
        }
      }
    } catch (fallbackErr) {
      console.error('Fallback class roster fetch error:', fallbackErr);
    }
    return [];
  }

  // Flatten array so components receive standard student objects:
  return (data || []).map((item: any) => item.student).filter(Boolean);
};

/**
 * Unenroll a student from a specific class by removing the junction record.
 * Strictly deletes only the junction record for the active class (class_students),
 * preserving the student's global wallet, Pokémon collection, and other class enrollments.
 */
export const removeStudentFromClass = async (studentId: string, classId: string): Promise<void> => {
  if (!studentId || !classId) {
    throw new Error("Both studentId and classId are required to unenroll student.");
  }

  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("student_id", studentId)
    .eq("class_id", classId);

  if (error) {
    console.error("Failed to unenroll student:", error);
    throw new Error(error.message || "Could not perform this action.");
  }

  // Invalidate active React Query / SWR keys for ['class_students', classId]
  if (typeof window !== "undefined" && (window as any).queryClient) {
    try {
      (window as any).queryClient.invalidateQueries({ queryKey: ["class_students", classId] });
    } catch (qErr) {
      console.warn("Failed to invalidate query cache for class_students:", qErr);
    }
  }
};

/**
 * Strict UUID-based coin adjustment for students.
 * Atomically increments the student's coins using increment_student_coins RPC
 * (with fallback to direct query by UUID) and logs into coin_transactions.
 */
export const adjustStudentCoins = async (
  studentId: string,
  amount: number,
  adminId: string,
  reason: string = "Admin adjustment"
): Promise<number> => {
  if (!studentId) {
    throw new Error("Student ID (UUID) is required for coin adjustment.");
  }

  let newBalance: number | null = null;

  // 1. Atomically update the student's actual wallet balance via RPC
  const { data: updatedBalance, error: updateError } = await supabase.rpc("increment_student_coins", {
    target_student_id: studentId,
    coin_delta: amount,
  });

  if (!updateError && updatedBalance !== null && updatedBalance !== undefined) {
    newBalance = Number(updatedBalance);
  } else {
    // Fallback direct update if RPC is not present:
    const { data: student, error: fetchErr } = await supabase
      .from("students")
      .select("coins")
      .eq("id", studentId)
      .single();

    if (fetchErr || !student) throw new Error("Student not found");

    const calculated = Math.max(0, (student.coins || 0) + amount);
    const { error: patchError } = await supabase
      .from("students")
      .update({ coins: calculated })
      .eq("id", studentId);

    if (patchError) throw patchError;
    newBalance = calculated;
  }

  // 2. Insert into transaction log using exact UUIDs
  try {
    await supabase.from("coin_transactions").insert({
      student_id: studentId,
      amount: amount,
      created_by: adminId,
      description: reason || "Admin adjustment",
      created_at: new Date().toISOString(),
    });
  } catch (logErr) {
    console.warn("Failed to insert into coin_transactions:", logErr);
  }

  return newBalance ?? 0;
};
