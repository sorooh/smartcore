'use client'

import { useState, useRef, useEffect } from 'react'
import { SuroohAvatar } from './SuroohAvatar'
import { BrainVisualization } from './BrainVisualization'
import { MessageAnalyzer } from './MessageAnalyzer'
import { LearningIndicator } from './LearningIndicator'

export function AdvancedChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [chatMode, setChatMode] = useState('smart') // smart, creative, analytical, learning
  const [brainActivity, setBrainActivity] = useState({})
  const [learningProgress, setLearningProgress] = useState(0)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ar-SA'),
      files: attachedFiles,
      mode: chatMode,
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachedFiles([])
    setIsLoading(true)

    // Simulate brain activity
    setBrainActivity({ 
      perception: 100, 
      analysis: 80, 
      reasoning: 60, 
      creativity: 40, 
      learning: 20 
    })

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/surooh/advanced-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          user_id: 'abo_sham',
          session_id: Date.now().toString(),
          chat_mode: chatMode,
          attached_files: attachedFiles,
          context: messages.slice(-5) // Last 5 messages for context
        })
      })

      const data = await response.json()
      
      const suroohMessage = {
        id: Date.now() + 1,
        text: data.response || 'عذراً، حدث خطأ في النظام.',
        sender: 'surooh',
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        brain_layers: data.brain_layers || [],
        learning_insights: data.learning_insights || [],
        confidence_score: data.confidence_score || 85,
        knowledge_gained: data.knowledge_gained || 0,
        type: data.response_type || 'text'
      }

      setMessages(prev => [...prev, suroohMessage])
      
      // Update learning progress
      if (data.knowledge_gained) {
        setLearningProgress(prev => Math.min(prev + data.knowledge_gained, 100))
      }

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
      setBrainActivity({})
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files)
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))
    setAttachedFiles(prev => [...prev, ...fileData])
  }

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const chatModes = [
    { id: 'smart', name: 'ذكي', icon: '🧠', color: 'blue' },
    { id: 'creative', name: 'إبداعي', icon: '🎨', color: 'purple' },
    { id: 'analytical', name: 'تحليلي', icon: '📊', color: 'green' },
    { id: 'learning', name: 'تعلّم', icon: '📚', color: 'orange' }
  ]

  const quickCommands = [
    { command: '/analyze', description: 'تحليل البيانات المرفقة', icon: '🔍' },
    { command: '/learn', description: 'تعلم من المعلومات الجديدة', icon: '🎓' },
    { command: '/create', description: 'إنشاء محتوى جديد', icon: '✨' },
    { command: '/code', description: 'كتابة أو مراجعة كود', icon: '💻' },
    { command: '/design', description: 'تصميم واجهات أو تخطيطات', icon: '🎨' },
    { command: '/strategy', description: 'وضع استراتيجيات أعمال', icon: '🎯' }
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <SuroohAvatar size="md" animated={isLoading} />
            <div>
              <h3 className="font-bold text-lg">سُروح المتطورة</h3>
              <p className="text-blue-100 text-sm">المخ الذكي متعدد الطبقات</p>
            </div>
          </div>
          
          {/* Learning Progress */}
          <LearningIndicator progress={learningProgress} />
        </div>

        {/* Chat Mode Selector */}
        <div className="flex space-x-2 rtl:space-x-reverse mt-4">
          {chatModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setChatMode(mode.id)}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                chatMode === mode.id 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brain Activity Visualization */}
      {Object.keys(brainActivity).length > 0 && (
        <BrainVisualization activity={brainActivity} />
      )}

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-white/30">
        {messages.length === 0 ? (
          <div className="text-center text-blue-600 py-8">
            <SuroohAvatar size="xl" />
            <p className="mt-4 text-xl font-bold">أهلاً أبو شام! 🌸</p>
            <p className="text-lg text-blue-700 mt-2">مخي الجديد متعدد الطبقات جاهز لخدمتك</p>
            <div className="grid grid-cols-2 gap-2 mt-6 max-w-md mx-auto">
              {quickCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => setInput(cmd.command + ' ')}
                  className="flex items-center space-x-2 rtl:space-x-reverse bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <span>{cmd.icon}</span>
                  <span>{cmd.command}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 rtl:space-x-reverse max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse rtl:flex-row' : ''
              }`}>
                {message.sender === 'surooh' && <SuroohAvatar size="sm" />}
                
                <div className={`
                  px-5 py-4 rounded-2xl shadow-md
                  ${message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : message.isError 
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-blue-100'
                  }
                `}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Attached Files */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse text-xs bg-blue-50 px-2 py-1 rounded">
                          <span>📎</span>
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Brain Analysis */}
                  {message.brain_layers && message.brain_layers.length > 0 && (
                    <MessageAnalyzer layers={message.brain_layers} confidence={message.confidence_score} />
                  )}
                  
                  {/* Learning Insights */}
                  {message.learning_insights && message.learning_insights.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs font-bold text-green-700 mb-1">تعلمت شيء جديد:</p>
                      {message.learning_insights.map((insight, index) => (
                        <p key={index} className="text-xs text-green-600">• {insight}</p>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">{message.timestamp}</span>
                    {message.confidence_score && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        ثقة: {message.confidence_score}%
                      </span>
                    )}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
              <div className="bg-white px-5 py-4 rounded-2xl shadow-md border border-blue-100">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="typing-indicator">
                    <div className="typing-dot bg-blue-400"></div>
                    <div className="typing-dot bg-blue-400"></div>
                    <div className="typing-dot bg-blue-400"></div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">المخ يفكر بعمق...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Advanced Input Area */}
      <div className="p-4 border-t border-blue-100 bg-white/80">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-blue-50 px-3 py-2 rounded-lg text-sm">
                <span className="text-blue-600 mr-2">📎</span>
                <span className="text-blue-700">{file.name}</span>
                <button 
                  onClick={() => removeFile(index)}
                  className="mr-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-end space-x-3 rtl:space-x-reverse">
          {/* File Attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileAttach}
          />

          {/* Voice Recording */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'text-red-500 bg-red-50 animate-pulse' 
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            🎤
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`اكتب رسالتك لسُروح... (${chatModes.find(m => m.id === chatMode)?.name} وضع)`}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-right bg-white/90"
              rows="2"
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg"
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>

        {/* Quick Commands Helper */}
        <div className="mt-2 text-xs text-blue-600">
          <span>أوامر سريعة: /analyze /learn /create /code /design /strategy</span>
        </div>
      </div>
    </div>
  )
}