import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Mic, Play, Trophy, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ConversationTurn {
  id: string
  speaker: 'ai' | 'user'
  text: string
  audioUrl?: string
}

interface SpeakingPrompt {
  id: string
  scenario: string
  context: string
  aiGreeting: string
  expectedResponses: string[]
  conversationFlow: ConversationTurn[]
}

interface SpeakingActivityProps {
  prompts: SpeakingPrompt[]
  onComplete: (score: number, fluencyScore: number) => void
  onAddXP: (amount: number) => void
  onPlaySound: (
    sound:
      | 'click'
      | 'correct'
      | 'wrong'
      | 'celebration'
      | 'levelUp'
      | 'coin'
      | 'star'
  ) => void
}

interface FluencyMetrics {
  pronunciation: number
  vocabulary: number
  grammar: number
  fluency: number
  overall: number
}

export function SpeakingActivity({
  prompts,
  onComplete,
  onAddXP,
  onPlaySound,
}: SpeakingActivityProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [conversationHistory, setConversationHistory] = useState<
    ConversationTurn[]
  >([])
  const [isRecording, setIsRecording] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [gameState, setGameState] = useState<
    'ready' | 'conversation' | 'reviewing' | 'complete'
  >('ready')
  const [score, setScore] = useState(0)
  const [turnCount, setTurnCount] = useState(0)
  const [fluencyMetrics, setFluencyMetrics] = useState<FluencyMetrics | null>(
    null
  )
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentPrompt = prompts[currentPromptIndex]
  const maxTurns = 6

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioContextRef.current?.close()
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  const startGame = () => {
    setGameState('conversation')
    onPlaySound('click')

    // AI greets first
    setTimeout(() => {
      addAITurn(currentPrompt.aiGreeting)
    }, 1000)
  }

  const addAITurn = (text: string) => {
    setIsAISpeaking(true)
    onPlaySound('click')

    const newTurn: ConversationTurn = {
      id: `ai-${Date.now()}`,
      speaker: 'ai',
      text,
    }

    setConversationHistory((prev) => [...prev, newTurn])

    // Simulate AI speaking duration
    setTimeout(() => {
      setIsAISpeaking(false)
    }, text.length * 50) // ~50ms per character
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream)
        const analyser = audioContextRef.current.createAnalyser()
        analyser.fftSize = 2048
        analyserRef.current = analyser
        source.connect(analyser)
        visualizeWaveform()
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        setRecordedAudio(audioBlob)
        analyzeRecording()
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      onPlaySound('click')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const visualizeWaveform = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording) return

      analyserRef.current!.getByteTimeDomainData(dataArray)
      const samples = 30
      const step = Math.floor(bufferLength / samples)
      const waveform: number[] = []

      for (let i = 0; i < samples; i++) {
        const value = dataArray[i * step] / 128.0 - 1.0
        waveform.push(Math.abs(value))
      }

      setWaveformData(waveform)
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  const analyzeRecording = () => {
    // Mock analysis - replace with real AI API
    setTimeout(() => {
      const pronunciation = 75 + Math.random() * 20
      const vocabulary = 70 + Math.random() * 25
      const grammar = 65 + Math.random() * 30
      const fluency = 70 + Math.random() * 25
      const overall = (pronunciation + vocabulary + grammar + fluency) / 4

      setFluencyMetrics({
        pronunciation: Math.round(pronunciation),
        vocabulary: Math.round(vocabulary),
        grammar: Math.round(grammar),
        fluency: Math.round(fluency),
        overall: Math.round(overall),
      })

      const points = Math.floor(overall * 2)
      setScore((s) => s + points)
      onAddXP(points)

      // Generate feedback
      const feedbacks = [
        'Great pronunciation! Keep it up! 🌟',
        'Nice vocabulary usage! 📚',
        'Good grammar structure! ✨',
        "Excellent fluency! You're doing great! 🎉",
        "Keep practicing, you're improving! 💪",
      ]
      const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)]
      setCurrentFeedback(feedback)
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 3000)

      // Add user turn
      const mockTranscript = 'I understand. Let me think about that...'
      const userTurn: ConversationTurn = {
        id: `user-${Date.now()}`,
        speaker: 'user',
        text: mockTranscript,
      }
      setConversationHistory((prev) => [...prev, userTurn])

      const newTurnCount = turnCount + 1
      setTurnCount(newTurnCount)

      if (overall >= 75) {
        onPlaySound('correct')
      } else if (overall >= 60) {
        onPlaySound('coin')
      } else {
        onPlaySound('wrong')
      }

      // AI responds
      setTimeout(() => {
        if (newTurnCount >= maxTurns / 2) {
          addAITurn(
            "That's wonderful! Let's wrap up our conversation. Great job!"
          )
          setTimeout(() => {
            if (currentPromptIndex < prompts.length - 1) {
              handleNextPrompt()
            } else {
              handleComplete()
            }
          }, 3000)
        } else {
          const responses = [
            'Interesting! Tell me more about that.',
            'I see. What else would you like to share?',
            "That's great! How do you feel about it?",
            'Perfect! Can you elaborate on that?',
          ]
          addAITurn(responses[Math.floor(Math.random() * responses.length)])
        }
      }, 1500)
    }, 1500)
  }

  const handleNextPrompt = () => {
    setCurrentPromptIndex((i) => i + 1)
    setConversationHistory([])
    setTurnCount(0)
    setFluencyMetrics(null)
    setRecordedAudio(null)
    onPlaySound('click')

    setTimeout(() => {
      addAITurn(prompts[currentPromptIndex + 1]?.aiGreeting || 'Hello again!')
    }, 1000)
  }

  const handleComplete = () => {
    setGameState('complete')
    const avgFluency = fluencyMetrics?.overall || 0
    onComplete(score, avgFluency)
    onPlaySound('celebration')
  }

  const playRecording = () => {
    if (!recordedAudio) return
    const audio = new Audio(URL.createObjectURL(recordedAudio))
    audio.play()
    onPlaySound('click')
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-lg">{score}</span>
          </div>
          {fluencyMetrics && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl"
            >
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="font-bold text-white text-lg">
                {fluencyMetrics.overall}% Fluency
              </span>
            </motion.div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-white/70">Scenario</div>
          <div className="font-bold text-white text-xl">
            {currentPromptIndex + 1} / {prompts.length}
          </div>
        </div>
      </div>

      {/* Ready State */}
      {gameState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-orange-600/90 to-red-600/90 rounded-3xl p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Mic className="w-24 h-24 text-white mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Talk Show Host!
          </h2>
          <p className="text-xl text-white/90 mb-8 text-center max-w-md">
            🎙️ Have a conversation with AI
            <br />
            📊 Improve your fluency score!
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-xl shadow-lg"
          >
            Start Conversation! 🚀
          </motion.button>
        </motion.div>
      )}

      {/* Conversation State */}
      {gameState === 'conversation' && currentPrompt && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6">
          {/* Scenario Context */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 mb-4"
          >
            <div className="text-sm text-white/80 mb-1">Scenario</div>
            <div className="text-lg font-bold text-white mb-2">
              {currentPrompt.scenario}
            </div>
            <div className="text-sm text-white/90">{currentPrompt.context}</div>
          </motion.div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-2">
            <AnimatePresence>
              {conversationHistory.map((turn, index) => (
                <motion.div
                  key={turn.id}
                  initial={{ opacity: 0, x: turn.speaker === 'ai' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      turn.speaker === 'ai'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {turn.speaker === 'ai' ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      <span className="text-xs font-bold opacity-80">
                        {turn.speaker === 'ai' ? 'AI Assistant' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{turn.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isAISpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: 0.2,
                      }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: 0.4,
                      }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Feedback Banner */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 mb-4 text-center font-bold"
              >
                {currentFeedback}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waveform (when recording) */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 bg-white/50 rounded-2xl p-4"
            >
              <div className="flex items-end justify-center gap-1 h-16">
                {waveformData.map((value, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${value * 100}%` }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-full min-h-[4px]"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Fluency Meter */}
          {fluencyMetrics && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-4 gap-2 mb-4"
            >
              {[
                {
                  label: 'Pronunciation',
                  value: fluencyMetrics.pronunciation,
                  icon: '🗣️',
                },
                {
                  label: 'Vocabulary',
                  value: fluencyMetrics.vocabulary,
                  icon: '📚',
                },
                { label: 'Grammar', value: fluencyMetrics.grammar, icon: '✍️' },
                { label: 'Fluency', value: fluencyMetrics.fluency, icon: '⚡' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/70 backdrop-blur rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{metric.icon}</div>
                  <div className="text-xs text-gray-600 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {metric.value}%
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-3">
            {recordedAudio && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playRecording}
                className="px-6 py-4 bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Play
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isAISpeaking || turnCount >= maxTurns}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-105'
                  : isAISpeaking || turnCount >= maxTurns
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Mic className="w-6 h-6" />
                  </motion.div>
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  Hold to Speak
                </>
              )}
            </motion.button>
          </div>

          {/* Turn Counter */}
          <div className="text-center mt-3 text-sm text-gray-600">
            Turn {turnCount} / {maxTurns}
          </div>
        </div>
      )}

      {/* Complete State */}
      {gameState === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            <Trophy className="w-32 h-32 text-white mb-6" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Conversation Master!
          </h2>
          <div className="text-7xl font-black text-white mb-4">{score}</div>
          {fluencyMetrics && (
            <div className="text-2xl text-white/90">
              Average Fluency: {fluencyMetrics.overall}%
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
