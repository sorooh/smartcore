'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, RotateCcw, Brain } from "lucide-react"

export default function SuroohChatGPTStyle() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'أهلاً أبو شام! أنا سُروح، سكرتيرتك الذكية. متصلة مع المخ المتطور والبوتات الثلاثة. كيف بقدر أساعدك اليوم؟ 💼',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [brainConnection, setBrainConnection] = useState('connected')
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'مرحباً بك في سُروح', date: 'اليوم', messages: 1, active: true },
    { id: 2, title: 'مشروع: موقع تجاري ذكي', date: 'أمس', messages: 8 },
    { id: 3, title: 'مشروع: تصميم شعار سُروح', date: 'أمس', messages: 12 },
    { id: 4, title: 'مشروع: ربط APIs جديدة', date: '2 أيام', messages: 5 },
    { id: 5, title: 'مشروع: تطوير البوتات', date: '3 أيام', messages: 15 }
  ])
  const [currentChatId, setCurrentChatId] = useState(1)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log("👩‍💼 سُروح ترسل للمخ المتطور...")
      
      // إرسال للمخ المتطور مباشرة من سُروح
      const brainResponse = await fetch('http://localhost:8006/v1/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
        },
        body: JSON.stringify({
          user_id: 'abu_sham',
          session_id: sessionId,
          query_text: inputMessage,
          top_k: 5,
          mode: 'hybrid'
        })
      })

      if (brainResponse.ok) {
        const brainResult = await brainResponse.json()
        console.log("🧠 رد المخ:", brainResult)
        
        // تحليل نوع الطلب
        const taskType = analyzeMessageType(inputMessage)
        
        // معالجة ذكية بشخصية سُروح المتطورة
        const suroohResponse = await createIntelligentSuroohResponse(
          brainResult, 
          inputMessage, 
          taskType
        )
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: suroohResponse.content,
          timestamp: new Date(),
          from_brain: true,
          brain_data: {
            confidence: brainResult.confidence_score,
            processing_time: brainResult.processing_time_ms,
            sources: brainResult.sources?.length || 0,
            trace_id: brainResult.trace_id
          },
          task_executed: suroohResponse.taskExecuted,
          task_id: suroohResponse.taskId
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // إذا المهمة تحتاج تنفيذ، أرسل للنظام
        if (suroohResponse.needsExecution) {
          console.log("⚡ سُروح ترسل مهمة للتنفيذ...")
          await executeThroughSystem(inputMessage, taskType, brainResult)
        }
        
        // حفظ المحادثة في ذاكرة سُروح
        await saveSuroohMemory(inputMessage, suroohResponse.content, brainResult)
        
      } else {
        throw new Error('المخ غير متاح')
      }

    } catch (error) {
      console.error('❌ خطأ في سُروح:', error)
      
      // رد ذكي في حالة الخطأ
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant', 
        content: `عذراً أبو شام، واجهت مشكلة تقنية في الاتصال مع المخ المتطور. 

الخطأ: ${error.message}

أحاول إصلاح المشكلة والعودة للخدمة قريباً... 🔧

في غضون ذلك، يمكنك الاطلاع على Dashboard للتحقق من حالة النظام.`,
        timestamp: new Date(),
        from_brain: false,
        error: true
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeMessageType = (message) => {
    const msg = message.toLowerCase()
    
    if (msg.includes('تصميم') || msg.includes('شعار') || msg.includes('صورة') || msg.includes('لون')) {
      return 'design'
    } else if (msg.includes('موقع') || msg.includes('تطبيق') || msg.includes('برمجة') || msg.includes('كود')) {
      return 'development' 
    } else if (msg.includes('مراقبة') || msg.includes('فحص') || msg.includes('موقع') || msg.includes('حساب')) {
      return 'monitoring'
    } else if (msg.includes('تطوير') || msg.includes('تحديث') || msg.includes('نظام')) {
      return 'system_development'
    } else {
      return 'general'
    }
  }

  const createIntelligentSuroohResponse = async (brainResult, originalMessage, taskType) => {
    try {
      // استخدام الذكاء الاصطناعي لإنشاء رد سُروح المتطور
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: originalMessage,
          brain_result: brainResult,
          task_type: taskType,
          user_id: 'abu_sham'
        })
      })

      if (response.ok) {
        const result = await response.json()
        return {
          content: result.surooh_response || createFallbackResponse(brainResult, taskType),
          needsExecution: result.needs_execution || false,
          taskExecuted: result.task_executed || false,
          taskId: result.task_id || null
        }
      } else {
        return {
          content: createFallbackResponse(brainResult, taskType),
          needsExecution: false
        }
      }
      
    } catch (error) {
      return {
        content: createFallbackResponse(brainResult, taskType),
        needsExecution: false
      }
    }
  }

  const createFallbackResponse = (brainResult, taskType) => {
    const taskEmoji = {
      'design': '🎨',
      'development': '👨‍💻', 
      'monitoring': '🌐',
      'system_development': '🏗️',
      'general': '💭'
    }

    return `أبو شام، فهمت طلبك! ${taskEmoji[taskType] || '💭'}

تحليل المخ المتطور:
${brainResult.answer_text}

${brainResult.confidence_score > 0.5 ? 
  'الثقة عالية بالفهم والتحليل!' : 
  'محتاج توضيح أكثر للحصول على نتائج أفضل.'}

الإحصائيات: ${brainResult.sources?.length || 0} مصادر، ${brainResult.processing_time_ms}ms معالجة

إيش تحب نعمل بالموضوع؟`
  }

  const executeThroughSystem = async (message, taskType, brainResult) => {
    try {
      console.log(`⚡ تنفيذ مهمة ${taskType}...`)
      
      // تحديد البوت المناسب
      const botMapping = {
        'design': 'design_genius',
        'development': 'code_master',
        'monitoring': 'account_manager', 
        'system_development': 'fullstack_pro',
        'general': 'fullstack_pro'
      }
      
      const targetBot = botMapping[taskType] || 'fullstack_pro'
      
      // إرسال للمخ للتنفيذ
      const executeResponse = await fetch('http://localhost:8006/v1/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
        },
        body: JSON.stringify({
          agent_name: targetBot,
          task_payload: {
            description: message,
            original_query: message,
            brain_analysis: brainResult.answer_text,
            confidence: brainResult.confidence_score,
            from_surooh: true
          },
          priority: 'normal'
        })
      })
      
      if (executeResponse.ok) {
        const executeResult = await executeResponse.json()
        console.log("✅ تم إرسال المهمة للتنفيذ:", executeResult.task_id)
        
        // إضافة رسالة متابعة من سُروح
        const followUp = {
          id: Date.now() + 2,
          type: 'assistant',
          content: `أبو شام، أرسلت المهمة للنظام! 🚀

📋 معرف المهمة: ${executeResult.task_id}
🤖 البوت المُكلف: ${executeResult.agent_name}  
🔄 الحالة: ${executeResult.status}

أتابع معك التقدم وأعطيك النتيجة حال الانتهاء! ⏰

يمكنك متابعة الحالة من Dashboard → البوتات`,
          timestamp: new Date(),
          from_brain: true,
          execution_data: executeResult
        }
        
        setMessages(prev => [...prev, followUp])
        
        // فحص النتيجة لاحقاً
        setTimeout(async () => {
          await checkTaskResult(executeResult.task_id, executeResult.agent_name)
        }, 8000)
        
      }
      
    } catch (error) {
      console.log('⚠️ فشل تنفيذ المهمة:', error)
    }
  }

  const saveSuroohMemory = async (userMessage, suroohResponse, brainData) => {
    try {
      // حفظ في ذاكرة سُروح
      const memoryEntry = {
        user_message: userMessage,
        surooh_response: suroohResponse,
        brain_confidence: brainData.confidence_score,
        sources_count: brainData.sources?.length || 0,
        timestamp: new Date().toISOString(),
        session_id: sessionId
      }
      
      // حفظ محلياً (في المستقبل سيحفظ في قاعدة البيانات)
      console.log("💾 حفظ المحادثة في ذاكرة سُروح:", memoryEntry)
      
    } catch (error) {
      console.log("⚠️ فشل حفظ الذاكرة:", error)
    }
  }

  const checkTaskResult = async (taskId, agentName) => {
    try {
      console.log(`🔍 فحص نتيجة المهمة ${taskId}...`)
      
      const statusResponse = await fetch(`http://localhost:8006/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
        }
      })

      if (statusResponse.ok) {
        const taskData = await statusResponse.json()
        
        if (taskData.status === 'completed') {
          // إضافة رسالة النتيجة من سُروح
          const resultMessage = {
            id: Date.now() + 3,
            type: 'assistant',
            content: `أبو شام، اكتملت المهمة! ✅

النتيجة من ${agentName}:
${taskData.result?.message || 'تم الإنجاز بنجاح'}

📋 معرف المهمة: ${taskId}
⏰ وقت الإنجاز: ${new Date().toLocaleString('ar-SA')}
💾 تم الحفظ في ذاكرة النظام

بدك شي تاني؟`,
            timestamp: new Date(),
            from_brain: true,
            task_completed: true,
            task_data: taskData
          }
          
          setMessages(prev => [...prev, resultMessage])
          console.log("✅ تم عرض نتيجة المهمة في سُروح")
        }
      }
    } catch (error) {
      console.log('⚠️ فشل فحص النتيجة:', error)
    }
  }

  const startNewChat = () => {
    const newChatId = Date.now()
    const newChat = {
      id: newChatId,
      title: 'دردشة جديدة',
      date: 'الآن',
      messages: 1,
      active: true
    }
    
    setChatHistory(prev => prev.map(chat => ({...chat, active: false})))
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'أهلاً أبو شام! دردشة جديدة مع سُروح. كيف بقدر أساعدك؟ 💼',
        timestamp: new Date()
      }
    ])
  }

  const loadChat = (chatId) => {
    setChatHistory(prev => prev.map(chat => ({
      ...chat, 
      active: chat.id === chatId
    })))
    setCurrentChatId(chatId)
    
    // محاكاة تحميل رسائل محفوظة
    if (chatId === 2) {
      setMessages([
        {
          id: 1,
          type: 'user',
          content: 'بدي أطور موقع تجاري ذكي',
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'assistant',
          content: 'ممتاز أبو شام! المخ حلل طلبك وأرسل للمطور الذكي. تم إنشاء خطة تطوير متكاملة للموقع!',
          timestamp: new Date(),
          from_brain: true
        }
      ])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar مثل ChatGPT */}
      <div className="w-80 bg-gray-900 flex flex-col">
        {/* زر دردشة جديدة */}
        <div className="p-4">
          <Button 
            onClick={startNewChat}
            className="w-full bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-200 justify-start gap-3 h-12 rounded-lg"
          >
            <Send className="w-4 h-4" />
            دردشة جديدة مع سُروح
          </Button>
        </div>

        {/* معلومات سُروح */}
        <div className="px-4 mb-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">👩‍💼</div>
            <div className="text-gray-200 font-bold mb-1">سُروح</div>
            <div className="text-gray-400 text-xs mb-3">السكرتيرة الذكية</div>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            </div>
            <div className="text-gray-400 text-xs mt-1">مخ + سمارت + 3 بوتات</div>
          </div>
        </div>

        {/* قائمة المشاريع والدردشات */}
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-3 px-2">المشاريع والدردشات</div>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                  chat.active ? 'bg-gray-800 border-l-2 border-purple-500' : 'bg-transparent'
                }`}
              >
                <div className="text-gray-200 text-sm font-medium mb-1">
                  {chat.title}
                </div>
                <div className="text-gray-400 text-xs">
                  {chat.date} • {chat.messages} رسائل
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معلومات أبو شام */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
              ش
            </div>
            <div>
              <div className="text-gray-200 text-sm font-medium">أبو شام</div>
              <div className="text-gray-400 text-xs">Sam Borvat</div>
            </div>
          </div>
        </div>
      </div>

      {/* منطقة الدردشة */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">👩‍💼</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  سُروح
                </h1>
                <p className="text-sm text-gray-500">
                  {chatHistory.find(c => c.active)?.title || 'دردشة نشطة'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 text-xs">
                🧠 المخ متصل
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                ⚙️ Smart Core
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                🤖 3 بوتات
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('/?v=fixed', '_blank')}
                className="text-gray-600 hover:text-gray-900 border-2 border-blue-300"
              >
                🎛️ Dashboard الرئيسي
              </Button>
            </div>
          </div>
        </div>

        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👩‍💼</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">سُروح</span>
                      {message.from_brain && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          🧠 من المخ
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Card className={`p-4 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </Card>
                  
                  {message.type === 'user' && (
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <span className="text-sm text-gray-500">أبو شام</span>
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ش</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      سُروح تستشير المخ...
                    </span>
                  </div>
                  <Card className="p-4 bg-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        المخ → Smart Core → البوت...
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* منطقة الإدخال */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-3xl px-4 py-3 shadow-lg">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="أبو شام، احكيلي شو بدك..."
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900"
                dir="rtl"
              />
              
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              سُروح مربوطة مع المخ المتطور وSmart Core والبوتات الثلاثة الذكية
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}