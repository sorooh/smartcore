'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, Bot, Activity, Database, Settings, Bell, RefreshCw,
  Terminal, Zap, Eye, Github, Mail, Languages,
  Calendar, CheckSquare, Plus, Trash2, PowerOff,
  TrendingUp, Cpu, HardDrive, Wifi
} from "lucide-react"

export default function ProfessionalDashboard() {
  const [systemStats, setSystemStats] = useState({
    brain: { status: 'active', memories: 0, apis: 0, sessions: 0, uptime: '0:00:00' },
    smartcore: { status: 'active', tasks: 0 },
    bots: { active: 3, total: 3, efficiency: 92 },
    performance: { cpu: 67, ram: 45, uptime: '24h 15m' }
  })
  
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('ar')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [storedAPIs, setStoredAPIs] = useState([])
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Gmail متصل (1,731 إيميل)', time: '14:45' },
    { id: 2, type: 'success', message: 'GitHub Auto-Deploy نشط', time: '14:40' },
    { id: 3, type: 'info', message: 'المخ يعالج طلبات جديدة', time: '14:35' }
  ])
  const [gmailData, setGmailData] = useState(null)
  const [githubData, setGithubData] = useState(null)
  const [scheduledTasks, setScheduledTasks] = useState([
    {
      id: 1,
      title: 'مراجعة تقرير المبيعات الشهري',
      description: 'تحليل شامل للأداء وإعداد التقرير التنفيذي',
      dueDate: '2025-10-05',
      priority: 'high',
      status: 'pending',
      progress: 0
    }
  ])
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'normal' })
  const [consoleOutput, setConsoleOutput] = useState([])

  useEffect(() => {
    fetchStoredAPIs()
    fetchSystemStats()
    const interval = setInterval(() => {
      fetchStoredAPIs()
      fetchSystemStats()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStoredAPIs = async () => {
    try {
      const response = await fetch('/api/brain-apis')
      if (response.ok) {
        const data = await response.json()
        setStoredAPIs(data.stored_apis || [])
        setSystemStats(prev => ({ ...prev, brain: { ...prev.brain, apis: data.stored_apis?.length || 0 }}))
      }
    } catch (error) {
      console.error('Error fetching APIs:', error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const [brainRes, coreRes, memoryRes, advancedBrainRes] = await Promise.all([
        fetch('/api/check-system?port=8002'), // المخ القديم
        fetch('/api/check-system?port=8001'), // Smart Core
        fetch('/api/incoming-requests'), // الذاكرة
        fetch('/api/check-system?port=8006') // المخ المتطور الجديد
      ])
      
      const brainData = brainRes.ok ? await brainRes.json() : { status: 'inactive' }
      const coreData = coreRes.ok ? await coreRes.json() : { status: 'inactive' }
      const memoryData = memoryRes.ok ? await memoryRes.json() : { requests: [] }
      const advancedBrainData = advancedBrainRes.ok ? await advancedBrainRes.json() : { status: 'inactive' }
      
      setSystemStats(prev => ({
        brain: { 
          status: advancedBrainData.status === 'operational' || advancedBrainData.status === 'active' ? 'active' : 'inactive',
          memories: advancedBrainData.statistics?.total_documents || 0,
          apis: storedAPIs.length,
          sessions: advancedBrainData.statistics?.total_sessions || 0,
          uptime: advancedBrainData.uptime_human || '0:00:00'
        },
        smartcore: { 
          status: coreData.status === 'active' ? 'active' : 'inactive',
          tasks: coreData.tasks || 0
        },
        bots: { active: 3, total: 3, efficiency: 92 },
        performance: {
          cpu: Math.round(60 + Math.random() * 20),
          ram: Math.round(40 + Math.random() * 20),
          uptime: advancedBrainData.uptime_human || prev.performance.uptime
        }
      }))
      
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const testGmail = async () => {
    try {
      addNotification('بدء قراءة Gmail تلقائياً...', 'info')
      
      const response = await fetch('/api/gmail-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read_recent' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const output = result.output
        const totalMatch = output.match(/إجمالي الإيميلات: (\d+)/)
        const totalEmails = totalMatch ? parseInt(totalMatch[1]) : 0
        
        // استخراج الإيميلات من النتيجة
        const emails = []
        const lines = output.split('\n')
        let currentEmail = {}
        
        lines.forEach(line => {
          if (line.includes('📧 إيميل:')) {
            if (currentEmail.subject) emails.push(currentEmail)
            currentEmail = { subject: line.replace('📧 إيميل:', '').trim() }
          } else if (line.includes('👤 من:')) {
            currentEmail.sender = line.replace('👤 من:', '').trim()
          } else if (line.includes('📅 التاريخ:')) {
            currentEmail.date = line.replace('📅 التاريخ:', '').trim()
          }
        })
        if (currentEmail.subject) emails.push(currentEmail)
        
        setGmailData({
          totalEmails: totalEmails,
          recentEmails: emails,
          lastCheck: new Date().toLocaleString('ar-SA'),
          status: 'success'
        })
        
        // إرسال تلقائي للمخ المتطور
        try {
          console.log('🧠 إرسال إيميلات للمخ المتطور تلقائياً...')
          
          for (const email of emails.slice(0, 5)) { // آخر 5 إيميلات
            const ingestResponse = await fetch('http://localhost:8006/v1/ingest', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
              },
              body: JSON.stringify({
                source_type: 'gmail',
                source_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                raw_payload: email,
                metadata: {
                  email_account: 'samborvat@gmail.com',
                  auto_ingested: true,
                  total_emails_in_account: totalEmails
                }
              })
            })
            
            if (ingestResponse.ok) {
              const ingestResult = await ingestResponse.json()
              console.log(`✅ إيميل "${email.subject?.substring(0, 30)}..." فُهرس في المخ`)
            }
            
            // تأخير بين الإيميلات
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          
          addNotification(`تم تحليل ${emails.length} إيميل في المخ`, 'success')
        } catch (ingestError) {
          console.log('⚠️ تعذر إرسال الإيميلات للمخ:', ingestError.message)
          addNotification('Gmail محفوظ، سيُرسل للمخ لاحقاً', 'warning')
        }
        
        addNotification(`تم قراءة ${totalEmails} إيميل من Gmail`, 'success')
        logCommand(`Gmail check: ${totalEmails} emails found`)
      } else {
        setGmailData({ status: 'error', error: result.error })
        addNotification(`خطأ Gmail: ${result.error}`, 'error')
      }
    } catch (error) {
      setGmailData({ status: 'error', error: error.message })
      addNotification(`خطأ Gmail: ${error.message}`, 'error')
    }
  }

  const testGithub = async () => {
    try {
      const response = await fetch('/api/github-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: Date.now() })
      })
      
      const result = await response.json()
      setGithubData(result)
      
      if (result.success) {
        addNotification('GitHub Deploy نجح', 'success')
        logCommand(`GitHub deploy: ${result.github_url}`)
      } else {
        addNotification(`خطأ GitHub: ${result.error}`, 'error')
      }
    } catch (error) {
      addNotification(`خطأ GitHub: ${error.message}`, 'error')
    }
  }

  const deleteAPI = async (apiId, apiType) => {
    if (!confirm(`حذف ${apiType} API؟`)) return
    
    try {
      console.log(`🗑️ حذف ${apiType} API...`)
      const response = await fetch('/api/delete-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, apiType })
      })
      
      const result = await response.json()
      console.log('نتيجة الحذف:', result)
      
      if (response.ok && result.success) {
        await fetchStoredAPIs()
        alert(`✅ تم حذف ${apiType} API`)
        addNotification(`تم حذف ${apiType} API`, 'success')
      } else {
        alert(`❌ فشل الحذف: ${result.message}`)
        addNotification('فشل الحذف', 'error')
      }
    } catch (error) {
      alert(`❌ خطأ: ${error.message}`)
      addNotification(`خطأ الحذف: ${error.message}`, 'error')
    }
  }

  const addNotification = (message, type) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
  }

  const logCommand = (command) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setConsoleOutput(prev => [`[${timestamp}] ${command}`, ...prev.slice(0, 19)])
  }

  const addScheduledTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      alert('يرجى ملء العنوان والتاريخ')
      return
    }

    const task = {
      id: Date.now(),
      ...newTask,
      status: 'pending',
      progress: 0
    }

    setScheduledTasks(prev => [...prev, task])
    setNewTask({ title: '', description: '', dueDate: '', priority: 'normal' })
    addNotification(`تمت إضافة مهمة: ${task.title}`, 'success')
  }

  const getText = (ar, en) => language === 'ar' ? ar : en

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      
      {/* Header احترافي */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-xl`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  {getText('نواة سُروح', 'Surooh Core')}
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getText('مركز القيادة والتحكم الاحترافي', 'Professional Command & Control Center')}
                </p>
                <div className="flex gap-3 mt-2">
                  <Badge className="bg-green-100 text-green-800">🟢 النظام نشط</Badge>
                  <Badge className="bg-blue-100 text-blue-800">⚡ {systemStats.performance.uptime}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-2xl p-2 shadow-inner">
                {[
                  { id: 'dashboard', icon: '📊', text: getText('التحكم', 'Control') },
                  { id: 'integrations', icon: '🔗', text: getText('APIs', 'APIs') },
                  { id: 'services', icon: '🛠️', text: getText('الخدمات', 'Services') },
                  { id: 'tasks', icon: '📅', text: getText('المهام', 'Tasks') }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-12 px-4 transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl' 
                        : 'hover:bg-white'
                    }`}
                  >
                    <span className="text-lg mr-2">{tab.icon}</span>
                    {tab.text}
                  </Button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="h-12 px-4"
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'EN' : 'عربي'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setDarkMode(!darkMode)}
                className="h-12 px-4"
              >
                {darkMode ? '☀️' : '🌙'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('/surooh', '_blank')}
                className="bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200 h-12 px-4"
              >
                👩‍💼 سُروح
              </Button>
              
              <div className="relative">
                <Button variant="outline" className="h-12 px-4">
                  <Bell className="w-4 h-4 mr-2" />
                  إشعارات
                </Button>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-bounce">
                  {notifications.length}
                </div>
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl">
                ش
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* الإحصائيات الاحترافية */}
            <div className="grid grid-cols-6 gap-6">
              {[
                {
                  title: getText('المخ', 'Brain'),
                  value: '🟢',
                  subtitle: `${systemStats.brain.apis} APIs • ${systemStats.brain.memories} docs • ${systemStats.brain.sessions} sessions`,
                  icon: Brain,
                  color: 'purple'
                },
                {
                  title: 'Smart Core',
                  value: '🟢',
                  subtitle: `${systemStats.smartcore.tasks} tasks active`,
                  icon: Settings,
                  color: 'blue'
                },
                {
                  title: getText('البوتات', 'Bots'),
                  value: `${systemStats.bots.active}/${systemStats.bots.total}`,
                  subtitle: '100% active',
                  icon: Bot,
                  color: 'green'
                },
                {
                  title: 'CPU',
                  value: `${systemStats.performance.cpu}%`,
                  subtitle: 'Processing',
                  icon: Cpu,
                  color: 'orange'
                },
                {
                  title: 'RAM',
                  value: `${systemStats.performance.ram}%`,
                  subtitle: 'Memory',
                  icon: HardDrive,
                  color: 'cyan'
                },
                {
                  title: getText('الشبكة', 'Network'),
                  value: '✅',
                  subtitle: systemStats.performance.uptime,
                  icon: Wifi,
                  color: 'emerald'
                }
              ].map((stat, i) => (
                <Card key={i} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl hover:shadow-2xl transition-all hover:scale-105 ${
                  i === 0 || i === 1 || i === 2 ? 'cursor-pointer' : ''
                }`} onClick={
                  i === 0 ? () => window.open('/brain', '_blank') : 
                  i === 1 ? () => window.open('/smartcore', '_blank') :
                  i === 2 ? () => window.open('/bots', '_blank') : undefined
                }>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex flex-col">
                        <span>{stat.title}</span>
                        {i === 0 && <span className="text-xs text-blue-600 mt-1">← اضغط للمخ</span>}
                        {i === 1 && <span className="text-xs text-blue-600 mt-1">← اضغط لـ Smart Core</span>}
                        {i === 2 && <span className="text-xs text-blue-600 mt-1">← اضغط للبوتات</span>}
                      </div>
                    </CardTitle>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 ${(i === 0 || i === 1 || i === 2) ? 'hover:scale-110 transition-transform' : ''}`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{stat.value}</div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.subtitle}
                    </p>
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3" />
                      +5.2%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* الخدمات الحقيقية */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* Gmail الحقيقي */}
              <Card className="shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Mail className="w-8 h-8 text-red-600" />
                      <div>
                        <span className="text-2xl font-bold">Gmail Reader</span>
                        <div className="text-base text-gray-600">samborvat@gmail.com</div>
                      </div>
                    </CardTitle>
                    <Button 
                      onClick={testGmail}
                      className="bg-red-600 hover:bg-red-700 shadow-xl"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      قراءة الآن
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {gmailData ? (
                    <div className={`p-4 rounded-lg ${gmailData.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {gmailData.success ? (
                        <div>
                          <div className="font-bold text-green-800 mb-2">✅ Gmail يعمل!</div>
                          <div className="text-sm space-y-1">
                            <div>📧 الحساب: {gmailData.gmail_address}</div>
                            <div>📊 الإيميلات: {gmailData.output?.match(/إجمالي الإيميلات: (\d+)/)?.[1] || '0'}</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-red-800">❌ خطأ:</div>
                          <div className="text-red-700 text-sm">{gmailData.error}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="w-16 h-16 mx-auto mb-4 text-red-300" />
                      <p>اضغط "قراءة الآن" لفحص الإيميلات</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* GitHub الحقيقي */}
              <Card className="shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Github className="w-8 h-8 text-purple-600" />
                      <div>
                        <span className="text-2xl font-bold">GitHub Deploy</span>
                        <div className="text-base text-gray-600">sorooh/smartcore</div>
                      </div>
                    </CardTitle>
                    <Button 
                      onClick={testGithub}
                      className="bg-purple-600 hover:bg-purple-700 shadow-xl"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      رفع الآن
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {githubData ? (
                    <div className={`p-4 rounded-lg ${githubData.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {githubData.success ? (
                        <div>
                          <div className="font-bold text-green-800 mb-2">✅ GitHub يعمل!</div>
                          <div className="text-sm space-y-1">
                            <div>📂 {githubData.repo}</div>
                            <div>🔗 <a href={githubData.github_url} target="_blank" className="text-blue-600 underline">عرض الملف</a></div>
                            <div>🆔 {githubData.commit_sha?.substring(0, 12)}...</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-red-800">❌ خطأ:</div>
                          <div className="text-red-700 text-sm">{githubData.error}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Github className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                      <p>اضغط "رفع الآن" للرفع على GitHub</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* البوتات */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bot className="w-6 h-6 text-blue-600" />
                  البوتات المتخصصة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: "👨‍💻 Code Master", port: 8003, efficiency: "94%", task: "تطوير APIs", color: "blue" },
                    { name: "🎨 Design Genius", port: 8004, efficiency: "87%", task: "تحسين UI", color: "pink" },
                    { name: "🏗️ Full-Stack Pro", port: 8005, efficiency: "91%", task: "دمج الأنظمة", color: "green" }
                  ].map((bot, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all">
                      <div className="text-center">
                        <div className="text-xl font-bold mb-2">{bot.name}</div>
                        <div className="text-sm text-gray-600 mb-2">Port: {bot.port}</div>
                        <div className={`text-2xl font-bold text-${bot.color}-600`}>{bot.efficiency}</div>
                        <div className="text-sm text-gray-500">{bot.task}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* الإشعارات والتحكم */}
            <div className="grid grid-cols-3 gap-6">
              
              {/* الإشعارات */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-500" />
                    الإشعارات المباشرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                        notif.type === 'success' ? 'border-green-500 bg-green-50' :
                        notif.type === 'error' ? 'border-red-500 bg-red-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="text-sm font-medium">{notif.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* وحدة التحكم */}
              <Card className="col-span-2 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-green-600" />
                      وحدة التحكم التنفيذية
                    </CardTitle>
                    <Button 
                      variant="outline"
                      onClick={() => setConsoleOutput([])}
                    >
                      مسح
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 h-48 overflow-y-auto">
                    {consoleOutput.map((line, i) => (
                      <div key={i} className="mb-1">
                        <span className="text-blue-400">[LOG]</span> {line}
                      </div>
                    ))}
                    {consoleOutput.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Terminal className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                        <p>سُروح جاهز للتحكم</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* اختبار المخ المتطور */}
            <div className="mt-8">
              <Card className="shadow-2xl border-2 border-purple-400">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="text-2xl font-bold text-center">
                    🧠 اختبار المخ المتطور (Enterprise v2.0.0)
                  </CardTitle>
                  <p className="text-center text-gray-600">
                    اختبار APIs المتقدمة: Query, Execute, Ingest
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-3 gap-6">
                    
                    {/* اختبار الاستعلام الذكي */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-purple-800">🔍 استعلام ذكي</h3>
                      <input 
                        id="query-input"
                        placeholder="اسأل المخ أي شي..."
                        className="w-full p-3 border-2 border-purple-200 rounded-lg"
                        defaultValue="ما هي آخر التحديثات في المشروع؟"
                      />
                      <Button 
                        onClick={async () => {
                          const query = document.getElementById('query-input').value
                          
                          try {
                            const response = await fetch('/api/brain-query', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ query, top_k: 3 })
                            })
                            
                            const result = await response.json()
                            
                            if (result.success) {
                              alert(`✅ المخ أجاب!

الإجابة: ${result.answer}

المصادر: ${result.sources.length}
الثقة: ${(result.confidence * 100).toFixed(1)}%
وقت المعالجة: ${result.processing_time}ms`)
                              addNotification('استعلام المخ نجح', 'success')
                            } else {
                              alert(`❌ فشل الاستعلام: ${result.error}`)
                            }
                          } catch (error) {
                            alert(`❌ خطأ: ${error.message}`)
                          }
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        🔍 استعلام المخ
                      </Button>
                    </div>

                    {/* اختبار تنفيذ المهام */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-blue-800">⚡ تنفيذ مهمة</h3>
                      <select id="agent-select" className="w-full p-3 border-2 border-blue-200 rounded-lg">
                        <option value="code_master">👨‍💻 Code Master</option>
                        <option value="design_genius">🎨 Design Genius</option>
                        <option value="fullstack_pro">🏗️ Full-Stack Pro</option>
                      </select>
                      <input 
                        id="task-input"
                        placeholder="وصف المهمة..."
                        className="w-full p-3 border-2 border-blue-200 rounded-lg"
                        defaultValue="إنشاء صفحة ويب جديدة"
                      />
                      <Button 
                        onClick={async () => {
                          const agent = document.getElementById('agent-select').value
                          const task = document.getElementById('task-input').value
                          
                          try {
                            const response = await fetch('/api/brain-execute', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                agent_name: agent,
                                task_payload: { description: task },
                                priority: 'high'
                              })
                            })
                            
                            const result = await response.json()
                            
                            if (result.success) {
                              alert(`✅ المهمة أُرسلت للبوت!

البوت: ${result.agent_name}
معرف المهمة: ${result.task_id}
الحالة: ${result.status}`)
                              addNotification(`مهمة أُرسلت لـ ${result.agent_name}`, 'success')
                            } else {
                              alert(`❌ فشل التنفيذ: ${result.error}`)
                            }
                          } catch (error) {
                            alert(`❌ خطأ: ${error.message}`)
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        ⚡ تنفيذ على البوت
                      </Button>
                    </div>

                    {/* إحصائيات المخ المتطور */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-green-800">📊 إحصائيات متقدمة</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          <div>🟢 الحالة: {systemStats.brain.status}</div>
                          <div>⏰ وقت التشغيل: {systemStats.brain.uptime}</div>
                          <div>📚 الوثائق: {systemStats.brain.memories}</div>
                          <div>🔗 APIs: {systemStats.brain.apis}</div>
                          <div>👥 الجلسات: {systemStats.brain.sessions}</div>
                        </div>
                      </div>
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/brain-advanced-stats')
                            const result = await response.json()
                            
                            if (result.success) {
                              const stats = result.brain_stats
                              alert(`📊 إحصائيات المخ المتطور:

وقت التشغيل: ${stats.uptime_human}
الوثائق: ${stats.statistics.total_documents}
الجلسات: ${stats.statistics.total_sessions}
المهام النشطة: ${stats.statistics.active_tasks}
المهام المكتملة: ${stats.statistics.completed_tasks}

🎯 الأداء:
- الاستعلامات اليوم: ${stats.performance_metrics.successful_queries_24h}
- فشل الاستعلامات: ${stats.performance_metrics.failed_queries_24h}
- متوسط وقت الرد: ${stats.performance_metrics.average_query_time_ms}ms`)
                            } else {
                              alert(`❌ فشل جلب الإحصائيات: ${result.error}`)
                            }
                          } catch (error) {
                            alert(`❌ خطأ: ${error.message}`)
                          }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        📊 إحصائيات مفصلة
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-center">
                      <div className="font-bold text-yellow-800 mb-2">
                        🎯 المخ المتطور مربوط مع Dashboard!
                      </div>
                      <div className="text-sm text-yellow-700">
                        • استعلام ذكي مع مصادر وثقة
                        <br />• تنفيذ مهام على البوتات المتخصصة  
                        <br />• إحصائيات Enterprise مفصلة
                        <br />• نظام Session وMemory متقدم
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>🔗 إدارة APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <select id="api-type" className="p-3 border rounded-lg">
                    <option value="">اختر النوع</option>
                    <option value="gmail">📧 Gmail</option>
                    <option value="github">🐙 GitHub</option>
                    <option value="bol">🛒 BOL</option>
                  </select>
                  
                  <Input id="api-endpoint" placeholder="API Endpoint" className="h-12" />
                  <Input id="api-key" placeholder="API Key" type="password" className="h-12" />
                  
                  <Button 
                    onClick={async () => {
                      const apiType = document.getElementById('api-type').value
                      const endpoint = document.getElementById('api-endpoint').value
                      const apiKey = document.getElementById('api-key').value
                      
                      if (!apiType || !endpoint || !apiKey) {
                        alert('املأ كل الحقول!')
                        return
                      }
                      
                      try {
                        const response = await fetch('/api/store-api', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ apiType, endpoint, apiKey, userId: 'abu_sham' })
                        })
                        
                        const result = await response.json()
                        if (result.success) {
                          alert(`✅ ${result.message}`)
                          await fetchStoredAPIs()
                          addNotification(`تم ربط ${apiType} API`, 'success')
                          
                          // إرسال تلقائي للمخ المتطور للفهرسة
                          try {
                            console.log(`🧠 إرسال ${apiType} API للمخ المتطور تلقائياً...`)
                            
                            const ingestResponse = await fetch('http://localhost:8006/v1/ingest', {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
                              },
                              body: JSON.stringify({
                                source_type: apiType,
                                source_id: `api_${Date.now()}`,
                                raw_payload: {
                                  api_type: apiType,
                                  endpoint: endpoint,
                                  added_from: 'dashboard',
                                  timestamp: new Date().toISOString(),
                                  capabilities: `${apiType} API integration for Abu Sham`
                                },
                                metadata: {
                                  integrated_from: 'dashboard',
                                  auto_ingested: true
                                }
                              })
                            })
                            
                            if (ingestResponse.ok) {
                              const ingestResult = await ingestResponse.json()
                              addNotification(`${apiType} API تم تحليله في المخ`, 'success')
                              console.log(`✅ ${apiType} API فُهرس في المخ:`, ingestResult)
                            }
                            
                          } catch (ingestError) {
                            console.log(`⚠️ تعذر إرسال ${apiType} للمخ:`, ingestError.message)
                            addNotification(`${apiType} محفوظ، سيُرسل للمخ لاحقاً`, 'warning')
                          }
                          
                          document.getElementById('api-endpoint').value = ''
                          document.getElementById('api-key').value = ''
                        } else {
                          alert(`❌ فشل: ${result.message}`)
                        }
                      } catch (error) {
                        alert(`❌ خطأ: ${error.message}`)
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 h-12"
                  >
                    🚀 ربط مع المخ
                  </Button>
                </div>

                <div className="space-y-4">
                  {storedAPIs.map((api, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-2 border-green-400 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          {api.api_type === 'gmail' ? '📧' :
                           api.api_type === 'github' ? '🐙' :
                           api.api_type === 'bol' ? '🛒' : '🧠'}
                        </span>
                        <div>
                          <div className="font-bold text-lg">{api.api_type} API</div>
                          <div className="text-sm text-gray-600">{api.endpoint}</div>
                          <div className="text-xs text-gray-500">
                            🔒 {api.api_key_hash} • 📅 {api.timestamp && new Date(api.timestamp).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800 font-bold">🟢 نشط</Badge>
                        <Button size="sm" variant="outline">
                          <PowerOff className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAPI(api.id, api.api_type)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {storedAPIs.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Database className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">إضافة API أول</h3>
                      <p className="text-gray-500">ابدأ بربط خدماتك المفضلة</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-2 gap-8">
            
            {/* Gmail Test المفصل */}
            <Card className="shadow-2xl">
              <CardHeader className="bg-red-600 text-white">
                <CardTitle className="text-2xl">📧 Gmail Reader Test</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">الحساب:</div>
                  <div className="font-mono bg-gray-100 p-2 rounded">samborvat@gmail.com</div>
                </div>
                
                <Button 
                  onClick={testGmail}
                  className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg mb-4"
                >
                  📧 قراءة الإيميلات الحقيقية
                </Button>
                
                {gmailData && (
                  <div className={`p-4 rounded-lg ${gmailData.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="font-bold mb-2">
                      {gmailData.success ? '✅ نتائج Gmail:' : '❌ خطأ Gmail:'}
                    </div>
                    {gmailData.success ? (
                      <div>
                        <div className="text-sm">الحساب: {gmailData.gmail_address}</div>
                        <details className="mt-2">
                          <summary className="cursor-pointer">عرض كامل التفاصيل</summary>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-auto max-h-48">
                            {gmailData.output}
                          </pre>
                        </details>
                      </div>
                    ) : (
                      <div className="text-red-700">{gmailData.error}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GitHub Test المفصل */}
            <Card className="shadow-2xl">
              <CardHeader className="bg-purple-600 text-white">
                <CardTitle className="text-2xl">🐙 GitHub Deploy Test</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">المستودع:</div>
                  <div className="font-mono bg-gray-100 p-2 rounded">sorooh/smartcore</div>
                </div>
                
                <Button 
                  onClick={testGithub}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg mb-4"
                >
                  🚀 رفع ملف حقيقي على GitHub
                </Button>
                
                {githubData && (
                  <div className={`p-4 rounded-lg ${githubData.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="font-bold mb-2">
                      {githubData.success ? '✅ نتائج GitHub:' : '❌ خطأ GitHub:'}
                    </div>
                    {githubData.success ? (
                      <div className="text-sm space-y-1">
                        <div>المستودع: {githubData.repo}</div>
                        <div>الرابط: <a href={githubData.github_url} target="_blank" className="text-blue-600 underline">عرض الملف على GitHub</a></div>
                        <div>SHA: {githubData.commit_sha}</div>
                      </div>
                    ) : (
                      <div className="text-red-700">{githubData.error}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📅 إضافة مهمة جديدة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <Input 
                    placeholder="عنوان المهمة"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))}
                    className="col-span-2"
                  />
                  <Input 
                    placeholder="الوصف"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))}
                  />
                  <Input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({...prev, dueDate: e.target.value}))}
                  />
                  <Button 
                    onClick={addScheduledTask}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    📅 إضافة
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📋 المهام المجدولة ({scheduledTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledTasks.map((task) => (
                    <div key={task.id} className={`p-4 rounded-xl border-2 ${
                      task.priority === 'high' ? 'border-red-400 bg-red-50' :
                      task.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                      'border-green-400 bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{task.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{task.description}</div>
                          <div className="text-sm">📅 {new Date(task.dueDate).toLocaleDateString('en-GB')}</div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                            {task.priority}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <CheckSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}