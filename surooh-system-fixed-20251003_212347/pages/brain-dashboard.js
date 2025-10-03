'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Brain, Database, Activity, Zap, Eye, RefreshCw, Search,
  FileText, Users, Clock, Target, Shield, TrendingUp, BarChart3
} from "lucide-react"

export default function BrainDashboard() {
  const [brainStats, setBrainStats] = useState({
    status: 'loading',
    uptime: '0:00:00',
    components: {},
    statistics: {},
    performance_metrics: {}
  })
  
  const [sessions, setSessions] = useState([])
  const [documents, setDocuments] = useState([])
  const [activeTasks, setActiveTasks] = useState([])
  const [queryInput, setQueryInput] = useState('')
  const [queryResult, setQueryResult] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchBrainStats()
    const interval = setInterval(fetchBrainStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBrainStats = async () => {
    try {
      // إحصائيات المخ الأساسية
      const statsResponse = await fetch('http://localhost:8006/')
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setBrainStats(stats)
        
        // إحصائيات مفصلة
        try {
          const metricsResponse = await fetch('http://localhost:8006/v1/metrics', {
            headers: { 'Authorization': 'Bearer surooh-enterprise-token-abu-sham' }
          })
          if (metricsResponse.ok) {
            const metrics = await metricsResponse.json()
            setBrainStats(prev => ({ ...prev, ...metrics }))
          }
        } catch (e) {
          console.log('Metrics not available:', e)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب إحصائيات المخ:', error)
      setBrainStats(prev => ({ ...prev, status: 'error' }))
    }
  }

  const queryBrain = async () => {
    if (!queryInput.trim()) return
    
    try {
      const response = await fetch('http://localhost:8006/v1/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
        },
        body: JSON.stringify({
          user_id: 'abu_sham',
          query_text: queryInput,
          top_k: 3,
          mode: 'hybrid'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setQueryResult(result)
        addLog(`Query executed: ${queryInput} (${result.processing_time_ms}ms)`)
      } else {
        const error = await response.text()
        setQueryResult({ error: error })
        addLog(`Query failed: ${error}`)
      }
    } catch (error) {
      setQueryResult({ error: error.message })
      addLog(`Query error: ${error.message}`)
    }
  }

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:8006/v1/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`✅ تم إنشاء جلسة جديدة!\n\nSession ID: ${result.session_id}`)
        addLog(`Session created: ${result.session_id}`)
        await fetchBrainStats()
      }
    } catch (error) {
      alert(`❌ خطأ: ${error.message}`)
    }
  }

  const testAPIsIntegration = async () => {
    try {
      addLog('بدء اختبار تكامل APIs مع المخ...')
      
      // جلب APIs المحفوظة
      const apisResponse = await fetch('/api/brain-apis')
      const apisData = await apisResponse.json()
      
      addLog(`تم جلب ${apisData.stored_apis?.length || 0} APIs من Dashboard`)
      
      // لكل API، أرسل بياناته للمخ للتحليل
      for (const api of apisData.stored_apis || []) {
        try {
          // إرسال بيانات API للمخ للفهرسة
          const ingestResponse = await fetch('http://localhost:8006/v1/ingest', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer surooh-enterprise-token-abu-sham'
            },
            body: JSON.stringify({
              source_type: api.api_type,
              source_id: api.id,
              raw_payload: {
                endpoint: api.endpoint,
                api_key_hash: api.api_key_hash,
                timestamp: api.timestamp,
                capabilities: `${api.api_type} API integration`
              },
              metadata: {
                api_type: api.api_type,
                integrated_from: 'dashboard',
                user_id: 'abu_sham'
              }
            })
          })
          
          if (ingestResponse.ok) {
            const result = await ingestResponse.json()
            addLog(`✅ تم تحليل وفهرسة ${api.api_type} API - ${result.chunks_created} قطعة`)
          } else {
            addLog(`❌ فشل تحليل ${api.api_type} API`)
          }
          
        } catch (e) {
          addLog(`❌ خطأ في ${api.api_type}: ${e.message}`)
        }
        
        // تأخير بين الطلبات
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      addLog('✅ انتهى اختبار تكامل APIs مع المخ')
      alert('تم تحليل وفهرسة كل APIs في المخ!')
      
      // تحديث الإحصائيات
      await fetchBrainStats()
      
    } catch (error) {
      addLog(`❌ خطأ عام: ${error.message}`)
      alert(`❌ خطأ: ${error.message}`)
    }
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)])
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': 
      case 'active': return 'text-green-500'
      case 'error':
      case 'failed': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🧠 المخ المتطور
              </h1>
              <p className="text-2xl text-gray-700">SmartCore Enterprise v2.0.0</p>
              <Badge className={`mt-2 ${brainStats.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {brainStats.status === 'operational' ? '🟢 عملياتي' : '🔴 غير متاح'}
              </Badge>
            </div>
          </div>
        </div>

        {/* إحصائيات المخ المتطور */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {brainStats.status === 'operational' ? '🟢' : '🔴'}
                </div>
                <div className="font-bold text-lg">{brainStats.status}</div>
                <div className="text-sm text-gray-600">⏰ {brainStats.uptime_human}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                الذاكرة والوثائق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {brainStats.statistics?.total_documents || 0}
                </div>
                <div className="text-sm text-gray-600">وثائق محفوظة</div>
                <div className="text-xs text-gray-500">
                  ~{brainStats.memory_usage?.estimated_size_mb || 0} MB
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                الجلسات والمهام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {brainStats.statistics?.total_sessions || 0}
                </div>
                <div className="text-sm text-gray-600">جلسات نشطة</div>
                <div className="text-xs text-gray-500">
                  {brainStats.statistics?.active_tasks || 0} مهام نشطة
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-orange-600">
                  {brainStats.performance_metrics?.average_query_time_ms || 0}ms
                </div>
                <div className="text-sm text-gray-600">متوسط الاستجابة</div>
                <div className="text-xs text-gray-500">
                  {brainStats.performance_metrics?.successful_queries_24h || 0} استعلام/يوم
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المكونات النشطة */}
        <Card className="shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">🔧 مكونات المخ المتطور</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(brainStats.components || {}).map(([component, status]) => (
                <div key={component} className={`p-4 rounded-lg border-2 ${
                  status === 'active' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                }`}>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1">
                      {component === 'api_gateway' ? '🔐 API Gateway' :
                       component === 'memory_service' ? '💾 Memory Service' :
                       component === 'search_engine' ? '🔍 Search Engine' :
                       component === 'orchestrator' ? '⚙️ Orchestrator' : component}
                    </div>
                    <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {status === 'active' ? '🟢 نشط' : '🔴 متوقف'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* اختبار المخ المباشر */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          
          {/* استعلام المخ */}
          <Card className="shadow-xl border-2 border-purple-300">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-xl">🔍 استعلام المخ المباشر</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Input 
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="اسأل المخ أي شي..."
                  className="h-12 border-2 border-purple-200"
                />
                
                <Button 
                  onClick={queryBrain}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  disabled={!queryInput.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  🔍 استعلام المخ
                </Button>
                
                {queryResult && (
                  <div className={`p-4 rounded-lg border ${
                    queryResult.error ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
                  }`}>
                    {queryResult.error ? (
                      <div>
                        <div className="font-bold text-red-800">❌ خطأ:</div>
                        <div className="text-red-700 text-sm">{queryResult.error}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-green-800 mb-2">✅ إجابة المخ:</div>
                        <div className="text-sm mb-3">{queryResult.answer_text}</div>
                        <div className="text-xs text-gray-600">
                          🎯 الثقة: {(queryResult.confidence_score * 100).toFixed(1)}% • 
                          ⚡ الوقت: {queryResult.processing_time_ms}ms • 
                          📄 المصادر: {queryResult.sources?.length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* إدارة الجلسات */}
          <Card className="shadow-xl border-2 border-blue-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl">👥 إدارة الجلسات</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button 
                  onClick={createSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                >
                  <Users className="w-4 h-4 mr-2" />
                  إنشاء جلسة جديدة
                </Button>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {brainStats.statistics?.total_sessions || 0}
                    </div>
                    <div className="text-sm text-blue-700">جلسات نشطة</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    alert('قائمة الجلسات ستظهر هنا مع تطوير أكثر')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  عرض كل الجلسات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* اختبار تكامل APIs */}
        <Card className="shadow-2xl border-2 border-green-400 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-2xl font-bold text-center">
              🔗 اختبار تكامل APIs مع المخ
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              ربط APIs Dashboard مع المخ للتحليل والفهرسة
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                سيتم أخذ كل APIs المحفوظة في Dashboard وإرسالها للمخ للتحليل والفهرسة
              </p>
              
              <Button 
                onClick={testAPIsIntegration}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 px-8 text-xl font-bold shadow-2xl"
              >
                🚀 ربط وتحليل كل APIs مع المخ
              </Button>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="text-sm text-yellow-700">
                  💡 هذا سيأخذ APIs من Dashboard (Gmail, GitHub, BOL, إلخ) ويحللها في المخ المتطور
                  <br />📊 المخ سيفهرس كل API ويخزن قدراته للاستعلام لاحقاً
                  <br />🔍 بعدها تقدر تسأل المخ "شو APIs الموجودة؟" أو "كيف أستخدم GitHub API؟"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* سجل العمليات المباشر */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                سجل عمليات المخ المباشر
              </CardTitle>
              <Button 
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
              >
                مسح السجل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                  <p>سجل العمليات فارغ - ابدأ باختبار المخ</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}