'use client'

import { useState, useRef, useEffect } from 'react'
import { SuroohAvatar } from './SuroohAvatar'
import { AutomationFlow } from './AutomationFlow'

export function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFlow, setShowFlow] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ar-SA')
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowFlow(true)

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/surooh/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          user_id: 'abo_sham',
          session_id: Date.now().toString()
        })
      })

      const data = await response.json()
      
      const suroohMessage = {
        id: Date.now() + 1,
        text: data.response || 'عذراً، حدث خطأ في النظام. حاول مرة أخرى.',
        sender: 'surooh',
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        flow_trace: data.flow_trace || []
      }

      setMessages(prev => [...prev, suroohMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'عذراً، لا أستطيع الاتصال بالنظام حالياً. تأكد من أن الخادم يعمل.',
        sender: 'surooh',
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => setShowFlow(false), 3000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { icon: '💻', text: 'أريد برمجة تطبيق جديد', action: () => setInput('أريد برمجة تطبيق جديد') },
    { icon: '🎨', text: 'تصميم واجهة مستخدم', action: () => setInput('أريد تصميم واجهة مستخدم جميلة') },
    { icon: '📊', text: 'إنشاء dashboard إداري', action: () => setInput('أريد إنشاء dashboard إداري متكامل') },
    { icon: '🤖', text: 'إضافة ذكاء اصطناعي', action: () => setInput('أريد إضافة ذكاء اصطناعي للمشروع') }
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 overflow-hidden">
      {/* Automation Flow Indicator */}
      {showFlow && <AutomationFlow />}
      
      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-blue-600 py-8">
            <SuroohAvatar size="lg" />
            <p className="mt-4 text-lg">ابدأ محادثة مع سُروح...</p>
            <p className="text-sm opacity-75">جربني في أي شي تريده</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 rtl:space-x-reverse max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse rtl:flex-row' : ''
              }`}>
                {message.sender === 'surooh' && <SuroohAvatar size="sm" />}
                <div className={`
                  px-4 py-3 rounded-2xl
                  ${message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.isError 
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className="text-xs opacity-75 mt-1 block">{message.timestamp}</span>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                    أش
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <SuroohAvatar size="sm" animated />
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-xs text-gray-500">سُروح تفكر...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100">
          <p className="text-sm text-blue-700 mb-2 font-semibold">إجراءات سريعة:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-200 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-blue-100 bg-white/80">
        <div className="flex space-x-3 rtl:space-x-reverse">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك لسُروح..."
              className="w-full px-4 py-3 border border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-right"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  )
}