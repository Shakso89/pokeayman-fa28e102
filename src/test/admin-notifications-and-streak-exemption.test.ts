import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin Streak Exemption & Administrative Notifications', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  it('contains admin exemption in teacherStreakState', () => {
    expect(indexHtml).toContain('function teacherStreakState() {');
    expect(indexHtml).toMatch(/if\s*\(!rec\s*\|\|\s*isTeacherAdminRecord\(rec\)\s*\|\|\s*isAymanTeacher\(\)\s*\|\|\s*rec\.teacher_credits\s*===\s*-1\)\s*return null;/);
  });

  it('exempts admin accounts from recording daily login streak in recordTeacherDailyLogin', () => {
    expect(indexHtml).toContain('async function recordTeacherDailyLogin() {');
    expect(indexHtml).toMatch(/if\s*\(!rec\s*\|\|\s*isTeacherAdminRecord\(rec\)\s*\|\|\s*isAymanTeacher\(\)\s*\|\|\s*rec\.teacher_credits\s*===\s*-1\)\s*return;/);
  });

  it('suppresses streak notices and streak category notifications for admin in teacherNotificationsFor', () => {
    expect(indexHtml).toContain('function teacherNotificationsFor(record = currentTeacherRec()) {');
    expect(indexHtml).toContain('const isAdmin = isTeacherAdminRecord(record) || isAymanTeacher() || record.teacher_credits === -1;');
    expect(indexHtml).toContain("if (isAdmin && (item.notification_target === 'streak' || item.is_streak_notice || item.notification_category === 'streak reward'");
    expect(indexHtml).toContain('const st = teacherStreakState();');
    expect(indexHtml).toContain('if (st && record && !isAdmin) {');
  });

  it('matches admin notifications by admin recipient id or admin name in teacherNotificationsFor', () => {
    expect(indexHtml).toContain("if (itemRecId === 'admin' || itemRecId === 'ayman') return true;");
    expect(indexHtml).toContain("if (isTeacherAdminRecord(itemRecName)) return true;");
  });

  it('hides streak panel and streak toggle for admin in trainer profile tab', () => {
    expect(indexHtml).toContain("const streakToggle = modal.querySelector('[data-th-editor=\"teacher-streak-panel\"]');");
    expect(indexHtml).toContain('if (isAdmin) {');
    expect(indexHtml).toContain("if (streakToggle) streakToggle.style.display = 'none';");
    expect(indexHtml).toContain("if (streakPanel) streakPanel.style.display = 'none';");
  });

  it('provides window.notifyAdminTeachers to dispatch notifications to admin accounts', () => {
    expect(indexHtml).toContain('async function notifyAdminTeachers(title, message, category = \'admin\', options = {}) {');
    expect(indexHtml).toContain('window.notifyAdminTeachers = notifyAdminTeachers;');
  });

  it('notifies admin when a teacher is assigned to a class in saveClassTeacherAssignments', () => {
    expect(indexHtml).toContain('if (newlyAssignedRecords.length && window.notifyAdminTeachers) {');
    expect(indexHtml).toContain("'Teacher assigned to class'");
    expect(indexHtml).toContain('was assigned to ${className} at ${schoolName}.');
  });

  it('notifies admin when teacher assignments are updated in edit teacher modal', () => {
    expect(indexHtml).toContain('Teacher TR. ${newName} was assigned to: ${classList}.');
  });

  it('notifies admin when manager transfers credit to other teachers in executeCreditTransfer', () => {
    expect(indexHtml).toContain("'Manager credit transfer'");
    expect(indexHtml).toContain('transferred ${Number(amount).toLocaleString()} credits to TR. ${recipientDisplayName}.');
    expect(indexHtml).toContain("'Credits received'");
  });

  describe('Runtime Streak & Notification Logic Execution', () => {
    // Isolated evaluation of logic mirrors index.html implementation
    function isTeacherAdminRecord(teacher: any): boolean {
      if (!teacher) return false;
      if (typeof teacher === 'string') {
        const clean = String(teacher).trim();
        return clean === 'Ayman' || clean.toLowerCase() === 'ayman';
      }
      const cleanName = String(teacher.teacher_name || '').trim();
      if (cleanName === 'Ayman' || cleanName.toLowerCase() === 'ayman') return true;
      if (teacher.is_admin === true || teacher.isAdmin === true) return true;
      const role = String(teacher.role || teacher.teacher_role || teacher.user_role || '').toLowerCase();
      return role === 'admin' || role === 'administrator';
    }

    function teacherStreakState(rec: any) {
      if (!rec || isTeacherAdminRecord(rec) || rec.teacher_credits === -1) return null;
      return { count: Number(rec.streak_count || 0), boxes: Number(rec.surprise_boxes || 0), last: rec.streak_last_day || '' };
    }

    function teacherNotificationsFor(record: any, allData: any[], localRead: Set<string> = new Set()) {
      if (!record) return [];
      const id = String(record.__backendId || '');
      const isAdmin = isTeacherAdminRecord(record) || record.teacher_credits === -1;
      const dbItems = (allData || []).filter(item => {
        if (item.type !== 'teacher_notification') return false;
        if (isAdmin && (item.notification_target === 'streak' || item.is_streak_notice || item.notification_category === 'streak reward' || String(item.notification_id || '').startsWith('streak-notice-'))) {
          return false;
        }
        const itemRecId = String(item.notification_recipient_id || '');
        if (id && itemRecId === id) return true;
        if (isAdmin) {
          if (itemRecId === 'admin' || itemRecId === 'ayman') return true;
          const recName = String(record.teacher_name || '').trim();
          const itemRecName = String(item.notification_recipient_name || '').trim();
          if (recName && itemRecName && recName.toLowerCase() === itemRecName.toLowerCase()) return true;
          if (isTeacherAdminRecord(itemRecName)) return true;
        }
        return false;
      }).map(item => (item.notification_read || localRead.has(String(item.__backendId || item.notification_id || ''))) ? { ...item, notification_read: true } : item);

      const streakNotices: any[] = [];
      const st = teacherStreakState(record);
      if (st && record && !isAdmin) {
        streakNotices.push({
          __backendId: `streak-notice-${id}`,
          type: 'teacher_notification',
          notification_title: `🔥 Login Streak: Day ${st.count}`,
          is_streak_notice: true
        });
      }
      return [...streakNotices, ...dbItems];
    }

    it('returns null streak state for Admin accounts with unlimited credits', () => {
      const adminRec = { teacher_name: 'Ayman', teacher_role: 'admin', teacher_credits: -1, streak_count: 5 };
      expect(teacherStreakState(adminRec)).toBeNull();

      const regularTeacher = { teacher_name: 'Sarah', teacher_role: 'teacher', teacher_credits: 50, streak_count: 4, surprise_boxes: 1 };
      expect(teacherStreakState(regularTeacher)).toEqual({ count: 4, boxes: 1, last: '' });
    });

    it('filters out streak notices and streak db items for Admin accounts while keeping class and transfer notifications', () => {
      const adminRec = { __backendId: 'admin-id-1', teacher_name: 'Ayman', teacher_role: 'admin', teacher_credits: -1 };
      const notifications = [
        {
          type: 'teacher_notification',
          notification_recipient_id: 'admin-id-1',
          notification_title: '🔥 Streak Box Ready',
          notification_target: 'streak',
          is_streak_notice: true
        },
        {
          type: 'teacher_notification',
          notification_recipient_id: 'admin',
          notification_title: 'Teacher assigned to class',
          notification_message: 'Teacher TR. Sarah was assigned to Grade 4 at Oak School.',
          notification_category: 'class'
        },
        {
          type: 'teacher_notification',
          notification_recipient_id: 'admin-id-1',
          notification_title: 'Manager credit transfer',
          notification_message: 'Manager Bob transferred 50 credits to TR. Sarah.',
          notification_category: 'reward'
        }
      ];

      const adminNotices = teacherNotificationsFor(adminRec, notifications);
      expect(adminNotices).toHaveLength(2);
      expect(adminNotices.some(n => n.notification_title.includes('Streak'))).toBe(false);
      expect(adminNotices.find(n => n.notification_title === 'Teacher assigned to class')).toBeDefined();
      expect(adminNotices.find(n => n.notification_title === 'Manager credit transfer')).toBeDefined();
    });

    it('dispatches admin notifications with correct title and payload format', async () => {
      const createdNotifications: any[] = [];
      const mockDataSdk = {
        create: vi.fn(async (payload: any) => {
          createdNotifications.push(payload);
          return { isOk: true, data: { ...payload, __backendId: 'backend-generated-id' } };
        })
      };

      const teachers = [
        { __backendId: 'admin-1', teacher_name: 'Ayman', teacher_role: 'admin' },
        { __backendId: 'teacher-2', teacher_name: 'Sarah', teacher_role: 'teacher' }
      ];

      async function notifyAdminTeachers(title: string, message: string, category = 'admin', options: any = {}) {
        const admins = teachers.filter(isTeacherAdminRecord);
        for (const admin of admins) {
          await mockDataSdk.create({
            type: 'teacher_notification',
            notification_recipient_id: String(admin.__backendId),
            notification_recipient_name: admin.teacher_name,
            notification_title: title,
            notification_message: message,
            notification_category: category,
            ...options
          });
        }
      }

      // Simulate class teacher assignment
      await notifyAdminTeachers('Teacher assigned to class', 'Teacher TR. Sarah was assigned to P5 at Maple Academy.', 'class');
      expect(mockDataSdk.create).toHaveBeenCalledTimes(1);
      expect(createdNotifications[0].notification_recipient_name).toBe('Ayman');
      expect(createdNotifications[0].notification_title).toBe('Teacher assigned to class');
      expect(createdNotifications[0].notification_message).toContain('Teacher TR. Sarah was assigned to P5');

      // Simulate manager credit transfer
      await notifyAdminTeachers('Manager credit transfer', 'Manager John transferred 100 credits to TR. Sarah.', 'reward');
      expect(mockDataSdk.create).toHaveBeenCalledTimes(2);
      expect(createdNotifications[1].notification_title).toBe('Manager credit transfer');
      expect(createdNotifications[1].notification_message).toContain('Manager John transferred 100 credits to TR. Sarah');
    });
  });
});
