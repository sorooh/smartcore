'use client'

import { useState, useEffect } from 'react'

export function AutomationFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    { id: 'secretary', name: 'سُروح', icon: '🌸', description: 'استلام الطلب' },
    { id: 'brain', name: 'المخ', icon: '🧠', description: 'تحليل وفهم' },
    { id: 'smart_core', name: 'المنسق', icon: '⚙️', description: 'توزيع المهام' },
    { id: 'bot', name: 'البوت', icon: '🤖', description: 'التنفيذ' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 800)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="bg-blue-50/80 border-b border-blue-200 p-4">
      <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
        <span className="text-sm text-blue-700 font-semibold">تدفق المعالجة:</span>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-300
                ${index === currentStep 
                  ? 'bg-blue-200 scale-110 shadow-md' 
                  : index < currentStep 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }
              `}>
                <div className="text-lg">{step.icon}</div>
                <div className="text-xs font-semibold mt-1">{step.name}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-1 transition-colors duration-300
                  ${index < currentStep ? 'bg-green-400' : 'bg-gray-300'}
                `}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm">جاري المعالجة...</span>
        </div>
      </div>
    </div>
  )
}