# Podcast Attempt History Feature

> **Ngày tạo**: 2025-11-06
> **Mô tả**: Hiển thị lịch sử làm bài podcast đầy đủ với khả năng xem chi tiết từng lần làm

## 📋 Tổng Quan

Đã thêm tính năng hiển thị lịch sử làm bài podcast hoàn chỉnh, tương tự như tính năng lịch sử submission trong Assignment. Người dùng có thể:

- Xem danh sách tất cả các lần làm bài đã hoàn thành
- Xem thống kê tổng hợp (điểm cao nhất, điểm trung bình)
- Xem chi tiết từng lần làm (câu trả lời, điểm số, thời gian)

## 🎯 Components Mới

### 1. `PodcastAttemptItem.tsx`
**Vị trí**: `src/components/podcast/attempt-history/PodcastAttemptItem.tsx`

Component hiển thị thông tin của **một lần làm bài**:
- Số thứ tự lần làm (attemptNo)
- Trạng thái (đang làm/hoàn thành/bỏ dở)
- Điểm số và số câu đúng/tổng số câu
- Thời gian làm bài và ngày giờ làm
- Badge đặc biệt: "Mới nhất", "Điểm cao nhất"
- Nút "Xem chi tiết" (chỉ hiện với attempt đã hoàn thành)

**Features**:
- Color coding theo điểm số (xanh: ≥80%, vàng: ≥60%, đỏ: <60%)
- Highlight attempt mới nhất với background màu xanh nhạt
- Hover effect để tăng tính tương tác

### 2. `PodcastAttemptDetailModal.tsx`
**Vị trí**: `src/components/podcast/attempt-history/PodcastAttemptDetailModal.tsx`

Modal hiển thị **chi tiết đầy đủ** của một lần làm bài:
- Thống kê tổng quan (điểm số, đúng/tổng, thời gian, trạng thái)
- Danh sách chi tiết từng câu hỏi với:
  - Câu trả lời của user
  - Đáp án đúng (nếu trả lời sai)
  - Icon check/x để phân biệt đúng/sai
  - Color coding: xanh cho đúng, đỏ cho sai

**UX Features**:
- Fullscreen modal với backdrop
- Scrollable content cho danh sách câu hỏi dài
- Nút đóng ở header và footer
- Responsive layout (grid 2-4 columns cho stats)

### 3. `PodcastAttemptsHistory.tsx`
**Vị trí**: `src/components/podcast/attempt-history/PodcastAttemptsHistory.tsx`

Component **container chính** quản lý toàn bộ UI lịch sử:

**Chế độ thu gọn** (mặc định):
- Tóm tắt thống kê: Tổng số lần, Điểm cao nhất, Điểm trung bình
- Nút "Xem tất cả" để expand

**Chế độ mở rộng**:
- Danh sách đầy đủ các lần làm bài (PodcastAttemptItem)
- Sắp xếp theo thời gian (mới nhất trước)
- Nút "Ẩn bớt" để collapse

**Logic**:
- Chỉ hiển thị nếu có ít nhất 1 lần làm hoàn thành
- Filter ra các attempt "completed"
- Tự động xác định attempt mới nhất và điểm cao nhất
- Quản lý state cho modal chi tiết

### 4. `index.ts`
**Vị trí**: `src/components/podcast/attempt-history/index.ts`

Export barrel file để import dễ dàng:
```typescript
export { PodcastAttemptsHistory } from './PodcastAttemptsHistory'
export { PodcastAttemptItem } from './PodcastAttemptItem'
export { PodcastAttemptDetailModal } from './PodcastAttemptDetailModal'
export type { PodcastAttemptItemData } from './PodcastAttemptItem'
```

## 🔧 Tích Hợp

### `PodcastDetailPage.tsx`

Đã thêm section "Attempts History" vào trang chi tiết podcast:

```typescript
{/* Attempts History Section */}
{attempts.length > 0 && (
  <div className="mt-12">
    <PodcastAttemptsHistory
      attempts={attempts.map((a: any) => ({...}))}
      gaps={podcastData.gaps?.map((g: any) => ({...})) || []}
    />
  </div>
)}
```

**Vị trí**: Giữa phần "Ratings" và "Comment Section"

**Data Flow**:
- `attempts`: Lấy từ `usePodcastAttempts(podcastId)` hook
- `gaps`: Lấy từ `podcastData.gaps` (backend trả về kèm podcast)
- Chỉ hiển thị khi `attempts.length > 0`

## 📊 Data Structure

### PodcastAttemptItemData
```typescript
interface PodcastAttemptItemData {
  attemptId: string
  attemptNo: number
  status: 'in_progress' | 'completed' | 'abandoned'
  scorePercent: number
  correctCount: number
  totalQuestions: number
  timeSpent?: number
  createdAt: string
  answers: Record<string, string> // gapId -> user answer
}
```

### Gaps Data
```typescript
Array<{
  id: string
  orderNo: number
  answer: string // Đáp án đúng
}>
```

## 🎨 Design System

### Colors
- **Green**: Trả lời đúng, điểm ≥80%
- **Yellow**: Đang làm, điểm 60-79%
- **Red**: Trả lời sai, điểm <60%
- **Blue**: Highlight attempt mới nhất
- **Purple**: Badge "Điểm cao nhất"
- **Gray**: Trạng thái "Bỏ dở"

### Icons (Lucide React)
- `History`: Icon chính cho section lịch sử
- `Clock`: Thời gian làm bài
- `Calendar`: Ngày giờ làm bài
- `Eye`: Xem chi tiết
- `CheckCircle2`: Câu trả lời đúng
- `XCircle`: Câu trả lời sai
- `TrendingUp`: Badge điểm cao nhất
- `ChevronDown/Up`: Toggle expand/collapse

### Layout
- **Card-based**: Mỗi attempt là một card riêng
- **Grid system**: 2-4 columns cho stats
- **Spacing**: `space-y-3` cho danh sách, `mt-12` giữa sections
- **Border radius**: `rounded-lg` cho cards, `rounded-xl` cho modal
- **Shadow**: `shadow-sm` cho cards, `shadow-2xl` cho modal

## ✅ Features

### Đã Hoàn Thành
- [x] Hiển thị danh sách lịch sử làm bài
- [x] Highlight attempt mới nhất
- [x] Hiển thị attempt có điểm cao nhất
- [x] Thống kê tóm tắt (tổng, cao nhất, trung bình)
- [x] Toggle expand/collapse
- [x] Modal xem chi tiết từng attempt
- [x] Hiển thị câu trả lời đúng/sai với color coding
- [x] Format thời gian và ngày tháng
- [x] Responsive design
- [x] TypeScript type safety
- [x] Zero linter errors
- [x] Build successfully

### Tương Lai (Có Thể Mở Rộng)
- [ ] Export attempt details to PDF
- [ ] Compare 2 attempts side-by-side
- [ ] Filter/sort attempts (by date, score)
- [ ] Search trong transcript để highlight từ user điền sai
- [ ] Charts/graphs hiển thị progress theo thời gian
- [ ] Share attempt result với bạn bè

## 🔍 Testing Checklist

### Manual Testing
- [ ] Truy cập podcast đã làm bài (có attempts)
- [ ] Xem section "Lịch sử làm bài" hiển thị đúng
- [ ] Click "Xem tất cả" để expand danh sách
- [ ] Kiểm tra badges "Mới nhất" và "Điểm cao nhất" hiển thị đúng
- [ ] Click "Xem chi tiết" trên một attempt
- [ ] Kiểm tra modal hiển thị đầy đủ thông tin
- [ ] Kiểm tra câu đúng hiển thị màu xanh, sai hiển thị màu đỏ
- [ ] Đóng modal và kiểm tra state reset
- [ ] Test với podcast chưa làm bài (không có attempts)
- [ ] Test responsive trên mobile/tablet

### Edge Cases
- [ ] Podcast chỉ có 1 attempt
- [ ] Podcast có nhiều attempts cùng điểm số
- [ ] Attempt không có timeSpent
- [ ] Gaps array rỗng
- [ ] Very long transcript/answers

## 📝 API Dependencies

### Backend Endpoints Đã Sử Dụng
```
GET /private/v1/podcasts/:id
  → Trả về podcast với gaps included

GET /private/v1/podcasts/:podcastId/attempts
  → Trả về danh sách attempts của user cho podcast này
```

### Backend Data Requirements
- `podcast.gaps[]` phải include: `id`, `orderNo`, `answer`
- `attempt[]` phải include: tất cả fields trong `PodcastAttemptItemData`

## 🚀 Deployment Notes

### Build
```bash
cd englishWeb
npm run build
# ✓ Build successful - no errors
```

### Environment
- Không cần thêm env variables mới
- Sử dụng existing `VITE_API_URL`

### Migration
- Không cần database migration
- Feature hoạt động với data hiện có

## 📚 References

**Similar Implementation**: `englishWeb/src/pages/AssignmentResultPage.tsx` (lines 330-397)
- Đã tham khảo cách hiển thị submission history trong Assignment
- Adapt cho podcast context với improvements

**Related Components**:
- `CommentSection` - cùng pattern component nhỏ, clean
- `MediaPlayer` - tham khảo props typing

**Icons Source**: [Lucide React](https://lucide.dev/)

## 🎓 Code Quality

- **Clean Code**: Chia nhỏ thành 3 components riêng biệt
- **Type Safety**: Đầy đủ TypeScript types, không dùng `any` trừ mapping data
- **Reusability**: Components có thể reuse cho tương lai
- **Maintainability**: Code dễ đọc, có comments rõ ràng
- **Performance**: Chỉ render khi có data, lazy load modal
- **Accessibility**: Semantic HTML, proper button/modal handling

---

**Tác giả**: AI Agent
**Review**: Cần review bởi team trước khi merge
**Status**: ✅ Ready for Testing

