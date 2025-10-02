'use client'

import { useState, useEffect, useRef } from 'react'
import { AdvancedChatInterface } from './components/AdvancedChatInterface'
import { SuroohAvatar } from './components/SuroohAvatar'
import { SystemStatus } from './components/SystemStatus'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    secretary: false,
    brain: false,
    smartCore: false,
    bots: false
  })

  useEffect(() => {
    // Simulate system connection
    const connectSystem = async () => {
      // Secretary connection
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, secretary: true }))
      }, 1000)
      
      // Brain connection  
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, brain: true }))
      }, 2000)
      
      // Smart Core connection
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, smartCore: true }))
      }, 3000)
      
      // Bots connection
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, bots: true }))
        setIsConnected(true)
      }, 4000)
    }

    connectSystem()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <SuroohAvatar size="lg" animated={isConnected} />
              <div>
                <h1 className="text-2xl font-bold text-blue-900">منظومة سُروح</h1>
                <p className="text-blue-600 text-sm">النسخة الرقمية من أبو شام</p>
              </div>
            </div>
            <SystemStatus status={systemStatus} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!isConnected ? (
            <div className="text-center py-16">
              <SuroohAvatar size="xl" animated={true} />
              <h2 className="text-2xl font-bold text-blue-900 mt-6 mb-4">
                جاري تهيئة منظومة سُروح...
              </h2>
              <p className="text-blue-600 mb-8">
                يتم الآن تحميل وربط جميع مكونات النظام الذكي
              </p>
              <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                <div className={`px-4 py-2 rounded-full text-sm ${
                  systemStatus.secretary ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  🌸 السكرتيرة
                </div>
                <div className={`px-4 py-2 rounded-full text-sm ${
                  systemStatus.brain ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  🧠 المخ
                </div>
                <div className={`px-4 py-2 rounded-full text-sm ${
                  systemStatus.smartCore ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  ⚙️ المنسق الذكي
                </div>
                <div className={`px-4 py-2 rounded-full text-sm ${
                  systemStatus.bots ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  🤖 البوتات
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-blue-200 shadow-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <SuroohAvatar size="md" animated={true} />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-2 text-xl">مرحباً أبو شام! 🌸</h3>
                    <p className="text-blue-800 leading-relaxed">
                      أنا سُروح المتطورة، مع المخ الجديد متعدد الطبقات! الآن يمكنني التعلم والتطور المستمر. 
                      عندي 7 طبقات ذكية تشتغل متزامنة: الإدراك، التحليل، المنطق، الإبداع، التعلم، الذاكرة، والتركيب.
                    </p>
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm flex items-center">
                        <span className="mr-2">🧠</span> تفكير متقدم
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center">
                        <span className="mr-2">🎓</span> تعلم ذاتي
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm flex items-center">
                        <span className="mr-2">📚</span> ذاكرة طويلة
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm flex items-center">
                        <span className="mr-2">⚡</span> معالجة فورية
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Chat Interface */}
              <AdvancedChatInterface />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-blue-600">
            <p className="font-semibold">مجموعة سُروح القابضة | Surooh Holding Group B.V</p>
            <p className="text-sm mt-1">🌸 "لا شيء مستحيل – زنبق صخر الصوان"</p>
          </div>
        </div>
      </footer>
    </div>
  )
}