#!/usr/bin/env python3
"""
⚙️ Smart Core - منسق المهام
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
import uuid
from datetime import datetime
import asyncio

app = FastAPI(title="⚙️ Smart Core", version="1.0.0")

class TaskRequest(BaseModel):
    task_id: str
    description: str  
    category: str
    priority: str = "normal"

class SmartCore:
    def __init__(self):
        self.tasks = []
        self.bots = {
            "code_master": {"status": "ready", "port": 8003},
            "design_genius": {"status": "ready", "port": 8004}, 
            "fullstack_pro": {"status": "ready", "port": 8005}
        }
    
    async def execute_task(self, task: TaskRequest):
        """تنفيذ المهمة وتوزيعها على البوتات بالذكاء الاصطناعي"""
        
        print(f"⚙️ Smart Core يعالج: {task.description}")
        
        # تحليل ذكي للمهمة
        import openai
        try:
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            # تحليل ذكي للمهمة
            analysis_response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """أنت Smart Core المخ التنظيمي لأبو شام.
                        
تحليل المهام بذكاء:
- حدد نوع المشروع (موقع، تطبيق، تصميم)
- قدر التعقيد (بسيط، متوسط، عالي)
- اختر البوتات المناسبة
- ضع خطة تنفيذ واقعية

اجب بتحليل واضح ومختصر بالشامية."""
                    },
                    {
                        "role": "user", 
                        "content": f"حلل هذه المهمة وضع خطة تنفيذ: {task.description}"
                    }
                ],
                temperature=0.5,
                max_tokens=300
            )
            
            ai_analysis = analysis_response.choices[0].message.content
            
        except Exception as e:
            ai_analysis = f"تحليل أساسي: مشروع {task.category}"
        
        # حفظ المهمة
        task_entry = {
            "id": task.task_id,
            "description": task.description,
            "category": task.category,
            "ai_analysis": ai_analysis,
            "status": "قيد التنفيذ",
            "timestamp": datetime.now().isoformat(),
            "bots_assigned": []
        }
        
        # تحديد البوتات حسب النوع مع محاولة الاتصال الفعلي
        if task.category == "development":
            task_entry["bots_assigned"] = ["design_genius", "code_master", "fullstack_pro"]
            
            # محاولة تكليف البوتات فعلياً
            bot_results = await self.try_assign_to_bots(task, ["design_genius", "code_master", "fullstack_pro"])
            
            result_message = f"""أبو شام، Smart Core نفذ التحليل الذكي:

🧠 التحليل: {ai_analysis}

🤖 فريق العمل المكلف:
• 🎨 Design Genius - تصميم الواجهات  
• 👨‍💻 Code Master - البرمجة والوظائف
• 🏗️ Full-Stack Pro - التكامل والنشر

⚙️ الحالة: {len([r for r in bot_results if r['success']])}/{len(bot_results)} بوتات متصلة

✅ المهمة موزعة على فريق العمل المتخصص!"""
            
        elif task.category == "design":
            task_entry["bots_assigned"] = ["design_genius"]
            bot_results = await self.try_assign_to_bots(task, ["design_genius"])
            
            result_message = f"""أبو شام، Smart Core حلل مهمة التصميم:

🧠 التحليل: {ai_analysis}

🎨 المصمم المكلف: Design Genius  
⚙️ الحالة: {'متصل' if bot_results[0]['success'] else 'غير متاح'}

✅ تم إرسال للمصمم المبدع!"""
            
        else:
            task_entry["bots_assigned"] = ["fullstack_pro"]
            bot_results = await self.try_assign_to_bots(task, ["fullstack_pro"])
            
            result_message = f"""أبو شام، Smart Core عالج المهمة:

🧠 التحليل: {ai_analysis}

📝 النوع: {task.category}
🤖 البوت المكلف: Full-Stack Pro
⚙️ الحالة: {'نشط' if bot_results[0]['success'] else 'غير متاح'}

✅ جاري التنفيذ!"""
        
        task_entry["bot_results"] = bot_results
        self.tasks.append(task_entry)
        
        return {
            "success": True,
            "message": result_message,
            "task_id": task.task_id,
            "ai_analysis": ai_analysis,
            "bots_assigned": task_entry["bots_assigned"],
            "execution_status": f"{len([r for r in bot_results if r['success']])}/{len(bot_results)} نجح"
        }
    
    async def try_assign_to_bots(self, task, bot_names):
        """محاولة تكليف البوتات فعلياً"""
        results = []
        
        for bot_name in bot_names:
            bot_config = self.bots.get(bot_name)
            if not bot_config:
                results.append({"bot": bot_name, "success": False, "error": "غير موجود"})
                continue
                
            try:
                # محاولة الاتصال بالبوت
                import aiohttp
                async with aiohttp.ClientSession() as session:
                    bot_task = {
                        "bot_name": bot_name,
                        "task_description": f"{task.description} (من Smart Core)",
                        "requirements": task.requirements,
                        "priority": task.priority
                    }
                    
                    async with session.post(
                        f"http://localhost:{bot_config['port']}/execute", 
                        json=bot_task,
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            bot_result = await response.json()
                            results.append({
                                "bot": bot_name, 
                                "success": True, 
                                "result": bot_result
                            })
                        else:
                            results.append({
                                "bot": bot_name, 
                                "success": False, 
                                "error": f"رد غير صالح: {response.status}"
                            })
                            
            except asyncio.TimeoutError:
                results.append({"bot": bot_name, "success": False, "error": "انتهت مهلة الاتصال"})
            except Exception as e:
                results.append({"bot": bot_name, "success": False, "error": str(e)})
                
        return results

smart_core = SmartCore()

@app.post("/execute-from-brain")
async def execute_brain_request(task_request: TaskRequest):
    result = await smart_core.execute_task(task_request)
    return result

@app.get("/tasks")
async def get_tasks():
    return {"tasks": smart_core.tasks, "total": len(smart_core.tasks)}

@app.get("/")
async def status():
    return {
        "system": "⚙️ Smart Core",
        "status": "نشط",
        "tasks": len(smart_core.tasks),
        "bots": smart_core.bots,
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)