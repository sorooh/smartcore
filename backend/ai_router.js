// External AI Router - Node.js Backend for Surooh AI System
const express = require('express');
const { LlmChat, UserMessage } = require('emergentintegrations/llm/chat');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "surooh-system",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

// Surooh AI System Classes
class SuroohSecretary {
  constructor() {
    this.personality = `
أنا سُروح، النسخة الرقمية من أبو شام. 
شخصيتي:
- لهجة شامية 100%
- ريادية صارمة + إبداعية
- مباشرة وصريحة وعملية
- أحكي كأنني أبو شام بالضبط
- ما في مجاملات أو كلام منمق
- الصدق والوضوح أساس كل شي
- "لا شيء مستحيل – زنبق صخر الصوان"

دوري:
- أستقبل الطلبات من أبو شام
- أفهم شو بده بالضبط
- أرسل الطلب للمخ عشان يحلل ويقرر
- أرد عليه بأسلوبه وبلهجته
    `;
  }

  async processRequest(message, userId) {
    console.log('🌸 سُروح: استلمت طلب جديد من', userId);
    
    // Save to Firebase
    await db.collection('requests').add({
      message,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'received_by_secretary',
      step: 'secretary'
    });

    // Send to Brain for analysis
    const brain = new SuroohBrain();
    const analysis = await brain.analyzeRequest(message, userId);
    
    return {
      response: analysis.secretaryResponse,
      flow_trace: ['secretary', 'brain', analysis.nextStep],
      requestId: analysis.requestId
    };
  }
}

class SuroohBrain {
  constructor() {
    this.llmChat = new LlmChat(
      process.env.EMERGENT_LLM_KEY,
      'surooh-brain-session',
      `
أنت المخ في منظومة سُروح. دورك:

1. تحليل الطلبات بعمق
2. فهم المطلوب بالضبط
3. تحديد نوع المهمة:
   - برمجة (code) → للمبرمج
   - تصميم (design) → للمصمم  
   - تطوير متكامل (development) → للمطور الكامل
   - إدارة وتنظيم (management) → مباشر من المخ

4. إرسال تعليمات واضحة للمنسق الذكي
5. صياغة رد لسُروح بلهجة أبو شام

قواعد الرد:
- لهجة شامية طبيعية
- وضوح تام في التعليمات
- تحديد دقيق لنوع المهمة
- توقعات واقعية للوقت والجهد
      `
    ).with_model("openai", "gpt-4o");
  }

  async analyzeRequest(message, userId) {
    console.log('🧠 المخ: بدأ تحليل الطلب');

    const userMessage = new UserMessage(
      `طلب من ${userId}: ${message}
      
حلل هالطلب وحدد:
1. نوع المهمة (code/design/development/management)
2. التعليمات للمنسق الذكي
3. رد لسُروح بلهجة أبو شام
4. تقدير الوقت المطلوب

اعطني الجواب بالشكل هاد:
TYPE: [نوع المهمة]
INSTRUCTIONS: [تعليمات للمنسق]
RESPONSE: [رد لأبو شام]
TIME_ESTIMATE: [تقدير الوقت]`
    );

    try {
      const analysis = await this.llmChat.send_message(userMessage);
      
      // Parse the response
      const lines = analysis.split('\n');
      const taskType = this.extractField(lines, 'TYPE');
      const instructions = this.extractField(lines, 'INSTRUCTIONS');
      const response = this.extractField(lines, 'RESPONSE');
      const timeEstimate = this.extractField(lines, 'TIME_ESTIMATE');

      const requestId = Date.now().toString();
      
      // Save analysis to Firebase
      await db.collection('brain_analysis').doc(requestId).set({
        originalMessage: message,
        userId,
        taskType,
        instructions,
        response,
        timeEstimate,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'analyzed'
      });

      // Send to Smart Core if needed
      let nextStep = 'completed';
      if (['code', 'design', 'development'].includes(taskType)) {
        const smartCore = new SmartCore();
        await smartCore.coordinateTask(requestId, taskType, instructions);
        nextStep = 'smart_core';
      }

      return {
        secretaryResponse: response,
        taskType,
        instructions,
        nextStep,
        requestId,
        timeEstimate
      };

    } catch (error) {
      console.error('خطأ في المخ:', error);
      return {
        secretaryResponse: 'عذراً أبو شام، صار عندي خطأ في التحليل. جرب مرة تانية.',
        taskType: 'error',
        nextStep: 'error',
        requestId: null
      };
    }
  }

  extractField(lines, fieldName) {
    const line = lines.find(l => l.startsWith(`${fieldName}:`));
    return line ? line.substring(fieldName.length + 1).trim() : '';
  }
}

class SmartCore {
  constructor() {
    this.bots = {
      code: new CodeMasterBot(),
      design: new DesignGeniusBot(), 
      development: new FullStackProBot()
    };
  }

  async coordinateTask(requestId, taskType, instructions) {
    console.log('⚙️ المنسق الذكي: بدأ تنسيق المهمة', taskType);

    // Update status
    await db.collection('brain_analysis').doc(requestId).update({
      status: 'coordinating',
      smartCoreStep: 'started'
    });

    // Select appropriate bot
    const bot = this.bots[taskType];
    if (!bot) {
      throw new Error(`Bot غير متوفر لنوع المهمة: ${taskType}`);
    }

    // Execute task
    const result = await bot.executeTask(instructions, requestId);
    
    // Update final status
    await db.collection('brain_analysis').doc(requestId).update({
      status: 'completed',
      result: result,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return result;
  }
}

// Bot Classes
class CodeMasterBot {
  constructor() {
    this.llmChat = new LlmChat(
      process.env.EMERGENT_LLM_KEY,
      'code-master-session',
      'أنت المبرمج الخبير في منظومة سُروح. تكتب كود نظيف، مفهوم، وقابل للصيانة.'
    ).with_model("openai", "gpt-4o");
  }

  async executeTask(instructions, requestId) {
    console.log('💻 المبرمج: بدأ تنفيذ المهمة');
    
    const userMessage = new UserMessage(instructions);
    const code = await this.llmChat.send_message(userMessage);
    
    return {
      type: 'code',
      content: code,
      message: 'تم إنشاء الكود بنجاح! 💻'
    };
  }
}

class DesignGeniusBot {
  constructor() {
    this.llmChat = new LlmChat(
      process.env.EMERGENT_LLM_KEY,
      'design-genius-session', 
      'أنت مصمم UI/UX خبير في منظومة سُروح. تصمم واجهات جميلة وعملية.'
    ).with_model("openai", "gpt-4o");
  }

  async executeTask(instructions, requestId) {
    console.log('🎨 المصمم: بدأ تنفيذ المهمة');
    
    const userMessage = new UserMessage(instructions);
    const design = await this.llmChat.send_message(userMessage);
    
    return {
      type: 'design',
      content: design,
      message: 'تم إنشاء التصميم بنجاح! 🎨'
    };
  }
}

class FullStackProBot {
  constructor() {
    this.llmChat = new LlmChat(
      process.env.EMERGENT_LLM_KEY,
      'fullstack-pro-session',
      'أنت مطور Full-Stack خبير في منظومة سُروح. تبني تطبيقات متكاملة.'
    ).with_model("openai", "gpt-4o");
  }

  async executeTask(instructions, requestId) {
    console.log('🏗️ المطور الكامل: بدأ تنفيذ المهمة');
    
    const userMessage = new UserMessage(instructions);
    const fullStackSolution = await this.llmChat.send_message(userMessage);
    
    return {
      type: 'development', 
      content: fullStackSolution,
      message: 'تم بناء الحل المتكامل بنجاح! 🏗️'
    };
  }
}

// API Routes
app.post('/chat', async (req, res) => {
  try {
    const { message, user_id, session_id } = req.body;
    
    const secretary = new SuroohSecretary();
    const result = await secretary.processRequest(message, user_id || 'abo_sham');
    
    res.json(result);
  } catch (error) {
    console.error('خطأ في المحادثة:', error);
    res.status(500).json({
      response: 'عذراً، حدث خطأ في النظام. جاري إصلاحه...',
      error: true
    });
  }
});

app.get('/status', async (req, res) => {
  try {
    res.json({
      status: 'active',
      secretary: true,
      brain: true,
      smart_core: true,
      bots: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.get('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const doc = await db.collection('brain_analysis').doc(requestId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ id: requestId, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.AI_ROUTER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 External AI Router running on port ${PORT}`);
  console.log('🌸 منظومة سُروح جاهزة للعمل!');
});

module.exports = app;