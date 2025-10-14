# 🚀 Quick Start - Phase 2 Activities

## Để test ngay:

### 1. Start Dev Server
```bash
cd englishWeb
npm run dev
```

### 2. Truy cập Activities Page
```
http://localhost:5173/activities/1
```

### 3. Test Word Catcher (Vocab)
1. Click card **"Word Catcher"** (purple gradient)
2. Click **"Start Game!"**
3. Di chuyển **mouse** hoặc **touch** để điều khiển giỏ
4. Bắt từ rơi xuống vào giỏ
5. Build combo để nhận điểm x2, x3, x4...
6. Game over khi miss 5 words

**Tips**:
- Giỏ có glow effect → dễ thấy
- Combo text xuất hiện mỗi 3 catches
- Stars bay ra khi catch thành công
- Click trực tiếp vào word cũng được!

---

### 4. Test Karaoke Hero (Pronunciation)
1. Click card **"Karaoke Hero"** (blue gradient)
2. Click **"Start Practice!"**
3. Click **"Listen to Example"** để nghe mẫu
4. **Hold** button "Hold to Record" và nói từ
5. Release để stop
6. Xem pitch graph + scores
7. Try **"Play Recording"**, **"Retry"**, hoặc **"Next Word"**

**Important**:
- ⚠️ Browser sẽ hỏi permission microphone → click **Allow**
- 📱 iOS Safari cần user gesture trước (click button)
- 🎵 Waveform hiển thị real-time khi record
- ⭐ ≥90% = 3 stars, ≥75% = 2 stars, ≥60% = 1 star

---

## 🎮 Features Demo

### Vocab Activity
- ✅ 8 words fall randomly
- ✅ Combo system with multipliers
- ✅ Particle effects
- ✅ Sound effects (correct, wrong, coin)
- ✅ Miss counter (max 5)

### Pronunciation Activity
- ✅ Real microphone recording
- ✅ 50-bar waveform visualization
- ✅ Pitch graph animation
- ✅ 3-metric scoring breakdown
- ✅ Star celebration effects

---

## 📁 Files Created

```
src/
  components/
    learn-children/
      activities/
        ✅ VocabActivity.tsx          (398 lines)
        ✅ PronunciationActivity.tsx  (550 lines)
  pages/
    ✅ ActivitiesPage.tsx             (283 lines)

docs/
  ✅ LESSON_PLAYER_CHILDREN_PHASE2.md
  ✅ PHASE2_SUMMARY.md
  ✅ PHASE2_QUICKSTART.md (this file)
```

---

## 🎯 What's Next?

Phase 3 sẽ có:
- 🎧 **Listening Activity** - Audio Adventure với story map
- 🎙️ **Speaking Activity** - Talk Show Host với fluency meter
- 🎮 **Quiz Activity** - Battle Arena với power-ups
- 🧩 **Mini Games** - Word Search, Memory Cards, Puzzles

Bạn muốn làm activity nào tiếp theo? 😊

---

## 🐛 Troubleshooting

**Microphone không hoạt động?**
- Kiểm tra browser permissions
- Try Chrome/Edge (best support)
- iOS Safari: click button trước khi record

**Words fall quá nhanh/chậm?**
- Adjust `FALL_SPEED` và `velocity` trong VocabActivity.tsx
- Current: 0.5px per frame, velocity 1-1.5x

**Pronunciation scores không realistic?**
- Hiện tại dùng mock random scores
- Cần integrate AI API cho real analysis
- Check backend docs để integrate

---

**Ready to test!** 🚀 Enjoy Phase 2 activities!
