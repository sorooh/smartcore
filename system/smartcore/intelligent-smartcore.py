#!/usr/bin/env python3
"""
⚙️ Smart Core الذكي - مربوط بالمخ ومحلل ذكي
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

app = FastAPI(title="⚙️ Smart Core الذكي", version="2.0.0")

class IntelligentSmartCore:
    def __init__(self):
        self.brain_connection = False
        self.active_tasks = {}
        self.completed_tasks = []
        self.analysis_history = []
        
    async def connect_to_brain(self):
        """الاتصال بالمخ"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:8006/') as response:
                    if response.status == 200:
                        brain_info = await response.json()
                        self.brain_connection = True
                        print(f"✅ Smart Core متصل بالمخ: {brain_info['version']}")
                        return True
        except Exception as e:
            print(f"❌ فشل الاتصال بالمخ: {e}")
        
        self.brain_connection = False
        return False
        
    async def report_to_brain(self, task):
        """إرسال تقرير للمخ عن المهمة المكتملة"""
        try:
            if self.brain_connection:
                async with aiohttp.ClientSession() as session:
                    report = {
                        "type": "task_completion",
                        "task_id": task["request_id"],
                        "original_command": task["command"],
                        "executed_by": task["bot_used"],
                        "result": task["result"],
                        "completion_time": task["timestamp"],
                        "success": bool(task.get("result"))
                    }
                    
                    # إرسال تقرير للمخ
                    async with session.post(
                        'http://localhost:8006/v1/task-completion',
                        json=report,
                        headers={'Authorization': 'Bearer surooh-enterprise-token-abu-sham'}
                    ) as response:
                        if response.status == 200:
                            print(f"✅ تم إرسال التقرير للمخ عن {task['request_id']}")
                        else:
                            print(f"⚠️ فشل إرسال التقرير للمخ: {response.status}")
                            
        except Exception as e:
            print(f"❌ خطأ في إرسال التقرير للمخ: {e}")
        
    async def intelligent_analysis(self, command):
        """تحليل ذكي للمهمة"""
        try:
            analysis_prompt = f"""تحليل مهمة ذكي لأبو شام:

المهمة: {command}

حلل وحدد:
1. نوع المهمة (development, design, integration, analysis)
2. التعقيد (low, medium, high)
3. البوت الأفضل:
   - code_master: للبرمجة والكود
   - design_genius: للتصميم والواجهات
   - fullstack_pro: للتطوير المتكامل والدمج
4. خطة التنفيذ
5. الوقت المتوقع
6. المتطلبات

أجب بتحليل واضح وعملي."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت محلل ذكي لـ Smart Core. تحلل المهام وتختار أفضل بوت للتنفيذ."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.3,
                max_tokens=600
            )
            
            analysis_text = response.choices[0].message.content
            
            # استخراج البوت المقترح من التحليل
            suggested_bot = self.extract_bot_from_analysis(analysis_text)
            
            analysis_result = {
                "analysis": analysis_text,
                "suggested_bot": suggested_bot,
                "confidence": 0.85,
                "timestamp": datetime.now().isoformat()
            }
            
            self.analysis_history.append(analysis_result)
            print(f"🧠 تحليل ذكي مكتمل: اقتراح {suggested_bot}")
            
            return analysis_result
            
        except Exception as e:
            print(f"❌ فشل التحليل الذكي: {e}")
            
            # تحليل بسيط بديل
            return {
                "analysis": f"تحليل بسيط للمهمة: {command}",
                "suggested_bot": self.simple_bot_selection(command),
                "confidence": 0.6,
                "timestamp": datetime.now().isoformat()
            }
    
    def extract_bot_from_analysis(self, analysis):
        """استخراج البوت المقترح من التحليل"""
        analysis_lower = analysis.lower()
        
        if 'code_master' in analysis_lower:
            return 'code_master'
        elif 'design_genius' in analysis_lower:
            return 'design_genius'
        elif 'fullstack_pro' in analysis_lower:
            return 'fullstack_pro'
        else:
            return self.simple_bot_selection(analysis)
    
    def simple_bot_selection(self, text):
        """اختيار بوت بسيط"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['كود', 'برمجة', 'api', 'function']):
            return 'code_master'
        elif any(word in text_lower for word in ['تصميم', 'واجهة', 'ui', 'شعار']):
            return 'design_genius'
        else:
            return 'fullstack_pro'
    
    async def execute_on_bot(self, bot_name, task_data):
        """تنفيذ على بوت محدد"""
        try:
            bot_ports = {"code_master": 8003, "design_genius": 8004, "fullstack_pro": 8005}
            port = bot_ports.get(bot_name, 8005)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f'http://localhost:{port}/execute', json=task_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"✅ {bot_name} نفذ المهمة")
                        return result
                    else:
                        print(f"❌ {bot_name} فشل: {response.status}")
                        return None
        except Exception as e:
            print(f"❌ خطأ {bot_name}: {e}")
            return None
    
    async def monitor_requests(self):
        """مراقبة الطلبات من Dashboard"""
        processed_requests = set()
        
        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get('http://localhost:3000/api/incoming-requests') as response:
                        if response.status == 200:
                            data = await response.json()
                            requests = data.get('requests', [])
                            
                            for request in requests[-5:]:
                                request_id = request['id']
                                
                                if request_id not in processed_requests:
                                    print(f"🆕 طلب جديد: {request['message'][:30]}...")
                                    
                                    # تحليل ذكي
                                    analysis = await self.intelligent_analysis(request['message'])
                                    
                                    # تنفيذ
                                    task_data = {
                                        "task_description": request['message'],
                                        "analysis": analysis["analysis"],
                                        "priority": "normal"
                                    }
                                    
                                    result = await self.execute_on_bot(analysis["suggested_bot"], task_data)
                                    
                                    # حفظ النتيجة
                                    completed_task = {
                                        "request_id": request_id,
                                        "command": request['message'],
                                        "bot_used": analysis["suggested_bot"],
                                        "result": result,
                                        "analysis": analysis,
                                        "timestamp": datetime.now().isoformat()
                                    }
                                    
                                    self.completed_tasks.append(completed_task)
                                    processed_requests.add(request_id)
                                    
                                    # إرسال تقرير للمخ
                                    await self.report_to_brain(completed_task)
                                    
                                    print(f"✅ طلب {request_id} مكتمل بواسطة {analysis['suggested_bot']}")
                
                await asyncio.sleep(20)
                
            except Exception as e:
                print(f"❌ خطأ في المراقبة: {e}")
                await asyncio.sleep(30)

# إنشاء Smart Core الذكي
intelligent_core = IntelligentSmartCore()

@app.on_event("startup")
async def startup():
    print("🚀 بدء Smart Core الذكي...")
    await intelligent_core.connect_to_brain()
    asyncio.create_task(intelligent_core.monitor_requests())

@app.get("/")
async def root():
    return {
        "system": "⚙️ Smart Core الذكي",
        "status": "operational",
        "brain_connected": intelligent_core.brain_connection,
        "intelligence_active": True,
        "active_tasks": len(intelligent_core.active_tasks),
        "completed_tasks": len(intelligent_core.completed_tasks),
        "analyses_performed": len(intelligent_core.analysis_history),
        "monitoring": "Dashboard + Brain Integration",
        "version": "2.1.0-intelligent"
    }

@app.get("/intelligence-stats")
async def intelligence_stats():
    """إحصائيات الذكاء"""
    return {
        "total_analyses": len(intelligent_core.analysis_history),
        "active_tasks": len(intelligent_core.active_tasks),
        "completed_tasks": len(intelligent_core.completed_tasks),
        "recent_analyses": intelligent_core.analysis_history[-5:]
    }

@app.post("/test-analysis")
async def test_analysis():
    """اختبار التحليل الذكي"""
    test_commands = [
        "أريد تطوير موقع تجاري",
        "بدي تصميم شعار للشركة",
        "أحتاج دمج قواعد البيانات"
    ]
    
    results = []
    for cmd in test_commands:
        analysis = await intelligent_core.intelligent_analysis(cmd)
        results.append({
            "command": cmd,
            "suggested_bot": analysis["suggested_bot"],
            "confidence": analysis["confidence"]
        })
    
    return {
        "test_results": results,
        "message": "Smart Core يحلل المهام بذكاء!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)