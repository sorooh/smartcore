'use client'

import { useEffect, useState } from 'react'

export function BrainVisualization({ activity }) {
  const [animatedValues, setAnimatedValues] = useState({})

  useEffect(() => {
    // Animate progress bars
    Object.keys(activity).forEach(layer => {
      setTimeout(() => {
        setAnimatedValues(prev => ({ ...prev, [layer]: activity[layer] }))
      }, Math.random() * 500)
    })
  }, [activity])

  const brainLayers = [
    { key: 'perception', name: 'الإدراك', icon: '👁️', color: 'bg-blue-500' },
    { key: 'analysis', name: 'التحليل', icon: '🔍', color: 'bg-green-500' },
    { key: 'reasoning', name: 'المنطق', icon: '🤔', color: 'bg-purple-500' },
    { key: 'creativity', name: 'الإبداع', icon: '💡', color: 'bg-yellow-500' },
    { key: 'learning', name: 'التعلم', icon: '🎓', color: 'bg-red-500' },
    { key: 'memory', name: 'الذاكرة', icon: '🧠', color: 'bg-indigo-500' },
    { key: 'synthesis', name: 'التركيب', icon: '⚡', color: 'bg-pink-500' }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-4 border-b border-blue-200">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
        <div className="animate-pulse">🧠</div>
        <h4 className="font-bold">نشاط المخ متعدد الطبقات</h4>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {brainLayers.map(layer => {
          const value = animatedValues[layer.key] || 0
          const activityValue = activity[layer.key] || 0
          
          return (
            <div key={layer.key} className="text-center">
              <div className="text-lg mb-1">{layer.icon}</div>
              <div className="text-xs font-semibold mb-1">{layer.name}</div>
              
              {/* Progress Circle */}
              <div className="relative w-12 h-12 mx-auto">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(value || 0) * 100.48 / 100} 100.48`}
                    className={`transition-all duration-1000 ${
                      layer.color.replace('bg-', 'text-')
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {Math.round(value || 0)}%
                </div>
              </div>
              
              {/* Activity Indicator */}
              {activityValue > 0 && (
                <div className="mt-1">
                  <div className="w-8 h-1 bg-gray-600 rounded-full mx-auto overflow-hidden">
                    <div 
                      className={`h-full ${layer.color} transition-all duration-1000 animate-pulse`}
                      style={{ width: `${activityValue}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-3 text-xs text-center text-blue-200">
        النظام يعالج البيانات عبر 7 طبقات ذكية متزامنة
      </div>
    </div>
  )
}