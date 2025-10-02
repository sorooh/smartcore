'use client'

export function LearningIndicator({ progress }) {
  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <div className="text-right">
        <div className="text-sm font-bold">تقدم التعلم</div>
        <div className="text-xs opacity-90">{Math.round(progress)}% مكتمل</div>
      </div>
      
      <div className="w-16 h-16 relative">
        {/* Outer Circle */}
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="white"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${progress * 157.08 / 100} 157.08`}
            className="transition-all duration-1000"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Brain Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-lg ${progress > 50 ? 'animate-pulse' : ''}`}>
            🧠
          </div>
        </div>
        
        {/* Learning Particles */}
        {progress > 25 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
        )}
        {progress > 50 && (
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        )}
        {progress > 75 && (
          <div className="absolute top-1 left-0 w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        )}
      </div>
    </div>
  )
}