import { motion } from 'framer-motion'
import { Heart, MessageCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

type Emotion = 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating'

interface CharacterAvatarProps {
  emotion?: Emotion
  message?: string
  showMessage?: boolean
}

/**
 * CharacterAvatar - Mascot động với emotions và dialogues
 */
export function CharacterAvatar({
  emotion = 'happy',
  message,
  showMessage = false,
}: CharacterAvatarProps) {
  const [currentMessage, setCurrentMessage] = useState(message)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Typing effect for message
  useEffect(() => {
    if (message && showMessage) {
      setCurrentMessage(message)
      setDisplayedText('')
      setIsTyping(true)

      let index = 0
      const timer = setInterval(() => {
        if (index < message.length) {
          setDisplayedText((prev) => prev + message[index])
          index++
        } else {
          setIsTyping(false)
          clearInterval(timer)
        }
      }, 50)

      return () => clearInterval(timer)
    }
  }, [message, showMessage])

  const emotionConfig = {
    happy: {
      eyeAnimation: { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] },
      mouthCurve: 'M 30 45 Q 50 55 70 45',
      color: 'from-pink-400 to-rose-400',
      particles: '✨',
    },
    excited: {
      eyeAnimation: {
        scale: [1, 1.3, 0.9, 1.3, 1],
        rotate: [0, 10, -10, 10, 0],
      },
      mouthCurve: 'M 30 40 Q 50 60 70 40',
      color: 'from-yellow-400 to-orange-400',
      particles: '🎉',
    },
    thinking: {
      eyeAnimation: { x: [-2, 2, -2], y: [0, -2, 0] },
      mouthCurve: 'M 35 50 L 65 50',
      color: 'from-blue-400 to-cyan-400',
      particles: '💭',
    },
    encouraging: {
      eyeAnimation: { scale: [1, 1.1, 1] },
      mouthCurve: 'M 30 48 Q 50 52 70 48',
      color: 'from-green-400 to-emerald-400',
      particles: '💪',
    },
    celebrating: {
      eyeAnimation: { scale: [1, 0.8, 1.2, 0.8, 1], rotate: [0, 360] },
      mouthCurve: 'M 25 40 Q 50 65 75 40',
      color: 'from-purple-400 to-pink-400',
      particles: '🎊',
    },
  }

  const config = emotionConfig[emotion]

  return (
    <div className="relative">
      {/* Character Container */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Main Character Circle */}
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${config.color} shadow-2xl border-4 border-white relative overflow-hidden`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Shine effect */}
          <div className="absolute top-2 left-2 w-8 h-8 bg-white/50 rounded-full blur-md" />

          {/* Face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Eyes */}
              <motion.g
                animate={config.eyeAnimation}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <circle cx="35" cy="40" r="8" fill="white" />
                <circle cx="35" cy="40" r="4" fill="#1F2937" />
                <circle cx="65" cy="40" r="8" fill="white" />
                <circle cx="65" cy="40" r="4" fill="#1F2937" />
              </motion.g>

              {/* Mouth */}
              <motion.path
                d={config.mouthCurve}
                stroke="#1F2937"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                animate={{
                  d: [
                    config.mouthCurve,
                    'M 30 50 Q 50 50 70 50',
                    config.mouthCurve,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Cheeks */}
              <motion.circle
                cx="20"
                cy="50"
                r="6"
                fill="#FF6B9D"
                opacity="0.4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.circle
                cx="80"
                cy="50"
                r="6"
                fill="#FF6B9D"
                opacity="0.4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              />
            </svg>
          </div>

          {/* Decorative elements */}
          {emotion === 'celebrating' && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-yellow-300"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * 45 * Math.PI) / 180) * 60],
                    y: [0, Math.sin((i * 45 * Math.PI) / 180) * 60],
                    opacity: [1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          >
            {config.particles}
          </motion.div>
        ))}

        {/* Hearts for happy emotion */}
        {emotion === 'happy' && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </motion.div>
        )}
      </motion.div>

      {/* Speech Bubble */}
      {showMessage && currentMessage && (
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
        >
          <div className="relative bg-white rounded-2xl p-4 shadow-xl border-4 border-purple-300">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <p className="text-gray-800 font-semibold text-sm leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                )}
              </p>
            </div>
            {/* Tail */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-purple-300 transform rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Sparkle decoration */}
      <motion.div
        className="absolute -top-4 -left-4"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <Sparkles className="w-8 h-8 text-yellow-400 fill-current" />
      </motion.div>
    </div>
  )
}
