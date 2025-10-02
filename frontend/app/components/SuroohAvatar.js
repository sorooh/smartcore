'use client'

export function SuroohAvatar({ size = 'md', animated = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className="relative">
      {animated && (
        <div className="absolute inset-0 -m-2">
          <div className="pulse-ring"></div>
        </div>
      )}
      <div className={`
        ${sizeClasses[size]} 
        rounded-full border-4 border-blue-300 overflow-hidden 
        bg-gradient-to-br from-blue-200 to-blue-400
        flex items-center justify-center
        ${animated ? 'animate-pulse' : ''}
      `}>
        <div className="text-white font-bold text-lg">🌸</div>
      </div>
    </div>
  )
}