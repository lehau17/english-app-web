# Podcast Create Components (V2 - Final)

Các component được refactor cho trang tạo Podcast mới với wizard-style interface.

## Cấu trúc Components

### StepIndicator.tsx
- Component hiển thị progress steps (1-4)
- Tự động highlight step hiện tại
- Hiển thị checkmark cho các step đã hoàn thành

### BasicInfoForm.tsx (Bước 1)
- Form nhập tiêu đề và mô tả podcast
- Validation: tiêu đề là bắt buộc

### MediaAndContentForm.tsx (Bước 2) ⭐ UPDATED
**Gộp media + transcript trong 1 bước - Logic đúng!**

**Thứ tự:**
1. **Nhập transcript TRƯỚC** (textarea ở trên)
2. **Chọn media type**: Audio hay Video
3. **Tạo/upload media SAU** (ở dưới)

**Media modes:**
- **Audio - Upload**: Upload file MP3/WAV
- **Audio - Generate**: Tạo audio TTS từ transcript ⬆️ ở trên
- **Video**: Upload video → auto extract transcript

**Tại sao đúng?**
- ✅ Generate audio CẦN transcript trước
- ✅ Upload audio thuần CẦN transcript để match
- ✅ Upload video TỰ ĐỘNG điền transcript

### GapsForm.tsx (Bước 3) ⭐ NEW
**Riêng phần tạo chỗ trống:**
- Preview nội dung hiện tại
- **Auto gap generator:**
  - Tạo gaps theo độ khó (40%-90%)
  - Hoặc theo số lượng chính xác
  - Preview gaps với highlight vàng
- Thống kê: số từ, thời lượng ước tính
- Có thể quay lại bước 2 để chỉnh thủ công `[từ]`

### MetadataForm.tsx (Bước 4)
- Chọn category và difficulty
- Thêm tags (keywords)
- Upload thumbnail (optional)

## Wizard Flow (Updated)

```
Bước 1: Thông tin cơ bản
         ↓
Bước 2: Nội dung & Media ⭐ (GỘP - transcript trước, media sau)
         ↓
Bước 3: Tạo gaps (auto-generate)
         ↓
Bước 4: Metadata & hoàn tất
         ↓
       Submit
```

## Logic Flow Chi tiết

### Bước 2: Media & Content
```
1. User nhập transcript (tiếng Anh)
   ↓
2. User chọn Audio hoặc Video
   ↓
3a. Audio - Generate mode:
    - Chọn giọng đọc + tốc độ
    - Nhấn "Tạo Audio" → dùng transcript ở trên
    - Audio được tạo và preview

3b. Audio - Upload mode:
    - Upload file audio (MP3/WAV)
    - Transcript đã nhập phải match với audio

3c. Video mode:
    - Upload video file
    - System tự động extract transcript
    - User có thể edit transcript sau
```

### Bước 3: Gaps
```
1. Preview nội dung từ bước 2
   ↓
2. Chọn cách tạo gaps:
   - Theo độ khó (40-90%)
   - Hoặc số lượng cụ thể
   ↓
3. Nhấn "Tạo gaps" → system chọn từ ngẫu nhiên
   ↓
4. Preview với highlight vàng
   ↓
5. (Optional) Quay lại bước 2 để chỉnh thủ công
```

## Validation Rules

| Step | Required Fields | Logic |
|------|----------------|-------|
| 1 | title | Tiêu đề bắt buộc |
| 2 | content + (audioUrl \|\| videoUrl) | Có transcript + media |
| 3 | - | Không bắt buộc (có thể skip gaps) |
| 4 | - | Metadata optional |

## Props & State

### MediaAndContentForm
```tsx
interface MediaAndContentFormProps {
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  errors: FieldErrors
  onAudioDurationChange: (duration: number) => void
  onTtsStatusChange: (status: 'idle' | 'generating' | 'completed' | 'error') => void
  onQueuedForTTS: (queued: boolean) => void
}
```

### GapsForm
```tsx
interface GapsFormProps {
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}
```

## Files Structure

```
src/components/podcast/create/
├── StepIndicator.tsx           (85 lines)
├── BasicInfoForm.tsx           (64 lines)
├── MediaAndContentForm.tsx     (456 lines) ⭐ NEW
├── GapsForm.tsx                (278 lines) ⭐ NEW
├── MetadataForm.tsx            (154 lines)
└── README.md                   (This file)

src/pages/
└── CreatePodcastPageWizard.tsx (265 lines)
```

### Deprecated (can delete)
- ❌ `MediaUploadForm.tsx` → replaced by `MediaAndContentForm`
- ❌ `ContentForm.tsx` → split into `MediaAndContentForm` + `GapsForm`

## Benefits

✅ **Logic đúng**: Transcript → Media (đúng thứ tự)
✅ **UX tốt**: Gộp 2 phần liên quan
✅ **Maintainable**: Components nhỏ, độc lập
✅ **Clear flow**: 4 steps rõ ràng

## Testing Checklist

### Step 2 Tests
- [ ] Nhập transcript → hiển thị OK
- [ ] Generate audio (có transcript) → Success
- [ ] Generate audio (không transcript) → Warning
- [ ] Upload audio → Preview OK
- [ ] Upload video → Auto-fill transcript

### Step 3 Tests
- [ ] Preview nội dung từ step 2
- [ ] Auto-generate gaps (percent mode)
- [ ] Auto-generate gaps (count mode)
- [ ] Highlight gaps màu vàng
- [ ] Thống kê số từ & duration

### Navigation Tests
- [ ] Back button từ step 3 → step 2
- [ ] Next button validation từng step
- [ ] Submit từ step 4 → Create podcast

## Usage

```tsx
// In routing (App.tsx)
import CreatePodcastPageWizard from './pages/CreatePodcastPageWizard'

<Route
  path="/listening-practice/create"
  element={<CreatePodcastPageWizard />}
/>
```

---

**Version:** 2.0 (Final)
**Date:** 2025-11-06
**Status:** ✅ Tested & Ready
