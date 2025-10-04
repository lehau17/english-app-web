# 📝 TODO: Features to Implement

Quick reference checklist for implementable features.

---

## 🔴 PRIORITY 1: CRITICAL (Tuần 1-2)

- [ ] **Settings Persistence** (1-2 ngày) ⚡ Quick Win
  - Wire up SettingsPage actions to API/localStorage
  - Files: `src/pages/SettingsPage.tsx`

- [ ] **Parent Role Guards** (1 ngày) ⚡ Quick Win
  - Verify role checking in ProtectedRoute
  - Files: `src/routes/ProtectedRoute.tsx`

- [ ] **Learn Player - Time Limit** (2 ngày)
  - Add countdown timer
  - Auto-submit on timeout
  - Files: `src/pages/LearnPage.tsx`

- [ ] **Learn Player - Max Attempts** (1-2 ngày)
  - Track attempts count
  - Block retry when exceeded
  - Files: `src/pages/LearnPage.tsx`

- [ ] **Learn Player - Passing Score** (1-2 ngày)
  - Calculate real scores
  - Check pass/fail against passingScore
  - Files: `src/pages/LearnPage.tsx`

---

## 🟡 PRIORITY 2: CORE (Tuần 3-4)

- [ ] **Grade Details Page** (3-4 ngày)
  - Create AssignmentSubmissionDetailPage
  - Route: `/classroom-detail/:id/assignments/:assignmentId/submissions/:submissionId`
  - Grade input form + feedback
  - Files: New page + update App.tsx

- [ ] **Persist Learner Notes** (2-3 ngày)
  - API to save/load notes
  - Resume from last activity
  - Files: `src/pages/LearnPage.tsx`

---

## 🟢 PRIORITY 3: UX (Tuần 5-6)

- [ ] **Real-time Notifications** (3-4 ngày)
  - Setup Socket.IO client
  - Update notification badge
  - Show toast for new notifications
  - Files: `src/lib/notificationBus.ts`, `src/hooks/notifications.hooks.ts`

- [ ] **Language Switching** (1-2 ngày) ⚡ Quick Win
  - Connect language selector to i18n
  - Persist language choice
  - Files: `src/i18n.ts`, `src/pages/SettingsPage.tsx`

- [ ] **Notification Actions** (2-3 ngày)
  - Mark as read
  - Mark all as read
  - Filter by type
  - Files: `src/pages/NotificationsPage.tsx`

---

## 🔵 PRIORITY 4: TEACHER TOOLS (Tuần 7-8)

- [ ] **Assignment Filters & Export** (2-3 ngày) ⚡ Quick Win
  - Filter by status/score/attempts
  - Export CSV/Excel
  - Files: `src/pages/AssignmentSubmissionsPage.tsx`

- [ ] **Student Management** (4-5 ngày)
  - Generate QR code for class join
  - Remove student
  - Import/Export CSV
  - Add notes
  - Files: `src/pages/ClassroomDetail.tsx`

- [ ] **Announcements Enhancement** (2-3 ngày)
  - Edit/Delete announcement
  - Attachments
  - Priority/pinned
  - Files: `src/pages/ClassroomDetail.tsx`

- [ ] **Teacher Feedback Loop** (3-4 ngày)
  - Pending/needs-review states
  - Send artifacts for review
  - Show feedback in results
  - Files: `src/pages/LearnPage.tsx`

---

## ⚪ PRIORITY 5: POLISH (Tuần 9-10)

- [ ] **Error Handling** (3-4 ngày)
  - Replace console.log with logger
  - Add error boundaries
  - Consistent empty/loading states
  - Files: Multiple

- [ ] **Performance** (3-4 ngày)
  - Lazy load routes
  - Virtual scrolling
  - Code splitting
  - Files: `src/App.tsx`, large lists

- [ ] **Fix Warnings** (2 ngày)
  - Fix 19 react-hooks/exhaustive-deps warnings
  - Files: Multiple

---

## 🎨 NICE TO HAVE (Future)

### Verify These First
- [ ] Check if gamification backend exists (XP/badges/streaks)
- [ ] Verify parent pages have real data sources
- [ ] Check if admin portal exists separately

### If Backend Ready
- [ ] **Gamification UI**
  - XP progress display
  - Badge collection showcase
  - Leaderboards (weekly/monthly/global)
  - Streak counter with freeze items
  - Achievement popup notifications

### New Features (Require Backend)
- [ ] **Social Features**
  - Friend system
  - Study clubs
  - Challenges/tournaments
  - Group chat

- [ ] **Offline Mode**
  - Cache lessons
  - Sync when online
  - Download audio

- [ ] **Advanced AI**
  - AI tutor chatbot
  - Adaptive difficulty
  - Auto-generate exercises
  - Phoneme analysis

- [ ] **Accessibility**
  - Aria labels
  - Keyboard navigation
  - Screen reader support

- [ ] **Tests**
  - Unit tests (Vitest)
  - E2E tests (Playwright)

---

## ⚡ Quick Wins List

Can be done in 1-2 days:

1. ✅ Settings Persistence
2. ✅ Parent Role Guards Check
3. ✅ Language Switching
4. ✅ Assignment Frontend Filters
5. ✅ Mark Notification as Read

---

## 📅 10-Week Implementation Plan

| Week | Focus | Features |
|------|-------|----------|
| 1-2 | Critical | Settings, Role Guards, Learn Player (3 items) |
| 3-4 | Core | Grade Details, Learner Notes |
| 5-6 | UX | Notifications, Language, Mark-as-Read |
| 7-8 | Teachers | Filters, Student Mgmt, Announcements, Feedback |
| 9-10 | Polish | Error Handling, Performance, Fix Warnings |

---

## 🎯 Start Here

**Day 1**:
- [ ] Settings Persistence (quick win)
- [ ] Parent Role Guards (quick win)

**Day 2-3**:
- [ ] Language Switching (quick win)
- [ ] Learn Player - Time Limit

**Day 4-6**:
- [ ] Learn Player - Max Attempts
- [ ] Learn Player - Passing Score

**Week 2**:
- [ ] Grade Details Page

**Week 3**:
- [ ] Learner Notes Persistence
- [ ] Real-time Notifications

Continue according to priority...

---

*Check FEATURE_ANALYSIS.md and IMPLEMENTABLE_FEATURES.md for detailed information*
*Check TINH_NANG_CO_THE_LAM.md for Vietnamese summary*
