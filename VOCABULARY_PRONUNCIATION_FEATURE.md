# Vocabulary Pronunciation Practice Feature

> **Ngày tạo**: 2025-11-06
> **Mô tả**: Tính năng luyện phát âm từ vựng với AI chấm điểm tự động

## 📋 Tổng Quan

Thêm tính năng **luyện phát âm** vào VocabActivity, cho phép học viên:
- 🎤 Ghi âm phát âm của mình
- 🤖 AI chấm điểm và đưa nhận xét (Gemini + Google Cloud Speech)
- 🔄 Thử lại nhiều lần không giới hạn
- 📊 Xem chi tiết điểm số và feedback

## ✨ Features

### 1. Recording Audio
- **Browser API**: `MediaRecorder` để ghi âm
- **Format**: audio/webm (browser native)
- **Visual Feedback**:
  - Nút mic đỏ + animate pulse khi đang ghi
  - Text "🔴 Đang ghi âm..."
  - Ping animation ở góc nút

### 2. AI Evaluation
- **Backend**: `/private/v1/ai-evaluation/pronunciation`
- **AI Engine**: Gemini AI + Google Cloud Speech-to-Text
- **Metrics**:
  - Overall score (0-100)
  - Accuracy score
  - Fluency score
  - Clarity score
  - Transcript (từ user đọc)
  - Detailed feedback

### 3. Result Display
- **Color-coded scores**:
  - 🟢 Green (≥80%): Xuất sắc!
  - 🟡 Yellow (60-79%): Khá tốt!
  - 🔴 Red (<60%): Cần cải thiện
- **Feedback sections**:
  - Transcript (bạn đã đọc gì)
  - AI comments
  - Detailed metrics (accuracy, fluency, clarity)

### 4. Try Again
- Nút "Thử lại" để ghi âm lại
- Reset state và cho phép record mới
- Không giới hạn số lần thử

## 🎨 UI Components

### Component Structure

```
VocabularyPronunciationPractice
├── Recording Section (blue dashed border)
│   ├── Title & Instructions
│   ├── Mic Button (animated)
│   └── Status Text
│
├── Evaluation Result (color-coded)
│   ├── Score Icon & Number
│   ├── Transcript Box
│   ├── Feedback Box
│   ├── Detailed Metrics
│   └── Try Again Button
│
└── Tips Section (gray background)
    └── Best practices
```

### States

| State | UI Behavior |
|-------|-------------|
| **Idle** | Blue mic button, "Nhấn mic để bắt đầu" |
| **Recording** | Red pulsing mic, "🔴 Đang ghi âm..." |
| **Evaluating** | Gray disabled mic, "⏳ Đang đánh giá..." |
| **Result** | Show score card, hide tips, show "Thử lại" |

## 📁 Files Created/Modified

### New Component
```
englishWeb/src/components/learn/
└── VocabularyPronunciationPractice.tsx  (280 lines)
```

### Modified Files
```
✅ englishWeb/src/pages/LearnPage.tsx
   - Import VocabularyPronunciationPractice
   - Add showPronunciation state to VocabActivity
   - Add "Luyện phát âm" button
   - Add pronunciation section with AnimatePresence
   - Pass activityId prop to VocabActivity
```

## 🔧 Integration

### In VocabActivity

**Added Props**:
```typescript
activityId?: string  // Activity ID for API call
```

**Added States**:
```typescript
const [showPronunciation, setShowPronunciation] = useState(false)
```

**New Button**:
```typescript
{activityId && (
  <button
    onClick={() => setShowPronunciation((v) => !v)}
    className="... bg-blue-600 ..."
  >
    <Mic /> {showPronunciation ? 'Ẩn phát âm' : 'Luyện phát âm'}
  </button>
)}
```

**Pronunciation Section**:
```typescript
<AnimatePresence>
  {showPronunciation && activityId && (
    <motion.div ...>
      <VocabularyPronunciationPractice
        word={it.word}
        activityId={activityId}
      />
    </motion.div>
  )}
</AnimatePresence>
```

## 🎯 API Flow

```
1. User clicks "Luyện phát âm" button
   ↓
2. Pronunciation section expands (with animation)
   ↓
3. User clicks mic button
   ↓
4. Browser requests mic permission
   ↓
5. MediaRecorder starts recording
   ↓
6. User speaks the word
   ↓
7. User clicks mic again to stop
   ↓
8. Audio converts to base64
   ↓
9. POST /private/v1/ai-evaluation/pronunciation
   ↓
10. AI evaluates (Gemini + Google Cloud Speech)
   ↓
11. Result displays with score & feedback
   ↓
12. User can click "Thử lại" to record again
```

## 🤖 Backend API

### Endpoint
```
POST /private/v1/ai-evaluation/pronunciation
```

### Request
```typescript
{
  activityId: string      // Required
  audioBase64: string     // Required (without data URI prefix)
  mimeType: string        // "audio/webm"
  phrase: string          // The target word
}
```

### Response
```typescript
{
  statusCode: 200,
  message: "Pronunciation evaluated successfully",
  data: {
    attemptId: string
    score: number         // 0-100
    feedback: string      // AI comments
    transcript: string    // What user said
    detail: {
      accuracy: number    // 0-100
      fluency: number     // 0-100
      clarity: number     // 0-100
    }
  }
}
```

### AI Services Used
1. **Google Cloud Speech-to-Text**: Transcribe user audio
2. **Gemini AI**: Evaluate pronunciation quality & provide feedback

## 💡 UX Features

### Visual Feedback
- ✅ Recording indicator with pulse animation
- ✅ Loading state during evaluation
- ✅ Color-coded results (green/yellow/red)
- ✅ Smooth expand/collapse animations
- ✅ Clear status messages

### User Guidance
- 📝 Tips section with best practices
- 🔊 "Nghe phát âm" button to hear correct pronunciation
- 🎯 Clear instructions: "Nhấn nút mic và đọc từ: **word**"
- ♻️ Easy retry with "Thử lại" button

### Error Handling
- ❌ Mic permission denied → Toast error
- ❌ API error → Toast error with message
- ❌ Network error → Graceful fallback

## 📱 Browser Compatibility

**MediaRecorder API Support**:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Partial (may need polyfill)
- ⚠️ Mobile browsers: Check compatibility

**Fallbacks**:
- If MediaRecorder not available → Hide pronunciation button
- If mic permission denied → Show error toast

## 🎓 Learning Experience

### Optional Feature
- Feature is **optional** - không bắt buộc để complete activity
- User có thể skip và dùng chỉ "Lật nghĩa" + "Next"
- Pronunciation là thêm điểm cho người muốn luyện

### Gamification
- Score ≥80% → Auto complete after 3s (optional)
- Encourages students to practice until they get good score
- Can try unlimited times

### Accessibility
- Button states clear (enabled/disabled)
- Status text for screen readers
- Keyboard-friendly (existing hotkeys still work)

## 🧪 Testing Checklist

### Manual Testing
- [ ] Click "Luyện phát âm" button → Section expands
- [ ] Click mic → Browser requests permission
- [ ] Allow mic → Recording starts (red pulse)
- [ ] Speak word → Audio captures
- [ ] Click mic again → Recording stops
- [ ] Wait for evaluation → Loading state shows
- [ ] Result displays with score
- [ ] Click "Thử lại" → Can record again
- [ ] Click "Ẩn phát âm" → Section collapses

### Edge Cases
- [ ] Mic permission denied → Error toast
- [ ] No activityId → Button hidden
- [ ] Network error during evaluation → Error handling
- [ ] Very short recording → API handles
- [ ] Background noise → AI still evaluates
- [ ] Wrong word spoken → Low score + feedback

### Cross-browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 📊 Performance

**Recording**:
- Lightweight: Only stores audio chunks in memory
- Auto cleanup on unmount
- No storage used

**Evaluation**:
- API call: ~2-5 seconds (depending on audio length)
- Shows loading state during processing
- Non-blocking (user can cancel)

**Bundle Size**:
- +280 lines of code
- No new dependencies (uses browser APIs)
- Minimal impact on bundle size

## 🔒 Security & Privacy

**Audio Handling**:
- Audio recorded in-browser
- Converted to base64 for API transmission
- Not stored permanently (unless backend saves)
- Streams stopped and cleaned up properly

**Permissions**:
- Requires user consent for microphone access
- Clear permission prompts
- Can revoke permission anytime

## 🚀 Deployment

### Environment Variables
No new env vars needed! Uses existing:
- `VITE_API_URL` for API endpoint

### Build
```bash
cd englishWeb
npm run build  # ✅ SUCCESS
```

### Backend Requirements
- ✅ Google Cloud Speech-to-Text API enabled
- ✅ Gemini API key configured
- ✅ Evaluation service running

## 📚 Code Quality

- ✅ **TypeScript**: Full type safety
- ✅ **Clean code**: Single responsibility
- ✅ **Reusable**: Component can be used elsewhere
- ✅ **Accessible**: Clear states and feedback
- ✅ **Performant**: Efficient recording & cleanup
- ✅ **Error handling**: Graceful failures
- ✅ **No linter errors**

## 🔮 Future Enhancements

### Phase 2
- [ ] Phoneme-level feedback (which sounds to improve)
- [ ] Waveform visualization during recording
- [ ] Compare user audio with native speaker
- [ ] Save best attempts for progress tracking

### Phase 3
- [ ] Speech rate analysis
- [ ] Intonation pattern matching
- [ ] Personalized pronunciation exercises
- [ ] Progress chart over time

## 🎬 User Journey

```
1. Student vào lesson → VocabActivity
   ↓
2. Click "Luyện phát âm" button
   ↓
3. Section mở ra với mic button
   ↓
4. Click mic → Allow permission → Recording
   ↓
5. Speak: "Business"
   ↓
6. Click mic lại → Stop → Evaluating...
   ↓
7. Result: 85% - "Xuất sắc! Phát âm rất chuẩn..."
   ↓
8. Click "Thử lại" hoặc move to next word
```

## 📝 Notes

### Best Practices for Students
1. Nói rõ ràng, tốc độ vừa phải
2. Giữ khoảng cách 10-15cm với mic
3. Tránh môi trường ồn
4. Nghe phát âm chuẩn trước khi đọc
5. Thử lại nếu score thấp

### For Developers
- Component is self-contained
- Easy to integrate into other activities
- Uses existing evaluation API
- No additional dependencies

---

**Status**: ✅ **COMPLETED**

**Build**: ✅ Passed (no errors)

**Ready for**: User testing

**Route**: `/learn/:classroomId/:lessonId?activityId=xxx`


