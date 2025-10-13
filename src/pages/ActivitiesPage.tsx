import { motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Grid3X3,
  Headphones,
  Home,
  MessageSquare,
  Mic,
  Puzzle,
  Search,
  Swords,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatedBackground } from '../components/learn-children/AnimatedBackground'
import { CharacterAvatar } from '../components/learn-children/CharacterAvatar'
import { ProgressSystem } from '../components/learn-children/ProgressSystem'
import useSoundEffects from '../components/learn-children/SoundEffects'
import { CrosswordActivity } from '../components/learn-children/activities/CrosswordActivity'
import { JigsawActivity } from '../components/learn-children/activities/JigsawActivity'
import { ListeningActivity } from '../components/learn-children/activities/ListeningActivity'
import { MemoryCardActivity } from '../components/learn-children/activities/MemoryCardActivity'
import { PronunciationActivity } from '../components/learn-children/activities/PronunciationActivity'
import { QuizActivity } from '../components/learn-children/activities/QuizActivity'
import { SpeakingActivity } from '../components/learn-children/activities/SpeakingActivity'
import { VocabActivity } from '../components/learn-children/activities/VocabActivity'
import { WordSearchActivity } from '../components/learn-children/activities/WordSearchActivity'

// Mock data
const MOCK_VOCAB_WORDS = [
  { id: '1', word: 'Apple', meaning: 'Táo', pronunciation: '/ˈæp.əl/' },
  { id: '2', word: 'Book', meaning: 'Sách', pronunciation: '/bʊk/' },
  { id: '3', word: 'Cat', meaning: 'Mèo', pronunciation: '/kæt/' },
  { id: '4', word: 'Dog', meaning: 'Chó', pronunciation: '/dɒɡ/' },
  { id: '5', word: 'Elephant', meaning: 'Voi', pronunciation: '/ˈel.ɪ.fənt/' },
  { id: '6', word: 'Fish', meaning: 'Cá', pronunciation: '/fɪʃ/' },
  {
    id: '7',
    word: 'Giraffe',
    meaning: 'Hươu cao cổ',
    pronunciation: '/dʒɪˈræf/',
  },
  { id: '8', word: 'House', meaning: 'Nhà', pronunciation: '/haʊs/' },
]

const MOCK_PRONUNCIATION_WORDS = [
  {
    id: '1',
    word: 'Hello',
    phonetic: '/həˈloʊ/',
    example: 'Hello, how are you?',
  },
  {
    id: '2',
    word: 'Thank you',
    phonetic: '/θæŋk juː/',
    example: 'Thank you very much!',
  },
  {
    id: '3',
    word: 'Beautiful',
    phonetic: '/ˈbjuː.tɪ.fəl/',
    example: 'She is beautiful.',
  },
  {
    id: '4',
    word: 'Wonderful',
    phonetic: '/ˈwʌn.də.fəl/',
    example: 'What a wonderful day!',
  },
]

const MOCK_LISTENING_CHAPTERS = [
  {
    id: '1',
    title: 'A Day at the Park',
    audioUrl: '',
    transcript:
      'Yesterday, I went to the park with my friends. We played soccer and had a picnic. The weather was beautiful and sunny. We had so much fun!',
    duration: 15,
    questions: [
      {
        id: 'q1',
        question: 'Where did they go?',
        options: ['To the beach', 'To the park', 'To the mall', 'To school'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'What did they play?',
        options: ['Basketball', 'Tennis', 'Soccer', 'Baseball'],
        correctAnswer: 2,
      },
    ],
  },
]

const MOCK_SPEAKING_PROMPTS = [
  {
    id: '1',
    scenario: 'At a Restaurant',
    context: 'You are ordering food at your favorite restaurant',
    aiGreeting:
      'Hello! Welcome to our restaurant. What would you like to order today?',
    expectedResponses: ['I would like...', 'Can I have...', "I'll take..."],
    conversationFlow: [],
  },
]

const MOCK_QUIZ_QUESTIONS = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
    difficulty: 'easy' as const,
    timeLimit: 15,
    points: 100,
  },
  {
    id: '2',
    question: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'easy' as const,
    timeLimit: 15,
    points: 100,
  },
  {
    id: '3',
    question: 'What color do you get when you mix blue and yellow?',
    options: ['Red', 'Green', 'Purple', 'Orange'],
    correctAnswer: 1,
    difficulty: 'easy' as const,
    timeLimit: 15,
    points: 100,
  },
  {
    id: '4',
    question: 'How many legs does a spider have?',
    options: ['6', '8', '10', '12'],
    correctAnswer: 1,
    difficulty: 'medium' as const,
    timeLimit: 12,
    points: 150,
  },
  {
    id: '5',
    question: 'What is 15 × 4?',
    options: ['45', '50', '60', '65'],
    correctAnswer: 2,
    difficulty: 'medium' as const,
    timeLimit: 12,
    points: 150,
  },
  {
    id: '6',
    question: 'Who painted the Mona Lisa?',
    options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 2,
    difficulty: 'hard' as const,
    timeLimit: 10,
    points: 200,
  },
  {
    id: '7',
    question: 'What is the largest planet in our solar system?',
    options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
    correctAnswer: 1,
    difficulty: 'medium' as const,
    timeLimit: 12,
    points: 150,
  },
  {
    id: '8',
    question: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    difficulty: 'hard' as const,
    timeLimit: 10,
    points: 200,
  },
]

const MOCK_WORDSEARCH_WORDS = [
  'APPLE',
  'BOOK',
  'CAT',
  'DOG',
  'FISH',
  'HOUSE',
  'TREE',
  'CAR',
]

const MOCK_MEMORY_WORDS = [
  { word: 'Apple', meaning: 'Táo' },
  { word: 'Book', meaning: 'Sách' },
  { word: 'Cat', meaning: 'Mèo' },
  { word: 'Dog', meaning: 'Chó' },
  { word: 'Fish', meaning: 'Cá' },
  { word: 'Tree', meaning: 'Cây' },
]

const MOCK_CROSSWORD_CLUES = [
  {
    clue: 'A red fruit that grows on trees',
    answer: 'APPLE',
    direction: 'across' as const,
  },
  { clue: 'You read this', answer: 'BOOK', direction: 'across' as const },
  { clue: 'A pet that says meow', answer: 'CAT', direction: 'down' as const },
  { clue: "Man's best friend", answer: 'DOG', direction: 'down' as const },
  {
    clue: 'A place where you live',
    answer: 'HOUSE',
    direction: 'across' as const,
  },
]

const MOCK_JIGSAW_IMAGE =
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop'

type ActivityType =
  | 'menu'
  | 'vocab'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'quiz'
  | 'wordsearch'
  | 'memory'
  | 'crossword'
  | 'jigsaw'

/**
 * ActivitiesPage - Demo page for Phase 2 activities
 */
export default function ActivitiesPage() {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const { playSound } = useSoundEffects()

  const [currentActivity, setCurrentActivity] = useState<ActivityType>('menu')
  const [currentXP, setCurrentXP] = useState(45)
  const [level, setLevel] = useState(3)
  const [stars, setStars] = useState(28)
  const [coins, setCoins] = useState(156)
  const [characterMessage, setCharacterMessage] = useState(
    'Chào bạn! Chọn activity để bắt đầu học nhé! 🎉'
  )

  const handleLevelUp = () => {
    playSound('levelUp')
    setLevel((prev) => prev + 1)
    setCurrentXP(0)
    setCharacterMessage('Wowww! Bạn lên cấp rồi! Tuyệt vời quá! 🎊')
  }

  const handleHomeClick = () => {
    playSound('click')
    navigate(`/classroom/${classroomId}/map`)
  }

  const handleActivitySelect = (activity: ActivityType) => {
    playSound('click')
    setCurrentActivity(activity)

    if (activity === 'vocab') {
      setCharacterMessage('Bắt từ rơi xuống để học từ vựng! 🎯')
    } else if (activity === 'pronunciation') {
      setCharacterMessage('Luyện phát âm như karaoke nhé! 🎤')
    } else if (activity === 'listening') {
      setCharacterMessage('Nghe chuyện và trả lời câu hỏi nhé! 🎧')
    } else if (activity === 'speaking') {
      setCharacterMessage('Nói chuyện với AI thôi nào! 🗣️')
    } else if (activity === 'quiz') {
      setCharacterMessage('Chiến đấu trong Quiz Arena! ⚔️')
    } else if (activity === 'wordsearch') {
      setCharacterMessage('Tìm từ ẩn trong lưới! 🔍')
    } else if (activity === 'memory') {
      setCharacterMessage('Lật thẻ và ghép cặp! 🧠')
    } else if (activity === 'crossword') {
      setCharacterMessage('Giải ô chữ thông minh! 🧩')
    } else if (activity === 'jigsaw') {
      setCharacterMessage('Ghép tranh hoàn chỉnh! 🧩')
    }
  }

  const handleBackToMenu = () => {
    playSound('click')
    setCurrentActivity('menu')
    setCharacterMessage('Chọn activity tiếp theo nhé! 💪')
  }

  const handleVocabComplete = (_score: number, correctWords: number) => {
    setCharacterMessage(`Tuyệt vời! Bạn đã bắt được ${correctWords} từ! 🌟`)
    playSound('levelUp')
  }

  const handlePronunciationComplete = (_score: number, earnedStars: number) => {
    setCharacterMessage(
      `Phát âm xuất sắc! Bạn nhận được ${earnedStars} sao! ⭐`
    )
    playSound('celebration')
    setStars((prev) => prev + earnedStars)
  }

  const handleListeningComplete = (_score: number, correctAnswers: number) => {
    setCharacterMessage(`Tuyệt vời! Bạn trả lời đúng ${correctAnswers} câu! 🎧`)
    playSound('celebration')
  }

  const handleSpeakingComplete = (_score: number, fluency: number) => {
    setCharacterMessage(`Xuất sắc! Độ trôi chảy: ${fluency}%! 🎤`)
    playSound('celebration')
  }

  const handleQuizComplete = (score: number, accuracy: number) => {
    setCharacterMessage(`Chiến thắng! Độ chính xác: ${accuracy}%! ⚔️`)
    playSound('celebration')
    addCoins(score)
  }

  const handleWordSearchComplete = (score: number, foundWords: number) => {
    setCharacterMessage(`Tìm được ${foundWords} từ! Tuyệt vời! 🔍`)
    playSound('celebration')
    addCoins(score)
  }

  const handleMemoryComplete = (score: number, stars: number) => {
    setCharacterMessage(`Ghép cặp hoàn hảo! ${stars} sao! 🧠`)
    playSound('celebration')
    addCoins(score)
    setStars((prev) => prev + stars)
  }

  const handleCrosswordComplete = (score: number, accuracy: number) => {
    setCharacterMessage(`Giải ô chữ thành công! ${accuracy}% chính xác! 🧩`)
    playSound('celebration')
    addCoins(score)
  }

  const handleJigsawComplete = (score: number, moves: number) => {
    setCharacterMessage(`Hoàn thành puzzle! Chỉ ${moves} nước đi! 🧩`)
    playSound('celebration')
    addCoins(score)
  }

  const addXP = (amount: number) => {
    setCurrentXP((prev) => {
      const newXP = prev + amount
      if (newXP >= 100) {
        handleLevelUp()
        return newXP - 100
      }
      return newXP
    })
  }

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Home Button */}
            <motion.button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-3 bg-white/90 hover:bg-white rounded-2xl shadow-lg border-4 border-blue-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-blue-600">Home</span>
            </motion.button>

            {/* Back to Menu (when in activity) */}
            {currentActivity !== 'menu' && (
              <motion.button
                onClick={handleBackToMenu}
                className="flex items-center gap-2 px-4 py-3 bg-white/90 hover:bg-white rounded-2xl shadow-lg border-4 border-purple-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="font-bold text-purple-600">Back to Menu</span>
              </motion.button>
            )}
          </div>

          {/* Progress System */}
          <ProgressSystem
            currentXP={currentXP}
            maxXP={100}
            level={level}
            stars={stars}
            coins={coins}
            onLevelUp={handleLevelUp}
          />
        </div>

        {/* Activity Content */}
        <div className="flex-1 p-4">
          {currentActivity === 'menu' && (
            <div className="max-w-6xl mx-auto">
              {/* Character Avatar */}
              <div className="flex justify-center mb-8">
                <CharacterAvatar
                  emotion="happy"
                  message={characterMessage}
                  showMessage={true}
                />
              </div>

              {/* Activity Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vocab Activity Card */}
                <motion.button
                  onClick={() => handleActivitySelect('vocab')}
                  className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />

                  <div className="relative z-10">
                    <BookOpen className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Word Catcher
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      🎯 Bắt từ rơi xuống
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Vocab
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Game
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Pronunciation Activity Card */}
                <motion.button
                  onClick={() => handleActivitySelect('pronunciation')}
                  className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  />

                  <div className="relative z-10">
                    <Mic className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Karaoke Hero
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      🎤 Luyện phát âm
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Speaking
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Practice
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Listening Activity Card */}
                <motion.button
                  onClick={() => handleActivitySelect('listening')}
                  className="relative bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                  />

                  <div className="relative z-10">
                    <Headphones className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Audio Adventure
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      🎧 Nghe & trả lời
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Listening
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Story
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Speaking Activity Card */}
                <motion.button
                  onClick={() => handleActivitySelect('speaking')}
                  className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
                  />

                  <div className="relative z-10">
                    <MessageSquare className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Talk Show Host
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      🗣️ Nói chuyện với AI
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Speaking
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Conversation
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Quiz Activity Card */}
                <motion.button
                  onClick={() => handleActivitySelect('quiz')}
                  className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 2 }}
                  />

                  <div className="relative z-10">
                    <Swords className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Battle Arena
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      ⚔️ Quiz chiến đấu
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Quiz
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Power-ups
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Word Search Card */}
                <motion.button
                  onClick={() => handleActivitySelect('wordsearch')}
                  className="relative bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 2.5 }}
                  />

                  <div className="relative z-10">
                    <Search className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Word Search
                    </h2>
                    <p className="text-xl text-white/90 mb-4">🔍 Tìm từ ẩn</p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Puzzle
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Grid
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Memory Card */}
                <motion.button
                  onClick={() => handleActivitySelect('memory')}
                  className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 3 }}
                  />

                  <div className="relative z-10">
                    <Brain className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Memory Match
                    </h2>
                    <p className="text-xl text-white/90 mb-4">
                      🧠 Ghép cặp thẻ
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Memory
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Cards
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Crossword Card */}
                <motion.button
                  onClick={() => handleActivitySelect('crossword')}
                  className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 3.5 }}
                  />

                  <div className="relative z-10">
                    <Grid3X3 className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Crossword
                    </h2>
                    <p className="text-xl text-white/90 mb-4">🧩 Giải ô chữ</p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Puzzle
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Words
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Jigsaw Card */}
                <motion.button
                  onClick={() => handleActivitySelect('jigsaw')}
                  className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-8 shadow-2xl border-8 border-white overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 4 }}
                  />

                  <div className="relative z-10">
                    <Puzzle className="w-20 h-20 text-white mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Jigsaw Puzzle
                    </h2>
                    <p className="text-xl text-white/90 mb-4">🧩 Ghép tranh</p>
                    <div className="flex justify-center gap-2">
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Picture
                      </span>
                      <span className="px-4 py-2 bg-white/30 rounded-xl text-white font-bold">
                        Pieces
                      </span>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Coming Soon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <div className="inline-block bg-white/80 backdrop-blur rounded-2xl px-8 py-4 shadow-lg">
                  <p className="text-2xl font-bold text-gray-700">
                    🚀 Phase 5 Complete!
                  </p>
                  <p className="text-lg text-gray-600 mt-2">
                    Polish & Advanced Features • Coming in Phase 6!
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {currentActivity === 'vocab' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <VocabActivity
                words={MOCK_VOCAB_WORDS}
                onComplete={handleVocabComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'pronunciation' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <PronunciationActivity
                words={MOCK_PRONUNCIATION_WORDS}
                onComplete={handlePronunciationComplete}
                onAddXP={addXP}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'listening' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <ListeningActivity
                chapters={MOCK_LISTENING_CHAPTERS}
                onComplete={handleListeningComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SpeakingActivity
                prompts={MOCK_SPEAKING_PROMPTS}
                onComplete={handleSpeakingComplete}
                onAddXP={addXP}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <QuizActivity
                questions={MOCK_QUIZ_QUESTIONS}
                onComplete={handleQuizComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'wordsearch' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <WordSearchActivity
                words={MOCK_WORDSEARCH_WORDS}
                gridSize={10}
                onComplete={handleWordSearchComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'memory' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <MemoryCardActivity
                words={MOCK_MEMORY_WORDS}
                difficulty="medium"
                onComplete={handleMemoryComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'crossword' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <CrosswordActivity
                clues={MOCK_CROSSWORD_CLUES}
                gridSize={10}
                onComplete={handleCrosswordComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}

          {currentActivity === 'jigsaw' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <JigsawActivity
                imageUrl={MOCK_JIGSAW_IMAGE}
                title="Beautiful Landscape"
                difficulty="medium"
                onComplete={handleJigsawComplete}
                onAddXP={addXP}
                onAddCoins={addCoins}
                onPlaySound={playSound}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
