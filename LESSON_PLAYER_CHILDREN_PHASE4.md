# 🎮 Phase 4: Quiz Activity (Battle Arena)

**Status:** ✅ COMPLETE
**Date:** 2024
**Component:** `QuizActivity.tsx` (527 lines)

---

## 📋 Overview

Phase 4 introduces a **Battle Arena Quiz** activity with timer-based challenges, power-ups, combo system, and explosive visual feedback. Kids answer questions under time pressure while managing strategic power-ups to maximize their score.

---

## 🎯 Core Features

### 1. **Battle Arena Theme**
- ⚔️ Gladiator/combat aesthetic with gradient backgrounds
- 🏆 Trophy and sword iconography
- ⚡ Dynamic particle effects and explosions
- 🔥 Combo flame indicators

### 2. **Timer System**
```typescript
// Color-coded urgency
timeLeft > 10 ? 'green' : timeLeft > 5 ? 'yellow' : 'red'

// Time bonus scoring
const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 50)
```

### 3. **Power-Up System**
4 strategic power-ups (single-use per quiz):

| Power-Up | Icon | Effect | Strategy |
|----------|------|--------|----------|
| **Freeze Time** | ⏸️ | Add 10 seconds | Use on hard questions |
| **Remove 2** | 💡 | Eliminate 2 wrong answers | 50/50 chance boost |
| **2x Points** | ✨ | Double next question points | Combine with high-value questions |
| **Skip** | ⏭️ | Skip current question | Bail out of tough questions |

### 4. **Combo System**
- Every **3 consecutive correct** answers triggers combo
- Multipliers: 2x → 3x → 4x (caps at 4x)
- Visual flame indicators show combo level
- Resets on wrong answer

### 5. **Difficulty Levels**
```typescript
type Difficulty = 'easy' | 'medium' | 'hard'

// Points & Time by Difficulty
easy:   100 points, 15s
medium: 150 points, 12s
hard:   200 points, 10s
```

### 6. **Explosion Effects**
Wrong answers trigger:
- 💥 Red explosion animation
- 20 particle sparkles flying out
- Screen shake effect
- Combo reset

---

## 📦 Component Architecture

### Props Interface
```typescript
interface QuizActivityProps {
  questions: QuizQuestion[]
  onComplete: (score: number, accuracy: number) => void
  onAddXP: (amount: number) => void
  onAddCoins: (amount: number) => void
  onPlaySound: (sound: SoundType) => void
}
```

### State Machine
```
ready → playing → complete
         ↓
    (per question cycle)
    unanswered → answered → next question
```

### Core State
```typescript
currentQuestionIndex: number
selectedAnswer: number | null
isAnswered: boolean
score: number
correctCount: number
combo: number
timeLeft: number
gameState: 'ready' | 'playing' | 'complete'
powerUps: PowerUp[]
activePowerUp: string | null
eliminatedOptions: number[]
showExplosion: boolean
```

---

## 🎨 UI Components

### 1. Ready Screen
```tsx
// Arena intro with gradient background
<motion.div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600">
  <Swords icon />
  <Trophy icon />
  Start Quiz button
  Difficulty badges
</motion.div>
```

### 2. Question Screen
**Header:**
- Timer bar (color-coded by urgency)
- Progress indicator (2/8)
- Score display with coins

**Power-Ups Row:**
- 4 power-up buttons
- Active state indicator
- Tooltip on hover

**Question Card:**
- Question text (2xl font)
- 4 option buttons in grid
- Eliminated options shown as disabled
- Selected answer highlighted

**Combo Display:**
- Flame icons showing combo level
- "3 COMBO!" overlay on trigger
- Multiplier badge

### 3. Results Screen
```tsx
// Victory celebration
Final Score: {score} coins
Accuracy: {accuracy}%
Correct: {correctCount}/{total}

// Performance metrics
Time Bonus: +{timeBonus}
Combo Max: {maxCombo}x
Power-ups Used: {usedCount}

// Play Again button
```

---

## 🔄 Game Flow

### Quiz Lifecycle
```typescript
1. Ready State
   ↓ [Start Quiz]
2. Load First Question
   ↓ [Start Timer]
3. Playing State
   - User can select answer
   - User can activate power-ups
   - Timer counts down
   ↓ [Submit Answer]
4. Answer Feedback
   - Correct: +XP, +Coins, +Combo
   - Wrong: Explosion, Reset Combo
   ↓ [Next Question]
5. Repeat 3-4 until all questions done
   ↓
6. Complete State
   - Calculate final score
   - Show results
   - Award bonuses
```

### Timer Management
```typescript
useEffect(() => {
  if (gameState === 'playing' && !isAnswered && timeLeft > 0) {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }

  // Auto-submit on timeout
  if (timeLeft === 0 && !isAnswered) {
    handleSubmit()
  }
}, [gameState, isAnswered, timeLeft])
```

---

## ⚡ Power-Up Mechanics

### 1. Freeze Time
```typescript
case 'freeze':
  setTimeLeft(prev => prev + 10)
  setActivePowerUp('freeze')
  setTimeout(() => setActivePowerUp(null), 1000)
```

### 2. Remove 2
```typescript
case 'hint':
  const wrongOptions = options
    .map((_, i) => i)
    .filter(i => i !== correctAnswer)
  const toEliminate = wrongOptions
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  setEliminatedOptions(toEliminate)
```

### 3. Double Points
```typescript
case 'double':
  setActivePowerUp('double')
  // Applied in handleSubmit scoring
  const finalPoints = isCorrect && activePowerUp === 'double'
    ? points * 2
    : points
```

### 4. Skip Question
```typescript
case 'skip':
  setIsAnswered(true)
  // Move to next after delay
  setTimeout(() => moveToNextQuestion(), 1500)
```

---

## 🎭 Animations

### Framer Motion Patterns

**1. Explosion Effect**
```tsx
{showExplosion && (
  <motion.div
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: 3, opacity: 0 }}
    className="absolute inset-0 bg-red-500 rounded-3xl"
  />

  {Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      animate={{
        x: [0, Math.random() * 400 - 200],
        y: [0, Math.random() * 400 - 200],
        opacity: [1, 0]
      }}
      transition={{ duration: 1 }}
      className="absolute text-4xl"
    >
      💥
    </motion.div>
  ))}
)}
```

**2. Combo Trigger**
```tsx
{combo > 0 && combo % 3 === 0 && (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1.5, 1] }}
    className="text-6xl font-black"
  >
    🔥 {combo} COMBO! 🔥
  </motion.div>
)}
```

**3. Timer Bar Pulse**
```tsx
<motion.div
  animate={timeLeft <= 5 ? { scale: [1, 1.05, 1] } : {}}
  transition={{ repeat: Infinity, duration: 0.5 }}
>
  Timer: {timeLeft}s
</motion.div>
```

---

## 📊 Scoring System

### Point Calculation
```typescript
const basePoints = currentQuestion.points // 100/150/200
const comboMultiplier = Math.floor(combo / 3) + 1 // 1x-4x max
const timeBonus = Math.floor((timeLeft / timeLimit) * 50) // 0-50
const doublePowerUp = activePowerUp === 'double' ? 2 : 1

finalScore = (basePoints * comboMultiplier * doublePowerUp) + timeBonus
```

### Accuracy Calculation
```typescript
const accuracy = Math.round((correctCount / totalQuestions) * 100)
```

### Rewards
- **XP:** 50 per correct answer
- **Coins:** Equals final score
- **Bonus XP:** 100 on quiz completion

---

## 🎯 Mock Data Structure

```typescript
const MOCK_QUIZ_QUESTIONS = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1, // Index of correct option
    difficulty: 'easy',
    timeLimit: 15,
    points: 100,
  },
  // ... 8 questions total
  // Mix of easy (15s), medium (12s), hard (10s)
]
```

---

## 🔌 Integration

### In ActivitiesPage.tsx
```typescript
// 1. Import
import { QuizActivity } from '../components/learn-children/activities/QuizActivity'

// 2. Activity type
type ActivityType = 'menu' | 'vocab' | 'pronunciation' | 'listening' | 'speaking' | 'quiz'

// 3. Handler
const handleQuizComplete = (score: number, accuracy: number) => {
  setCharacterMessage(`Chiến thắng! Độ chính xác: ${accuracy}%! ⚔️`)
  playSound('celebration')
  addCoins(score)
}

// 4. Render
{currentActivity === 'quiz' && (
  <QuizActivity
    questions={MOCK_QUIZ_QUESTIONS}
    onComplete={handleQuizComplete}
    onAddXP={addXP}
    onAddCoins={addCoins}
    onPlaySound={playSound}
  />
)}

// 5. Menu Card
<motion.button onClick={() => handleActivitySelect('quiz')}>
  <Swords icon />
  Battle Arena
  ⚔️ Quiz chiến đấu
</motion.button>
```

---

## 🚀 Phase 4 vs Previous Phases

| Feature | Phase 2 | Phase 3 | **Phase 4** |
|---------|---------|---------|------------|
| Activity Type | Word Games | Story/Conversation | **Quiz/Battle** |
| Time Pressure | ❌ | Partial | **✅ Full** |
| Power-ups | ❌ | ❌ | **✅ 4 Types** |
| Combo System | ❌ | ❌ | **✅ Multipliers** |
| Explosions | ❌ | ❌ | **✅ Particle FX** |
| Difficulty Levels | Manual | Implicit | **✅ Easy/Med/Hard** |
| Score Strategy | Linear | Linear | **✅ Strategic** |

---

## 🎮 Gameplay Strategy

### Optimal Power-Up Usage
1. **Early Game:** Save power-ups for hard questions
2. **Mid Game:** Use Remove 2 on medium questions to maintain combo
3. **Late Game:** Activate 2x Points on high-value questions
4. **Emergency:** Freeze Time when combo is active and question is hard
5. **Bail Out:** Skip only if combo is already broken

### Combo Maintenance
- Prioritize accuracy over speed to build combo
- Use Hint power-up at 2 correct to secure combo trigger
- Don't rush on easy questions - combo worth more than time bonus

### Score Maximization
```
Max Score Example:
Hard question (200pts)
  × 4x combo
  × 2x power-up
  + 50 time bonus
= 1,650 points!
```

---

## 🐛 Known Limitations

1. **Mock Questions:** Only 8 hardcoded questions
2. **No API:** Question data should come from backend
3. **No Persistence:** Quiz progress not saved
4. **Single Attempt:** Can't retry failed questions
5. **No Leaderboard:** Scores not tracked globally

---

## ✅ Testing Checklist

- [x] Component renders without errors
- [x] Timer counts down correctly
- [x] Power-ups activate and disable properly
- [x] Combo system increments correctly
- [x] Explosions trigger on wrong answers
- [x] Scoring calculation accurate
- [x] Results screen shows correct data
- [x] XP and coins awarded properly
- [x] Sound effects play on actions
- [x] Responsive on mobile/tablet

---

## 🔮 Future Enhancements

### Phase 5 Ideas
1. **Question Categories:** Math, Science, History, English
2. **Multi-Player Mode:** Real-time quiz battles
3. **Power-Up Shop:** Buy more power-ups with coins
4. **Daily Challenges:** Special quiz modes
5. **Achievement System:** Unlock badges for milestones

### Advanced Features
- **AI-Generated Questions:** Dynamic difficulty adjustment
- **Voice Questions:** Listen and answer
- **Image-Based Questions:** Visual learning
- **Leaderboards:** Global/classroom rankings
- **Tournament Mode:** Bracket-style competitions

---

## 📝 Summary

**Phase 4 Success Metrics:**
- ✅ 527 lines of battle-themed quiz code
- ✅ 4 strategic power-ups implemented
- ✅ Combo system with 4x multipliers
- ✅ Timer with color-coded urgency
- ✅ Explosion particle effects
- ✅ 8 mock questions (easy/medium/hard)
- ✅ Full integration with ActivitiesPage
- ✅ 0 TypeScript errors
- ✅ Responsive design

**Next:** Phase 5 - Mini Games (Word Search, Memory, Crossword, Jigsaw) 🎯

---

**Created:** Phase 4 Complete
**File:** `src/components/learn-children/activities/QuizActivity.tsx`
**Lines:** 527
**Status:** Production Ready (mock data)
