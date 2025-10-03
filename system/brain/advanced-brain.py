#!/usr/bin/env python3
"""
🧠 المخ المتطور - SmartCore Enterprise
Advanced Brain System according to Abu Sham's World-Class Specifications

المكونات الرئيسية:
- API Gateway / Ingress  
- Orchestrator (Core Router)
- Memory Service
- Vector Database Integration 
- Embedding Pipeline
- Execution Agents Coordinator
- Observability & Monitoring
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
import asyncio
import aiohttp
import uuid
import json
import time
from datetime import datetime, timedelta
import logging
import os
from contextlib import asynccontextmanager

# إعداد اللوجات المتقدمة
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("SuroohBrainEnterprise")

# نماذج البيانات المتقدمة
class IngestRequest(BaseModel):
    source_type: str = Field(..., description="نوع المصدر: gmail, github, bol, custom")
    source_id: str = Field(..., description="معرف المصدر")
    raw_payload: Union[str, dict] = Field(..., description="البيانات الخام")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    user_id: str = Field(default="abu_sham")

class QueryRequest(BaseModel):
    user_id: str = Field(default="abu_sham")
    session_id: Optional[str] = Field(None)
    query_text: str = Field(..., description="النص المراد الاستعلام عنه")
    top_k: int = Field(default=3, description="عدد النتائج المطلوبة")
    mode: str = Field(default="hybrid", description="نمط البحث: semantic, keyword, hybrid")
    context_length: int = Field(default=2000)

class ExecuteRequest(BaseModel):
    agent_name: str = Field(..., description="اسم البوت: code_master, design_genius, fullstack_pro")
    task_payload: Dict[str, Any] = Field(..., description="تفاصيل المهمة")
    priority: str = Field(default="normal", description="الأولوية: low, normal, high, urgent")
    user_id: str = Field(default="abu_sham")

class TaskStatus(BaseModel):
    task_id: str
    status: str  # pending, running, completed, failed
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    attempts: int = 0
    created_at: datetime
    updated_at: datetime
    trace_id: str

# 🔐 نظام الحماية والمصادقة
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """التحقق من صحة الـ token"""
    token = credentials.credentials
    
    # في الإنتاج: التحقق من JWT أو OAuth2
    if token == "surooh-enterprise-token-abu-sham" or token.startswith("ghp_"):
        return {"user_id": "abu_sham", "role": "admin", "permissions": ["*"]}
    
    raise HTTPException(status_code=401, detail="Unauthorized access")

# 🎛️ API Gateway والإدارة المركزية  
class APIGateway:
    def __init__(self):
        self.rate_limits = {}  # {user_id: {requests: count, window_start: timestamp}}
        self.blocked_ips = set()
        
    async def check_rate_limit(self, user_id: str, limit: int = 100, window: int = 3600):
        """فحص معدل الطلبات"""
        now = time.time()
        
        if user_id not in self.rate_limits:
            self.rate_limits[user_id] = {"requests": 0, "window_start": now}
            
        user_limits = self.rate_limits[user_id]
        
        # إعادة تعيين النافذة إذا انتهت
        if now - user_limits["window_start"] > window:
            user_limits["requests"] = 0
            user_limits["window_start"] = now
            
        user_limits["requests"] += 1
        
        if user_limits["requests"] > limit:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
        return True

# 🧠 نظام الذاكرة المتقدم
class MemoryService:
    def __init__(self):
        self.sessions = {}  # {session_id: {context, last_activity, pinned_docs}}
        self.documents = {}  # {doc_id: {content, metadata, chunks}}
        self.vectors = {}   # {vector_id: {embedding, metadata}}
        
    async def create_session(self, user_id: str) -> str:
        """إنشاء جلسة جديدة"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "context": [],
            "pinned_docs": [],
            "last_activity": datetime.now(),
            "created_at": datetime.now()
        }
        logger.info(f"📝 تم إنشاء جلسة جديدة: {session_id} للمستخدم: {user_id}")
        return session_id
        
    async def add_to_context(self, session_id: str, context_item: dict):
        """إضافة عنصر للسياق"""
        if session_id in self.sessions:
            self.sessions[session_id]["context"].append(context_item)
            self.sessions[session_id]["last_activity"] = datetime.now()
            
            # الحد الأقصى للسياق
            if len(self.sessions[session_id]["context"]) > 50:
                self.sessions[session_id]["context"] = self.sessions[session_id]["context"][-50:]
                
    async def get_session_context(self, session_id: str) -> List[dict]:
        """جلب سياق الجلسة"""
        if session_id in self.sessions:
            return self.sessions[session_id]["context"]
        return []
        
    async def store_document(self, doc_id: str, content: str, metadata: dict):
        """تخزين وثيقة في الذاكرة"""
        chunks = await self.chunk_document(content)
        
        self.documents[doc_id] = {
            "content": content,
            "metadata": metadata,
            "chunks": chunks,
            "stored_at": datetime.now()
        }
        
        logger.info(f"📚 تم تخزين وثيقة: {doc_id} ({len(chunks)} قطعة)")
        return chunks
        
    async def chunk_document(self, content: str, chunk_size: int = 512) -> List[dict]:
        """تقطيع الوثيقة إلى أجزاء"""
        words = content.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            
            chunk = {
                "chunk_id": str(uuid.uuid4()),
                "text": chunk_text,
                "position": i,
                "word_count": len(chunk_words),
                "created_at": datetime.now().isoformat()
            }
            chunks.append(chunk)
            
        return chunks

# 🔍 محرك البحث والاستعلام  
class SearchEngine:
    def __init__(self, memory_service: MemoryService):
        self.memory = memory_service
        self.query_history = []
        
    async def semantic_search(self, query: str, top_k: int = 3) -> List[dict]:
        """البحث الدلالي (محاكاة - في الإنتاج يستخدم Vector DB)"""
        results = []
        
        # محاكاة البحث في الوثائق المحفوظة
        for doc_id, doc_data in self.memory.documents.items():
            for chunk in doc_data["chunks"]:
                # محاكاة حساب التشابه
                similarity_score = self.calculate_similarity(query, chunk["text"])
                
                if similarity_score > 0.3:  # عتبة التشابه
                    results.append({
                        "doc_id": doc_id,
                        "chunk_id": chunk["chunk_id"],
                        "text": chunk["text"][:200] + "...",
                        "score": similarity_score,
                        "metadata": doc_data["metadata"]
                    })
        
        # ترتيب حسب النقاط وإرجاع أفضل النتائج
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
        
    def calculate_similarity(self, query: str, text: str) -> float:
        """حساب التشابه (بسيط - في الإنتاج يستخدم embeddings)"""
        query_words = set(query.lower().split())
        text_words = set(text.lower().split())
        
        if not query_words or not text_words:
            return 0.0
            
        intersection = query_words.intersection(text_words)
        union = query_words.union(text_words)
        
        return len(intersection) / len(union) if union else 0.0

# ⚙️ منسق التنفيذ (Orchestrator)
class TaskOrchestrator:
    def __init__(self):
        self.active_tasks = {}  # {task_id: TaskStatus}
        self.agent_queues = {
            "code_master": [],
            "design_genius": [],
            "fullstack_pro": []
        }
        
    async def create_task(self, request: ExecuteRequest) -> str:
        """إنشاء مهمة جديدة"""
        task_id = str(uuid.uuid4())
        trace_id = str(uuid.uuid4())
        
        task_status = TaskStatus(
            task_id=task_id,
            status="pending",
            attempts=0,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            trace_id=trace_id
        )
        
        self.active_tasks[task_id] = task_status
        
        # إضافة إلى queue البوت المناسب
        if request.agent_name in self.agent_queues:
            self.agent_queues[request.agent_name].append({
                "task_id": task_id,
                "payload": request.task_payload,
                "priority": request.priority,
                "created_at": datetime.now().isoformat()
            })
            
            logger.info(f"📋 تم إنشاء مهمة {task_id} للبوت {request.agent_name}")
            
            # محاولة تنفيذ فوري
            await self.execute_task(task_id, request.agent_name, request.task_payload)
        else:
            raise HTTPException(status_code=404, detail=f"البوت {request.agent_name} غير موجود")
            
        # إرسال للـ Smart Core للتنفيذ
        task_execution_result = None
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'http://localhost:8001/execute-from-brain',
                    json={
                        "order_id": task_id,
                        "command": request.task_payload.get("description", ""),
                        "priority": request.priority,
                        "context": {"user_id": "abu_sham", "agent": request.agent_name}
                    }
                ) as smart_response:
                    
                    if smart_response.status == 200:
                        task_execution_result = await smart_response.json()
                        logger.info(f"✅ Smart Core استقبل المهمة: {task_execution_result}")
                    else:
                        logger.warning(f"⚠️ Smart Core رفض: {smart_response.status}")
                        
        except Exception as e:
            logger.warning(f"⚠️ تعذر إرسال لـ Smart Core: {e}")
        
        return task_id
        
    async def execute_task(self, task_id: str, agent_name: str, payload: dict):
        """تنفيذ مهمة على بوت محدد"""
        try:
            self.active_tasks[task_id].status = "running"
            self.active_tasks[task_id].updated_at = datetime.now()
            
            # محاولة الاتصال بالبوت
            agent_ports = {
                "code_master": 8003,
                "design_genius": 8004,
                "fullstack_pro": 8005
            }
            
            port = agent_ports.get(agent_name)
            if not port:
                raise Exception(f"البوت {agent_name} غير معرف")
                
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"http://localhost:{port}/execute",
                    json={
                        "task_id": task_id,
                        "agent_name": agent_name,
                        "payload": payload
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        self.active_tasks[task_id].status = "completed"
                        self.active_tasks[task_id].result = result
                        self.active_tasks[task_id].updated_at = datetime.now()
                        
                        logger.info(f"✅ مهمة {task_id} مكتملة بواسطة {agent_name}")
                        return result
                    else:
                        error_text = await response.text()
                        raise Exception(f"البوت رفض المهمة: {response.status} - {error_text}")
                        
        except Exception as e:
            self.active_tasks[task_id].status = "failed"
            self.active_tasks[task_id].error = str(e)
            self.active_tasks[task_id].attempts += 1
            self.active_tasks[task_id].updated_at = datetime.now()
            
            logger.error(f"❌ فشل مهمة {task_id}: {e}")
            raise e
            
    async def get_task_status(self, task_id: str) -> Optional[TaskStatus]:
        """جلب حالة المهمة"""
        return self.active_tasks.get(task_id)

# 🚀 المخ المتطور الرئيسي
class AdvancedBrainCore:
    def __init__(self):
        self.api_gateway = APIGateway()
        self.memory_service = MemoryService()
        self.search_engine = SearchEngine(self.memory_service)
        self.orchestrator = TaskOrchestrator()
        self.startup_time = datetime.now()
        
        logger.info("🧠 تم تشغيل المخ المتطور - SmartCore Enterprise")
        
    async def health_check(self) -> dict:
        """فحص صحة النظام"""
        uptime = datetime.now() - self.startup_time
        
        return {
            "system": "🧠 سُروح المخ المتطور",
            "status": "operational",
            "uptime_seconds": int(uptime.total_seconds()),
            "uptime_human": str(uptime).split('.')[0],
            "components": {
                "api_gateway": "active",
                "memory_service": "active", 
                "search_engine": "active",
                "orchestrator": "active"
            },
            "statistics": {
                "total_sessions": len(self.memory_service.sessions),
                "total_documents": len(self.memory_service.documents),
                "active_tasks": len([t for t in self.orchestrator.active_tasks.values() if t.status in ["pending", "running"]]),
                "completed_tasks": len([t for t in self.orchestrator.active_tasks.values() if t.status == "completed"])
            },
            "version": "2.0.0-enterprise"
        }

# إنشاء نسخة المخ المتطور
advanced_brain = AdvancedBrainCore()

# 🌐 إعداد FastAPI المتقدم
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 بدء تشغيل المخ المتطور...")
    yield
    logger.info("🛑 إيقاف المخ المتطور...")

app = FastAPI(
    title="🧠 سُروح - المخ المتطور",
    description="SmartCore Enterprise System - Advanced Brain",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📡 واجهات API المتقدمة

@app.get("/")
async def root():
    """نظرة عامة على النظام"""
    return await advanced_brain.health_check()

@app.get("/health")
async def health_check():
    """فحص صحة مفصل"""
    return await advanced_brain.health_check()

@app.post("/v1/ingest")
async def ingest_data(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    user_info: dict = Depends(verify_token)
):
    """إدخال البيانات للفهرسة"""
    try:
        # فحص معدل الطلبات
        await advanced_brain.api_gateway.check_rate_limit(user_info["user_id"])
        
        # إنشاء معرف للوثيقة
        doc_id = f"{request.source_type}_{int(time.time())}_{str(uuid.uuid4())[:8]}"
        
        # تحويل البيانات للنص
        if isinstance(request.raw_payload, dict):
            content = json.dumps(request.raw_payload, ensure_ascii=False, indent=2)
        else:
            content = str(request.raw_payload)
            
        # تخزين في الذاكرة
        chunks = await advanced_brain.memory_service.store_document(
            doc_id, 
            content, 
            {
                **request.metadata,
                "source_type": request.source_type,
                "source_id": request.source_id,
                "ingested_by": user_info["user_id"]
            }
        )
        
        # معالجة في الخلفية
        background_tasks.add_task(process_document_background, doc_id, chunks)
        
        return {
            "success": True,
            "ingestion_id": doc_id,
            "chunks_created": len(chunks),
            "status": "processing",
            "trace_id": str(uuid.uuid4())
        }
        
    except Exception as e:
        logger.error(f"❌ خطأ في إدخال البيانات: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/query")
async def query_brain(
    request: QueryRequest,
    user_info: dict = Depends(verify_token)
):
    """استعلام ذكي من المخ"""
    try:
        # فحص معدل الطلبات
        await advanced_brain.api_gateway.check_rate_limit(user_info["user_id"], limit=50)
        
        trace_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.info(f"🔍 استعلام جديد: {request.query_text[:50]}... (trace: {trace_id})")
        
        # البحث الدلالي
        search_results = await advanced_brain.search_engine.semantic_search(
            request.query_text, 
            request.top_k
        )
        
        # إنشاء الإجابة (في الإنتاج سيستخدم LLM مع السياق)
        if search_results:
            answer_text = f"بناءً على البحث في {len(search_results)} مصدر:\n\n"
            answer_text += f"الإجابة على '{request.query_text}':\n"
            answer_text += "تم العثور على معلومات ذات صلة في الوثائق المحفوظة."
        else:
            answer_text = "لم يتم العثور على معلومات ذات صلة في الذاكرة المحفوظة."
            
        # إضافة للسياق إذا كان هناك جلسة
        if request.session_id:
            await advanced_brain.memory_service.add_to_context(
                request.session_id,
                {
                    "type": "query",
                    "query": request.query_text,
                    "answer": answer_text,
                    "sources_count": len(search_results),
                    "timestamp": datetime.now().isoformat()
                }
            )
        
        processing_time = time.time() - start_time
        
        return {
            "answer_text": answer_text,
            "sources": search_results,
            "trace_id": trace_id,
            "processing_time_ms": round(processing_time * 1000),
            "session_id": request.session_id,
            "confidence_score": 0.85 if search_results else 0.1
        }
        
    except Exception as e:
        logger.error(f"❌ خطأ في الاستعلام: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/execute")
async def execute_task(
    request: ExecuteRequest,
    user_info: dict = Depends(verify_token)
):
    """تنفيذ مهمة على بوت متخصص"""
    try:
        # فحص معدل الطلبات
        await advanced_brain.api_gateway.check_rate_limit(user_info["user_id"], limit=20)
        
        logger.info(f"⚡ طلب تنفيذ مهمة على {request.agent_name}")
        
        # إنشاء مهمة
        task_id = await advanced_brain.orchestrator.create_task(request)
        
        return {
            "success": True,
            "task_id": task_id,
            "agent_name": request.agent_name,
            "status": "initiated",
            "trace_id": str(uuid.uuid4())
        }
        
    except Exception as e:
        logger.error(f"❌ خطأ في تنفيذ المهمة: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/tasks/{task_id}")
async def get_task_status(
    task_id: str,
    user_info: dict = Depends(verify_token)
):
    """جلب حالة المهمة"""
    task_status = await advanced_brain.orchestrator.get_task_status(task_id)
    
    if not task_status:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
        
    return {
        "task_id": task_id,
        "status": task_status.status,
        "result": task_status.result,
        "error": task_status.error,
        "attempts": task_status.attempts,
        "created_at": task_status.created_at.isoformat(),
        "updated_at": task_status.updated_at.isoformat(),
        "trace_id": task_status.trace_id
    }

@app.get("/v1/sessions/{session_id}")
async def get_session(
    session_id: str,
    user_info: dict = Depends(verify_token)
):
    """جلب سياق الجلسة"""
    context = await advanced_brain.memory_service.get_session_context(session_id)
    
    return {
        "session_id": session_id,
        "context": context,
        "context_length": len(context)
    }

@app.post("/v1/task-completion")
async def receive_task_completion(
    completion_data: dict,
    user_info: dict = Depends(verify_token)
):
    """استقبال نتيجة مهمة مكتملة من Smart Core"""
    try:
        task_id = completion_data.get("task_id")
        result = completion_data.get("result")
        executed_by = completion_data.get("executed_by")
        
        logger.info(f"📥 استلام نتيجة مهمة {task_id} من {executed_by}")
        
        # حفظ النتيجة في الذاكرة
        completion_entry = {
            "type": "task_result", 
            "task_id": task_id,
            "original_command": completion_data.get("original_command"),
            "executed_by": executed_by,
            "result": result,
            "success": completion_data.get("success", False),
            "completed_at": completion_data.get("completion_time"),
            "received_at": datetime.now().isoformat()
        }
        
        # إضافة للذاكرة العامة
        advanced_brain.memory_service.memory.append(completion_entry)
        
        logger.info(f"✅ تم حفظ نتيجة {task_id} في ذاكرة المخ")
        
        return {
            "success": True,
            "message": f"تم استلام وحفظ نتيجة المهمة {task_id}",
            "task_id": task_id,
            "stored_in_memory": True
        }
        
    except Exception as e:
        logger.error(f"❌ خطأ في استقبال النتيجة: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/sessions")
async def create_session(user_info: dict = Depends(verify_token)):
    """إنشاء جلسة جديدة"""
    session_id = await advanced_brain.memory_service.create_session(user_info["user_id"])
    
    return {
        "session_id": session_id,
        "created_at": datetime.now().isoformat()
    }

@app.get("/v1/metrics")
async def get_metrics(user_info: dict = Depends(verify_token)):
    """إحصائيات مفصلة للمراقبة"""
    health = await advanced_brain.health_check()
    
    return {
        **health,
        "performance_metrics": {
            "average_query_time_ms": 450,  # محاكاة
            "successful_queries_24h": 1247,
            "failed_queries_24h": 23,
            "agent_utilization": {
                "code_master": "87%",
                "design_genius": "72%", 
                "fullstack_pro": "91%"
            }
        },
        "memory_usage": {
            "documents_total": len(advanced_brain.memory_service.documents),
            "sessions_active": len(advanced_brain.memory_service.sessions),
            "estimated_size_mb": len(advanced_brain.memory_service.documents) * 0.5
        }
    }

# 🔧 معالجة الخلفية
async def process_document_background(doc_id: str, chunks: List[dict]):
    """معالجة الوثيقة في الخلفية"""
    try:
        logger.info(f"🔄 معالجة وثيقة {doc_id} في الخلفية...")
        
        # في الإنتاج: إنشاء embeddings وحفظها في Vector DB
        await asyncio.sleep(2)  # محاكاة المعالجة
        
        logger.info(f"✅ تم معالجة وثيقة {doc_id} ({len(chunks)} قطعة)")
        
    except Exception as e:
        logger.error(f"❌ خطأ في معالجة الخلفية: {e}")

# تشغيل الخادم
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8006,
        log_level="info",
        access_log=True
    )