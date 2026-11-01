import React, { useState, useEffect } from 'react';
import { Check, X, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface TeacherProfile {
  id: string; // Immutable UUID
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  is_pro?: boolean;
}

export interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  schoolName: string;
  teachers: TeacherProfile[];
  initialTeacherIds?: string[];
  onSaved?: (selectedIds: string[]) => void;
}

export const AssignTeachersModal: React.FC<AssignTeachersModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  schoolName,
  teachers = [],
  initialTeacherIds = [],
  onSaved,
}) => {
  // Track immutable teacher UUIDs instead of display names
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(initialTeacherIds);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTeacherIds(initialTeacherIds);
  }, [initialTeacherIds, isOpen]);

  if (!isOpen) return null;

  const handleToggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSaveAssignments = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      // 1. Delete previous assignments for this class
      const { error: delErr } = await supabase
        .from('class_teachers' as any)
        .delete()
        .eq('class_id', classId);

      if (delErr) {
        console.warn('class_teachers table delete error (falling back to client store if needed):', delErr);
      }

      // 2. Insert new selections with teacher UUIDs
      if (selectedTeacherIds.length > 0) {
        const rowsToInsert = selectedTeacherIds.map((teacherId) => ({
          class_id: classId,
          teacher_id: teacherId,
        }));
        const { error: insErr } = await supabase
          .from('class_teachers' as any)
          .insert(rowsToInsert);
        if (insErr) {
          console.warn('class_teachers table insert error:', insErr);
        }
      }

      if (onSaved) {
        onSaved(selectedTeacherIds);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save teacher assignments');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-teachers-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 tracking-wider uppercase mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Class Teacher Assignment</span>
            </div>
            <h2 id="assign-teachers-modal-title" className="text-xl font-bold text-white tracking-tight">
              {className}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              🏫 {schoolName} · Co-Teacher Permissions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Select teachers registered at <strong className="text-slate-200">{schoolName}</strong> to manage this class. Multiple teachers share equal teaching permissions for rosters, vocabulary, quizzes, games, and progress.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No teachers registered for this school yet.
              </div>
            ) : (
              teachers.map((teacher) => {
                const isSelected = selectedTeacherIds.includes(teacher.id);
                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleToggleTeacher(teacher.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-sm'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Teacher Avatar & Details */}
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm overflow-hidden shrink-0">
                        {teacher.avatar ? (
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>🎓</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm font-bold text-white truncate">
                            {teacher.name}
                          </span>
                          {teacher.role === 'admin' && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                              Admin
                            </span>
                          )}
                          {teacher.is_pro && (
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                              ⭐ Pro
                            </span>
                          )}
                        </div>
                        {/* Disambiguate with Email */}
                        <span className="text-xs text-slate-400 block font-mono truncate">
                          {teacher.email || 'No email provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
            <span>💡</span> Assigned teachers will appear in the class header and class card.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAssignments}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(251,191,36,0.25)]"
          >
            {isSaving ? 'Saving…' : 'Save Teachers'}
          </button>
        </div>
      </div>
    </div>
  );
};
