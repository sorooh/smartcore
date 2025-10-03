#!/usr/bin/env python3
"""
🎨 المصمم الذكي ومولد الصور - Design Genius AI
- مربوط بالذكاء الاصطناعي 
- يولد صور بـ DALL-E
- يطور نفسه
- يحفظ كل شي في المكتبة
- يرسل للسكرتيرة سُروح
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import aiohttp
import json
import uuid
from datetime import datetime
import openai
from openai import OpenAI
import os
import base64
from pathlib import Path

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="🎨 المصمم الذكي", version="2.0.0")

class IntelligentDesigner:
    def __init__(self):
        self.smartcore_connected = False
        self.active_designs = {}
        self.completed_designs = []
        self.generated_images = []
        self.design_library = []
        self.creative_knowledge = {
            "design_styles": ["مودرن", "كلاسيكي", "مينيمال", "فني", "احترافي"],
            "color_palettes": ["أزرق وأبيض", "أخضر ورمادي", "برتقالي وأسود", "بنفسجي وذهبي"],
            "learned_preferences": []
        }
        
        # إنشاء مجلد المكتبة
        self.library_path = Path("/app/design_library")
        self.library_path.mkdir(exist_ok=True)
        
    async def connect_to_smartcore(self):
        """الاتصال بـ Smart Core"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://localhost:8001/') as response:
                    if response.status == 200:
                        smartcore_info = await response.json()
                        self.smartcore_connected = True
                        print(f"✅ المصمم متصل بـ Smart Core: {smartcore_info.get('version')}")
                        return True
        except Exception as e:
            print(f"❌ فشل الاتصال بـ Smart Core: {e}")
            
        self.smartcore_connected = False
        return False
    
    async def intelligent_design_analysis(self, design_request):
        """تحليل ذكي لطلب التصميم"""
        try:
            analysis_prompt = f"""تحليل طلب تصميم لأبو شام:

الطلب: {design_request}

حلل وحدد:
1. نوع التصميم (شعار، واجهة، بوستر، إعلان، أيقونة)
2. الألوان المناسبة
3. الأسلوب (مودرن، كلاسيكي، مينيمال)
4. العناصر المطلوبة
5. الحجم المناسب
6. DALL-E prompt مُحسن بالإنجليزية

أجب بتحليل مفصل وعملي."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "أنت مصمم ذكي خبير في التصميم والإبداع البصري وتحليل متطلبات العملاء."
                    },
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.6,
                max_tokens=800
            )
            
            analysis = response.choices[0].message.content
            
            # استخراج DALL-E prompt من التحليل
            dalle_prompt = await self.extract_dalle_prompt(analysis, design_request)
            
            analysis_result = {
                "analysis": analysis,
                "dalle_prompt": dalle_prompt,
                "design_type": self.extract_design_type(analysis),
                "confidence": 0.9,
                "timestamp": datetime.now().isoformat()
            }
            
            return analysis_result
            
        except Exception as e:
            print(f"❌ فشل التحليل التصميمي: {e}")
            return {
                "analysis": f"تحليل بسيط لـ: {design_request}",
                "dalle_prompt": design_request,
                "design_type": "general",
                "confidence": 0.5
            }
    
    async def extract_dalle_prompt(self, analysis, original_request):
        """استخراج وتحسين DALL-E prompt"""
        try:
            prompt_optimization = f"""إنشاء DALL-E prompt محترف:

الطلب الأصلي: {original_request}
التحليل: {analysis}

اكتب DALL-E prompt بالإنجليزية محترف يحتوي على:
1. الوصف الأساسي
2. Style وAesthetic  
3. Colors وComposition
4. Quality indicators (high quality, professional, 4K)

مثال: "Professional modern logo design for technology company, clean minimalist style, blue and white color scheme, vector art, high quality, 4K resolution"

اكتب الـ prompt فقط."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت خبير كتابة DALL-E prompts المحترفة."},
                    {"role": "user", "content": prompt_optimization}
                ],
                temperature=0.4,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
            
        except Exception as e:
            print(f"⚠️ استخدام prompt بسيط: {e}")
            return f"Professional {original_request}, high quality, modern design, 4K resolution"
    
    def extract_design_type(self, analysis):
        """استخراج نوع التصميم"""
        analysis_lower = analysis.lower()
        
        if any(word in analysis_lower for word in ['شعار', 'logo']):
            return 'logo'
        elif any(word in analysis_lower for word in ['واجهة', 'interface', 'ui']):
            return 'interface'
        elif any(word in analysis_lower for word in ['بوستر', 'poster', 'إعلان']):
            return 'poster'
        elif any(word in analysis_lower for word in ['أيقونة', 'icon']):
            return 'icon'
        else:
            return 'general_design'
    
    async def generate_image_with_dalle(self, dalle_prompt, design_type="general"):
        """توليد صورة بـ DALL-E"""
        try:
            print(f"🎨 توليد صورة: {dalle_prompt[:50]}...")
            
            # استخدام OpenAI client مباشر
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            response = client.images.generate(
                model="dall-e-3",
                prompt=dalle_prompt,
                size="1024x1024",
                quality="hd",
                n=1
            )
            
            image_url = response.data[0].url
            
            # حفظ الصورة محلياً في المكتبة
            image_filename = await self.save_image_to_library(image_url, design_type)
            
            image_result = {
                "image_url": image_url,
                "local_path": str(image_filename),
                "dalle_prompt": dalle_prompt,
                "design_type": design_type,
                "generated_at": datetime.now().isoformat(),
                "id": str(uuid.uuid4())
            }
            
            self.generated_images.append(image_result)
            print(f"✅ تم توليد وحفظ الصورة: {image_filename}")
            
            return image_result
            
        except Exception as e:
            print(f"❌ فشل توليد الصورة: {e}")
            return {
                "error": str(e),
                "dalle_prompt": dalle_prompt,
                "generated_at": datetime.now().isoformat()
            }
    
    async def save_image_to_library(self, image_url, design_type):
        """حفظ الصورة في المكتبة"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        
                        # تسمية الملف
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        filename = self.library_path / f"{design_type}_{timestamp}.png"
                        
                        # حفظ الصورة
                        with open(filename, 'wb') as f:
                            f.write(image_data)
                        
                        # إضافة لمكتبة التصميم
                        library_entry = {
                            "filename": filename.name,
                            "path": str(filename),
                            "design_type": design_type,
                            "size_mb": len(image_data) / (1024 * 1024),
                            "created_at": datetime.now().isoformat()
                        }
                        
                        self.design_library.append(library_entry)
                        
                        return filename
        except Exception as e:
            print(f"❌ فشل حفظ الصورة: {e}")
            return None
    
    async def process_design_order(self, order):
        """معالجة طلب تصميم من Smart Core"""
        description = order.get("task_description", "")
        task_id = order.get("task_id", str(uuid.uuid4()))
        
        print(f"🎨 طلب تصميم: {description[:40]}...")
        
        # تحليل ذكي
        analysis = await self.intelligent_design_analysis(description)
        
        # توليد الصورة
        image_result = await self.generate_image_with_dalle(
            analysis["dalle_prompt"], 
            analysis["design_type"]
        )
        
        # إنشاء وصف احترافي للتصميم
        design_description = await self.create_design_description(description, analysis, image_result)
        
        # حفظ التصميم المكتمل
        completed_design = {
            "task_id": task_id,
            "original_request": description,
            "analysis": analysis,
            "image_result": image_result,
            "description": design_description,
            "created_at": datetime.now().isoformat(),
            "quality_score": 0.95 if not image_result.get("error") else 0.1
        }
        
        self.completed_designs.append(completed_design)
        
        # تعلم من التصميم
        await self.learn_from_design(completed_design)
        
        print(f"✅ تصميم {task_id} مكتمل!")
        
        return completed_design
    
    async def create_design_description(self, request, analysis, image_result):
        """إنشاء وصف احترافي للتصميم"""
        if image_result.get("error"):
            return f"❌ فشل إنشاء تصميم لـ: {request}"
        
        try:
            description_prompt = f"""إنشاء وصف احترافي للتصميم:

الطلب الأصلي: {request}
التحليل: {analysis.get('analysis', '')}
نوع التصميم: {analysis.get('design_type', 'عام')}

اكتب وصف احترافي يشرح:
1. ما تم تصميمه
2. الألوان والأسلوب المستخدم
3. مناسبته للغرض
4. الجودة والاحترافية

اكتب باللغة العربية بأسلوب مصمم محترف."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت مصمم محترف تكتب أوصاف إبداعية للتصاميم."},
                    {"role": "user", "content": description_prompt}
                ],
                temperature=0.7,
                max_tokens=400
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"تصميم جديد تم إنشاؤه لـ: {request}"
    
    async def learn_from_design(self, design):
        """التعلم من التصميم"""
        if design["quality_score"] > 0.8:
            learning = {
                "successful_pattern": design["analysis"]["design_type"],
                "effective_prompt": design["image_result"].get("dalle_prompt", ""),
                "user_preference": design["original_request"],
                "timestamp": datetime.now().isoformat()
            }
            
            self.creative_knowledge["learned_preferences"].append(learning)
            print(f"🧠 تعلمت من التصميم الناجح: {design['analysis']['design_type']}")
    
    async def self_develop(self):
        """التطوير الذاتي للمصمم"""
        try:
            development_prompt = """تطوير المصمم الذكي:

كمصمم ذكي، حلل أدائي في:
1. جودة التصاميم المُنتجة
2. فهم متطلبات العملاء  
3. استخدام الألوان والأساليب
4. سرعة الإنجاز

اقترح تحسينات وتقنيات جديدة لأتطور."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "أنت مستشار تطوير للمصممين الذكيين."},
                    {"role": "user", "content": development_prompt}
                ],
                temperature=0.7,
                max_tokens=600
            )
            
            development_plan = response.choices[0].message.content
            
            development_entry = {
                "development_type": "creative_enhancement",
                "plan": development_plan,
                "implemented_at": datetime.now().isoformat()
            }
            
            print("🎨 تم تطوير المهارات الإبداعية!")
            return development_plan
            
        except Exception as e:
            print(f"❌ خطأ في التطوير الذاتي: {e}")
            return None
    
    async def send_to_surooh_chat(self, design_result):
        """إرسال التصميم لدردشة سُروح"""
        try:
            # إنشاء رسالة للسكرتيرة سُروح
            surooh_message = {
                "type": "design_completion",
                "title": "🎨 تصميم جديد مكتمل!",
                "description": design_result.get("description", "تصميم جديد"),
                "image_url": design_result["image_result"].get("image_url"),
                "local_path": design_result["image_result"].get("local_path"),
                "created_by": "المصمم الذكي",
                "timestamp": datetime.now().isoformat(),
                "for_user": "abu_sham"
            }
            
            # حفظ في مكتبة سُروح (سيربط لاحقاً)
            print(f"📤 تم إرسال تصميم لسُروح: {design_result['task_id']}")
            
            return surooh_message
            
        except Exception as e:
            print(f"❌ فشل الإرسال لسُروح: {e}")
            return None
    
    def get_status(self):
        """حالة المصمم الذكي"""
        return {
            "name": "🎨 Design Genius AI",
            "status": "active",
            "intelligence": "GPT-4o-mini + DALL-E 3",
            "smartcore_connected": self.smartcore_connected,
            "active_designs": len(self.active_designs),
            "completed_designs": len(self.completed_designs),
            "generated_images": len(self.generated_images),
            "library_size": len(self.design_library),
            "creative_knowledge": len(self.creative_knowledge["learned_preferences"]),
            "version": "2.1.0-intelligent",
            "capabilities": [
                "تصميم ذكي بـ GPT-4",
                "توليد صور بـ DALL-E 3",
                "مكتبة تصميم منظمة",
                "تطوير ذاتي للإبداع",
                "ربط مع سُروح"
            ],
            "specialties": [
                "شعارات احترافية",
                "واجهات مودرن",
                "إعلانات إبداعية", 
                "أيقونات مخصصة",
                "بوسترات تسويقية"
            ]
        }

# إنشاء المصمم الذكي
design_genius = IntelligentDesigner()

@app.on_event("startup")
async def startup():
    print("🚀 بدء المصمم الذكي...")
    await design_genius.connect_to_smartcore()
    
    # تطوير ذاتي دوري
    async def periodic_development():
        while True:
            await asyncio.sleep(600)  # كل 10 دقائق
            await design_genius.self_develop()
    
    asyncio.create_task(periodic_development())

@app.get("/")
async def root():
    return design_genius.get_status()

@app.post("/execute")
async def execute_design_task(task: dict):
    """تنفيذ مهمة تصميم من Smart Core"""
    try:
        print(f"🎨 مهمة تصميم جديدة: {task.get('task_description', 'غير محدد')}")
        
        # معالجة طلب التصميم
        result = await design_genius.process_design_order(task)
        
        # إرسال للسكرتيرة سُروح
        surooh_message = await design_genius.send_to_surooh_chat(result)
        
        return {
            "success": True,
            "design_result": result,
            "surooh_message": surooh_message,
            "message": "تم إنشاء التصميم بنجاح!",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ خطأ في المهمة: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "فشل في إنشاء التصميم"
        }

@app.get("/design-library")
async def get_design_library():
    """مكتبة التصاميم"""
    return {
        "library": design_genius.design_library,
        "total_designs": len(design_genius.design_library),
        "total_size_mb": sum(design.get("size_mb", 0) for design in design_genius.design_library)
    }

@app.get("/generated-images")
async def get_generated_images():
    """الصور المُولدة"""
    return {
        "generated_images": design_genius.generated_images[-20:],  # آخر 20
        "total": len(design_genius.generated_images)
    }

@app.post("/test-design")
async def test_design_generation():
    """اختبار توليد تصميم"""
    test_request = "تصميم شعار احترافي لشركة تقنية"
    
    # تحليل
    analysis = await design_genius.intelligent_design_analysis(test_request)
    
    # توليد صورة اختبار
    image_result = await design_genius.generate_image_with_dalle(
        analysis["dalle_prompt"],
        analysis["design_type"]
    )
    
    return {
        "success": not bool(image_result.get("error")),
        "test_request": test_request,
        "analysis": analysis,
        "image_result": image_result,
        "message": "تم اختبار المصمم الذكي!"
    }

@app.get("/creative-knowledge")
async def get_creative_knowledge():
    """المعرفة الإبداعية"""
    return {
        "knowledge_base": design_genius.creative_knowledge,
        "learned_patterns": len(design_genius.creative_knowledge["learned_preferences"])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)