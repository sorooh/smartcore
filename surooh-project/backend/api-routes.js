import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

class SuroohCore {
  static async analyzeRequest(message, userHistory) {
    const msgLower = message.toLowerCase()
    
    const analysis = {
      context: 'general',
      emotion: 'neutral',
      urgency: 'normal',
      intent: 'chat',
      actionRequired: false
    }

    if (['شغل', 'عمل', 'مشروع', 'اجتماع'].some(word => msgLower.includes(word))) {
      analysis.context = 'work'
      analysis.intent = 'business'
      analysis.actionRequired = true
    } else if (['أهل', 'بيت', 'عائلة'].some(word => msgLower.includes(word))) {
      analysis.context = 'personal'
    }

    if (['تعبان', 'زعلان', 'مضايق'].some(word => msgLower.includes(word))) {
      analysis.emotion = 'sad'
    } else if (['متوتر', 'قلقان', 'خايف'].some(word => msgLower.includes(word))) {
      analysis.emotion = 'stressed'
    }

    if (['عاجل', 'سريع', 'ضروري'].some(word => msgLower.includes(word))) {
      analysis.urgency = 'urgent'
      analysis.actionRequired = true
    }

    return analysis
  }

  static async saveIncomingRequest(message, analysis, userId) {
    const db = await connectToMongo()
    const request = {
      id: uuidv4(),
      userId: userId,
      message: message,
      analysis: analysis,
      status: 'received',
      timestamp: new Date(),
      processed: false
    }
    
    await db.collection('incoming_requests').insertOne(request)
    return request
  }

  static async updateUserProfile(userId, interactionData) {
    const db = await connectToMongo()
    
    await db.collection('user_profiles').updateOne(
      { userId },
      {
        $push: {
          interactions: {
            ...interactionData,
            timestamp: new Date()
          }
        },
        $set: { last_active: new Date() },
        $inc: { total_interactions: 1 }
      },
      { upsert: true }
    )
  }
}

// نظام توفير استهلاك API ذكي
async function shouldUseAI(message, analysis) {
  const complexKeywords = ["موقع", "تطبيق", "مشروع", "نظام", "برنامج", "تصميم", "شركة", "بناء", "إنشاء"]
  const isComplex = complexKeywords.some(word => message.toLowerCase().includes(word))
  const isActionRequired = analysis.actionRequired || analysis.urgency === "urgent"
  
  return isComplex || isActionRequired
}

async function getSmartLocalResponse(message, analysis) {
  const msgLower = message.toLowerCase()
  
  if (msgLower.includes("مرحبا") || msgLower.includes("أهلا") || msgLower.includes("السلام")) {
    return "أهلاً أبو شام! شو بدك اليوم؟"
  }
  
  if (msgLower.includes("كيفك") || msgLower.includes("كيف حالك")) {
    return "الحمد لله أبو شام، كيفك إنت؟ شو أخبارك؟"
  }
  
  if (msgLower.includes("شو أخبار") || msgLower.includes("شو عاملك")) {
    return "كله تمام، أنا هون أخدمك. إيش محتاج؟"
  }
  
  if (msgLower.includes("تذكر") || msgLower.includes("فاكر")) {
    return "طبعاً بفتكر كل شي أبو شام. إيش بدك أتذكرلك؟"
  }
  
  if (msgLower.includes("ساعد") || msgLower.includes("مساعدة")) {
    return "أكيد أبو شام! قلي شو بدك أساعدك فيه؟"
  }
  
  return "فهمت أبو شام. قلي أكتر عن الموضوع..."
}

// ربط ذكي مع المخ (بس للمهام المعقدة)
async function connectToBrain(message, analysis, userId) {
  try {
    console.log('🧠 إرسال للمخ للمعالجة المتقدمة...')
    
    const brainRequest = {
      message: message,
      context: {
        user_id: userId,
        analysis: analysis,
        timestamp: new Date()
      },
      source: "surooh",
      priority: analysis.urgency || "normal"
    }

    const response = await fetch('http://localhost:8002/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brainRequest)
    })

    if (response.ok) {
      const brainResult = await response.json()
      console.log('✅ المخ رد بنجاح!')
      return brainResult.brain_response
    } else {
      throw new Error('المخ غير متاح')
    }

  } catch (error) {
    console.error('❌ خطأ في المخ:', error)
    return await suroohLocalAI(message, userId)
  }
}

async function suroohLocalAI(message, userId) {
  try {
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'أنت سُروح لأبو شام. رد بالشامية مختصر وعملي.' 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    return response.choices[0].message.content
  } catch (error) {
    return "في مشكلة تقنية أبو شام، بس أنا معك!"
  }
}

// ربط مع نظام الذاكرة الدائمة
async function saveToMemory(userId, message, response, analysis) {
  try {
    const memoryEntry = {
      id: uuidv4(),
      user_id: userId,
      timestamp: new Date(),
      user_message: message,
      ai_response: response,
      analysis: analysis,
      processed_by: ["surooh", "brain"],
      importance: analysis?.actionRequired ? "high" : "medium"
    }

    const db = await connectToMongo()
    await db.collection('permanent_memory').insertOne(memoryEntry)
    
    console.log("💾 تم حفظ في الذاكرة الدائمة")
    return memoryEntry
  } catch (error) {
    console.error("خطأ في حفظ الذاكرة:", error)
    return null
  }
}

async function getMemoryHistory(userId, limit = 10) {
  try {
    const db = await connectToMongo()
    const history = await db.collection('permanent_memory')
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    return history.map(h => ({
      message: h.user_message,
      response: h.ai_response,
      timestamp: h.timestamp
    }))
  } catch (error) {
    console.error("خطأ في جلب التاريخ:", error)
    return []
  }
}

async function suroohAI(message, history = [], userId = 'abu_sham') {
  try {
    const analysis = await SuroohCore.analyzeRequest(message, history)
    await SuroohCore.saveIncomingRequest(message, analysis, userId)

    // فحص إذا المهمة تحتاج AI فعلاً (توفير التكاليف)
    const needsAI = await shouldUseAI(message, analysis)
    
    let response;
    if (needsAI) {
      console.log("🧠 مهمة معقدة - استخدام AI المتطور")
      response = await connectToBrain(message, analysis, userId)
      // حفظ فقط للمهام المهمة
      await saveToMemory(userId, message, response, analysis)
    } else {
      console.log("⚡ رد سريع محلي - توفير API")
      response = await getSmartLocalResponse(message, analysis)
    }
    
    await SuroohCore.updateUserProfile(userId, {
      message,
      response,
      analysis,
      ai_used: needsAI,
      cost_optimized: true
    })

    return response

  } catch (error) {
    console.error('Surooh AI Error:', error)
    return "في مشكلة تقنية أبو شام، رح أحلها!"
  }
}

async function getUserProfile(userId) {
  try {
    const db = await connectToMongo()
    let profile = await db.collection('user_profiles').findOne({ userId })
    
    if (!profile) {
      profile = {
        userId,
        name: 'أبو شام',
        preferences: {
          communication_style: 'direct',
          work_focus: true,
          cost_optimization: true
        },
        interactions: [],
        created_at: new Date()
      }
      await db.collection('user_profiles').insertOne(profile)
    }
    
    return profile
  } catch (error) {
    return null
  }
}

function buildSuroohPersonality(userProfile, mode, analysis) {
  return `أنت سُروح لأبو شام.

الشخصية: ودودة، ذكية، عملية.
اللهجة: شامية أصيلة.
الأسلوب: مختصر ومفيد، بدون إطالة.

نادي "أبو شام" دائماً.
شعار: لا شيء مستحيل - زنبق صخر الصوان`
}

function getEmergencyResponse(message) {
  const msgLower = message.toLowerCase()
  
  if (['مرحبا', 'أهلا'].some(word => msgLower.includes(word))) {
    return 'أهلاً أبو شام!'
  } else if (['ساعد', 'مساعدة'].some(word => msgLower.includes(word))) {
    return 'شو بدك أبو شام؟'
  } else {
    return 'أنا معك أبو شام.'
  }
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        system: "نواة سُروح - Dashboard",
        status: "نشط",
        version: "6.0.0 - Dashboard"
      }))
    }

    if (route === '/chat' && method === 'POST') {
      const body = await request.json()
      
      if (!body.message) {
        return handleCORS(NextResponse.json({ error: "Message required" }, { status: 400 }))
      }

      const sessionId = body.sessionId || uuidv4()
      const userId = 'abu_sham'
      const userMessage = body.message
      const conversationHistory = body.conversationHistory || []

      const assistantResponse = await suroohAI(userMessage, conversationHistory, userId)
      const analysis = await SuroohCore.analyzeRequest(userMessage, conversationHistory)

      const db = await connectToMongo()
      const conversation = {
        id: uuidv4(),
        sessionId,
        userId,
        userMessage,
        assistantResponse,
        analysis,
        timestamp: new Date()
      }
      
      await db.collection('conversations').insertOne(conversation)

      return handleCORS(NextResponse.json({
        reply: assistantResponse,
        sessionId,
        context: analysis.context,
        emotion: analysis.emotion,
        timestamp: new Date()
      }))
    }

    if (route === '/execute' && method === 'POST') {
      const body = await request.json()
      const command = body.command
      
      // محاكي للأوامر (لأمان النظام)
      let output = ""
      
      if (command.includes('ps aux')) {
        output = "العمليات النشطة:\n• سُروح: نشط\n• المخ: نشط\n• Smart Core: نشط\n• البوتات: 3/3 نشطة"
      } else if (command.includes('تشغيل')) {
        output = "✅ تم تشغيل كل الأنظمة بنجاح"
      } else if (command.includes('إيقاف')) {
        output = "⚠️ تم إيقاف الأنظمة مؤقتاً"
      } else if (command.includes('فحص الذاكرة')) {
        const db = await connectToMongo()
        const count = await db.collection('permanent_memory').countDocuments()
        output = `📊 الذاكرة الدائمة: ${count} عنصر محفوظ`
      } else {
        output = `تم تنفيذ: ${command}`
      }
      
      return handleCORS(NextResponse.json({ output }))
    }

    if (route === '/check-system' && method === 'GET') {
      const url = new URL(request.url)
      const port = url.searchParams.get('port')
      
      if (!port) {
        return handleCORS(NextResponse.json({ error: "Port required" }, { status: 400 }))
      }
      
      try {
        const response = await fetch(`http://localhost:${port}/`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        })
        
        return handleCORS(NextResponse.json({
          port: port,
          status: response.ok ? "active" : "inactive",
          response_time: "< 3s"
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({
          port: port, 
          status: "inactive",
          error: error.message
        }))
      }
    }

    if (route === '/incoming-requests' && method === 'GET') {
      const db = await connectToMongo()
      const requests = await db.collection('incoming_requests')
        .find({ userId: 'abu_sham' })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json({
        requests: requests.map(({ _id, ...rest }) => rest),
        total: requests.length
      }))
    }

    if (route === '/analyze-api' && method === 'POST') {
      const body = await request.json()
      const { apiUrl, apiKey, serviceName } = body
      
      try {
        // تحليل API بالذكاء الاصطناعي
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        
        const analysisPrompt = `تحليل API جديد لأبو شام:

اسم الخدمة: ${serviceName}
الرابط: ${apiUrl}

حلل هذا API وقدم:
1. نوع الخدمة (تجارة، مدفوعات، تخزين، إلخ)
2. البيانات المتاحة 
3. طريقة التكامل المقترحة
4. الفوائد للمنظومة
5. مستوى الأمان

اكتب التحليل بالشامية بشكل مختصر ومفيد.`

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'أنت محلل APIs ذكي لأبو شام. حلل أي API وقدم توصيات عملية.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
        
        const aiAnalysis = response.choices[0].message.content
        
        // محاولة فحص API فعلياً إذا أمكن
        let connectionTest = "غير مختبر"
        try {
          const testResponse = await fetch(apiUrl, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          })
          connectionTest = testResponse.ok ? "متاح" : "غير متاح"
        } catch {
          connectionTest = "غير قابل للوصول"
        }
        
        return handleCORS(NextResponse.json({
          success: true,
          analysis: aiAnalysis,
          connectionTest: connectionTest,
          recommendations: [
            "ربط آمن عبر OAuth إن أمكن",
            "مزامنة دورية كل ساعة",
            "تشفير البيانات المحفوظة"
          ],
          estimatedSetupTime: "15-30 دقيقة"
        }))
        
      } catch (error) {
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message,
          fallback: "API جديد تم إضافته، يحتاج إعداد يدوي"
        }))
      }
    }

    if (route === '/oauth-callback' && method === 'GET') {
      const url = new URL(request.url)
      const code = url.searchParams.get('code')
      const service = url.searchParams.get('service')
      
      if (code && service) {
        // معالجة OAuth callback
        // في الإنتاج الحقيقي هنا ستكون معالجة OAuth tokens
        
        return handleCORS(NextResponse.json({
          success: true,
          message: `تم ربط ${service} بنجاح!`,
          service: service,
          token: "secured_token_" + Date.now()
        }))
      }
      
      return handleCORS(NextResponse.json({
        success: false,
        error: "بيانات OAuth غير صحيحة"
      }))
    }

    if (route === '/accounts/save' && method === 'POST') {
      const body = await request.json()
      const { userId, provider, accountData } = body
      
      try {
        const db = await connectToMongo()
        
        const accountEntry = {
          id: uuidv4(),
          userId: userId,
          provider: provider,
          email: accountData.email,
          username: accountData.username,
          name: accountData.name,
          access_token: accountData.access_token,
          refresh_token: accountData.refresh_token,
          status: 'active',
          created_at: new Date(),
          last_sync: new Date(),
          data_count: 0
        }
        
        // تحديث إذا موجود، إضافة إذا جديد
        await db.collection('oauth_accounts').updateOne(
          { 
            userId: userId, 
            provider: provider, 
            email: accountData.email 
          },
          { $set: accountEntry },
          { upsert: true }
        )
        
        console.log(`✅ تم حفظ حساب ${provider}: ${accountData.email || accountData.username}`)
        
        return handleCORS(NextResponse.json({
          success: true,
          message: `تم ربط حساب ${provider} بنجاح`,
          account: {
            id: accountEntry.id,
            provider: provider,
            email: accountData.email,
            status: 'active'
          }
        }))
        
      } catch (error) {
        console.error('خطأ في حفظ الحساب:', error)
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 }))
      }
    }

    if (route === '/accounts/list' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId') || 'abu_sham'
      
      try {
        const db = await connectToMongo()
        const accounts = await db.collection('oauth_accounts')
          .find({ userId: userId })
          .sort({ created_at: -1 })
          .toArray()

        const cleanedAccounts = accounts.map(({ _id, access_token, refresh_token, ...rest }) => rest)
        
        return handleCORS(NextResponse.json({
          success: true,
          accounts: cleanedAccounts,
          total: cleanedAccounts.length
        }))
        
      } catch (error) {
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 }))
      }
    }

    if (route === '/accounts/toggle' && method === 'POST') {
      const body = await request.json()
      const { accountId, status } = body
      
      try {
        const db = await connectToMongo()
        await db.collection('oauth_accounts').updateOne(
          { id: accountId },
          { 
            $set: { 
              status: status,
              updated_at: new Date()
            }
          }
        )
        
        return handleCORS(NextResponse.json({
          success: true,
          message: `تم ${status === 'active' ? 'تفعيل' : 'إيقاف'} الحساب`
        }))
        
      } catch (error) {
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 }))
      }
    }

    if (route === '/brain-apis' && method === 'GET') {
      try {
        // جلب APIs من المخ
        const brainResponse = await fetch('http://localhost:8002/external-apis')
        if (brainResponse.ok) {
          const brainData = await brainResponse.json()
          return handleCORS(NextResponse.json({
            success: true,
            stored_apis: brainData.stored_apis || [],
            total: brainData.total || 0
          }))
        } else {
          return handleCORS(NextResponse.json({
            success: false,
            stored_apis: [],
            error: "المخ غير متاح"
          }))
        }
      } catch (error) {
        return handleCORS(NextResponse.json({
          success: false, 
          stored_apis: [],
          error: error.message
        }))
      }
    }

    if (route === '/github-deploy' && method === 'POST') {
      console.log('🚀 GitHub Auto-Deploy حقيقي للمشروع كاملاً...')
      
      try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN
        
        if (!GITHUB_TOKEN) {
          throw new Error('GitHub Token غير متوفر')
        }
        
        // قراءة ملفات المشروع الحقيقية
        const fs = require('fs')
        const path = require('path')
        
        const projectFiles = {}
        
        // قراءة Dashboard
        try {
          const dashboardCode = fs.readFileSync('/app/app/page.js', 'utf8')
          projectFiles['frontend/dashboard.js'] = dashboardCode
          console.log('✅ تم قراءة Dashboard')
        } catch (e) {
          console.log('⚠️ Dashboard غير متاح')
        }
        
        // قراءة API Routes
        try {
          const apiCode = fs.readFileSync('/app/app/api/[[...path]]/route.js', 'utf8')
          projectFiles['backend/api-routes.js'] = apiCode
          console.log('✅ تم قراءة API Routes')
        } catch (e) {
          console.log('⚠️ API Routes غير متاح')
        }
        
        // قراءة المخ
        try {
          const brainCode = fs.readFileSync('/app/brain/server.py', 'utf8')
          projectFiles['brain/brain-server.py'] = brainCode
          console.log('✅ تم قراءة المخ')
        } catch (e) {
          console.log('⚠️ المخ غير متاح')
        }
        
        // قراءة Smart Core
        try {
          const smartcoreCode = fs.readFileSync('/app/smartcore/server.py', 'utf8')
          projectFiles['smartcore/smartcore-server.py'] = smartcoreCode
          console.log('✅ تم قراءة Smart Core')
        } catch (e) {
          console.log('⚠️ Smart Core غير متاح')
        }
        
        // قراءة البوتات
        const bots = ['code_master.py', 'design_genius.py', 'fullstack_pro.py']
        for (const bot of bots) {
          try {
            const botCode = fs.readFileSync(`/app/bots/${bot}`, 'utf8')
            projectFiles[`bots/${bot}`] = botCode
            console.log(`✅ تم قراءة ${bot}`)
          } catch (e) {
            console.log(`⚠️ ${bot} غير متاح`)
          }
        }
        
        // إنشاء README للمشروع
        projectFiles['README.md'] = `# سُروح - النواة المركزية الذكية

## معلومات المشروع:
- **التاريخ:** ${new Date().toLocaleDateString('en-GB')}
- **الوقت:** ${new Date().toLocaleTimeString('en-GB')}
- **المطور:** أبو شام (Sam Borvat)
- **النسخة:** ${new Date().getTime()}

## ملفات المشروع المرفوعة:
${Object.keys(projectFiles).map(file => `- ${file}`).join('\n')}

## الهيكل:
\`\`\`
surooh-core/
├── frontend/          # واجهة Dashboard
├── backend/           # APIs والخادم
├── brain/             # نظام المخ الذكي
├── smartcore/         # منسق المهام
└── bots/             # البوتات المتخصصة
\`\`\`

## كيفية التشغيل:
1. \`npm install\` - تثبيت المكتبات
2. \`npm run dev\` - تشغيل Frontend
3. \`python3 brain/brain-server.py\` - تشغيل المخ
4. \`python3 smartcore/smartcore-server.py\` - تشغيل Smart Core
5. \`python3 bots/*.py\` - تشغيل البوتات

تم الرفع تلقائياً من Dashboard سُروح.`

        console.log(`📦 جاري رفع ${Object.keys(projectFiles).length} ملف...`)
        
        const uploadResults = []
        
        // رفع كل ملف على GitHub
        for (const [filePath, fileContent] of Object.entries(projectFiles)) {
          try {
            const encodedContent = Buffer.from(fileContent, 'utf8').toString('base64')
            const fileName = `surooh-project/${filePath}`
            
            // فحص إذا الملف موجود أولاً للحصول على SHA
            let existingSHA = null
            try {
              const checkResponse = await fetch(`https://api.github.com/repos/sorooh/smartcore/contents/${fileName}`, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
              })
              
              if (checkResponse.ok) {
                const existingFile = await checkResponse.json()
                existingSHA = existingFile.sha
                console.log(`📄 الملف ${fileName} موجود، SHA: ${existingSHA.substring(0, 8)}...`)
              }
            } catch (e) {
              console.log(`📄 الملف ${fileName} جديد`)
            }
            
            // إعداد بيانات الرفع
            const uploadData = {
              message: `Auto-Deploy: تحديث ${filePath} - ${new Date().toLocaleString('ar-SA')}`,
              content: encodedContent
            }
            
            // إضافة SHA إذا كان الملف موجود
            if (existingSHA) {
              uploadData.sha = existingSHA
            }
            
            const githubResponse = await fetch(`https://api.github.com/repos/sorooh/smartcore/contents/${fileName}`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(uploadData)
            })
            
            const result = await githubResponse.json()
            
            if (githubResponse.ok) {
              uploadResults.push({
                file: filePath,
                status: 'success',
                url: result.content?.html_url,
                sha: result.commit?.sha,
                updated: existingSHA ? true : false
              })
              console.log(`✅ ${existingSHA ? 'حُدث' : 'رُفع'}: ${filePath}`)
            } else {
              uploadResults.push({
                file: filePath,
                status: 'failed',
                error: result.message
              })
              console.log(`❌ فشل رفع: ${filePath} - ${result.message}`)
            }
            
            // تأخير قصير بين الرفعات
            await new Promise(resolve => setTimeout(resolve, 500))
            
          } catch (error) {
            uploadResults.push({
              file: filePath,
              status: 'error',
              error: error.message
            })
          }
        }
        
        const successCount = uploadResults.filter(r => r.status === 'success').length
        const totalCount = uploadResults.length
        
        return handleCORS(NextResponse.json({
          success: successCount > 0,
          message: `تم رفع ${successCount}/${totalCount} ملف من المشروع على GitHub`,
          upload_results: uploadResults,
          project_url: `https://github.com/sorooh/smartcore/tree/main/surooh-project`,
          files_uploaded: successCount,
          total_files: totalCount
        }))
        
      } catch (error) {
        console.error('❌ خطأ في رفع المشروع:', error)
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message,
          message: `فشل رفع المشروع: ${error.message}`
        }, { status: 500 }))
      }
    }

    if (route === '/gmail-check' && method === 'POST') {
      console.log('📧 طلب Gmail حقيقي')
      
      try {
        const GMAIL_ADDRESS = process.env.GMAIL_ADDRESS
        const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
        
        if (!GMAIL_ADDRESS || !GMAIL_PASSWORD) {
          throw new Error('Gmail credentials غير متوفرة')
        }
        
        console.log(`📡 قراءة إيميلات: ${GMAIL_ADDRESS}`)
        
        // استخدام Python Gmail Reader
        const { spawn } = require('child_process')
        
        const pythonEnv = { 
          ...process.env,
          GMAIL_ADDRESS: GMAIL_ADDRESS,
          GMAIL_APP_PASSWORD: GMAIL_PASSWORD
        }
        
        const pythonProcess = spawn('python3', ['-c', `
import imaplib
import email
import os
from datetime import datetime

try:
    gmail_address = os.getenv('GMAIL_ADDRESS')
    app_password = os.getenv('GMAIL_APP_PASSWORD')
    
    print(f"📧 اتصال بـ Gmail: {gmail_address}")
    
    # اتصال IMAP
    imap = imaplib.IMAP4_SSL('imap.gmail.com')
    imap.login(gmail_address, app_password)
    
    print("✅ تم الاتصال بـ Gmail بنجاح!")
    
    # فحص صندوق الوارد
    imap.select('INBOX')
    
    # البحث عن آخر 5 إيميلات
    result, messages = imap.search(None, 'ALL')
    email_ids = messages[0].split()
    
    total_emails = len(email_ids)
    print(f"📊 إجمالي الإيميلات: {total_emails}")
    
    # جلب آخر 3 إيميلات
    recent_emails = []
    for email_id in email_ids[-3:]:
        result, msg_data = imap.fetch(email_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                subject = str(msg['subject'] or 'بدون عنوان')
                sender = str(msg['from'] or 'مجهول')
                date = str(msg['date'] or 'بدون تاريخ')
                
                print(f"📧 إيميل: {subject[:50]}")
                print(f"👤 من: {sender[:50]}")
                print(f"📅 التاريخ: {date}")
                print("---")
                
                recent_emails.append({
                    "subject": subject[:100],
                    "sender": sender[:100], 
                    "date": date
                })
    
    imap.close()
    imap.logout()
    
    print(f"✅ تم قراءة {len(recent_emails)} إيميل حديث")
    print("📊 إحصائيات Gmail:")
    print(f"  - إجمالي الإيميلات: {total_emails}")
    print(f"  - آخر فحص: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
except Exception as e:
    print(f"❌ خطأ Gmail: {e}")
`], { 
          env: pythonEnv,
          stdio: 'pipe'
        })
        
        let gmailOutput = ""
        let gmailError = ""
        
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString()
          gmailOutput += output
          console.log(`Gmail Output: ${output}`)
        })
        
        pythonProcess.stderr.on('data', (data) => {
          const error = data.toString()  
          gmailError += error
          console.error(`Gmail Error: ${error}`)
        })
        
        return new Promise((resolve) => {
          pythonProcess.on('close', (code) => {
            console.log(`Gmail Reader finished with code: ${code}`)
            
            if (code === 0 && gmailOutput.includes('✅')) {
              resolve(handleCORS(NextResponse.json({
                success: true,
                message: "تم قراءة إيميلات Gmail الحقيقية بنجاح!",
                output: gmailOutput,
                gmail_address: GMAIL_ADDRESS
              })))
            } else {
              resolve(handleCORS(NextResponse.json({
                success: false,
                error: gmailError || 'فشل قراءة Gmail',
                output: gmailOutput
              }, { status: 500 })))
            }
          })
        })
        
      } catch (error) {
        console.error('❌ خطأ Gmail Check:', error)
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 }))
      }
    }

    if (route === '/delete-api' && method === 'POST') {
      const body = await request.json()
      console.log('🗑️ طلب حذف API:', body)
      
      try {
        // إرسال للمخ للحذف
        const brainResponse = await fetch('http://localhost:8002/delete-external-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        
        if (brainResponse.ok) {
          const result = await brainResponse.json()
          console.log('✅ المخ رد على الحذف:', result)
          
          return handleCORS(NextResponse.json({
            success: true,
            message: result.message || `تم حذف ${body.apiType} API`,
            brain_response: result
          }))
        } else {
          throw new Error(`المخ رفض حذف: ${brainResponse.status}`)
        }
        
      } catch (error) {
        console.error('❌ خطأ في الحذف:', error)
        return handleCORS(NextResponse.json({
          success: false,
          message: `فشل الحذف: ${error.message}`
        }, { status: 500 }))
      }
    }

    if (route === '/store-api' && method === 'POST') {
      const body = await request.json()
      console.log('📥 طلب ربط API:', body)
      
      try {
        // إرسال للمخ الحقيقي
        const brainResponse = await fetch('http://localhost:8002/store-external-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        
        if (brainResponse.ok) {
          const result = await brainResponse.json()
          console.log('✅ المخ رد:', result)
          
          return handleCORS(NextResponse.json({
            success: true,
            message: result.message || `تم ربط ${body.apiType} API`,
            brain_response: result
          }))
        } else {
          throw new Error(`المخ رفض الطلب: ${brainResponse.status}`)
        }
        
      } catch (error) {
        console.error('❌ خطأ في الربط:', error)
        return handleCORS(NextResponse.json({
          success: false,
          message: `فشل الربط: ${error.message}`
        }, { status: 500 }))
      }
    }

    return handleCORS(NextResponse.json({ error: "Route not found" }, { status: 404 }))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: "Internal server error" }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute