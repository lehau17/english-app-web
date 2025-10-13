import { AnimatePresence, motion } from 'framer-motion'
import { Check, Palette, Shirt, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { CharacterCustomization } from './useCharacterCustomization'

interface CharacterCustomizerProps {
  initialCustomization?: CharacterCustomization
  onSave: (customization: CharacterCustomization) => void
  onClose: () => void
  onPlaySound: (sound: 'click' | 'correct' | 'celebration') => void
}

// Available options
const OUTFITS = [
  {
    id: 'casual',
    name: 'Casual',
    emoji: '👕',
    description: 'Comfortable everyday wear',
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    description: 'Looking sharp and professional',
  },
  {
    id: 'sports',
    name: 'Sports',
    emoji: '⚽',
    description: 'Ready for action',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🧙',
    description: 'Magical and mysterious',
  },
  {
    id: 'superhero',
    name: 'Superhero',
    emoji: '🦸',
    description: 'Save the day!',
  },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', description: 'Stealthy and cool' },
]

const COLORS = [
  {
    id: 'blue',
    name: 'Blue',
    hex: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#A855F7',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#EC4899',
    gradient: 'from-pink-400 to-pink-600',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#10B981',
    gradient: 'from-green-400 to-green-600',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#F59E0B',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#EF4444',
    gradient: 'from-red-400 to-red-600',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    hex: '#06B6D4',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#F97316',
    gradient: 'from-orange-400 to-orange-600',
  },
]

const ACCESSORIES = [
  { id: 'none', name: 'None', emoji: '⚪', description: 'No accessory' },
  { id: 'glasses', name: 'Glasses', emoji: '👓', description: 'Smart look' },
  { id: 'hat', name: 'Hat', emoji: '🎓', description: 'Stylish cap' },
  { id: 'crown', name: 'Crown', emoji: '👑', description: 'Royal vibes' },
  {
    id: 'headphones',
    name: 'Headphones',
    emoji: '🎧',
    description: 'Music lover',
  },
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    emoji: '🕶️',
    description: 'Too cool',
  },
]

/**
 * CharacterCustomizer - Character appearance customization panel
 * Kids can change outfit, color, and accessories
 */
export function CharacterCustomizer({
  initialCustomization = { outfit: 'casual', color: 'blue', accessory: 'none' },
  onSave,
  onClose,
  onPlaySound,
}: CharacterCustomizerProps) {
  const [customization, setCustomization] =
    useState<CharacterCustomization>(initialCustomization)
  const [activeTab, setActiveTab] = useState<'outfit' | 'color' | 'accessory'>(
    'outfit'
  )
  const [showPreview, setShowPreview] = useState(false)

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem(
      'character_customization',
      JSON.stringify(customization)
    )
    onPlaySound('correct')
    onSave(customization)

    // Show preview animation
    setShowPreview(true)
    setTimeout(() => {
      onPlaySound('celebration')
      setTimeout(() => {
        setShowPreview(false)
        onClose()
      }, 1500)
    }, 500)
  }

  const handleOutfitSelect = (outfitId: string) => {
    setCustomization((prev) => ({ ...prev, outfit: outfitId }))
    onPlaySound('click')
  }

  const handleColorSelect = (colorId: string) => {
    setCustomization((prev) => ({ ...prev, color: colorId }))
    onPlaySound('click')
  }

  const handleAccessorySelect = (accessoryId: string) => {
    setCustomization((prev) => ({ ...prev, accessory: accessoryId }))
    onPlaySound('click')
  }

  const selectedOutfit = OUTFITS.find((o) => o.id === customization.outfit)
  const selectedColor = COLORS.find((c) => c.id === customization.color)
  const selectedAccessory = ACCESSORIES.find(
    (a) => a.id === customization.accessory
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-black text-white">
                Character Customization
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(90vh-120px)]">
          {/* Preview Panel */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-purple-100 to-pink-100 p-6 flex flex-col items-center justify-center">
            <motion.div
              animate={
                showPreview
                  ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                  : {}
              }
              transition={{ duration: 1 }}
              className="relative"
            >
              {/* Character Preview */}
              <div
                className={`
                  w-48 h-48 rounded-full bg-gradient-to-br ${selectedColor?.gradient}
                  flex items-center justify-center shadow-2xl border-8 border-white
                `}
              >
                <div className="text-9xl">{selectedOutfit?.emoji}</div>
              </div>

              {/* Accessory Overlay */}
              {selectedAccessory && selectedAccessory.id !== 'none' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 text-6xl"
                >
                  {selectedAccessory.emoji}
                </motion.div>
              )}

              {/* Sparkle Effects */}
              <AnimatePresence>
                {showPreview && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          x: Math.cos((i * Math.PI) / 4) * 100,
                          y: Math.sin((i * Math.PI) / 4) * 100,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute top-1/2 left-1/2 text-4xl"
                      >
                        ✨
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Preview Info */}
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {selectedOutfit?.name} {selectedOutfit?.emoji}
              </h3>
              <p className="text-lg text-gray-600">
                {selectedOutfit?.description}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: selectedColor?.hex }}
                />
                <span className="text-lg font-bold text-gray-700">
                  {selectedColor?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab('outfit')
                  onPlaySound('click')
                }}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors
                  ${
                    activeTab === 'outfit'
                      ? 'bg-purple-50 text-purple-600 border-b-4 border-purple-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <Shirt className="w-5 h-5" />
                Outfit
              </button>
              <button
                onClick={() => {
                  setActiveTab('color')
                  onPlaySound('click')
                }}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors
                  ${
                    activeTab === 'color'
                      ? 'bg-pink-50 text-pink-600 border-b-4 border-pink-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <Palette className="w-5 h-5" />
                Color
              </button>
              <button
                onClick={() => {
                  setActiveTab('accessory')
                  onPlaySound('click')
                }}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors
                  ${
                    activeTab === 'accessory'
                      ? 'bg-rose-50 text-rose-600 border-b-4 border-rose-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <Sparkles className="w-5 h-5" />
                Accessory
              </button>
            </div>

            {/* Options Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* Outfit Options */}
                {activeTab === 'outfit' && (
                  <motion.div
                    key="outfit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {OUTFITS.map((outfit) => (
                      <motion.button
                        key={outfit.id}
                        onClick={() => handleOutfitSelect(outfit.id)}
                        className={`
                          relative p-6 rounded-2xl border-4 transition-all
                          ${
                            customization.outfit === outfit.id
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {customization.outfit === outfit.id && (
                          <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-6xl mb-2">{outfit.emoji}</div>
                        <h4 className="font-bold text-lg text-gray-700">
                          {outfit.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {outfit.description}
                        </p>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Color Options */}
                {activeTab === 'color' && (
                  <motion.div
                    key="color"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    {COLORS.map((color) => (
                      <motion.button
                        key={color.id}
                        onClick={() => handleColorSelect(color.id)}
                        className={`
                          relative aspect-square rounded-2xl border-4 transition-all
                          bg-gradient-to-br ${color.gradient}
                          ${
                            customization.color === color.id
                              ? 'border-white shadow-2xl scale-110'
                              : 'border-gray-200 hover:scale-105'
                          }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {customization.color === color.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2">
                              <Check className="w-6 h-6 text-gray-700" />
                            </div>
                          </div>
                        )}
                        <div className="absolute -bottom-8 left-0 right-0 text-center">
                          <span className="text-sm font-bold text-gray-700">
                            {color.name}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Accessory Options */}
                {activeTab === 'accessory' && (
                  <motion.div
                    key="accessory"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {ACCESSORIES.map((accessory) => (
                      <motion.button
                        key={accessory.id}
                        onClick={() => handleAccessorySelect(accessory.id)}
                        className={`
                          relative p-6 rounded-2xl border-4 transition-all
                          ${
                            customization.accessory === accessory.id
                              ? 'border-rose-500 bg-rose-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {customization.accessory === accessory.id && (
                          <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-6xl mb-2">{accessory.emoji}</div>
                        <h4 className="font-bold text-lg text-gray-700">
                          {accessory.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {accessory.description}
                        </p>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <motion.button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                className="flex-1 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save Changes ✨
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
