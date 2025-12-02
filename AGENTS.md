# AGENTS – englishWeb (Vite + React)

> Last updated: 2025-11-28 — Tóm tắt: Student-facing web với 50+ pages, AI Speaking, Podcast, Assignment.

Ứng dụng web phía người dùng (student-facing). Dựng bằng Vite + React, Tailwind v4, TanStack Query, i18n.

## Thống Kê Nhanh
- **50+ pages** trong `src/pages/`
- **Tính năng chính**: Classroom, Assignment, AI Speaking, Podcast, Vocabulary, Certificate, Parent Portal

## Cấu Trúc Chính
- `src/main.tsx`: điểm vào ứng dụng.
- `src/App.tsx`: khung App và cấu hình chung.
- `src/components/`: UI components (ví dụ `ui/`, `learn/`, `listening/`, `podcast-comment/`).
- `src/pages/`: trang chức năng; `pages/auth/` cho đăng nhập/đăng ký.
- `src/routes/`: định nghĩa routing.
- `src/services/`: tầng gọi API theo domain.
- `src/lib/api.ts`: Axios instance (đính kèm cookie, bắt 401 → chuyển hướng `/login`).
- `src/context/`, `src/hooks/`, `src/utils/`, `src/styles/`, `src/types/`, `src/config/`.

## Các Trang Chính
| Nhóm | Pages |
|------|-------|
| **Learning** | `LearnPage`, `ClassroomDetail`, `ClassroomPage`, `LessonPlayerPageChildren` |
| **Assignment** | `AssignmentTakingPage`, `AssignmentResultPage`, `AssignmentSubmissionsPage` |
| **AI Speaking** | `AiSpeakingSessionPage`, `AiSpeakingConversationsPage`, `AiSpeakingConversationDetailPage` |
| **Podcast** | `PodcastDetailPage`, `PodcastPracticePage`, `CreatePodcastPageBeautiful`, `PlaylistsPage` |
| **Vocabulary** | `MyVocabularyPage`, `VocabularyListsPage`, `FlashcardReviewPage`, `VocabularyQuickReviewPage` |
| **Certificate** | `MyCertificatesPage`, `CertificateDetailPage`, `VerifyCertificatePage` |
| **Parent** | `ParentHomePage`, `ParentProgressReportPage`, `ParentSchedulePage`, `ParentActivitiesPage` |

## Biến Môi Trường
- Tạo file `.env` tại thư mục `englishWeb/`:
  - `VITE_API_URL=http://localhost:3000/api` (hoặc cổng mà backend đang expose `CLIENT_API_PORT`).

## Lệnh Phát Triển / Build
- Dev: `npm run dev` (Vite mặc định port 5173).
- Build: `npm run build` (kèm `tsc -b`).
- Xem thử build: `npm run preview`.
- Chất lượng: `npm run lint`, `npm run lint:fix`, `npm run format`.

## API & Auth
- Mọi request đi qua `src/lib/api.ts` với `withCredentials: true` và interceptor:
  - 401 (không phải endpoint `/auth/*`) → redirect sang `/login?next=...`.
  - Có thể thêm refresh-token/logic khác tại đây nếu backend hỗ trợ.

## Checklist Sau Khi Code
1) Chạy `npm run lint` (hoặc `lint:fix`).
2) `npm run build` và `npm run preview` để click test luồng vừa sửa.
3) Nếu có thay đổi contract API, cập nhật type/DTO, services và tài liệu.

## Gợi Ý Kiểm Thử
- Form/luồng auth: thử login/logout, xử lý 401.
- Kiểm tra i18n ở `src/i18n.ts` và thư mục `src/locales/` (vi/en).
- Luồng gọi API sử dụng React Query: đảm bảo cache/invalidation hợp lý.

