import { AnimatePresence, motion } from 'framer-motion'
import { Award, Mic, Play, RotateCcw, Star, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface PronunciationWord {
  id: string
  word: string
  phonetic: string
  audioUrl?: string
  example?: string
}

type SoundType =
  | 'click'
  | 'correct'
  | 'wrong'
  | 'celebration'
  | 'levelUp'
  | 'coin'
  | 'star'

interface PronunciationActivityProps {
  words: PronunciationWord[]
  onComplete: (score: number, stars: number) => void
  onAddXP: (amount: number) => void
  onPlaySound: (sound: SoundType) => void
}

interface PitchData {
  time: number
  pitch: number // 0-1
}

export function PronunciationActivity({
  words,
  onComplete,
  onAddXP,
  onPlaySound,
}: PronunciationActivityProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [score, setScore] = useState(0)
  const [stars, setStars] = useState(0)
  const [pitchData, setPitchData] = useState<PitchData[]>([])
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [gameState, setGameState] = useState<
    'ready' | 'playing' | 'reviewing' | 'complete'
  >('ready')
  const [feedback, setFeedback] = useState<{
    accuracy: number
    clarity: number
    rhythm: number
    overall: number
  } | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const currentWord = words[currentWordIndex]

  // Initialize audio context
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

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Setup audio analysis
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream)
        const analyser = audioContextRef.current.createAnalyser()
        analyser.fftSize = 2048
        analyserRef.current = analyser
        source.connect(analyser)

        // Start waveform visualization
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
        analyzePronunciation()
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      onPlaySound('click')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to use this feature')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setGameState('reviewing')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  // Visualize waveform
  const visualizeWaveform = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording) return

      analyserRef.current!.getByteTimeDomainData(dataArray)

      // Sample 50 points for visualization
      const samples = 50
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

  // Analyze pronunciation (mock analysis)
  const analyzePronunciation = () => {
    // In real app, send audio to backend for analysis
    // Here we simulate the analysis
    setTimeout(() => {
      const accuracy = 70 + Math.random() * 25 // 70-95%
      const clarity = 65 + Math.random() * 30 // 65-95%
      const rhythm = 60 + Math.random() * 35 // 60-95%
      const overall = (accuracy + clarity + rhythm) / 3

      const earnedStars =
        overall >= 90 ? 3 : overall >= 75 ? 2 : overall >= 60 ? 1 : 0
      const earnedPoints = Math.floor(overall * 10)

      setFeedback({
        accuracy: Math.round(accuracy),
        clarity: Math.round(clarity),
        rhythm: Math.round(rhythm),
        overall: Math.round(overall),
      })

      setScore((s) => s + earnedPoints)
      setStars((s) => s + earnedStars)
      onAddXP(earnedPoints)

      if (earnedStars >= 2) {
        onPlaySound('correct')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2000)
      } else if (earnedStars === 1) {
        onPlaySound('coin')
      } else {
        onPlaySound('wrong')
      }

      // Generate mock pitch data
      const mockPitchData: PitchData[] = []
      for (let i = 0; i < 50; i++) {
        mockPitchData.push({
          time: i / 50,
          pitch: 0.3 + Math.random() * 0.4 + Math.sin(i / 5) * 0.2,
        })
      }
      setPitchData(mockPitchData)
    }, 1500)
  }

  // Play example audio
  const playExample = () => {
    setIsPlaying(true)
    onPlaySound('click')
    // In real app, play currentWord.audioUrl
    setTimeout(() => setIsPlaying(false), 2000)
  }

  // Play recorded audio
  const playRecording = () => {
    if (!recordedAudio) return
    const audio = new Audio(URL.createObjectURL(recordedAudio))
    audio.play()
    onPlaySound('click')
  }

  // Next word
  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((i) => i + 1)
      setRecordedAudio(null)
      setFeedback(null)
      setPitchData([])
      setWaveformData([])
      setGameState('playing')
      onPlaySound('click')
    } else {
      setGameState('complete')
      onComplete(score, stars)
    }
  }

  // Retry current word
  const retry = () => {
    setRecordedAudio(null)
    setFeedback(null)
    setPitchData([])
    setWaveformData([])
    setGameState('playing')
    onPlaySound('click')
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setStars(0)
    setCurrentWordIndex(0)
    onPlaySound('click')
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-lg">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i <= stars
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/70">Progress</div>
          <div className="font-bold text-white text-xl">
            {currentWordIndex + 1} / {words.length}
          </div>
        </div>
      </div>

      {/* Ready State */}
      {gameState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-pink-600/90 to-purple-600/90 rounded-3xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Mic className="w-24 h-24 text-white mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Karaoke Hero!</h2>
          <p className="text-xl text-white/90 mb-8 text-center max-w-md">
            🎤 Listen and repeat the words
            <br />⭐ Get 3 stars for perfect pronunciation!
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-pink-600 rounded-2xl font-bold text-xl shadow-lg"
          >
            Start Practice! 🚀
          </motion.button>
        </motion.div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && currentWord && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8">
          {/* Word Display */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4"
            >
              {currentWord.word}
            </motion.div>
            <div className="text-2xl text-gray-600 mb-2">
              {currentWord.phonetic}
            </div>
            {currentWord.example && (
              <div className="text-lg text-gray-500 italic">
                "{currentWord.example}"
              </div>
            )}
          </div>

          {/* Example Audio Button */}
          <div className="flex justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playExample}
              disabled={isPlaying}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
            >
              {isPlaying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="w-6 h-6" />
                  </motion.div>
                  Playing...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Listen to Example
                </>
              )}
            </motion.button>
          </div>

          {/* Waveform Visualization */}
          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="w-full max-w-2xl h-48 bg-white/50 rounded-2xl p-4 flex items-end gap-1">
              {(isRecording ? waveformData : Array(50).fill(0)).map(
                (value, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${value * 100}%` }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full min-h-[4px]"
                  />
                )
              )}
            </div>
          </div>

          {/* Record Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`flex items-center gap-3 px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl transition-all ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Mic className="w-8 h-8" />
                  </motion.div>
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  Hold to Record
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Reviewing State */}
      {gameState === 'reviewing' && feedback && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Your Performance
          </h2>

          {/* Pitch Graph */}
          <div className="mb-8">
            <div className="text-lg font-semibold text-gray-700 mb-3">
              Pitch Pattern
            </div>
            <div className="w-full h-32 bg-white rounded-2xl p-4 relative">
              <svg width="100%" height="100%" className="absolute inset-0 p-4">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  d={`M ${pitchData
                    .map(
                      (p, i) =>
                        `${(i / pitchData.length) * 100}% ${
                          100 - p.pitch * 80
                        }%`
                    )
                    .join(' L ')}`}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  className="drop-shadow-lg"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Accuracy', value: feedback.accuracy, icon: '🎯' },
              { label: 'Clarity', value: feedback.clarity, icon: '🔊' },
              { label: 'Rhythm', value: feedback.rhythm, icon: '🎵' },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-2xl p-4 text-center"
              >
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                <div className="text-2xl font-bold text-purple-600">
                  {metric.value}%
                </div>
              </div>
            ))}
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-center mb-8">
            <div className="text-white/80 text-lg mb-2">Overall Score</div>
            <div className="text-6xl font-black text-white mb-4">
              {feedback.overall}%
            </div>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale:
                      i <=
                      (feedback.overall >= 90
                        ? 3
                        : feedback.overall >= 75
                          ? 2
                          : feedback.overall >= 60
                            ? 1
                            : 0)
                        ? 1
                        : 0.5,
                    rotate: 0,
                  }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star
                    className={`w-8 h-8 ${
                      i <=
                      (feedback.overall >= 90
                        ? 3
                        : feedback.overall >= 75
                          ? 2
                          : feedback.overall >= 60
                            ? 1
                            : 0)
                        ? 'text-yellow-300 fill-yellow-300'
                        : 'text-white/30'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playRecording}
              disabled={!recordedAudio}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-2xl font-bold disabled:opacity-50"
            >
              <Volume2 className="w-5 h-5" />
              Play Recording
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retry}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-500 text-white rounded-2xl font-bold"
            >
              <RotateCcw className="w-5 h-5" />
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextWord}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold"
            >
              Next Word
            </motion.button>
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
            <Award className="w-32 h-32 text-white mb-6" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-4">Amazing!</h2>
          <div className="text-7xl font-black text-white mb-4">{score}</div>
          <div className="text-2xl text-white/90 mb-8">
            Total Stars: {stars} ⭐
          </div>
        </motion.div>
      )}

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 500,
                  y: -Math.random() * 500,
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="absolute"
              >
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
