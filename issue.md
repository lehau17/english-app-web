# englishWeb – Backlog & Gaps

This document lists pending features, gaps, and follow‑ups discovered while scanning the student‑facing web app. Items are grouped by feature area with actionable notes and file references.

## 1) Assignments

- [ ] Grade details page per submission (view attempt content, rubric, feedback, attachments)
  - Add per‑submission detail route under `/classroom-detail/:id/assignments/:assignmentId/submissions/:submissionId` with grade/feedback UI.
  - Wire to BE: GET one submission, POST/PATCH grade and feedback.
  - Entry points from: `englishWeb/src/pages/AssignmentSubmissionsPage.tsx:1` (row action)

- [ ] Bulk filters + export on submissions list
  - Filters: status (submitted/graded/late/missing), score range, attempts.
  - Export CSV/Excel button.
  - File: `englishWeb/src/pages/AssignmentSubmissionsPage.tsx:1`

- [ ] Teacher feedback loop in Learn Player
  - For writing/speaking/pronunciation: allow pending/needs‑review states and send artifacts (audio blob / text) to submissions.
  - Files: `englishWeb/src/pages/LearnPage.tsx:930, 1029, 1214`

## 2) Learn Player (time/attempts/scoring/persistence)

- [ ] Enforce `timeLimit` countdown and auto‑submit/fail on timeout
  - Show a top bar timer when `active.timeLimit` set; disable controls on timeout.
  - File: `englishWeb/src/pages/LearnPage.tsx:2463`

- [ ] Enforce `maxAttempts` per activity
  - Maintain attempts client‑side and via API; block start when exceeded.
  - Files: `englishWeb/src/pages/LearnPage.tsx:2240, 2274`; API contracts in `englishWeb/src/services/learn.api.ts:1`.

- [ ] Real scoring per activity with `passingScore`
  - Quiz/reading/grammar: derive score from correct options.
  - Matching: based on pairs correct.
  - Fill‑blank: partial credit by blanks.
  - Dictation: ratio of words matched (currently ~80% note).
  - Apply pass/fail against `passingScore` before calling complete.
  - Files: `englishWeb/src/pages/LearnPage.tsx:260, 1152, 1263, (FillBlankActivity/DictationActivity/MatchingActivity)`

- [ ] Persist learner notes and resume state
  - Save “Ghi chú” and current activity to API/local storage and restore on load.
  - Files: `englishWeb/src/pages/LearnPage.tsx:292, 2169`

- [ ] Better error boundaries and retry for data fetch
  - Add boundary and “Try again” for `useLessonAndActivities` failures.
  - Files: `englishWeb/src/hooks/learn.hooks.ts:1`, `englishWeb/src/pages/LearnPage.tsx:2152`

## 3) Parent Portal

- [ ] Implement missing parent pages linked from ParentHome
  - `/parent/activities`, `/parent/settings`, `/parent/reports`, `/parent/rewards` (currently buttons navigate, no routes/pages).
  - File with links: `englishWeb/src/pages/ParentHomePage.tsx:260`
  - Add routes: `englishWeb/src/App.tsx:1`

- [ ] Parent role guards + data sources
  - Ensure ProtectedRoute redirects non‑parent away from `/parent-*`.
  - Files: `englishWeb/src/routes/ProtectedRoute.tsx:12,29`

## 4) Notifications

- [ ] Real‑time updates and unread badges
  - Integrate WebSocket/Socket.IO or SSE for notifications; update badge counts.
  - Files: `englishWeb/src/lib/notificationBus.ts:11`, `englishWeb/src/hooks/notifications.hooks.ts:66`

- [ ] Mark‑as‑read, bulk actions, filters in NotificationsPage
  - Files: `englishWeb/src/pages/NotificationsPage.tsx:1`

## 5) Settings (many actions stubbed)

- [ ] Persist user settings to backend/localStorage
  - Implement handlers now logging via `console.log`.
  - Files: `englishWeb/src/pages/SettingsPage.tsx:105,110,173,200,241,248,255,268,275,282,289,302,309`

- [ ] Language switching via i18n
  - Wire “Ngôn ngữ” item to `i18n` and persist.
  - Files: `englishWeb/src/i18n.ts:1`, `englishWeb/src/pages/SettingsPage.tsx:173`

## 6) Listening / Podcast flows cleanup

- [x] Remove legacy CreatePodcast pages (dedupe)
  - Deleted: `CreatePodcastPage.tsx`, `CreatePodcastPageNew.tsx`, `CreatePodcastPageUpdated.tsx`, `CreatePodcastPageFinal.tsx`.
  - Keep `CreatePodcastPageBeautiful.tsx` as the single create flow (routes already use it).

- [ ] Consolidate “Beautiful/Updated” pages vs legacy
  - Align to one creation flow; remove dead code.
  - Files: `englishWeb/src/pages/CreatePodcastPageBeautiful.tsx`, `CreatePodcastPage.tsx`

## 7) Classroom Management

- [ ] Student management actions
  - Invite/join via class code QR, remove student, bulk import/export, notes, attendance.
  - Files: `englishWeb/src/pages/ClassroomDetail.tsx:1116+ (students list)`

- [ ] Announcements enhancements
  - Edit/delete announcement, priority filters, attachments.
  - Files: `englishWeb/src/pages/ClassroomDetail.tsx:1067+`

## 8) Accessibility & i18n

- [ ] Audit and add aria‑labels, keyboard navigation, focus management
  - Inputs in new activities and modal actions.
  - Files: `englishWeb/src/pages/LearnPage.tsx:FillBlankActivity, MatchingActivity, DictationActivity`

- [ ] Move user‑facing strings into locales
  - Many strings are hardcoded; wrap with `t()`.
  - Files: broad — e.g., `englishWeb/src/pages/LearnPage.tsx:2219+`, `englishWeb/src/pages/ClassroomDetail.tsx:780+`, etc.

## 9) Error handling & UX consistency

- [ ] Replace scattered `console.log` with toast + structured logger
  - Files (samples): `englishWeb/src/pages/LearnPage.tsx:2012,2136,2138,2152,2161,2174`, `englishWeb/src/routes/ProtectedRoute.tsx:12,27,29,32,35`

- [ ] Add empty/loading/error states consistently to new pages
  - Files: `englishWeb/src/pages/AssignmentSubmissionsPage.tsx:1`

## 10) Code quality & build health

- [ ] Fix TypeScript strict build failures unrelated to assignments
  - Unused vars and types cause `npm run build` to fail.
  - Files (examples):
    - `englishWeb/src/components/user/UserDetailModel.tsx:305`
    - `englishWeb/src/components/ui/DragDropFile.tsx:17`
    - `englishWeb/src/hooks/podcast-test.hooks.ts:2` (type‑only import)
    - `englishWeb/src/pages/ClassroomDetail.tsx:978,1010` (narrow types from API nullables)

- [ ] Tests
  - Add unit tests for new activity renderers (fill_blank, dictation, matching) and assignment actions.
  - Configure minimal Vitest/RTL suite.

## 11) Performance

- [ ] Route‑level code splitting (lazy) for heavy pages
  - Files: `englishWeb/src/App.tsx:1`

- [ ] Memoization and list virtualization for large tables
  - Submissions list when N ≫ 100.

---

If you want, I can start with: (a) Learn Player timeLimit/maxAttempts/passingScore enforcement, or (b) Parent portal skeleton pages and routing. Let me know your priority.
