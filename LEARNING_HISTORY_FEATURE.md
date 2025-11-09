# Learning History Feature - Lịch Sử Học Tập Tổng Hợp

> **Ngày tạo**: 2025-11-06
> **Mô tả**: Trang xem tổng hợp toàn bộ lịch sử học podcast của user

## 📋 Tổng Quan

Tính năng mới cho phép user xem **TẤT CẢ** lịch sử học podcast ở một nơi, không cần vào từng podcast riêng lẻ.

### ✨ Features Chính

- 📊 **Stats tổng hợp**: Tổng số bài, số lần làm, điểm trung bình, tổng thời gian học
- 🗓️ **Lọc theo thời gian**: All / Tuần này / Tháng này / Năm này
- 📋 **Danh sách chi tiết**: Tất cả podcasts đã học với điểm số, số lần làm
- 🔍 **Quick access**: Click vào podcast để xem chi tiết
- 🎨 **Beautiful UI**: Gradient header, color-coded scores, responsive

## 🗺️ Navigation

User có thể truy cập từ 2 nơi:

### 1. Từ Profile Page
```
Profile > Tab "Overview" > Nút "Xem lịch sử học tập"
```

### 2. Từ Listening Practice Page
```
Listening Practice > Header > Nút "Lịch sử"
```

## 🎯 Route

```
/listening-practice/my-history
```

## 📁 Cấu Trúc Files

### Components Mới

```
englishWeb/src/components/learning-history/
├── LearningStatsOverview.tsx      # Stats cards (4 cards tổng hợp)
├── PodcastHistoryItem.tsx         # Item hiển thị 1 podcast trong list
└── index.ts                        # Exports
```

### Pages Mới

```
englishWeb/src/pages/
└── MyLearningHistoryPage.tsx      # Page chính
```

### API & Hooks

```
englishWeb/src/services/
└── podcastAttempt.api.ts          # Thêm getAllUserAttempts()

englishWeb/src/hooks/
└── podcastAttempt.hooks.ts        # Thêm useAllUserAttempts()
```

### Routes

```
englishWeb/src/
└── App.tsx                         # Thêm route mới
```

## 🎨 UI Components Detail

### 1. LearningStatsOverview

**Purpose**: Hiển thị 4 cards thống kê tổng quan

**Stats**:
- 📚 **Tổng số bài**: Số podcast đã học
- 📈 **Số lần làm**: Tổng attempts
- 🏆 **Điểm trung bình**: Average score (color-coded)
- ⏱️ **Thời gian học**: Tổng thời gian (format: Xh Ym)

**Colors**:
- Blue: Tổng số bài
- Purple: Số lần làm
- Green/Yellow/Red: Điểm trung bình (theo performance)
- Orange: Thời gian học

### 2. PodcastHistoryItem

**Purpose**: Card hiển thị thông tin 1 podcast

**Thông tin hiển thị**:
- Title & Category badge
- Difficulty badge (color-coded)
- Latest score (với background color theo performance)
- Best score (với background color theo performance)
- Total time spent
- Total attempts count
- Latest attempt date (relative time)
- Arrow icon để indicate clickable

**Interactions**:
- Hover: Shadow tăng, border chuyển xanh
- Click: Navigate to podcast detail page

### 3. MyLearningHistoryPage

**Layout**:

```
┌─────────────────────────────────────────────┐
│  Gradient Header (Blue to Purple)          │
│  ├─ Back button                            │
│  ├─ Icon + Title                           │
│  └─ Description                             │
├─────────────────────────────────────────────┤
│  Stats Overview (4 cards grid)              │
├─────────────────────────────────────────────┤
│  Filters Card                               │
│  [All] [Tuần này] [Tháng này] [Năm này]    │
├─────────────────────────────────────────────┤
│  History List                               │
│  ├─ Podcast 1                              │
│  ├─ Podcast 2                              │
│  └─ ...                                     │
└─────────────────────────────────────────────┘
```

**States**:
- **Loading**: Spinner với text "Đang tải lịch sử học tập..."
- **Empty**: Calendar icon + message + CTA button
- **With Data**: Full list với số lượng podcasts

**Filtering Logic**:
- Group attempts by podcast
- Calculate stats cho mỗi podcast (best score, latest, total time)
- Sort by latest attempt date (newest first)
- Filter by selected period

## 🔧 API Integration

### Backend Endpoint (CẦN TẠO)

```typescript
GET /private/v1/podcast-attempts/my-history
```

**Query Params**:
- `page?: number`
- `limit?: number`
- `status?: 'in_progress' | 'completed' | 'abandoned'`

**Response Structure**:
```typescript
{
  data: [
    {
      attemptId: string
      attemptNo: number
      podcastId: string
      podcast: {
        id: string
        title: string
        category: string
        difficulty: string
      }
      status: string
      scorePercent: number
      correctCount: number
      totalQuestions: number
      timeSpent: number
      createdAt: string
      answers: Record<string, string>
    },
    ...
  ],
  total: number,
  page: number,
  totalPages: number
}
```

### Frontend Hook

```typescript
const { data, isLoading } = useAllUserAttempts({
  status: 'completed',
  limit: 100
})
```

## 📊 Data Flow

```
1. Page loads
   ↓
2. useAllUserAttempts() fetches data
   ↓
3. Group attempts by podcast
   ↓
4. Calculate stats for each podcast
   ↓
5. Apply period filter
   ↓
6. Render list
```

## ⚠️ Important Notes

### Backend TODO

**Backend chưa có API `/podcast-attempts/my-history`!**

Cần tạo:
1. Controller method trong `PodcastController`
2. Service method trong `PodcastService`
3. Query Prisma lấy tất cả attempts của user với podcast info

**Tham khảo**: `getPodcastAttempts()` hiện tại trong `podcast.service.ts` (line 455-477)

**Suggested Implementation**:

```typescript
// In podcast.service.ts
async getAllUserAttempts(
  userId: string,
  params?: {
    page?: number
    limit?: number
    status?: 'in_progress' | 'completed' | 'abandoned'
  }
) {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 50
  const skip = (page - 1) * limit

  const where: any = { userId }
  if (params?.status) {
    where.status = params.status
  }

  const [attempts, total] = await Promise.all([
    this.prisma.podcastAttempt.findMany({
      where,
      include: {
        podcast: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.podcastAttempt.count({ where }),
  ])

  return {
    data: attempts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}
```

### Frontend Fallback

Hiện tại frontend đã sẵn sàng nhưng **sẽ hiển thị empty state** vì backend chưa có API.

Khi backend API ready:
- Frontend sẽ tự động hoạt động
- Không cần thay đổi code frontend

## 🎨 Design Tokens

### Colors
- **Blue**: `#3B82F6` (primary, info)
- **Purple**: `#A855F7` (secondary)
- **Green**: `#10B981` (success, high score ≥80%)
- **Yellow**: `#F59E0B` (warning, medium score 60-79%)
- **Red**: `#EF4444` (danger, low score <60%)
- **Orange**: `#F97316` (time/duration)
- **Gray**: `#6B7280` (text), `#F9FAFB` (bg)

### Typography
- **H1**: `text-3xl font-bold` (page title)
- **H2**: `text-xl font-semibold` (section headings)
- **H3**: `text-lg font-semibold` (card titles)
- **Body**: `text-sm sm:text-base` (responsive)
- **Caption**: `text-xs` (metadata, timestamps)

### Spacing
- **Page padding**: `px-4 sm:px-6 lg:px-8 py-8`
- **Card gap**: `gap-4` (16px)
- **Section margin**: `mb-6 sm:mb-8`

## 🚀 Usage Examples

### User Journey 1: Từ Profile

```
1. User vào /profile
2. Click "Xem lịch sử học tập"
3. Navigate to /listening-practice/my-history
4. Xem stats và list podcasts
5. Filter theo "Tuần này"
6. Click vào podcast để xem detail
```

### User Journey 2: Từ Listening Practice

```
1. User vào /listening-practice
2. Click nút "Lịch sử" ở header
3. Navigate to /listening-practice/my-history
4. Xem tất cả progress
5. Click podcast để làm lại hoặc review
```

## ✅ Testing Checklist

### Manual Testing
- [ ] Truy cập từ ProfilePage button
- [ ] Truy cập từ ListeningPracticePage button
- [ ] Hiển thị loading state khi fetch data
- [ ] Hiển thị empty state khi chưa có data
- [ ] Stats cards hiển thị đúng số liệu
- [ ] Filter All/Week/Month/Year hoạt động
- [ ] Podcast items hiển thị đầy đủ info
- [ ] Color coding đúng theo score
- [ ] Click item navigate đến detail page
- [ ] Back button hoạt động
- [ ] Responsive trên mobile/tablet
- [ ] Gradient header hiển thị đẹp

### Edge Cases
- [ ] User chưa làm podcast nào
- [ ] User chỉ có 1 podcast
- [ ] User có nhiều podcasts (scroll)
- [ ] Podcast không có timeSpent
- [ ] Very long podcast titles
- [ ] Recent timestamps (vừa xong, X phút trước)

## 📦 Dependencies

**No new dependencies!** Sử dụng existing:
- `lucide-react` - Icons
- `framer-motion` - Animations (nếu cần)
- `@tanstack/react-query` - Data fetching
- `react-router-dom` - Navigation

## 🔮 Future Enhancements

### Phase 2
- [ ] Export history to PDF/CSV
- [ ] Charts/graphs theo thời gian
- [ ] Compare progress between time periods
- [ ] Achievement badges
- [ ] Share history với friends

### Phase 3
- [ ] AI insights: "You improved 15% this month!"
- [ ] Recommendations based on weak areas
- [ ] Streak tracking
- [ ] Goals setting & tracking

## 📝 Notes

1. **Performance**: Với 100+ podcasts, consider pagination hoặc virtual scrolling
2. **Caching**: React Query tự động cache 5 phút
3. **SEO**: Có thể thêm meta tags cho better indexing
4. **Analytics**: Có thể track "history page views" để measure engagement

## 🐛 Known Issues

1. ⚠️ **Backend API chưa có** - Frontend sẽ hiển thị empty state
2. Mock data structure có thể khác với actual API response
3. Relative time (vừa xong, X phút trước) chỉ accurate nếu device time đúng

## 📞 Support

Nếu gặp vấn đề:
1. Check browser console for errors
2. Verify API endpoint exists và returns correct data
3. Check React Query DevTools
4. Review network tab trong Chrome DevTools

---

**Status**: ✅ Frontend Complete, ⏳ Waiting for Backend API

**Build**: ✅ Passed (no errors, no warnings)

**Ready for**: Testing khi backend API ready


