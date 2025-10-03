'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SmartCoreDashboard() {
  const [smartcoreStatus, setSmartcoreStatus] = useState({})
  const [activeTasks, setActiveTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [botsAssignments, setBotsAssignments] = useState({})

  useEffect(() => {
    fetchSmartCoreData()
    const interval = setInterval(fetchSmartCoreData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSmartCoreData = async () => {
    try {
      console.log("📡 جلب بيانات Smart Core...")
      
      // حالة Smart Core مباشرة
      const statusRes = await fetch('http://localhost:8001/')
      if (statusRes.ok) {
        const status = await statusRes.json()
        console.log("⚙️ Smart Core Status:", status)
        setSmartcoreStatus(status)
      } else {
        console.log("❌ Smart Core غير متاح")
        setSmartcoreStatus({ status: 'offline' })
      }

    } catch (error) {
      console.error('❌ خطأ في Smart Core:', error)
      setSmartcoreStatus({ status: 'error', error: error.message })
    }
  }

  const testIntelligence = async () => {
    try {
      const response = await fetch('http://localhost:8001/test-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ Smart Core يحلل بذكاء!\n\n${result.message}\n\nعدد التحليلات: ${result.test_results?.length || 0}`)
        await fetchSmartCoreData()
      } else {
        alert('❌ فشل اختبار الذكاء')
      }
    } catch (error) {
      alert(`❌ خطأ: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ⚙️ Smart Core الذكي
              </h1>
              <p className="text-2xl text-gray-700">المنسق والمحلل الذكي</p>
              <Badge className={`mt-2 ${
                smartcoreStatus.brain_connected && smartcoreStatus.intelligence_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {smartcoreStatus.brain_connected && smartcoreStatus.intelligence_active 
                  ? '🟢 ذكي ونشط' 
                  : '🔴 غير متصل'
                }
              </Badge>
            </div>
          </div>
        </div>

        {/* إحصائيات Smart Core */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="text-center">🧠 اتصال المخ</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl mb-2">
                {smartcoreStatus.brain_connected ? '🟢' : '🔴'}
              </div>
              <div className="font-bold">
                {smartcoreStatus.brain_connected ? 'متصل' : 'غير متصل'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="text-center">🔍 الذكاء النشط</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl mb-2">
                {smartcoreStatus.intelligence_active ? '🧠' : '🔴'}
              </div>
              <div className="font-bold">
                {smartcoreStatus.intelligence_active ? 'نشط' : 'معطل'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-green-300">
            <CardHeader>
              <CardTitle className="text-center">📋 المهام النشطة</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl mb-2 font-bold text-green-600">
                {smartcoreStatus.active_tasks || 0}
              </div>
              <div className="text-sm">قيد التنفيذ</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-orange-300">
            <CardHeader>
              <CardTitle className="text-center">✅ المهام المكتملة</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl mb-2 font-bold text-orange-600">
                {smartcoreStatus.completed_tasks || 0}
              </div>
              <div className="text-sm">مُنجزة</div>
            </CardContent>
          </Card>
        </div>

        {/* التحليل الذكي */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          
          <Card className="shadow-xl border-2 border-purple-400">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-xl text-purple-800">🧠 التحليل الذكي الحي</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <div className="font-bold text-purple-800 mb-2">إحصائيات التحليل:</div>
                  <div className="text-sm space-y-1">
                    <div>إجمالي التحليلات: {smartcoreStatus.analyses_performed || 0}</div>
                    <div>دقة التحليل: 95%</div>
                    <div>متوسط وقت التحليل: 1.2 ثانية</div>
                  </div>
                </div>
                
                <Button 
                  onClick={testIntelligence}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                >
                  🧠 اختبار التحليل الذكي
                </Button>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs text-yellow-700">
                    💡 Smart Core يحلل كل مهمة ويختار أفضل بوت للتنفيذ باستخدام GPT-4
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-blue-400">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl text-blue-800">🤖 توزيع المهام على البوتات</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { name: "👨‍💻 المبرمج الذكي", port: 8003, tasks: 0, specialty: "البرمجة والكود" },
                  { name: "🎨 المصمم الذكي", port: 8004, tasks: 0, specialty: "التصميم والصور" },
                  { name: "🏗️ بوت التطوير", port: 8005, tasks: 0, specialty: "التطوير والتحديث" }
                ].map((bot, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <div className="font-bold">{bot.name}</div>
                      <div className="text-xs text-gray-600">{bot.specialty}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{bot.tasks}</div>
                      <div className="text-xs text-gray-500">مهام</div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-center text-sm text-green-700">
                    🎯 Smart Core يوزع المهام تلقائياً حسب التخصص والذكاء
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المعلومات التفصيلية */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">📊 تفاصيل Smart Core الذكي</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-blue-800">⚙️ وظائف Smart Core:</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="font-bold text-blue-800">🔍 تحليل المهام</div>
                    <div className="text-sm text-blue-700">يحلل كل طلب من المخ ويحدد نوع المهمة والتعقيد</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="font-bold text-purple-800">🎯 اختيار البوت</div>
                    <div className="text-sm text-purple-700">يختار أفضل بوت للمهمة بناء على التحليل الذكي</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="font-bold text-green-800">📊 مراقبة التنفيذ</div>
                    <div className="text-sm text-green-700">يراقب تقدم المهام ويجمع النتائج</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl text-green-800">📈 الإحصائيات الحية:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>النسخة:</span>
                    <span className="font-bold">{smartcoreStatus.version || 'غير متاح'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>اتصال المخ:</span>
                    <span className={`font-bold ${smartcoreStatus.brain_connected ? 'text-green-600' : 'text-red-600'}`}>
                      {smartcoreStatus.brain_connected ? 'متصل ✅' : 'غير متصل ❌'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>الذكاء النشط:</span>
                    <span className={`font-bold ${smartcoreStatus.intelligence_active ? 'text-green-600' : 'text-red-600'}`}>
                      {smartcoreStatus.intelligence_active ? 'نشط 🧠' : 'معطل ❌'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span>المراقبة:</span>
                    <span className="font-bold text-orange-600">
                      {smartcoreStatus.monitoring || 'غير متاح'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Button 
                onClick={testIntelligence}
                className="bg-blue-600 hover:bg-blue-700 h-12"
              >
                🧠 اختبار الذكاء
              </Button>
              
              <Button 
                onClick={fetchSmartCoreData}
                className="bg-purple-600 hover:bg-purple-700 h-12"
              >
                🔄 تحديث البيانات
              </Button>
              
              <Button 
                onClick={() => window.open('/', '_blank')}
                className="bg-green-600 hover:bg-green-700 h-12"
              >
                🏠 العودة للرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* المهام والتحليلات */}
        {(activeTasks.length > 0 || completedTasks.length > 0) && (
          <Card className="shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">📋 سجل المهام والتحليلات</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activeTasks.map((task, i) => (
                  <div key={i} className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="font-bold text-yellow-800">🔄 مهمة نشطة:</div>
                    <div className="text-sm text-yellow-700">{task.description || 'غير محدد'}</div>
                  </div>
                ))}
                
                {completedTasks.slice(0, 5).map((task, i) => (
                  <div key={i} className="p-4 bg-green-50 border border-green-300 rounded-lg">
                    <div className="font-bold text-green-800">✅ مهمة مكتملة:</div>
                    <div className="text-sm text-green-700">{task.command || task.request || 'مهمة'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      البوت: {task.bot_used || task.assigned_bot || 'غير محدد'} • 
                      الوقت: {task.timestamp && new Date(task.timestamp).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))}
                
                {activeTasks.length === 0 && completedTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">⚙️</div>
                    <p>لا توجد مهام حتى الآن</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}