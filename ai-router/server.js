# External AI Router - Python Backend for Surooh AI System
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import sys
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
import json

# Load environment variables
load_dotenv('../backend/.env')
load_dotenv('.env')

# Import emergentintegrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    print("✅ emergentintegrations imported successfully")
except ImportError as e:
    print(f"❌ Failed to import emergentintegrations: {e}")
    sys.exit(1)

app = FastAPI(
    title="Surooh AI Router", 
    description="External AI Router for Surooh System",
    version="1.0.0"
)

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Setup (Mock for now since we don't have real Firebase config)
let db;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
    db = admin.firestore();
    console.log('🔥 Firebase initialized successfully');
  }
} catch (error) {
  console.log('⚠️ Firebase not configured, using in-memory storage');
}

// In-memory storage fallback
let memoryStore = {
  requests: [],
  analyses: [],
  results: []
};

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
    
    // Save to Firebase or memory
    const requestData = {
      message,
      userId,
      timestamp: new Date(),
      status: 'received_by_secretary',
      step: 'secretary'
    };

    if (db) {
      await db.collection('requests').add(requestData);
    } else {
      memoryStore.requests.push({ id: Date.now(), ...requestData });
    }

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
      const taskType = this.extractField(lines, 'TYPE') || 'management';
      const instructions = this.extractField(lines, 'INSTRUCTIONS') || analysis;
      const response = this.extractField(lines, 'RESPONSE') || `تم استلام طلبك يا أبو شام: "${message}". عم أشتغل عليه!`;
      const timeEstimate = this.extractField(lines, 'TIME_ESTIMATE') || 'بضع دقائق';

      const requestId = Date.now().toString();
      
      // Save analysis to Firebase or memory
      const analysisData = {
        originalMessage: message,
        userId,
        taskType,
        instructions,
        response,
        timeEstimate,
        timestamp: new Date(),
        status: 'analyzed'
      };

      if (db) {
        await db.collection('brain_analysis').doc(requestId).set(analysisData);
      } else {
        memoryStore.analyses.push({ id: requestId, ...analysisData });
      }

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
    const updateData = {
      status: 'coordinating',
      smartCoreStep: 'started',
      updatedAt: new Date()
    };

    if (db) {
      await db.collection('brain_analysis').doc(requestId).update(updateData);
    } else {
      const analysis = memoryStore.analyses.find(a => a.id === requestId);
      if (analysis) Object.assign(analysis, updateData);
    }

    // Select appropriate bot
    const bot = this.bots[taskType];
    if (!bot) {
      throw new Error(`Bot غير متوفر لنوع المهمة: ${taskType}`);
    }

    // Execute task
    const result = await bot.executeTask(instructions, requestId);
    
    // Update final status
    const finalData = {
      status: 'completed',
      result: result,
      completedAt: new Date()
    };

    if (db) {
      await db.collection('brain_analysis').doc(requestId).update(finalData);
    } else {
      const analysis = memoryStore.analyses.find(a => a.id === requestId);
      if (analysis) Object.assign(analysis, finalData);
    }

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
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        response: 'شو بدك يا أبو شام؟ ما وصلني شي!',
        error: true
      });
    }
    
    const secretary = new SuroohSecretary();
    const result = await secretary.processRequest(message, user_id || 'abo_sham');
    
    res.json(result);
  } catch (error) {
    console.error('خطأ في المحادثة:', error);
    res.status(500).json({
      response: 'عذراً أبو شام، حدث خطأ في النظام. جاري إصلاحه...',
      error: true,
      details: error.message
    });
  }
});

app.get('/status', async (req, res) => {
  try {
    const hasFirebase = !!db;
    const hasLlmKey = !!process.env.EMERGENT_LLM_KEY;
    
    res.json({
      status: 'active',
      secretary: true,
      brain: hasLlmKey,
      smart_core: hasLlmKey,
      bots: hasLlmKey,
      firebase: hasFirebase,
      storage: hasFirebase ? 'firebase' : 'memory',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (db) {
      const doc = await db.collection('brain_analysis').doc(requestId).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json({ id: requestId, ...doc.data() });
    } else {
      const analysis = memoryStore.analyses.find(a => a.id === requestId);
      if (!analysis) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json(analysis);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/memory', async (req, res) => {
  try {
    if (db) {
      const requests = await db.collection('requests').limit(10).get();
      const analyses = await db.collection('brain_analysis').limit(10).get();
      
      res.json({
        storage: 'firebase',
        requests: requests.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        analyses: analyses.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
    } else {
      res.json({
        storage: 'memory',
        requests: memoryStore.requests.slice(-10),
        analyses: memoryStore.analyses.slice(-10)
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.AI_ROUTER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 External AI Router running on port ${PORT}`);
  console.log('🌸 منظومة سُروح جاهزة للعمل!');
  console.log(`🔥 Firebase: ${db ? 'Connected' : 'Not configured (using memory)'}`);
  console.log(`🤖 LLM Key: ${process.env.EMERGENT_LLM_KEY ? 'Available' : 'Missing'}`);
});

module.exports = app;