'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RealTestPage() {
  const [gmailData, setGmailData] = useState(null)
  const [githubData, setGithubData] = useState(null)
  const [loading, setLoading] = useState({ gmail: false, github: false })

  const testGmail = async () => {
    setLoading(prev => ({ ...prev, gmail: true }))
    try {
      console.log("📧 اختبار Gmail الحقيقي...")
      
      const response = await fetch('/api/gmail-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' })
      })
      
      const result = await response.json()
      console.log("Gmail Result:", result)
      
      if (result.success) {
        const output = result.output
        const totalMatch = output.match(/إجمالي الإيميلات: (\d+)/)
        const totalEmails = totalMatch ? parseInt(totalMatch[1]) : 0
        
        setGmailData({
          success: true,
          output: output,
          totalEmails: totalEmails,
          address: result.gmail_address,
          lastCheck: new Date().toLocaleString('ar-SA')
        })
        
        alert(`✅ Gmail يعمل!\n\nالحساب: ${result.gmail_address}\nإجمالي: ${totalEmails} إيميل`)
      } else {
        setGmailData({
          success: false,
          error: result.error,
          lastCheck: new Date().toLocaleString('ar-SA')
        })
        alert(`❌ فشل Gmail: ${result.error}`)
      }
    } catch (error) {
      setGmailData({
        success: false,
        error: error.message,
        lastCheck: new Date().toLocaleString('ar-SA')
      })
      alert(`❌ خطأ: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, gmail: false }))
    }
  }

  const testGithub = async () => {
    setLoading(prev => ({ ...prev, github: true }))
    try {
      console.log("🚀 اختبار GitHub الحقيقي...")
      
      const response = await fetch('/api/github-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      })
      
      const result = await response.json()
      console.log("GitHub Result:", result)
      
      if (result.success) {
        setGithubData({
          success: true,
          url: result.github_url,
          repo: result.repo,
          sha: result.commit_sha,
          message: result.message,
          timestamp: new Date().toLocaleString('ar-SA')
        })
        
        alert(`✅ GitHub يعمل!\n\nالمستودع: ${result.repo}\nالرابط: ${result.github_url}`)
      } else {
        setGithubData({
          success: false,
          error: result.error,
          timestamp: new Date().toLocaleString('ar-SA')
        })
        alert(`❌ فشل GitHub: ${result.error}`)
      }
    } catch (error) {
      setGithubData({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('ar-SA')
      })
      alert(`❌ خطأ: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, github: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🧠 سُروح - اختبار الخدمات الحقيقية
          </h1>
          <p className="text-lg text-gray-600">
            اختبار Gmail و GitHub مع credentials أبو شام الحقيقية
          </p>
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mt-4">
            <p className="font-bold text-yellow-800">
              🎯 هذا اختبار حقيقي - ليس demo!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          
          {/* Gmail Test */}
          <Card className="shadow-2xl">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="text-2xl">
                📧 Gmail Reader Test
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">الحساب المستخدم:</div>
                <div className="font-mono bg-gray-100 p-2 rounded">samborvat@gmail.com</div>
              </div>
              
              <Button 
                onClick={testGmail}
                disabled={loading.gmail}
                className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg mb-4"
              >
                {loading.gmail ? "🔄 جاري القراءة..." : "📧 قراءة الإيميلات الآن"}
              </Button>
              
              {gmailData && (
                <div className={`p-4 rounded-lg ${
                  gmailData.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  <div className="font-bold mb-2">
                    {gmailData.success ? '✅ النتيجة:' : '❌ خطأ:'}
                  </div>
                  
                  {gmailData.success ? (
                    <div className="text-sm space-y-2">
                      <div>📊 إجمالي الإيميلات: <span className="font-bold text-lg">{gmailData.totalEmails?.toLocaleString()}</span></div>
                      <div>📧 الحساب: {gmailData.address}</div>
                      <div>⏰ وقت الفحص: {gmailData.lastCheck}</div>
                      
                      <details className="mt-3">
                        <summary className="cursor-pointer font-bold">📋 عرض كل تفاصيل الإيميلات</summary>
                        <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 font-mono text-xs">
                          <pre>{gmailData.output}</pre>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      {gmailData.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub Test */}
          <Card className="shadow-2xl">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle className="text-2xl">
                🐙 GitHub Deploy Test
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">المستودع المستخدم:</div>
                <div className="font-mono bg-gray-100 p-2 rounded">sorooh/smartcore</div>
              </div>
              
              <Button 
                onClick={testGithub}
                disabled={loading.github}
                className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg mb-4"
              >
                {loading.github ? "🔄 جاري الرفع..." : "🚀 رفع ملف على GitHub الآن"}
              </Button>
              
              {githubData && (
                <div className={`p-4 rounded-lg ${
                  githubData.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  <div className="font-bold mb-2">
                    {githubData.success ? '✅ النتيجة:' : '❌ خطأ:'}
                  </div>
                  
                  {githubData.success ? (
                    <div className="text-sm space-y-2">
                      <div>📂 المستودع: <span className="font-bold">{githubData.repo}</span></div>
                      <div>🚀 وقت الرفع: {githubData.timestamp}</div>
                      <div>🆔 Commit SHA: <span className="font-mono text-xs">{githubData.sha}</span></div>
                      <div>
                        🔗 الرابط: 
                        <a href={githubData.url} target="_blank" className="text-blue-600 underline ml-1 font-bold">
                          عرض الملف على GitHub
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      {githubData.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🎯 أبو شام، هذا دليل على الصدق!
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            الأزرار فوق تستخدم credentials الحقيقية وتتصل بالخدمات الفعلية
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="font-bold">📧 Gmail:</div>
              <div className="text-sm">samborvat@gmail.com</div>
              <div className="text-xs text-gray-500">App Password: nrrc dcbv wcuu cpve</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="font-bold">🐙 GitHub:</div>
              <div className="text-sm">sorooh/smartcore</div>
              <div className="text-xs text-gray-500">Token: ghp_LTkSSD88ec...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}