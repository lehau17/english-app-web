# 🚀 Các Tính Năng Có Thể Implement Ngay

Tài liệu này tổng hợp các tính năng từ `context.md` có thể được implement dựa trên hiện trạng của ứng dụng.

---

## ✅ Đã Hoàn Thành

### Core Features
- ✅ Authentication (Login/Register/OAuth)
- ✅ Learn Player với nhiều loại activity
- ✅ Parent Portal (tất cả các trang đã có routing)
- ✅ Classroom Management cơ bản
- ✅ Assignment System
- ✅ Podcast/Listening Practice
- ✅ Notifications Page
- ✅ Profile & Settings Pages

---

## 🔥 PRIORITY 1: Critical Features (1-2 tuần)

### 1. Learn Player - Enforce Constraints ⭐⭐⭐
**Mô tả**: Hiện tại Learn Player không enforce timeLimit, maxAttempts, và passingScore.

**Cần làm**:
- [ ] Thêm countdown timer khi activity có `timeLimit`
- [ ] Auto-submit khi hết thời gian
- [ ] Tracking số lần thử với `maxAttempts`
- [ ] Block retry khi vượt quá số lần cho phép
- [ ] Tính điểm thực tế và so sánh với `passingScore`
- [ ] Hiển thị pass/fail dựa trên `passingScore`

**Files**: 
- `src/pages/LearnPage.tsx` (lines 2463, 2240, 2274, 260, 1152, 1263)
- `src/services/learn.api.ts`

**Impact**: HIGH - Bảo mật và công bằng trong học tập

---

### 2. Assignment - Grade Details Page ⭐⭐⭐
**Mô tả**: Giáo viên cần xem chi tiết từng bài nộp của học sinh để chấm điểm.

**Cần làm**:
- [ ] Tạo route mới: `/classroom-detail/:id/assignments/:assignmentId/submissions/:submissionId`
- [ ] Component hiển thị chi tiết submission (nội dung, rubric, feedback)
- [ ] Form nhập điểm và feedback
- [ ] API integration: GET submission detail, POST/PATCH grade & feedback

**Files**:
- `src/pages/AssignmentSubmissionsPage.tsx` (add link to detail)
- Tạo mới: `src/pages/AssignmentSubmissionDetailPage.tsx`
- `src/App.tsx` (add route)

**Impact**: HIGH - Core feature cho giáo viên

---

### 3. Settings Persistence ⭐⭐
**Mô tả**: Settings hiện chỉ console.log, không lưu vào backend/localStorage.

**Cần làm**:
- [ ] API endpoints cho user settings
- [ ] Persist settings khi user thay đổi
- [ ] Load settings khi mount component
- [ ] Loading states cho các actions

**Files**:
- `src/pages/SettingsPage.tsx` (lines 105, 110, 173, 200, 241, 248, 255, 268, 275, 282, 289, 302, 309)
- `src/services/settings.api.ts` (tạo mới nếu chưa có)

**Impact**: MEDIUM - UX improvement

---

### 4. Parent Portal - Role Guards ⭐⭐
**Mô tả**: Verify parent role checking và data sources.

**Cần làm**:
- [ ] Check `ProtectedRoute.tsx` có parent-specific guards không
- [ ] Nếu chưa: Add role checking cho parent routes
- [ ] Verify API endpoints cho parent data
- [ ] Test parent flow end-to-end

**Files**:
- `src/routes/ProtectedRoute.tsx`
- `src/pages/Parent*.tsx` (verify data sources)

**Impact**: HIGH - Security requirement

---

## 🎯 PRIORITY 2: UX Improvements (2-3 tuần)

### 5. Persist Learner Notes & Resume State ⭐⭐
**Mô tả**: Học sinh cần save notes và resume từ activity cuối cùng.

**Cần làm**:
- [ ] API để save/load learner notes
- [ ] LocalStorage fallback cho offline
- [ ] Save current activity ID
- [ ] Resume từ activity cuối khi reload

**Files**:
- `src/pages/LearnPage.tsx` (lines 292, 2169)

**Impact**: MEDIUM - Better learning experience

---

### 6. Real-time Notifications ⭐⭐
**Mô tả**: Integrate WebSocket hoặc Socket.IO cho notifications real-time.

**Cần làm**:
- [ ] Setup Socket.IO client connection
- [ ] Subscribe to notification events
- [ ] Update notification badge counts
- [ ] Show toast for new notifications

**Files**:
- `src/lib/notificationBus.ts` (line 11)
- `src/hooks/notifications.hooks.ts` (line 66)
- `src/components/layout/Header.tsx` (notification bell)

**Impact**: MEDIUM - Better engagement

---

### 7. Notifications Page Enhancements ⭐
**Mô tả**: Add mark-as-read, bulk actions, filters.

**Cần làm**:
- [ ] Mark single notification as read
- [ ] Mark all as read button
- [ ] Filter by type (assignment, achievement, message, etc.)
- [ ] Delete notification
- [ ] Pagination

**Files**:
- `src/pages/NotificationsPage.tsx`

**Impact**: LOW - UX polish

---

### 8. Language Switching (i18n) ⭐
**Mô tả**: Wire language selector to i18n system.

**Cần làm**:
- [ ] Connect language selector in SettingsPage to i18n
- [ ] Persist language choice to localStorage
- [ ] Add more translations to `src/locales/`

**Files**:
- `src/i18n.ts`
- `src/pages/SettingsPage.tsx` (line 173)
- `src/locales/en/translation.json` & `vi/translation.json`

**Impact**: MEDIUM - Internationalization

---

## 🌟 PRIORITY 3: Teacher Tools (3-4 tuần)

### 9. Assignment - Bulk Filters & Export ⭐
**Cần làm**:
- [ ] Filter by status (submitted/graded/late/missing)
- [ ] Filter by score range
- [ ] Filter by number of attempts
- [ ] Export to CSV/Excel

**Files**: `src/pages/AssignmentSubmissionsPage.tsx`

---

### 10. Classroom - Student Management ⭐⭐
**Cần làm**:
- [ ] Generate and show QR code for class join
- [ ] Remove student from class
- [ ] Import students from CSV
- [ ] Export student list
- [ ] Add notes to students

**Files**: `src/pages/ClassroomDetail.tsx` (line 1116+)

---

### 11. Classroom - Announcements ⭐
**Cần làm**:
- [ ] Edit announcement
- [ ] Delete announcement
- [ ] Add attachments to announcements
- [ ] Priority/pinned announcements

**Files**: `src/pages/ClassroomDetail.tsx` (line 1067+)

---

### 12. Teacher Feedback in Activities ⭐
**Mô tả**: Allow pending/needs-review states for speaking/writing activities.

**Cần làm**:
- [ ] Add "Submit for review" option
- [ ] Send audio blobs/text to backend
- [ ] Teacher review interface
- [ ] Show feedback in activity results

**Files**: `src/pages/LearnPage.tsx` (lines 930, 1029, 1214)

---

## 🎨 PRIORITY 4: Enhancement & Polish (4-6 tuần)

### 13. Performance Optimizations ⭐
- [ ] Lazy load routes in `App.tsx`
- [ ] Virtual scrolling for large tables
- [ ] Image lazy loading
- [ ] Code splitting

---

### 14. Error Handling ⭐⭐
- [ ] Replace `console.log` with structured logger
- [ ] Add error boundaries
- [ ] Consistent empty/loading/error states
- [ ] Better error messages

---

### 15. Accessibility ⭐
- [ ] Add aria-labels to interactive elements
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support

---

### 16. Code Quality ⭐
- [ ] Fix 19 React Hook dependency warnings
- [ ] Add unit tests (Vitest + RTL)
- [ ] E2E tests (Playwright/Cypress)

---

## 🚀 PRIORITY 5: Advanced Features (Future)

### 17. Gamification Features ⚠️ (Cần verify implementation)
**Từ context.md nhưng chưa rõ đã implement chưa**:
- [ ] XP/Points system với visual progress
- [ ] Badge collection và display
- [ ] Leaderboards (weekly/monthly/global)
- [ ] Streak system với freeze items
- [ ] Achievement notifications

**Cần làm**: 
1. Check xem có API endpoints không
2. Check database schema
3. Implement UI nếu backend đã có

---

### 18. Social Features ❌ (Chưa implement)
**Từ context.md - Features hoàn toàn mới**:
- [ ] Friend system (add friends, view activity)
- [ ] Study clubs
- [ ] Challenges and tournaments
- [ ] Group chat
- [ ] Social sharing

**Impact**: MEDIUM - Community engagement
**Effort**: HIGH - Requires backend work

---

### 19. Advanced AI Features ❌ (Backend heavy)
- [ ] AI Personal Tutor chatbot
- [ ] Adaptive difficulty based on performance
- [ ] Auto-generate exercises from vocab
- [ ] Pronunciation phoneme-level analysis
- [ ] Emotion analysis in speaking activities

**Impact**: HIGH - Differentiation
**Effort**: VERY HIGH - Requires ML infrastructure

---

### 20. Offline Mode ❌ (Not implemented)
- [ ] Cache lessons for offline access
- [ ] Sync progress when online
- [ ] Download audio files
- [ ] Offline indicator

**Impact**: MEDIUM - Convenience
**Effort**: HIGH - Service workers, sync logic

---

### 21. Admin Portal ❌ (Likely backend only)
- [ ] Content Management System (CMS)
- [ ] User management (suspend, activate, delete)
- [ ] Role & permission management
- [ ] System analytics dashboard
- [ ] Feature flags
- [ ] Email template editor

**Impact**: HIGH - Platform management
**Effort**: VERY HIGH - Requires full admin app

---

## 📊 Feature Matrix

| Feature | Priority | Effort | Impact | Status | Dependencies |
|---------|----------|--------|--------|--------|--------------|
| Learn Player Constraints | P1 | Medium | High | 🔴 TODO | None |
| Grade Details Page | P1 | Medium | High | 🔴 TODO | Assignment API |
| Settings Persistence | P1 | Low | Medium | 🔴 TODO | Settings API |
| Parent Role Guards | P1 | Low | High | 🟡 VERIFY | Auth system |
| Learner Notes | P2 | Low | Medium | 🔴 TODO | Learn API |
| Real-time Notifications | P2 | Medium | Medium | 🔴 TODO | WebSocket |
| Notification Actions | P2 | Low | Low | 🔴 TODO | Notification API |
| Language Switching | P2 | Low | Medium | 🔴 TODO | i18n setup |
| Assignment Filters | P3 | Low | Medium | 🔴 TODO | None |
| Student Management | P3 | Medium | Medium | 🔴 TODO | Classroom API |
| Announcements Edit | P3 | Low | Low | 🔴 TODO | Classroom API |
| Teacher Feedback | P3 | Medium | Medium | 🔴 TODO | Review API |
| Performance Opts | P4 | Medium | Medium | 🔴 TODO | None |
| Error Handling | P4 | Medium | High | 🔴 TODO | None |
| Accessibility | P4 | High | Medium | 🔴 TODO | None |
| Gamification | P5 | High | High | ⚠️ VERIFY | Backend |
| Social Features | P5 | Very High | Medium | ❌ NEW | Full stack |
| AI Features | P5 | Very High | High | ❌ NEW | ML infra |
| Offline Mode | P5 | High | Medium | ❌ NEW | Service workers |
| Admin Portal | P5 | Very High | High | ❌ NEW | Full app |

---

## 🎯 Recommended Implementation Order

### Week 1-2: Critical Fixes
1. Settings Persistence (1-2 days)
2. Parent Role Guards verification (1 day)
3. Learn Player Constraints (3-5 days)

### Week 3-4: Core Features
4. Grade Details Page (3-4 days)
5. Learner Notes Persistence (2-3 days)

### Week 5-6: UX Improvements
6. Real-time Notifications (3-4 days)
7. Language Switching (1-2 days)
8. Notification Actions (2-3 days)

### Week 7-8: Teacher Tools
9. Assignment Filters & Export (2-3 days)
10. Student Management (4-5 days)
11. Announcements Enhancements (2-3 days)

### Week 9-10: Polish
12. Error Handling improvements (3-4 days)
13. Performance Optimizations (3-4 days)
14. Fix Hook warnings (2 days)

---

## 💡 Quick Wins (Can do in 1-2 days)

1. ✅ **Settings Persistence** - Wire up existing UI to API/localStorage
2. ✅ **Language Switching** - Connect dropdown to i18n.changeLanguage()
3. ✅ **Notification Mark-as-Read** - Single API call
4. ✅ **Parent Role Guard Check** - Just verify existing code
5. ✅ **Assignment Filters** - Frontend-only filtering

---

## ⚠️ Features Requiring Backend Work

These features need backend API support before frontend implementation:

1. **Gamification** (if not already implemented)
   - XP/Points calculation
   - Badge awarding logic
   - Leaderboard rankings
   - Streak tracking

2. **Social Features** (completely new)
   - Friend relationships
   - Club memberships
   - Challenge system
   - Group chat infrastructure

3. **AI Features** (completely new)
   - ML model serving
   - Content generation
   - Adaptive algorithms
   - Analysis pipelines

4. **Admin Portal** (may exist separately)
   - Admin APIs
   - Audit logging
   - Feature flag system
   - Bulk operations

---

## 📞 Next Steps

1. **Verify gamification**: Check if XP/badges/streaks APIs exist
2. **Check parent role guards**: Test if parent routes have proper authorization
3. **Start with quick wins**: Settings persistence and language switching
4. **Then tackle P1 features**: Learn Player constraints and grade details

---

*Document created based on analysis of context.md, issue.md, and current codebase*
*Last updated: [Current Date]*
