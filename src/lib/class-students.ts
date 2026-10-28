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
