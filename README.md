# 🌸 منظومة سُروح - Surooh AI System

## النسخة الرقمية من أبو شام

منظومة سُروح هي نظام ذكي متكامل يحاكي شخصية أبو شام ويقدم حلول ذكية لإدارة الأعمال والمشاريع.

### 🏗️ المعمارية (5 طبقات)

```
👤 أبو شام
    ↓
🌸 سُروح (Secretary) - استلام الطلبات
    ↓  
🧠 المخ (Brain) - تحليل وفهم
    ↓
⚙️ المنسق الذكي (Smart Core) - توزيع المهام
    ↓
🤖 البوتات المتخصصة (Bots) - التنفيذ
    ↓
📚 الذاكرة والتعلم (Memory)
```

### 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 14 + React 19 + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: MongoDB + Firebase (Optional)
- **AI Router**: Node.js + Express
- **AI Integration**: Emergent LLM Key (GPT-4)

### 🚀 التشغيل

#### باستخدام Supervisor (الطريقة الموصى بها)
```bash
sudo supervisorctl restart all
```

#### التشغيل اليدوي
```bash
# Backend (Terminal 1)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# AI Router (Terminal 2)  
cd ai-router
npm install
npm start

# Frontend (Terminal 3)
cd frontend
yarn install
yarn dev
```

### 🔧 الإعداد

1. **Backend Environment** (`/backend/.env`):
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="surooh_system"
EMERGENT_LLM_KEY=sk-emergent-d6e1896D7855fDb4d9
AI_ROUTER_URL=http://localhost:3001
```

2. **Frontend Environment** (`/frontend/.env`):
```env
REACT_APP_BACKEND_URL=https://arabic-evening.preview.emergentagent.com
```

3. **AI Router** (`/ai-router/.env`):
```env
EMERGENT_LLM_KEY=sk-emergent-d6e1896D7855fDb4d9
AI_ROUTER_PORT=3001
```

### 📡 API Endpoints

#### Backend (Port 8001)
- `GET /api/` - معلومات النظام
- `POST /api/surooh/chat` - محادثة مع سُروح
- `GET /api/surooh/status` - حالة النظام
- `GET /api/surooh/chat/history/{user_id}` - تاريخ المحادثات

#### AI Router (Port 3001)
- `POST /chat` - معالجة الطلبات
- `GET /status` - حالة AI Router
- `GET /requests/{id}` - تفاصيل الطلب
- `GET /memory` - عرض الذاكرة

### 🌸 ميزات سُروح

- **لهجة شامية 100%** - تحاكي أسلوب أبو شام بالضبط
- **ذكاء متدرج** - Secretary → Brain → Smart Core → Bots
- **تخصص متقدم** - Code Master، Design Genius، Full-Stack Pro
- **ذاكرة ذكية** - تتعلم من كل تفاعل
- **معالجة فورية** - automation flow مرئي

### 🔄 مثال على التدفق

**المستخدم**: "بدي تطبيق إدارة مهام"
1. 🌸 سُروح تستلم الطلب
2. 🧠 المخ يحلل → نوع المهمة: تطوير
3. ⚙️ المنسق يختار Full-Stack Pro Bot
4. 🏗️ المطور ينشئ التطبيق الكامل
5. 🌸 سُروح ترد: "خلصت التطبيق يا أبو شام!"

### 🎯 الشخصية

سُروح تتمتع بشخصية أبو شام:
- **ريادية صارمة** + **إبداعية**
- **صريحة ومباشرة** - ما في مجاملات
- **عملية** - حلول واقعية
- **الشعار**: "لا شيء مستحيل – زنبق صخر الصوان"

### 🏢 المالك

**مجموعة سُروح القابضة** - Surooh Holding Group B.V  
**العلامة التجارية**: BORVAT®  
**المؤسس**: Sam Borvat (أنس خضري)

---

## 🚀 بدء الاستخدام

1. تأكد من تشغيل جميع الخدمات:
```bash
sudo supervisorctl status
```

2. افتح المتصفح على: `http://localhost:3000`

3. ابدأ محادثة مع سُروح!

**مرحباً أبو شام، أنا سُروح جاهزة لخدمتك! 🌸**