# Podcast Create Page - Refactor V2 (FINAL)

## 🎯 Yêu cầu từ User

> "Nhập nội dung transcript với bước upload phải gộp lại. Bước 2 trước bước 3 vì 2 cái đó dính với nhau. Ví dụ audio thuần thì phải nhập transcript trước mới dịch ra được audio."

✅ **Đã fix theo đúng logic!**

---

## ✨ Cấu trúc mới (4 steps)

### Bước 1: Thông tin cơ bản
- Tiêu đề podcast
- Mô tả ngắn

### Bước 2: Nội dung & Media ⭐ (GỘP LẠI)
**Thứ tự logic đúng:**
1. **Nhập transcript TRƯỚC** (textarea ở trên)
2. **Chọn media type**: Audio hay Video
3. **Tạo/upload media SAU**:
   - **Audio - Upload**: Upload file MP3/WAV (cần transcript match)
   - **Audio - Generate**: Tạo audio TTS từ transcript ở trên ⬆️
   - **Video**: Upload video → auto extract transcript

**Tại sao đúng?**
- ✅ Generate audio CẦN transcript trước
- ✅ Upload audio thuần CẦN transcript để match
- ✅ Upload video TỰ ĐỘNG điền transcript (optional manual edit)

### Bước 3: Tạo gaps (Chỗ trống)
- Preview nội dung hiện tại
- Auto-generate gaps:
  - Theo độ khó (40%-90%)
  - Hoặc theo số lượng cụ thể
- Preview với highlight vàng
- Có thể quay lại bước 2 để chỉnh thủ công `[từ]`

### Bước 4: Hoàn tất
- Category (Danh mục)
- Difficulty (Độ khó)
- Tags (Thẻ từ khóa)
- Thumbnail (Ảnh đại diện)

---

## 📂 Components mới

```
src/components/podcast/create/
├── StepIndicator.tsx              (Unchanged)
├── BasicInfoForm.tsx              (Unchanged)
├── MediaAndContentForm.tsx        ⭐ NEW - Gộp media + transcript
├── GapsForm.tsx                   ⭐ NEW - Riêng phần tạo gaps
└── MetadataForm.tsx               (Unchanged)
```

### Deleted/Replaced
- ❌ `MediaUploadForm.tsx` → replaced by `MediaAndContentForm.tsx`
- ❌ `ContentForm.tsx` → split thành `MediaAndContentForm` + `GapsForm`

---

## 🎨 UI Flow chi tiết

### Step 2: Media & Content (Chi tiết)

```
┌─────────────────────────────────────────┐
│  📝 Nội dung & Media                    │
├─────────────────────────────────────────┤
│                                         │
│  🔘 Audio  🔘 Video                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ TRANSCRIPT (textarea)              │ │
│  │ Nhập văn bản tiếng Anh...         │ │
│  │ (Required - nhập TRƯỚC)           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ MEDIA UPLOAD/GENERATE              │ │
│  │                                    │ │
│  │ [Audio Mode]                       │ │
│  │  • Upload File                     │ │
│  │  • Generate từ Text ⬆️             │ │
│  │                                    │ │
│  │ [Video Mode]                       │ │
│  │  • Upload Video                    │ │
│  │  • Auto extract → fill transcript │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Gaps Form

```
┌─────────────────────────────────────────┐
│  ✨ Tạo chỗ trống                       │
├─────────────────────────────────────────┤
│                                         │
│  📄 Preview nội dung:                   │
│  ┌───────────────────────────────────┐ │
│  │ The AI is transforming...         │ │
│  │ (shows current content)           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⚙️ Tự động tạo gaps:                  │
│  [Theo độ khó] [Theo số lượng]         │
│  [Độ khó ▼] [Khả dụng: 42 từ] [Tạo]   │
│                                         │
│  💡 Hoặc quay lại bước 2 để dùng [từ]  │
│                                         │
│  📊 Thống kê: 150 từ | ~2 phút         │
└─────────────────────────────────────────┘
```

---

## 🔄 So sánh Before/After

| Aspect | V1 (Wrong) | V2 (Fixed) ✅ |
|--------|-----------|---------------|
| **Step 2** | Media only | Media + Transcript |
| **Step 3** | Transcript + Gaps | Gaps only |
| **Transcript position** | Bước 3 | Bước 2 (trước media) |
| **Logic flow** | ❌ Upload → Transcript | ✅ Transcript → Generate |
| **Generate audio** | ❌ Không có text | ✅ Dùng transcript ở trên |

---

## ✅ Validation theo step

| Step | Validation |
|------|-----------|
| 1 | Có tiêu đề |
| 2 | Có transcript + có media (audio/video) |
| 3 | Không bắt buộc (có thể skip tạo gaps) |
| 4 | Không bắt buộc |

---

## 🚀 Build & Test

### Build Status
```bash
✓ npm run build
✓ No TypeScript errors
✓ No linter errors
✓ Built in 4.36s
```

### Files Changed
```
Modified:
- src/pages/CreatePodcastPageWizard.tsx (updated imports & flow)

Created:
- src/components/podcast/create/MediaAndContentForm.tsx (456 lines)
- src/components/podcast/create/GapsForm.tsx (278 lines)

Deleted (can delete after testing):
- src/components/podcast/create/MediaUploadForm.tsx
- src/components/podcast/create/ContentForm.tsx
```

---

## 📝 Testing Checklist

### Step 2: Media & Content
- [ ] Nhập transcript → text hiển thị OK
- [ ] **Audio - Generate mode:**
  - [ ] Nhập transcript → nhấn "Tạo Audio" → audio preview hiện
  - [ ] Không nhập transcript → nhấn "Tạo Audio" → warning
- [ ] **Audio - Upload mode:**
  - [ ] Upload MP3 → audio preview
  - [ ] Nhớ nhập transcript match với audio
- [ ] **Video mode:**
  - [ ] Upload video → progress bar
  - [ ] Video success → transcript tự động điền
  - [ ] Có thể edit transcript sau khi auto-fill

### Step 3: Gaps
- [ ] Preview hiển thị nội dung từ step 2
- [ ] Auto-generate theo độ khó → gaps được tạo
- [ ] Auto-generate theo số lượng → gaps được tạo
- [ ] Preview gaps với highlight vàng
- [ ] Thống kê số từ & thời lượng đúng

### Navigation
- [ ] Quay lại step 2 từ step 3 → content giữ nguyên
- [ ] Tiếp tục từ step 2 → step 3 → validation OK
- [ ] Submit ở step 4 → podcast được tạo

---

## 💡 Key Improvements

1. ✅ **Logic đúng**: Transcript trước → Media sau
2. ✅ **UX tốt hơn**: Gộp 2 phần liên quan vào 1 bước
3. ✅ **Maintainable**: Component nhỏ, dễ sửa
4. ✅ **Clear flow**: 4 steps rõ ràng, không nhầm lẫn

---

## 🎯 Next Steps (Optional)

- [ ] Add animation khi switch steps (framer-motion)
- [ ] Auto-save draft to localStorage
- [ ] Mobile responsive optimization
- [ ] Add tooltips/help text

---

**Updated:** 2025-11-06
**Status:** ✅ Ready for testing
**Build:** ✅ Success

