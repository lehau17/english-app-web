# Báo cáo Tính năng chưa hoàn thành - englishWeb

> **Ngày quét**: 2025-12-02
> **Trạng thái**: 62 files có TODO/FIXME/mock data
> **Build status**: ✅ Build thành công

---

## 📊 Tổng quan

| Category | Số lượng | Mức độ ưu tiên |
|----------|----------|----------------|
| **Critical** (ảnh hưởng UX) | 8 | 🔴 Cao |
| **Important** (tính năng core) | 12 | 🟡 Trung bình |
| **Nice to have** (enhancement) | 15 | 🟢 Thấp |

---

## 🔴 CRITICAL - Cần sửa ngay

### 1. **CreatePodcastPageBeautiful - Poll audio status**
**File**: `src/pages/CreatePodcastPageBeautiful.tsx:141`

**Vấn đề**: Luồng poll trạng thái tạo audio chỉ `console.log`, không gọi API kiểm tra thực tế

```typescript
console.error('Error polling podcast audio status:', error)
```

**Cần làm**:
- Gọi API `GET /podcasts/:id/audio-status` để check
- Update UI khi audio ready
- Handle timeout và error states

---

### 2. **ParentProgressReportPage - Mock data**
**File**: `src/pages/ParentProgressReportPage.tsx:28-127`

**Vấn đề**: Toàn bộ page dùng mock data

```typescript
const mockStudyTimeData = { ... }
const mockSkillData = [ ... ]
const mockCommonMistakes = [ ... ]
const mockRecentActivities = [ ... ]
```

**Cần làm**:
- Tạo API endpoint: `GET /private/v1/parents/children/:childId/progress`
- Integrate real data từ backend
- Remove mock data

---

### 3. **ParentHomePage - Mock data fallback**
**File**: `src/pages/ParentHomePage.tsx:64-70`

**Vấn đề**: Dùng empty arrays khi API fail, không có proper error handling

```typescript
const children = dashboardData?.children || []
const rewards = dashboardData?.rewards || []
```

**Cần làm**:
- Verify API endpoint hoạt động
- Add proper error states
- Test với real data

---

### 4. **SettingsPage - All actions are console.log**
**File**: `src/pages/SettingsPage.tsx:168,195,236,243,250,263,270,277,284,297,304`

**Vấn đề**: 11+ settings actions chỉ log ra console, không persist

```typescript
onClick: () => console.log('Change language')
onClick: () => console.log('Change daily goal')
onClick: () => console.log('Change password')
onClick: () => console.log('Manage email')
onClick: () => console.log('Update phone')
onClick: () => console.log('Help center')
onClick: () => console.log('Contact support')
onClick: () => console.log('Rate app')
onClick: () => console.log('Terms of service')
onClick: () => console.log('Download data')
onClick: () => console.log('Clear cache')
```

**Cần làm**:
- Implement API calls để save settings
- Persist vào localStorage hoặc backend
- Add confirmation dialogs

---

### 5. **ClassroomDetail - submission always null**
**File**: `src/pages/ClassroomDetail.tsx:2281,2507`

**Vấn đề**: Component học sinh luôn truyền `submission={null}`, không lấy submission thực

```typescript
submission={assignment.submission ?? null}
```

**Cần làm**:
- Verify backend đang trả về `submission` trong assignment object
- Fix mapping nếu cần
- Test với real submission data

---

### 6. **Vocabulary V2 Migration - TODO**
**Files**:
- `src/hooks/useVocabulary.ts:7`
- `src/components/common/TextInteractionWrapper.tsx:84`

**Vấn đề**: Chưa migrate sang vocabulary v2 system

```typescript
// TODO: Migrate to vocabulary v2 system
// TODO: Implement save word to vocabulary v2
```

**Cần làm**:
- Complete migration sang vocabulary v2 API
- Update TextInteractionWrapper để save words
- Test vocabulary features

---

### 7. **Podcast Attempt History - Backend API missing**
**File**: `LEARNING_HISTORY_FEATURE.md:215-220`

**Vấn đề**: Frontend đã ready nhưng backend chưa có API

```
Backend chưa có API `/podcast-attempts/my-history`!
Cần tạo:
1. Controller method trong PodcastController
2. Service method trong PodcastService
3. Query Prisma lấy tất cả attempts của user với podcast info
```

**Cần làm**:
- Tạo backend endpoint
- Test integration
- Verify data structure

---

### 8. **Parent Portal - Missing routes**
**File**: `src/pages/ParentHomePage.tsx:260` và `issue.md:49-56`

**Vấn đề**: 4 parent pages chưa có routes/implementation:
- `/parent/activities`
- `/parent/settings`
- `/parent/reports`
- `/parent/rewards`

**Cần làm**:
- Tạo 4 pages tương ứng
- Add routes trong `App.tsx`
- Add role guards

---

## 🟡 IMPORTANT - Tính năng core cần hoàn thiện

### 9. **Learn Player - timeLimit enforcement**
**File**: `src/pages/LearnPage.tsx:2463` và `issue.md:23-25`

**Vấn đề**: Không enforce timeout countdown, không auto-submit

**Cần làm**:
- Show timer bar khi `activity.timeLimit` > 0
- Auto-submit khi hết giờ
- Disable controls on timeout

---

### 10. **Learn Player - maxAttempts enforcement**
**File**: `src/pages/LearnPage.tsx:2240,2274` và `issue.md:27-29`

**Vấn đề**: Không giới hạn số lần làm bài

**Cần làm**:
- Track attempts client-side và via API
- Block start when exceeded
- Show attempts counter

---

### 11. **Learn Player - Real scoring with passingScore**
**File**: `src/pages/LearnPage.tsx:260,1152,1263` và `issue.md:31-37`

**Vấn đề**: Scoring không accurate, không check passingScore

**Cần làm**:
- Implement proper scoring cho mỗi loại activity
- Apply pass/fail logic
- Show detailed results

---

### 12. **Learn Player - Persist notes and resume**
**File**: `src/pages/LearnPage.tsx:292,2169` và `issue.md:39-41`

**Vấn đề**: Notes không được save, không resume được state

**Cần làm**:
- Save notes to API/localStorage
- Resume activity state khi reload
- Sync across devices

---

### 13. **Assignments - Grade details page**
**File**: `issue.md:7-10`

**Vấn đề**: Không có trang xem chi tiết grade cho từng submission

**Cần làm**:
- Add route `/classroom-detail/:id/assignments/:assignmentId/submissions/:submissionId`
- Create submission detail page
- Wire to backend APIs

---

### 14. **Assignments - Bulk filters & export**
**File**: `src/pages/AssignmentSubmissionsPage.tsx` và `issue.md:12-15`

**Vấn đề**: Submissions list thiếu filters và export

**Cần làm**:
- Add filters: status, score range, attempts
- Add export CSV/Excel button
- Implement export logic

---

### 15. **Assignments - Teacher feedback loop**
**File**: `src/pages/LearnPage.tsx:930,1029,1214` và `issue.md:17-19`

**Vấn đề**: Writing/Speaking activities không send artifacts cho teacher review

**Cần làm**:
- Add pending/needs-review states
- Send audio blob/text to submissions
- Teacher can review and give feedback

---

### 16. **Notifications - Real-time updates**
**File**: `src/lib/notificationBus.ts:11`, `src/hooks/notifications.hooks.ts:66` và `issue.md:60-62`

**Vấn đề**: Không có real-time notifications

**Cần làm**:
- Integrate WebSocket/SSE
- Update badge counts real-time
- Auto-refresh notification list

---

### 17. **Notifications - Mark as read & filters**
**File**: `src/pages/NotificationsPage.tsx` và `issue.md:64-65`

**Vấn đề**: Thiếu bulk actions và filters

**Cần làm**:
- Add mark-as-read functionality
- Bulk actions (mark all read, delete)
- Filter by type/priority/date

---

### 18. **Language switching - i18n**
**File**: `src/pages/SettingsPage.tsx:173` và `issue.md:73-75`

**Vấn đề**: UI i18n chưa được wire, nhiều strings hardcoded

**Cần làm**:
- Wire language selector to i18n
- Migrate hardcoded strings to locales
- Persist language preference

---

### 19. **Error boundaries**
**File**: `src/hooks/learn.hooks.ts`, `src/pages/LearnPage.tsx:2152` và `issue.md:43-45`

**Vấn đề**: Không có error boundary cho data fetch failures

**Cần làm**:
- Add error boundary component
- Add "Try again" button
- Better error messages

---

### 20. **Parent role guards**
**File**: `src/routes/ProtectedRoute.tsx:12,29` và `issue.md:54-56`

**Vấn đề**: Parent routes không có proper role guards

**Cần làm**:
- Add role-based redirects
- Verify data sources cho parent
- Test access control

---

## 🟢 NICE TO HAVE - Enhancements

### 21. **Accessibility audit**
**File**: `issue.md:99-101`

**Cần làm**:
- Add aria-labels
- Keyboard navigation
- Focus management
- Screen reader testing

---

### 22. **Console.log cleanup**
**Vấn đề**: 148 console.log statements trong 28 files

**Cần làm**:
- Replace với toast notifications
- Structured logger
- Remove debug logs

---

### 23. **Code splitting**
**File**: `issue.md:131-132`

**Cần làm**:
- Lazy load heavy pages
- Reduce bundle size (hiện tại 2MB+)
- Improve initial load time

---

### 24. **List virtualization**
**File**: `issue.md:134-135`

**Cần làm**:
- Virtual scrolling cho large lists
- Pagination improvements
- Performance optimization

---

### 25. **Tests**
**File**: `issue.md:125-127`

**Cần làm**:
- Unit tests cho activities
- Integration tests cho assignment flows
- E2E tests cho critical paths
- Configure Vitest/RTL

---

### 26. **Classroom - Student management**
**File**: `src/pages/ClassroomDetail.tsx` và `issue.md:89-91`

**Cần làm**:
- QR code invite
- Remove student
- Bulk import/export
- Student notes

---

### 27. **Classroom - Announcements enhancements**
**File**: `src/pages/ClassroomDetail.tsx` và `issue.md:93-95`

**Cần làm**:
- Edit/delete announcements
- Priority filters
- Attachments support

---

### 28. **TypeScript strict mode fixes**
**File**: `issue.md:117-123`

**Cần làm**:
- Fix unused variables
- Narrow types from nullable APIs
- Remove type-only imports
- Clean up unused code

---

## 📋 Chi tiết từng file có TODO/Mock

### Pages (28 files)
1. `ClassroomDetail.tsx` - 6 console.logs, submission null issue
2. `ParentActivitiesPage.tsx` - Chưa implement
3. `LearnPage.tsx` - 12 console.logs, scoring/timing/attempts issues
4. `CreatePodcastPageBeautiful.tsx` - Poll status chỉ log
5. `AiSpeakingSessionPage.tsx` - 15 console.logs
6. `MyCertificatesPage.tsx` - Debug logs
7. `VocabularyListsPage.tsx` - Debug logs
8. `AssignmentTakingPage.tsx` - 7 console.logs
9. `SchedulePage.tsx` - 23 console.logs (debug timezone)
10. `PodcastPracticePage.tsx` - 5 console.logs
11. `NotificationsPage.tsx` - Mark-as-read chưa implement
12. `ListeningPracticePage.tsx` - 2 console.logs
13. `RegisterPage.tsx` - Debug logs
14. `LoginPage.tsx` - Debug logs
15. `SettingsPage.tsx` - 11 stubbed actions
16. `ParentProgressReportPage.tsx` - Full mock data
17. `ParentHomePage.tsx` - Mock data fallback
18. `ParentRewardsPage.tsx` - Chưa implement
19. `VerifyCertificatePage.tsx` - Debug logs
20. ...và 8 files khác

### Components (24 files)
1. `TextInteractionWrapper.tsx` - Save word to vocab v2 TODO
2. `AIActivityGeneratorModal.tsx` - Debug logs
3. `CreateAssignmentModal.tsx` - Debug logs
4. `VocabularyReviewSession.tsx` - Debug logs
5. `GapsForm.tsx` - Debug logs
6. `AiChatbox.tsx` - Debug logs
7. `AiAgentPanel.tsx` - Debug logs
8. ...và 17 files khác

### Hooks (5 files)
1. `useVocabulary.ts` - TODO: Migrate to v2
2. `parent.queries.ts` - Mock data comments
3. `podcast-test.hooks.ts` - Type-only imports
4. ...

---

## 📍 Workspace Rules - Known Issues

Theo `AGENTS.md` trong workspace root:

### englishWeb
- ✅ `src/pages/CreatePodcastPageBeautiful.tsx`: Poll status chỉ log console - **ĐÃ XÁC NHẬN**
- ❌ `src/hooks/podcast-comment.hooks.ts`: Toast chưa bật (thiếu react-hot-toast) - **SAI, đã có toast**
- ✅ `src/pages/ClassroomDetail.tsx`: submission={null} - **ĐÃ XÁC NHẬN**

---

## 🎯 Đề xuất ưu tiên

### Sprint 1 - Critical Fixes (1-2 tuần)
1. Fix CreatePodcast poll audio status → API integration
2. Implement SettingsPage actions → Backend API
3. Fix ClassroomDetail submission data → Verify backend response
4. ParentProgressReportPage → Real data integration

### Sprint 2 - Core Features (2-3 tuần)
1. Learn Player - timeLimit/maxAttempts/passingScore
2. Parent Portal - 4 missing pages
3. Vocabulary V2 migration
4. Assignment grade details page
5. Notifications real-time + mark-as-read

### Sprint 3 - Enhancements (1-2 tuần)
1. i18n - Move strings to locales
2. Error boundaries
3. Console.log cleanup
4. Accessibility audit
5. Code splitting

### Sprint 4 - Quality & Performance (1 tuần)
1. Tests setup
2. List virtualization
3. TypeScript strict fixes
4. Build optimization

---

## 🔍 Phương pháp kiểm tra

### Tìm TODO/Mock data
```bash
grep -r "TODO\|FIXME\|mock\|fake\|dummy" src/
```

### Tìm console.log
```bash
grep -r "console\." src/ | wc -l
# Result: 148 matches
```

### Check build
```bash
npm run build
# ✅ Success
```

### Check lint
```bash
npm run lint
# ⚠️ 18 warnings (react-hooks/exhaustive-deps)
```

---

## ✅ Đã hoàn thành gần đây

1. **Attendance System** - ✅ Student view + Teacher marking UI
2. **Teacher Attendance Warning** - ✅ Frontend timing validation
3. **Backend endpoint** - ✅ GET /classrooms/:id/sessions
4. **Build optimization** - ✅ No TypeScript errors

---

## 📝 Notes

- Nhiều console.log là debug logs có thể giữ lại trong dev
- Mock data trong Parent pages là temporary cho UI development
- Một số TODO là nice-to-have, không block production
- Build thành công nhưng có 18 ESLint warnings (non-blocking)

---

**Tổng kết**: englishWeb có nhiều tính năng đã hoàn thành tốt, nhưng còn một số gaps quan trọng cần xử lý trước khi production-ready. Ưu tiên cao nhất là các tính năng ảnh hưởng trực tiếp đến UX (settings actions, mock data, submission display).


