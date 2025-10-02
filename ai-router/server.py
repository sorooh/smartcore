# Advanced Surooh AI Router - Multi-Layer Brain System
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

# Import emergentintegrations and advanced brain
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    from advanced_brain import AdvancedBrain
    print("✅ emergentintegrations and AdvancedBrain imported successfully")
except ImportError as e:
    print(f"❌ Failed to import dependencies: {e}")
    sys.exit(1)

app = FastAPI(
    title="Advanced Surooh AI Router", 
    description="Multi-Layer Brain System for Surooh AI",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory storage (Firebase alternative)
memory_store = {
    "requests": [],
    "analyses": [],
    "results": []
}

# Initialize Advanced Brain
advanced_brain = AdvancedBrain()
print("🧠 Advanced Multi-Layer Brain initialized successfully")

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_id: str = "abo_sham"
    session_id: Optional[str] = None

class AdvancedChatRequest(BaseModel):
    message: str
    user_id: str = "abo_sham"
    session_id: Optional[str] = None
    chat_mode: str = "smart"
    attached_files: List[Dict] = []
    context: List[Dict] = []

class ChatResponse(BaseModel):
    response: str
    flow_trace: List[str] = []
    requestId: Optional[str] = None

class AdvancedChatResponse(BaseModel):
    response: str
    brain_layers: List[Dict] = []
    learning_insights: List[str] = []
    confidence_score: int = 85
    knowledge_gained: int = 0
    processing_time: float = 0.0
    response_type: str = "advanced_ai"

class SystemStatus(BaseModel):
    status: str
    secretary: bool
    brain: bool
    smart_core: bool
    bots: bool
    firebase: bool
    storage: str
    timestamp: str
    version: str
    brain_layers: Optional[Dict] = None

# Surooh AI System Classes
class SuroohSecretary:
    def __init__(self):
        self.personality = """
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
        """

    async def process_request(self, message: str, user_id: str):
        logger.info(f'🌸 سُروح: استلمت طلب جديد من {user_id}')
        
        # Save to memory store
        request_data = {
            "id": len(memory_store["requests"]) + 1,
            "message": message,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "status": "received_by_secretary",
            "step": "secretary"
        }
        memory_store["requests"].append(request_data)

        # Send to Brain for analysis
        brain = SuroohBrain()
        analysis = await brain.analyze_request(message, user_id)
        
        return {
            "response": analysis["secretary_response"],
            "flow_trace": ["secretary", "brain", analysis["next_step"]],
            "requestId": analysis["request_id"]
        }

class SuroohBrain:
    def __init__(self):
        self.llm_chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id='surooh-brain-session',
            system_message="""
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
            """
        ).with_model("openai", "gpt-4o")

    async def analyze_request(self, message: str, user_id: str):
        logger.info('🧠 المخ: بدأ تحليل الطلب')

        user_message = UserMessage(
            text=f"""طلب من {user_id}: {message}
            
حلل هالطلب وحدد:
1. نوع المهمة (code/design/development/management)
2. التعليمات للمنسق الذكي
3. رد لسُروح بلهجة أبو شام
4. تقدير الوقت المطلوب

اعطني الجواب بالشكل هاد:
TYPE: [نوع المهمة]
INSTRUCTIONS: [تعليمات للمنسق]
RESPONSE: [رد لأبو شام]
TIME_ESTIMATE: [تقدير الوقت]"""
        )

        try:
            analysis = await self.llm_chat.send_message(user_message)
            
            # Parse the response
            lines = analysis.split('\n')
            task_type = self.extract_field(lines, 'TYPE') or 'management'
            instructions = self.extract_field(lines, 'INSTRUCTIONS') or analysis
            response = self.extract_field(lines, 'RESPONSE') or f'تم استلام طلبك يا أبو شام: "{message}". عم أشتغل عليه!'
            time_estimate = self.extract_field(lines, 'TIME_ESTIMATE') or 'بضع دقائق'

            request_id = str(len(memory_store["analyses"]) + 1)
            
            # Save analysis to memory
            analysis_data = {
                "id": request_id,
                "original_message": message,
                "user_id": user_id,
                "task_type": task_type,
                "instructions": instructions,
                "response": response,
                "time_estimate": time_estimate,
                "timestamp": datetime.now().isoformat(),
                "status": "analyzed"
            }
            memory_store["analyses"].append(analysis_data)

            # Send to Smart Core if needed
            next_step = "completed"
            if task_type in ['code', 'design', 'development']:
                smart_core = SmartCore()
                await smart_core.coordinate_task(request_id, task_type, instructions)
                next_step = "smart_core"

            return {
                "secretary_response": response,
                "task_type": task_type,
                "instructions": instructions,
                "next_step": next_step,
                "request_id": request_id,
                "time_estimate": time_estimate
            }

        except Exception as error:
            logger.error(f'خطأ في المخ: {error}')
            return {
                "secretary_response": f"عذراً أبو شام، صار عندي خطأ في التحليل: {str(error)}. جرب مرة تانية.",
                "task_type": "error",
                "next_step": "error",
                "request_id": None
            }

    def extract_field(self, lines: List[str], field_name: str) -> str:
        line = next((l for l in lines if l.startswith(f"{field_name}:")), None)
        return line[len(field_name) + 1:].strip() if line else ""

class SmartCore:
    def __init__(self):
        self.bots = {
            "code": CodeMasterBot(),
            "design": DesignGeniusBot(), 
            "development": FullStackProBot()
        }

    async def coordinate_task(self, request_id: str, task_type: str, instructions: str):
        logger.info(f'⚙️ المنسق الذكي: بدأ تنسيق المهمة {task_type}')

        # Update status in memory
        analysis = next((a for a in memory_store["analyses"] if a["id"] == request_id), None)
        if analysis:
            analysis.update({
                "status": "coordinating",
                "smart_core_step": "started",
                "updated_at": datetime.now().isoformat()
            })

        # Select appropriate bot
        bot = self.bots.get(task_type)
        if not bot:
            raise Exception(f"Bot غير متوفر لنوع المهمة: {task_type}")

        # Execute task
        result = await bot.execute_task(instructions, request_id)
        
        # Update final status
        if analysis:
            analysis.update({
                "status": "completed",
                "result": result,
                "completed_at": datetime.now().isoformat()
            })

        return result

# Bot Classes
class CodeMasterBot:
    def __init__(self):
        self.llm_chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id='code-master-session',
            system_message='أنت المبرمج الخبير في منظومة سُروح. تكتب كود نظيف، مفهوم، وقابل للصيانة.'
        ).with_model("openai", "gpt-4o")

    async def execute_task(self, instructions: str, request_id: str):
        logger.info('💻 المبرمج: بدأ تنفيذ المهمة')
        
        user_message = UserMessage(text=instructions)
        code = await self.llm_chat.send_message(user_message)
        
        return {
            "type": "code",
            "content": code,
            "message": "تم إنشاء الكود بنجاح! 💻"
        }

class DesignGeniusBot:
    def __init__(self):
        self.llm_chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id='design-genius-session', 
            system_message='أنت مصمم UI/UX خبير في منظومة سُروح. تصمم واجهات جميلة وعملية.'
        ).with_model("openai", "gpt-4o")

    async def execute_task(self, instructions: str, request_id: str):
        logger.info('🎨 المصمم: بدأ تنفيذ المهمة')
        
        user_message = UserMessage(text=instructions)
        design = await self.llm_chat.send_message(user_message)
        
        return {
            "type": "design",
            "content": design,
            "message": "تم إنشاء التصميم بنجاح! 🎨"
        }

class FullStackProBot:
    def __init__(self):
        self.llm_chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id='fullstack-pro-session',
            system_message='أنت مطور Full-Stack خبير في منظومة سُروح. تبني تطبيقات متكاملة.'
        ).with_model("openai", "gpt-4o")

    async def execute_task(self, instructions: str, request_id: str):
        logger.info('🏗️ المطور الكامل: بدأ تنفيذ المهمة')
        
        user_message = UserMessage(text=instructions)
        full_stack_solution = await self.llm_chat.send_message(user_message)
        
        return {
            "type": "development", 
            "content": full_stack_solution,
            "message": "تم بناء الحل المتكامل بنجاح! 🏗️"
        }

# Advanced API Routes
@app.post("/advanced-chat", response_model=AdvancedChatResponse)
async def advanced_chat_endpoint(chat_request: AdvancedChatRequest):
    """
    Advanced chat with multi-layer brain processing
    """
    try:
        if not chat_request.message or not chat_request.message.strip():
            raise HTTPException(
                status_code=400, 
                detail="شو بدك يا أبو شام؟ ما وصلني شي!"
            )
        
        logger.info(f'🧠 Advanced Brain: processing request from {chat_request.user_id}')
        
        # Process through advanced multi-layer brain
        result = await advanced_brain.process_advanced_request(
            message=chat_request.message,
            user_id=chat_request.user_id,
            context=chat_request.context,
            chat_mode=chat_request.chat_mode,
            attached_files=chat_request.attached_files
        )
        
        return AdvancedChatResponse(**result)
        
    except Exception as error:
        logger.error(f'خطأ في المخ المتطور: {error}')
        raise HTTPException(
            status_code=500,
            detail=f"عذراً أبو شام، حدث خطأ في المخ المتطور: {str(error)}"
        )

# Original chat for compatibility  
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatRequest):
    """Main chat endpoint for Surooh AI"""
    try:
        if not chat_request.message or not chat_request.message.strip():
            raise HTTPException(
                status_code=400, 
                detail="شو بدك يا أبو شام؟ ما وصلني شي!"
            )
        
        # Use advanced brain for backward compatibility
        advanced_request = AdvancedChatRequest(
            message=chat_request.message,
            user_id=chat_request.user_id,
            session_id=chat_request.session_id,
            chat_mode="smart",
            attached_files=[],
            context=[]
        )
        
        advanced_result = await advanced_chat_endpoint(advanced_request)
        
        return ChatResponse(
            response=advanced_result.response,
            flow_trace=["secretary", "advanced_brain", "synthesis"],
            requestId=chat_request.session_id
        )
        
    except Exception as error:
        logger.error(f'خطأ في المحادثة: {error}')
        raise HTTPException(
            status_code=500,
            detail=f"عذراً أبو شام، حدث خطأ في النظام: {str(error)}"
        )

@app.get("/status", response_model=SystemStatus)
async def status_endpoint():
    """Check system status"""
    try:
        has_llm_key = bool(os.getenv('EMERGENT_LLM_KEY'))
        
        return SystemStatus(
            status="active",
            secretary=True,
            brain=has_llm_key,
            smart_core=has_llm_key,
            bots=has_llm_key,
            firebase=False,
            storage="memory",
            timestamp=datetime.now().isoformat(),
            version="1.0.0"
        )
        
    except Exception as error:
        raise HTTPException(
            status_code=500, 
            detail=f"خطأ في فحص الحالة: {str(error)}"
        )

@app.get("/requests/{request_id}")
async def get_request(request_id: str):
    """Get request details"""
    try:
        analysis = next((a for a in memory_store["analyses"] if a["id"] == request_id), None)
        if not analysis:
            raise HTTPException(status_code=404, detail="Request not found")
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/memory")
async def get_memory():
    """Get memory store contents"""
    try:
        return {
            "storage": "memory",
            "requests": memory_store["requests"][-10:],  # Last 10
            "analyses": memory_store["analyses"][-10:],  # Last 10
            "total_requests": len(memory_store["requests"]),
            "total_analyses": len(memory_store["analyses"])
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "system": "منظومة سُروح - AI Router",
        "version": "1.0.0", 
        "description": "External AI Router for Surooh System",
        "status": "active",
        "endpoints": ["/chat", "/status", "/requests/{id}", "/memory"],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('AI_ROUTER_PORT', 3001))
    
    print(f"🚀 External AI Router starting on port {port}")
    print("🌸 منظومة سُروح جاهزة للعمل!")
    print(f"🤖 LLM Key: {'✅ Available' if os.getenv('EMERGENT_LLM_KEY') else '❌ Missing'}")
    
    uvicorn.run(app, host="0.0.0.0", port=port)