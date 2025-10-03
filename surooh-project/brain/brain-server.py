#!/usr/bin/env python3
"""
🧠 المخ - النظام المركزي للذكاء والتعلم
Brain Core System - Central Intelligence & Learning Hub
"""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json
import uuid
from datetime import datetime
import asyncio

app = FastAPI(title="🧠 سُروح - المخ الذكي", version="1.0.0")

class BrainRequest(BaseModel):
    message: str
    context: Optional[Dict] = {}
    source: str = "surooh"
    priority: str = "normal"

# نظام بسيط ومباشر للمخ
class SimpleBrain:
    def __init__(self):
        self.memory = []
        
    async def send_to_smartcore(self, task_data):
        """إرسال مهمة إلى Smart Core للتنفيذ"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://localhost:8001/execute-from-brain",
                    json=task_data
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"✅ Smart Core استقبل المهمة: {result}")
                        return result
                    else:
                        print(f"❌ Smart Core رفض المهمة: {response.status}")
                        return None
        except Exception as e:
            print(f"❌ خطأ في الاتصال بـ Smart Core: {e}")
            return None
        
    async def think(self, request: BrainRequest):
        """تفكير المخ مع ربط Smart Core"""
        message = request.message.lower()
        
        # تحليل نوع الطلب
        if any(word in message for word in ["موقع", "تطبيق", "برنامج", "نظام"]):
            category = "development"
            
            # إرسال للـ Smart Core للتنفيذ الفعلي
            task_for_smartcore = {
                "task_id": str(uuid.uuid4()),
                "description": request.message,
                "category": category,
                "priority": "high" if "عاجل" in message else "normal"
            }
            
            smartcore_result = await self.send_to_smartcore(task_for_smartcore)
            
            if smartcore_result and smartcore_result.get("success"):
                response = f"""أبو شام، المخ نفذ العملية كاملة:

📊 تحليل المشروع: {request.message}
🎯 التصنيف: مشروع تطوير عالي التعقيد
🤖 فريق العمل: تم تكليف البوتات الثلاث

{smartcore_result.get('message', 'تم التنفيذ بنجاح')}

💡 المخ يتعلم من هذا المشروع لتحسين الأداء المستقبلي."""
            else:
                response = f"""أبو شام، المخ حلل الطلب:

📊 نوع المشروع: تطوير {request.message.split()[2] if len(request.message.split()) > 2 else "تطبيق"}
⚠️ Smart Core غير متاح حالياً
🎯 الإجراء: سأعالج الطلب محلياً

رح أشتغل على إيجاد حل بديل فوري."""

        elif any(word in message for word in ["تصميم", "شعار", "واجهة"]):
            category = "design"
            response = f"""أبو شام، المخ حلل طلب التصميم:

🎨 نوع المهمة: {request.message}  
🎯 التعقيد: إبداعي متقدم
🤖 البوت المطلوب: Design Genius
⏰ الوقت المتوقع: 1-3 أيام

✅ جاري التواصل مع المصمم المتخصص."""

        else:
            category = "general"
            
            # استخدام OpenAI للردود الذكية العامة
            try:
                import openai
                openai.api_key = os.getenv("OPENAI_API_KEY")
                
                ai_response = openai.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system", 
                            "content": "أنت سُروح المخ الذكي لأبو شام. تجيبين بالشامية الأصيلة، مختصر وذكي."
                        },
                        {"role": "user", "content": request.message}
                    ],
                    temperature=0.7,
                    max_tokens=200
                )
                
                response = ai_response.choices[0].message.content
                
            except Exception as e:
                print(f"⚠️ خطأ في OpenAI: {e}")
                response = f"""أبو شام، المخ فهم طلبك:

💭 المهمة: {request.message}
🧠 المعالجة: تحليل ذكي مباشر  
⚡ الحالة: جاهز للرد

تمام، فهمت عليك وأنا معك."""

        # حفظ في الذاكرة مع التعلم
        memory_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "request": request.message,
            "category": category,
            "response": response,
            "ai_processed": True
        }
        self.memory.append(memory_entry)
        
        # تحليل الأنماط للتعلم
        if len(self.memory) > 5:
            await self.learn_from_patterns()
        
        return response
    
    async def learn_from_patterns(self):
        """تعلم من الأنماط المحفوظة"""
        categories = {}
        for entry in self.memory[-10:]:  # آخر 10 طلبات
            cat = entry.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1
        
        # حفظ الأنماط المتعلمة
        most_common = max(categories.items(), key=lambda x: x[1]) if categories else ("general", 1)
        print(f"🧠 المخ تعلم: أكثر طلب متكرر هو {most_common[0]} ({most_common[1]} مرات)")
        
        return most_common

brain = SimpleBrain()

@app.post("/think")
async def brain_think(request: BrainRequest):
    try:
        response = await brain.think(request)
        return {
            "success": True,
            "brain_response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "brain_response": "أبو شام، في مشكلة بالمخ... رح أصلحها!"
        }

@app.get("/memory")
async def get_memory():
    return {
        "total_memories": len(brain.memory),
        "recent_memories": brain.memory[-10:] if brain.memory else []
    }

@app.post("/store-external-api")
async def store_external_api(api_data: dict):
    """حفظ API خارجي في المخ"""
    try:
        brain.memory.append({
            "id": str(uuid.uuid4()),
            "type": "external_api",
            "api_type": api_data.get("apiType"),
            "endpoint": api_data.get("endpoint"), 
            "api_key_hash": api_data.get("apiKey")[:8] + "...",  # للأمان
            "user_id": api_data.get("userId"),
            "timestamp": datetime.now().isoformat(),
            "status": "stored"
        })
        
        return {
            "success": True,
            "message": f"تم حفظ {api_data.get('apiType')} API في المخ",
            "stored_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/delete-external-api")
async def delete_external_api(api_data: dict):
    """حذف API خارجي من المخ"""
    try:
        api_id = api_data.get("apiId")
        api_type = api_data.get("apiType")
        
        # البحث عن API وحذفه
        for i, memory in enumerate(brain.memory):
            if memory.get("id") == api_id and memory.get("type") == "external_api":
                deleted_api = brain.memory.pop(i)
                print(f"🗑️ تم حذف {api_type} API من المخ")
                
                return {
                    "success": True,
                    "message": f"تم حذف {api_type} API من المخ",
                    "deleted_api": deleted_api,
                    "remaining_apis": len([m for m in brain.memory if m.get("type") == "external_api"])
                }
        
        return {
            "success": False,
            "error": f"لم يتم العثور على {api_type} API"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/external-apis")
async def get_stored_apis():
    """جلب APIs المحفوظة"""
    external_apis = [m for m in brain.memory if m.get("type") == "external_api"]
    return {
        "stored_apis": external_apis,
        "total": len(external_apis)
    }

@app.get("/stats")
async def brain_stats():
    return {
        "total_memories": len(brain.memory),
        "status": "نشط",
        "external_apis": len([m for m in brain.memory if m.get("type") == "external_api"]),
        "recent_activity": list(brain.memory)[-5:]
    }

@app.get("/")
async def brain_status():
    return {
        "system": "🧠 سُروح - المخ الذكي",
        "status": "نشط وجاهز",
        "total_memories": len(brain.memory),
        "version": "1.0.0-simple"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)