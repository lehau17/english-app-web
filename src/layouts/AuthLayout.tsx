import { Crown, Heart, Sparkles, Star, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
}

interface FloatingIcon {
  id: number
  x: number
  y: number
  icon: 'star' | 'heart' | 'sparkles' | 'crown' | 'zap'
  opacity: number
  scale: number
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])
  const nextIdRef = useRef(0) // sinh id duy nhất

  const iconComponents = {
    star: Star,
    heart: Heart,
    sparkles: Sparkles,
    crown: Crown,
    zap: Zap,
  }
  const iconColors = {
    star: 'text-yellow-400',
    heart: 'text-red-400',
    sparkles: 'text-pink-400',
    crown: 'text-purple-400',
    zap: 'text-blue-400',
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const icons: (keyof typeof iconComponents)[] = [
      'star',
      'heart',
      'sparkles',
      'crown',
      'zap',
    ]
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = nextIdRef.current++ // id duy nhất, không trùng
    const newIcon: FloatingIcon = {
      id,
      x,
      y,
      icon: randomIcon,
      opacity: 1,
      scale: 0.5,
    }

    setFloatingIcons((prev) => [...prev, newIcon].slice(-200)) // (tuỳ) giới hạn số lượng để tránh quá tải
  }

  useEffect(() => {
    const t = setInterval(() => {
      setFloatingIcons((prev) =>
        prev
          .map((icon) => ({
            ...icon,
            opacity: icon.opacity - 0.02,
            scale: icon.scale + 0.01,
            y: icon.y - 1,
          }))
          .filter((icon) => icon.opacity > 0)
      )
    }, 50)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center p-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Fixed decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-10 left-10 text-yellow-300 w-6 h-6 animate-pulse" />
        <Heart className="absolute top-20 right-20 text-red-300 w-5 h-5 animate-bounce" />
        <Sparkles className="absolute bottom-20 left-20 text-pink-300 w-7 h-7 animate-pulse" />
        <Star className="absolute bottom-10 right-10 text-yellow-300 w-4 h-4 animate-bounce" />
      </div>

      {/* Dynamic floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((icon) => {
          const IconComponent = iconComponents[icon.icon]
          const colorClass = iconColors[icon.icon]

          return (
            <IconComponent
              key={icon.id}
              className={`absolute ${colorClass} transition-all duration-100 ease-out`}
              style={{
                left: `${icon.x}px`,
                top: `${icon.y}px`,
                opacity: icon.opacity,
                transform: `translate(-50%, -50%) scale(${icon.scale})`,
                width: '20px',
                height: '20px',
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))',
              }}
            />
          )
        })}
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🌟</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              English Fun!
            </h1>
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
            <p className="text-gray-500 text-sm mt-2">
              Let's learn English together! 🚀
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
export default AuthLayout
