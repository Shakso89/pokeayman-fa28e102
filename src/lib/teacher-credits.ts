import { supabase } from '@/integrations/supabase/client';

/**
 * Award teacher credits strictly keyed by immutable teacher UUID.
 * Deduplicates same-name teachers by operating on teacher UUID (profiles.id / auth.users.id).
 */
export const awardTeacherCredits = async (
  teacherId: string, // UUID
  amount: number,
  reason: string = 'Awarded by Admin'
) => {
  if (!teacherId) {
    throw new Error('Teacher UUID is required');
  }
  if (amount <= 0) {
    throw new Error('Credit amount must be greater than 0');
  }

  const { data, error } = await supabase.rpc('award_teacher_credits' as any, {
    p_teacher_id: teacherId,
    p_amount: amount,
    p_reason: reason,
  });

  if (error) {
    console.error('Failed to award teacher credits via RPC:', error);
    throw error;
  }

  return data;
};
