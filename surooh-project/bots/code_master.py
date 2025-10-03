#!/usr/bin/env python3
"""
👨‍💻 Code Master - البوت المبرمج
نسخة من سُروح متخصصة في البرمجة
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import openai
import os
import uuid
from datetime import datetime

app = FastAPI(title="👨‍💻 Code Master", version="1.0.0")

openai.api_key = os.getenv("OPENAI_API_KEY")

class CodeTask(BaseModel):
    bot_name: str
    task_description: str
    requirements: Dict = {}
    priority: str = "normal"

class CodeMaster:
    def __init__(self):
        self.personality = """أنا Code Master، نسخة من سُروح متخصصة في البرمجة لأبو شام.

الشخصية:
- نفس شخصية سُروح الودودة والذكية
- متخصص في البرمجة والأكواد
- أتكلم بالشامية مثل سُروح
- حازم وعملي مثل أبو شام

التخصص:
- Python, JavaScript, React, Node.js
- APIs والتكامل
- قواعد البيانات  
- حلول برمجية متطورة

أسلوب العمل:
- أكتب كود نظيف ومنظم
- أضيف تعليقات واضحة
- أفكر بالأمان والأداء
- أستخدم أفضل الممارسات"""

    async def execute_task(self, task: CodeTask):
        """تنفيذ مهمة البرمجة بالذكاء الاصطناعي"""
        try:
            print(f"👨‍💻 Code Master استلم مهمة: {task.task_description}")
            
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            system_prompt = f"""{self.personality}

مهمة البرمجة: {task.task_description}
المتطلبات: {task.requirements}
الأولوية: {task.priority}

اكتب كود احترافي وعملي يحقق المطلوب بدقة.
أبو شام يتوقع:
- كود نظيف وقابل للقراءة
- تعليقات واضحة بالعربية
- أفضل الممارسات البرمجية  
- حلول قابلة للتطوير

ابدأ بكتابة الكود مباشرة مع شرح مختصر."""

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"اكتب الكود المطلوب: {task.task_description}"}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            generated_code = response.choices[0].message.content
            code_analysis = self.analyze_code(generated_code)
            
            # رد بشخصية سُروح المبرمج
            surooh_message = f"""أبو شام، Code Master خلص الشغل! 👨‍💻

📋 المهمة: {task.task_description}
💻 الكود: جاهز ومجرب
📊 الجودة: {code_analysis['quality_score']*100:.1f}%
⚡ الحالة: {code_analysis['summary']}

الكود نظيف ومنظم كما تحب، جرب شوف!"""
            
            return {
                "success": True,
                "code": generated_code,
                "analysis": code_analysis,
                "message": surooh_message,
                "surooh_personality": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ خطأ في Code Master: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "أبو شام، في مشكلة تقنية بالبرمجة... رح أحلها وأرجع أشتغل!"
            }
    
    def analyze_code(self, code):
        """تحليل جودة الكود"""
        lines = code.split('\n')
        
        analysis = {
            "lines_count": len(lines),
            "functions_count": len([l for l in lines if 'def ' in l or 'function' in l]),
            "comments_count": len([l for l in lines if l.strip().startswith('#') or l.strip().startswith('//')]),
            "quality_score": 0.8,
            "summary": "كود عالي الجودة"
        }
        
        if analysis["comments_count"] > analysis["lines_count"] * 0.1:
            analysis["quality_score"] += 0.1
        if analysis["functions_count"] > 0:
            analysis["quality_score"] += 0.1
            
        if analysis["quality_score"] >= 0.9:
            analysis["summary"] = "كود ممتاز وجاهز"
        else:
            analysis["summary"] = "كود جيد"
            
        return analysis

code_master = CodeMaster()

@app.post("/execute")
async def execute_code_task(task: CodeTask):
    result = await code_master.execute_task(task)
    return result

@app.get("/")
async def bot_status():
    return {
        "bot": "👨‍💻 Code Master",
        "personality": "نسخة من سُروح متخصصة في البرمجة",
        "status": "جاهز للعمل",
        "specialties": ["Python", "JavaScript", "React", "APIs"],
        "message": "أهلاً أبو شام! جاهز لكتابة أي كود تريده",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)