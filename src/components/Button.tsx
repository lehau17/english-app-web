import React from 'react'
import './Button.css'

let clickSound: string | undefined
try {
  clickSound = new URL('../assets/sounds/click.mp3', import.meta.url).href
} catch (e) {
  console.warn(
    'Sound file not found. Please add click.mp3 to src/assets/sounds to enable sound effects.',
    e
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (clickSound) {
      const audio = new Audio(clickSound)
      audio.play().catch((e) => console.error('Error playing sound:', e))
    }
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <button className="kid-button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

export default Button
