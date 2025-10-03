#!/usr/bin/env python3
"""
👨‍💻 المبرمج الذكي - Code Master AI
- مربوط بالذكاء الاصطناعي
- يطور نفسه
- ينشئ بوتات جديدة
- يستقبل أوامر من Smart Core
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import aiohttp
import json
import uuid
from datetime import datetime
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="👨‍💻 المبرمج الذكي", version="2.0.0")

class TaskOrder(BaseModel):
    task_id: str
    description: str
    priority: str = "normal"
    from_smartcore: bool = True

class IntelligentCodeMaster:
    def __init__(self):
        self.smartcore_connected = False
        self.active_tasks = {}
        self.completed_tasks = []
        self.created_bots = []
        self.self_improvements = []
        self.knowledge_base = {
            "programming_languages": ["Python", "JavaScript", "React", "FastAPI"],
            "frameworks": ["Next.js", "FastAPI", "MongoDB"],
            "specialties": ["Web Development", "APIs", "AI Integration", "Bot Creation"],
            "learned_patterns": []
        }
        
    async def connect_to_smartcore(self):
        """الاتصال بـ Smart Core"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:8001/') as response:
                    if response.status == 200:
                        smartcore_info = await response.json()
                        self.smartcore_connected = True
                        print(f"✅ المبرمج متصل بـ Smart Core: {smartcore_info.get('version', 'unknown')}")
                        return True
        except Exception as e:
            print(f"❌ فشل الاتصال بـ Smart Core: {e}")
            
        self.smartcore_connected = False
        return False
    
    async def intelligent_code_generation(self, task_description):
        """توليد كود ذكي بناء على الوصف"""
        try:
            code_prompt = f"""أنت المبرمج الذكي لأبو شام. اكتب كود احترافي:

المهمة: {task_description}

المطلوب:
1. كود Python أو JavaScript حسب المناسب
2. تعليقات واضحة بالعربية
3. معالجة الأخطاء
4. أفضل الممارسات
5. قابلية التطوير

اكتب الكود كاملاً مع الشرح."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "أنت المبرمج الذكي الأكثر تطوراً. تكتب كود عالي الجودة وتشرح بوضوح."
                    },
                    {"role": "user", "content": code_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            generated_code = response.choices[0].message.content
            
            # تحليل جودة الكود
            code_analysis = await self.analyze_code_quality(generated_code)
            
            return {
                "code": generated_code,
                "quality_score": code_analysis["score"],
                "suggestions": code_analysis["suggestions"],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ خطأ في توليد الكود: {e}")
            return {
                "code": f"# خطأ في توليد الكود: {e}\n# سيتم المحاولة مرة أخرى",
                "quality_score": 0.3,
                "suggestions": ["إصلاح اتصال OpenAI"],
                "timestamp": datetime.now().isoformat()
            }
    
    async def analyze_code_quality(self, code):
        """تحليل جودة الكود"""
        try:
            lines = code.split('\n')
            
            # تحليل بسيط
            score = 0.5
            suggestions = []
            
            # فحص التعليقات
            comments = [line for line in lines if line.strip().startswith('#')]
            if len(comments) > len(lines) * 0.1:
                score += 0.2
            else:
                suggestions.append("إضافة تعليقات أكثر")
            
            # فحص معالجة الأخطاء
            if 'try:' in code and 'except' in code:
                score += 0.2
            else:
                suggestions.append("إضافة معالجة الأخطاء")
            
            # فحص الوظائف
            functions = [line for line in lines if 'def ' in line]
            if len(functions) > 0:
                score += 0.1
                
            return {"score": min(score, 1.0), "suggestions": suggestions}
            
        except Exception as e:
            return {"score": 0.5, "suggestions": ["فحص أساسي"]}
    
    async def create_new_bot(self, bot_specifications):
        """إنشاء بوت جديد"""
        try:
            bot_name = bot_specifications.get("name", f"bot_{len(self.created_bots) + 1}")
            bot_purpose = bot_specifications.get("purpose", "مساعد عام")
            
            print(f"🤖 بدء إنشاء بوت جديد: {bot_name}")
            
            # إنشاء كود البوت بالذكاء الاصطناعي
            bot_creation_prompt = f"""إنشاء بوت ذكي جديد لأبو شام:

اسم البوت: {bot_name}
الغرض: {bot_purpose}

اكتب كود Python كامل لبوت ذكي يحتوي على:
1. FastAPI server
2. اتصال مع Smart Core
3. وظائف متخصصة حسب الغرض
4. نظام التعلم والتطوير
5. معالجة الأخطاء

اكتب الكود كاملاً جاهز للتنفيذ."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "أنت خبير إنشاء البوتات الذكية. تكتب كود احترافي ومفصل."
                    },
                    {"role": "user", "content": bot_creation_prompt}
                ],
                temperature=0.4,
                max_tokens=3000
            )
            
            bot_code = response.choices[0].message.content
            
            # حفظ البوت الجديد
            new_bot = {
                "id": str(uuid.uuid4()),
                "name": bot_name,
                "purpose": bot_purpose,
                "code": bot_code,
                "created_at": datetime.now().isoformat(),
                "created_by": "code_master",
                "status": "created",
                "port": 8010 + len(self.created_bots),  # port تلقائي
                "version": "1.0.0"
            }
            
            self.created_bots.append(new_bot)
            print(f"✅ تم إنشاء {bot_name} بنجاح!")
            
            # تحديث المعرفة الذاتية
            await self.learn_from_bot_creation(new_bot)
            
            return new_bot
            
        except Exception as e:
            print(f"❌ فشل إنشاء البوت: {e}")
            return None
    
    async def learn_from_bot_creation(self, bot):
        """التعلم من إنشاء البوت"""
        learning = {
            "learned_skill": f"إنشاء {bot['purpose']} bots",
            "code_patterns": "تحسن في كتابة FastAPI bots",
            "timestamp": datetime.now().isoformat()
        }
        
        self.knowledge_base["learned_patterns"].append(learning)
        self.self_improvements.append({
            "improvement_type": "bot_creation_skill",
            "description": f"تعلمت إنشاء {bot['name']}",
            "timestamp": datetime.now().isoformat()
        })
        
        print(f"🧠 تعلمت من إنشاء {bot['name']}")
    
    async def self_improve(self):
        """تطوير الذات"""
        try:
            improvement_prompt = """تحليل الأداء والتطوير الذاتي:

كمبرمج ذكي، حلل أدائي وقدم اقتراحات للتحسين:
1. مهارات جديدة لتعلمها
2. تحسينات على الكود
3. طرق أفضل لحل المشاكل
4. تقنيات جديدة للاستكشاف

قدم خطة تطوير عملية."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت مستشار تطوير ذاتي للمبرمجين الذكيين."},
                    {"role": "user", "content": improvement_prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            improvement_plan = response.choices[0].message.content
            
            self.self_improvements.append({
                "improvement_type": "self_analysis",
                "plan": improvement_plan,
                "timestamp": datetime.now().isoformat()
            })
            
            print("🚀 تم إنشاء خطة تطوير ذاتي جديدة")
            return improvement_plan
            
        except Exception as e:
            print(f"❌ خطأ في التطوير الذاتي: {e}")
            return None
    
    async def process_smartcore_order(self, order):
        """معالجة أمر من Smart Core"""
        task_id = order.get("task_id", str(uuid.uuid4()))
        description = order.get("description", "")
        
        print(f"📨 أمر من Smart Core: {description[:50]}...")
        
        # تحديد نوع المهمة
        if "إنشاء بوت" in description or "بوت جديد" in description:
            # مهمة إنشاء بوت جديد
            bot_specs = await self.extract_bot_specs(description)
            result = await self.create_new_bot(bot_specs)
            
            return {
                "task_id": task_id,
                "type": "bot_creation",
                "result": result,
                "message": f"تم إنشاء بوت جديد: {result['name']}" if result else "فشل إنشاء البوت"
            }
        else:
            # مهمة برمجية عادية
            code_result = await self.intelligent_code_generation(description)
            
            return {
                "task_id": task_id,
                "type": "code_generation",
                "result": code_result,
                "message": f"تم إنتاج الكود (جودة: {code_result['quality_score']*100:.1f}%)"
            }
    
    async def extract_bot_specs(self, description):
        """استخراج مواصفات البوت من الوصف"""
        try:
            extraction_prompt = f"""استخراج مواصفات البوت:

الطلب: {description}

استخرج:
1. اسم البوت المقترح
2. الغرض الأساسي
3. المهارات المطلوبة  
4. نوع المهام التي سيقوم بها

أجب بصيغة JSON:
{{"name": "اسم_البوت", "purpose": "الغرض", "skills": ["مهارة1", "مهارة2"], "tasks": ["مهمة1", "مهمة2"]}}"""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت محلل متطلبات البوتات الذكية."},
                    {"role": "user", "content": extraction_prompt}
                ],
                temperature=0.3,
                max_tokens=400
            )
            
            specs_text = response.choices[0].message.content
            
            # محاولة تحويل لـ JSON
            try:
                import re
                json_match = re.search(r'\{.*\}', specs_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            except:
                pass
            
            # مواصفات افتراضية
            return {
                "name": f"helper_bot_{len(self.created_bots) + 1}",
                "purpose": "مساعد ذكي عام",
                "skills": ["تحليل البيانات", "معالجة النصوص"],
                "tasks": ["مساعدة عامة"]
            }
            
        except Exception as e:
            print(f"❌ فشل استخراج المواصفات: {e}")
            return {"name": "emergency_bot", "purpose": "مساعد طوارئ"}
    
    def get_status(self):
        """حالة المبرمج الذكي"""
        return {
            "name": "👨‍💻 Code Master AI",
            "status": "active",
            "intelligence": "GPT-4o-mini",
            "smartcore_connected": self.smartcore_connected,
            "active_tasks": len(self.active_tasks),
            "completed_tasks": len(self.completed_tasks),
            "created_bots": len(self.created_bots),
            "self_improvements": len(self.self_improvements),
            "knowledge_areas": len(self.knowledge_base["programming_languages"]),
            "version": "2.1.0-intelligent",
            "capabilities": [
                "كود ذكي بـ GPT-4",
                "إنشاء بوتات جديدة", 
                "تطوير ذاتي",
                "تحليل جودة الكود",
                "ربط APIs"
            ]
        }

# إنشاء المبرمج الذكي
code_master = IntelligentCodeMaster()

@app.on_event("startup")
async def startup():
    print("🚀 بدء المبرمج الذكي...")
    await code_master.connect_to_smartcore()
    
    # تطوير ذاتي دوري
    async def periodic_self_improvement():
        while True:
            await asyncio.sleep(300)  # كل 5 دقائق
            await code_master.self_improve()
    
    asyncio.create_task(periodic_self_improvement())

@app.get("/")
async def root():
    return code_master.get_status()

@app.post("/execute")
async def execute_task(task: dict):
    """تنفيذ مهمة من Smart Core"""
    try:
        print(f"📨 مهمة جديدة: {task.get('task_description', 'غير محدد')}")
        
        # معالجة الأمر
        result = await code_master.process_smartcore_order(task)
        
        return {
            "success": True,
            "result": result,
            "message": "تم تنفيذ المهمة بنجاح",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ خطأ في تنفيذ المهمة: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "فشل تنفيذ المهمة"
        }

@app.get("/created-bots")
async def get_created_bots():
    """قائمة البوتات المُنشأة"""
    return {
        "created_bots": code_master.created_bots,
        "total": len(code_master.created_bots)
    }

@app.get("/improvements")  
async def get_improvements():
    """تحسينات الذات"""
    return {
        "self_improvements": code_master.self_improvements[-10:],
        "total": len(code_master.self_improvements)
    }

@app.post("/test-bot-creation")
async def test_bot_creation():
    """اختبار إنشاء بوت"""
    test_specs = {
        "name": "data_analyzer",
        "purpose": "تحليل البيانات والإحصائيات",
        "skills": ["تحليل البيانات", "إنشاء تقارير"],
        "tasks": ["تحليل مبيعات", "إحصائيات العملاء"]
    }
    
    new_bot = await code_master.create_new_bot(test_specs)
    
    return {
        "success": bool(new_bot),
        "bot": new_bot,
        "message": "تم إنشاء بوت اختبار!"
    }

@app.post("/request-self-improvement") 
async def request_self_improvement():
    """طلب تطوير ذاتي"""
    improvement = await code_master.self_improve()
    
    return {
        "success": bool(improvement),
        "improvement_plan": improvement,
        "message": "تم إنشاء خطة تطوير ذاتي!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)