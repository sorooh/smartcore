'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function CleanDashboard() {
  const [brainStatus, setBrainStatus] = useState('connecting')
  const [apis, setApis] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    checkSystem()
    const interval = setInterval(checkSystem, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkSystem = async () => {
    try {
      const [brainRes, apisRes, smartBrainRes] = await Promise.all([
        fetch('/api/brain-status'),
        fetch('/api/brain-apis'),
        fetch('/api/smart-brain-stats')
      ])

      setBrainStatus(brainRes.ok ? 'connected' : 'error')
      
      if (apisRes.ok) {
        const data = await apisRes.json()
        setApis(data.stored_apis || [])
      }
      
      // عرض نشاط المخ الذكي
      if (smartBrainRes.ok) {
        const smartData = await smartBrainRes.json()
        if (smartData.success && smartData.smart_brain_active) {
          addActivity(`🧠 المخ الذكي: حلل ${smartData.stats.apis_analyzed} APIs و ${smartData.stats.requests_processed} طلب`)
        }
      }
    } catch (error) {
      setBrainStatus('error')
    }
  }

  const addActivity = (msg) => {
    setActivities(prev => [{
      id: Date.now(),
      msg,
      time: new Date().toLocaleTimeString('ar-SA')
    }, ...prev.slice(0, 99)])
  }

  const connectAPI = async () => {
    const type = document.getElementById('api-type').value
    const endpoint = document.getElementById('api-endpoint').value  
    const key = document.getElementById('api-key').value

    if (!type || !endpoint || !key) {
      alert('املأ كل الحقول')
      return
    }

    try {
      addActivity(`جاري ربط ${type} API...`)
      
      const response = await fetch('/api/store-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiType: type, endpoint, apiKey: key, userId: 'abu_sham' })
      })

      const result = await response.json()

      if (result.success) {
        addActivity(`✅ تم ربط ${type} API مع المخ`)
        await checkSystem()
        alert(`✅ ${result.message}`)
        document.getElementById('api-endpoint').value = ''
        document.getElementById('api-key').value = ''
      } else {
        addActivity(`❌ فشل ربط ${type}: ${result.message}`)
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      addActivity(`❌ خطأ ربط API: ${error.message}`)
      alert(`❌ ${error.message}`)
    }
  }

  const deleteAPI = async (apiId, apiType) => {
    if (!confirm(`حذف ${apiType} API؟`)) return

    try {
      addActivity(`جاري حذف ${apiType} API...`)
      
      const response = await fetch('/api/delete-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, apiType })
      })

      if (response.ok) {
        addActivity(`✅ تم حذف ${apiType} API من المخ`)
        await checkSystem()
        alert(`✅ تم الحذف`)
      } else {
        const error = await response.json()
        addActivity(`❌ فشل حذف ${apiType}: ${error.message}`)
        alert(`❌ فشل الحذف`)
      }
    } catch (error) {
      addActivity(`❌ خطأ حذف: ${error.message}`)
      alert(`❌ خطأ`)
    }
  }

  const testGmail = async () => {
    try {
      addActivity('جاري قراءة Gmail...')
      
      const response = await fetch('/api/gmail-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' })
      })

      const result = await response.json()

      if (result.success) {
        const totalEmails = result.output.match(/إجمالي الإيميلات: (\d+)/)?.[1] || '0'
        addActivity(`✅ Gmail: ${totalEmails} إيميل من ${result.gmail_address}`)
        alert(`✅ Gmail يعمل!\nالحساب: ${result.gmail_address}\nالإيميلات: ${totalEmails}`)
      } else {
        addActivity(`❌ فشل Gmail: ${result.error}`)
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      addActivity(`❌ خطأ Gmail: ${error.message}`)
      alert(`❌ ${error.message}`)
    }
  }

  const deployGithub = async () => {
    try {
      addActivity('جاري رفع المشروع على GitHub...')
      
      const response = await fetch('/api/github-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: Date.now() })
      })

      const result = await response.json()

      if (result.success) {
        addActivity(`✅ GitHub: رُفع ${result.files_uploaded || 1} ملف`)
        alert(`✅ GitHub يعمل!\nالرابط: ${result.github_url || result.project_url}`)
      } else {
        addActivity(`❌ فشل GitHub: ${result.error}`)
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      addActivity(`❌ خطأ GitHub: ${error.message}`)
      alert(`❌ ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto" dir="rtl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🧠 نواة سُروح</h1>
            <p className="text-lg text-gray-600">Dashboard نظيف مربوط مع المخ</p>
          </div>
          <Button 
            onClick={() => window.open('/brain', '_blank')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            🧠 فتح المخ
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>🧠 المخ</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl mb-2">
                {brainStatus === 'connected' ? '🟢' : '🔴'}
              </div>
              <div className="text-sm">
                {brainStatus === 'connected' ? 'متصل' : 'خطأ'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>🔗 APIs</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl mb-2">{apis.length}</div>
              <div className="text-sm">محفوظة</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>📧 Gmail</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testGmail} className="w-full bg-red-600 hover:bg-red-700">
                قراءة
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>🐙 GitHub</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={deployGithub} className="w-full bg-purple-600 hover:bg-purple-700">
                رفع
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>➕ ربط API جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select id="api-type" className="w-full p-3 border rounded">
                <option value="">اختر النوع</option>
                <option value="github">🐙 GitHub</option>
                <option value="gmail">📧 Gmail</option>
                <option value="bol">🛒 BOL</option>
              </select>
              
              <Input id="api-endpoint" placeholder="API Endpoint" />
              <Input id="api-key" placeholder="API Key" type="password" />
              
              <Button onClick={connectAPI} className="w-full bg-green-600 hover:bg-green-700">
                🔗 ربط مع المخ
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>📋 سجل العمليات (دائم)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
                {activities.map(activity => (
                  <div key={activity.id} className="mb-1">
                    [{activity.time}] {activity.msg}
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-gray-500 text-center py-16">
                    لا توجد أنشطة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>🗂️ APIs المحفوظة ({apis.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apis.map(api => (
                <div key={api.id} className="flex justify-between items-center p-4 border rounded bg-green-50">
                  <div>
                    <div className="font-bold">
                      {api.api_type === 'gmail' ? '📧' :
                       api.api_type === 'github' ? '🐙' :
                       api.api_type === 'bol' ? '🛒' : '🧠'} {api.api_type} API
                    </div>
                    <div className="text-sm text-gray-600">{api.endpoint}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800">🟢 متصل</Badge>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteAPI(api.id, api.api_type)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
              {apis.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد APIs
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}