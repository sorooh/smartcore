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

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    
    if (route === '/gmail-check' && method === 'POST') {
      console.log('📧 فحص Gmail حقيقي')
      
      try {
        const { spawn } = require('child_process')
        
        const pythonProcess = spawn('python3', ['-c', `
import imaplib
import email
import os

try:
    gmail_address = "${process.env.GMAIL_ADDRESS}"
    app_password = "${process.env.GMAIL_APP_PASSWORD}"
    
    print(f"📧 اتصال بـ Gmail: {gmail_address}")
    
    imap = imaplib.IMAP4_SSL('imap.gmail.com')
    imap.login(gmail_address, app_password)
    
    print("✅ تم الاتصال بـ Gmail بنجاح!")
    
    imap.select('INBOX')
    
    result, messages = imap.search(None, 'ALL')
    email_ids = messages[0].split()
    
    total_emails = len(email_ids)
    print(f"📊 إجمالي الإيميلات: {total_emails}")
    
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
    
    imap.close()
    imap.logout()
    
    print(f"✅ تم قراءة الإيميلات بنجاح")
    
except Exception as e:
    print(f"❌ خطأ Gmail: {e}")
`])
        
        return new Promise((resolve) => {
          let output = ""
          let error = ""
          
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
          })
          
          pythonProcess.stderr.on('data', (data) => {
            error += data.toString()
          })
          
          pythonProcess.on('close', (code) => {
            if (code === 0 && output.includes('✅')) {
              resolve(handleCORS(NextResponse.json({
                success: true,
                message: "تم قراءة Gmail بنجاح!",
                output: output,
                gmail_address: process.env.GMAIL_ADDRESS
              })))
            } else {
              resolve(handleCORS(NextResponse.json({
                success: false,
                error: error || 'فشل قراءة Gmail',
                output: output
              }, { status: 500 })))
            }
          })
        })
        
      } catch (error) {
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 }))
      }
    }

    if (route === '/github-deploy' && method === 'POST') {
      console.log('🚀 رفع النظام الحقيقي على GitHub')
      
      try {
        const fs = require('fs')
        const path = require('path')
        
        const projectFiles = {}
        
        // قراءة الملفات الحقيقية
        try {
          projectFiles['frontend/dashboard.js'] = fs.readFileSync('/app/app/page.js', 'utf8')
          console.log('✅ قُرأ Dashboard الرئيسي')
        } catch (e) {
          console.log('⚠️ Dashboard غير متاح')
        }
        
        try {
          projectFiles['frontend/surooh-chat.js'] = fs.readFileSync('/app/app/surooh/page.js', 'utf8')
          console.log('✅ قُرأت سُروح الدردشة')
        } catch (e) {
          console.log('⚠️ سُروح غير متاح')
        }
        
        try {
          projectFiles['backend/api-routes.js'] = fs.readFileSync('/app/app/api/[[...path]]/route.js', 'utf8')
          console.log('✅ قُرأت API Routes')
        } catch (e) {
          console.log('⚠️ API Routes غير متاح')
        }
        
        try {
          projectFiles['brain/advanced-brain.py'] = fs.readFileSync('/app/brain_advanced/server.py', 'utf8')
          console.log('✅ قُرأ المخ المتطور')
        } catch (e) {
          console.log('⚠️ المخ غير متاح')
        }
        
        try {
          projectFiles['smartcore/intelligent-smartcore.py'] = fs.readFileSync('/app/smartcore_intelligent/server.py', 'utf8')
          console.log('✅ قُرأ Smart Core الذكي')
        } catch (e) {
          console.log('⚠️ Smart Core غير متاح')
        }
        
        try {
          projectFiles['bots/code-master-ai.py'] = fs.readFileSync('/app/bots_intelligent/code_master_ai.py', 'utf8')
          console.log('✅ قُرأ المبرمج الذكي')
        } catch (e) {
          console.log('⚠️ المبرمج غير متاح')
        }
        
        try {
          projectFiles['bots/design-genius-ai.py'] = fs.readFileSync('/app/bots_intelligent/design_genius_ai.py', 'utf8')
          console.log('✅ قُرأ المصمم الذكي')
        } catch (e) {
          console.log('⚠️ المصمم غير متاح')
        }
        
        try {
          projectFiles['bots/fullstack-pro-ai.py'] = fs.readFileSync('/app/bots_intelligent/fullstack_pro_ai.py', 'utf8')
          console.log('✅ قُرأ بوت التطوير الذكي')
        } catch (e) {
          console.log('⚠️ بوت التطوير غير متاح')
        }
        
        // إنشاء README شامل
        projectFiles['README.md'] = `# نواة سُروح الذكية - النظام المتكامل

## هيكل المشروع:
\`\`\`
surooh-system/
├── frontend/
│   ├── dashboard.js          # Dashboard Pro الرئيسي
│   └── surooh-chat.js        # سُروح الدردشة الذكية
├── backend/
│   └── api-routes.js         # كل APIs (Gmail, GitHub, إلخ)
├── brain/
│   └── advanced-brain.py     # المخ المتطور Enterprise v2.0.0
├── smartcore/
│   └── intelligent-smartcore.py  # Smart Core الذكي v2.1.0
└── bots/
    ├── code-master-ai.py     # المبرمج الذكي
    ├── design-genius-ai.py   # المصمم الذكي + DALL-E 3
    └── fullstack-pro-ai.py   # بوت التطوير الذكي

\`\`\`

## المكونات:
- **Dashboard:** واجهة تحكم احترافية مع 6 إحصائيات
- **سُروح:** سكرتيرة ذكية مع شات مثل ChatGPT 
- **المخ المتطور:** نظام ذكي مع Memory Service وSearch Engine
- **Smart Core:** منسق ذكي يحلل ويوزع المهام
- **البوتات الثلاثة:** مربوطة بـ GPT-4 وDALL-E 3

## التدفق:
أبو شام → سُروح → 🧠 المخ → ⚙️ Smart Core → 🤖 البوت → النتيجة → العودة

## الخدمات المربوطة:
- ✅ Gmail Reader (samborvat@gmail.com)
- ✅ GitHub Auto-Deploy (sorooh/smartcore)
- ✅ OpenAI GPT-4 & DALL-E 3
- ✅ MongoDB للتخزين

## كيفية التشغيل:
1. \`npm install && npm run dev\` - Frontend
2. \`python3 brain/advanced-brain.py\` - المخ
3. \`python3 smartcore/intelligent-smartcore.py\` - Smart Core
4. \`python3 bots/*.py\` - البوتات الثلاثة

---
**تم الرفع:** ${new Date().toLocaleString('ar-SA')}
**بواسطة:** منظومة سُروح الذكية
**المطور:** أبو شام (Sam Borvat)`

        console.log(`📦 رفع ${Object.keys(projectFiles).length} ملف حقيقي...`)
        
        const uploadResults = []
        
        // رفع كل ملف
        for (const [filePath, fileContent] of Object.entries(projectFiles)) {
          try {
            // فحص إذا الملف موجود للحصول على SHA
            let existingSHA = null
            try {
              const checkResponse = await fetch(`https://api.github.com/repos/sorooh/smartcore/contents/system/${filePath}`, {
                headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
              })
              
              if (checkResponse.ok) {
                const existingFile = await checkResponse.json()
                existingSHA = existingFile.sha
              }
            } catch (e) {
              // ملف جديد
            }
            
            const encodedContent = Buffer.from(fileContent, 'utf8').toString('base64')
            
            const uploadData = {
              message: `تحديث النظام: ${filePath} - ${new Date().toLocaleString('ar-SA')}`,
              content: encodedContent
            }
            
            if (existingSHA) {
              uploadData.sha = existingSHA
            }
            
            const githubResponse = await fetch(`https://api.github.com/repos/sorooh/smartcore/contents/system/${filePath}`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
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
                sha: result.commit?.sha
              })
              console.log(`✅ رُفع: ${filePath}`)
            } else {
              uploadResults.push({
                file: filePath,
                status: 'failed',
                error: result.message
              })
            }
            
            // تأخير بين الرفعات
            await new Promise(resolve => setTimeout(resolve, 1000))
            
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
          message: `تم رفع ${successCount}/${totalCount} ملف من النظام على GitHub`,
          upload_results: uploadResults,
          project_url: `https://github.com/sorooh/smartcore/tree/main/system`,
          files_uploaded: successCount,
          total_files: totalCount,
          main_system_files: [
            "frontend/dashboard.js - Dashboard Pro",
            "frontend/surooh-chat.js - سُروح الذكية", 
            "backend/api-routes.js - كل APIs",
            "brain/advanced-brain.py - المخ المتطور",
            "smartcore/intelligent-smartcore.py - Smart Core الذكي",
            "bots/code-master-ai.py - المبرمج الذكي",
            "bots/design-genius-ai.py - المصمم الذكي + DALL-E",
            "bots/fullstack-pro-ai.py - بوت التطوير الذكي"
          ]
        }))
        
      } catch (error) {
        console.error('❌ خطأ في رفع النظام:', error)
        return handleCORS(NextResponse.json({
          success: false,
          error: error.message
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