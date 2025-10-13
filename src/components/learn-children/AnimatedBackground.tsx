import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

interface Cloud {
  id: number
  y: number
  duration: number
  delay: number
  scale: number
}

/**
 * AnimatedBackground - Background động với parallax, floating clouds, và particles
 */
export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [clouds, setClouds] = useState<Cloud[]>([])

  useEffect(() => {
    // Generate random particles (stars, sparkles)
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'][
        Math.floor(Math.random() * 5)
      ],
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)

    // Generate floating clouds
    const newClouds: Cloud[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      y: Math.random() * 60 + 10,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * 5,
      scale: Math.random() * 0.5 + 0.5,
    }))
    setClouds(newClouds)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-yellow-300/20 via-green-300/20 to-blue-300/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Floating Clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{
            top: `${cloud.y}%`,
            left: '-10%',
            transform: `scale(${cloud.scale})`,
          }}
          animate={{
            x: ['0vw', '110vw'],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: cloud.delay,
          }}
        >
          <div className="relative">
            {/* Cloud shape using circles */}
            <div className="flex items-end">
              <div className="w-16 h-12 bg-white/30 rounded-full blur-sm" />
              <div className="w-20 h-16 bg-white/40 rounded-full blur-sm -ml-4" />
              <div className="w-16 h-12 bg-white/30 rounded-full blur-sm -ml-4" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Floating Particles (Stars/Sparkles) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
            y: [0, -20, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
            animate={{
              d: [
                'M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z',
                'M0,60 C150,30 350,90 600,60 C850,30 1050,90 1200,60 L1200,120 L0,120 Z',
                'M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <defs>
            <linearGradient
              id="wave-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-green-300 to-blue-400 opacity-30 blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
      />
    </div>
  )
}
