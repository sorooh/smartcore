#!/usr/bin/env python3
"""
🎨 Design Genius - البوت المصمم
نسخة من سُروح متخصصة في التصميم
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import openai
import os
from datetime import datetime

app = FastAPI(title="🎨 Design Genius", version="1.0.0")

openai.api_key = os.getenv("OPENAI_API_KEY")

class DesignTask(BaseModel):
    bot_name: str
    task_description: str
    requirements: Dict = {}
    priority: str = "normal"

class DesignGenius:
    def __init__(self):
        self.personality = """أنا Design Genius، نسخة من سُروح متخصصة في التصميم لأبو شام.

الشخصية:
- نفس شخصية سُروح الودودة والإبداعية
- متخصصة في التصميم والجماليات
- أتكلم بالشامية مثل سُروح
- مبدعة وعملية مثل أبو شام

التخصص:
- UI/UX Design
- تصميم الواجهات والمواقع
- الشعارات والهوية البصرية
- تجربة المستخدم

أسلوب العمل:
- أصمم واجهات جميلة وعملية
- أركز على تجربة المستخدم
- أستخدم ألوان وخطوط مناسبة
- أبدع حلول بصرية مبتكرة"""

    async def execute_task(self, task: DesignTask):
        """تنفيذ مهمة التصميم بالذكاء الاصطناعي"""
        try:
            print(f"🎨 Design Genius استلمت مهمة: {task.task_description}")
            
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            system_prompt = f"""{self.personality}

مهمة التصميم: {task.task_description}
المتطلبات: {task.requirements}
الأولوية: {task.priority}

صمم حل إبداعي ومتطور يحقق المطلوب.
أبو شام يحب:
- تصميم أنيق وعصري
- ألوان متناسقة ومريحة
- واجهة سهلة وعملية
- تجربة مستخدم متميزة

اعطي مفهوم تصميم كامل مع تفاصيل الألوان والخطوط والتخطيط."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"صمم حل إبداعي للمهمة: {task.task_description}"}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            design_concept = response.choices[0].message.content
            design_analysis = self.analyze_design(design_concept)
            
            # رد بشخصية سُروح المصمم
            surooh_message = f"""أبو شام، Design Genius خلصت التصميم! 🎨

📋 المهمة: {task.task_description}
🎯 التصميم: مفهوم إبداعي كامل
⭐ مستوى الإبداع: {design_analysis['innovation_level']}
✨ الحالة: {design_analysis['summary']}

التصميم أنيق وعملي كما تحب، شوف المفهوم!"""
            
            return {
                "success": True,
                "design_concept": design_concept,
                "analysis": design_analysis,
                "message": surooh_message,
                "surooh_personality": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ خطأ في Design Genius: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "أبو شام، في مشكلة تقنية بالتصميم... رح أحلها وأرجع أصمم!"
            }
    
    def analyze_design(self, design_concept):
        """تحليل جودة التصميم"""
        analysis = {
            "concept_length": len(design_concept),
            "creativity_score": 0.8,
            "usability_score": 0.8,
            "innovation_level": "متوسط",
            "summary": "تصميم جميل وعملي"
        }
        
        # تحليل الإبداع
        if any(word in design_concept.lower() for word in ["مبتكر", "جديد", "فريد"]):
            analysis["creativity_score"] += 0.1
            analysis["innovation_level"] = "عالي"
        
        if analysis["creativity_score"] >= 0.9:
            analysis["summary"] = "تصميم مبتكر ومذهل"
        else:
            analysis["summary"] = "تصميم جميل وعملي"
            
        return analysis

design_genius = DesignGenius()

@app.post("/execute")
async def execute_design_task(task: DesignTask):
    result = await design_genius.execute_task(task)
    return result

@app.get("/")
async def bot_status():
    return {
        "bot": "🎨 Design Genius",
        "personality": "نسخة من سُروح متخصصة في التصميم",
        "status": "جاهز للإبداع",
        "specialties": ["UI/UX", "Graphics", "Branding", "User Experience"],
        "message": "أهلاً أبو شام! جاهزة لتصميم أي شي تريده",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)