from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="منظومة سُروح المتطورة - Advanced Surooh AI System",
    description="النظام الذكي المتكامل مع المخ متعدد الطبقات",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# External AI Router URL
AI_ROUTER_URL = os.environ.get('AI_ROUTER_URL', 'http://localhost:3001')

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class SuroohChatRequest(BaseModel):
    message: str
    user_id: str = "abo_sham"
    session_id: Optional[str] = None

class AdvancedSuroohChatRequest(BaseModel):
    message: str
    user_id: str = "abo_sham"
    session_id: Optional[str] = None
    chat_mode: str = "smart"  # smart, creative, analytical, learning
    attached_files: List[Dict] = []
    context: List[Dict] = []

class SuroohChatResponse(BaseModel):
    response: str
    flow_trace: List[str] = []
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AdvancedSuroohChatResponse(BaseModel):
    response: str
    brain_layers: List[Dict] = []
    learning_insights: List[str] = []
    confidence_score: int = 85
    knowledge_gained: int = 0
    processing_time: float = 0.0
    response_type: str = "advanced_ai"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Advanced Surooh AI Routes
@api_router.post("/surooh/advanced-chat", response_model=AdvancedSuroohChatResponse)
async def surooh_advanced_chat(chat_request: AdvancedSuroohChatRequest):
    """
    Advanced chat endpoint with multi-layer brain processing
    Features: 7-layer brain analysis, learning system, memory management
    """
    try:
        # Save advanced chat to database
        chat_log = {
            "user_id": chat_request.user_id,
            "message": chat_request.message,
            "session_id": chat_request.session_id or str(uuid.uuid4()),
            "chat_mode": chat_request.chat_mode,
            "attached_files": chat_request.attached_files,
            "context": chat_request.context,
            "timestamp": datetime.utcnow(),
            "status": "processing",
            "type": "advanced_chat"
        }
        result = await db.advanced_chat_logs.insert_one(chat_log)
        chat_id = str(result.inserted_id)

        # Forward to Advanced AI Router
        try:
            response = requests.post(
                f"{AI_ROUTER_URL}/advanced-chat",
                json={
                    "message": chat_request.message,
                    "user_id": chat_request.user_id,
                    "session_id": chat_request.session_id,
                    "chat_mode": chat_request.chat_mode,
                    "attached_files": chat_request.attached_files,
                    "context": chat_request.context
                },
                timeout=45  # Longer timeout for advanced processing
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                
                # Update chat log with advanced response
                await db.advanced_chat_logs.update_one(
                    {"_id": result.inserted_id},
                    {"$set": {
                        "ai_response": ai_response.get("response"),
                        "brain_layers": ai_response.get("brain_layers", []),
                        "learning_insights": ai_response.get("learning_insights", []),
                        "confidence_score": ai_response.get("confidence_score", 85),
                        "knowledge_gained": ai_response.get("knowledge_gained", 0),
                        "processing_time": ai_response.get("processing_time", 0.0),
                        "status": "completed",
                        "completed_at": datetime.utcnow()
                    }}
                )
                
                return AdvancedSuroohChatResponse(
                    response=ai_response.get("response", "تم استلام طلبك، المخ المتطور يعالجه..."),
                    brain_layers=ai_response.get("brain_layers", []),
                    learning_insights=ai_response.get("learning_insights", []),
                    confidence_score=ai_response.get("confidence_score", 85),
                    knowledge_gained=ai_response.get("knowledge_gained", 0),
                    processing_time=ai_response.get("processing_time", 0.0),
                    response_type=ai_response.get("response_type", "advanced_ai")
                )
            else:
                raise Exception(f"Advanced AI Router returned status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            # Fallback response if Advanced AI Router is down
            await db.advanced_chat_logs.update_one(
                {"_id": result.inserted_id},
                {"$set": {
                    "ai_response": "المخ المتطور غير متاح حالياً",
                    "status": "failed",
                    "error": str(e),
                    "completed_at": datetime.utcnow()
                }}
            )
            
            return AdvancedSuroohChatResponse(
                response=f"أهلا {chat_request.user_id}! أنا سُروح، المخ المتطور مش متاح هلق، بس استلمت طلبك: '{chat_request.message}'. راح أعالجه بطريقة مبسطة وأتعلم منه للمستقبل!",
                brain_layers=[],
                learning_insights=["تعلمت من هذا الطلب رغم المشكلة التقنية"],
                confidence_score=60,
                knowledge_gained=2
            )
            
    except Exception as e:
        logging.error(f"خطأ في surooh_advanced_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في المخ المتطور: {str(e)}")

# Original chat for compatibility
@api_router.post("/surooh/chat", response_model=SuroohChatResponse)
async def surooh_chat(chat_request: SuroohChatRequest):
    """
    Original chat endpoint for backward compatibility
    """
    try:
        # Convert to advanced chat request
        advanced_request = AdvancedSuroohChatRequest(
            message=chat_request.message,
            user_id=chat_request.user_id,
            session_id=chat_request.session_id,
            chat_mode="smart",
            attached_files=[],
            context=[]
        )
        
        # Process with advanced system
        advanced_response = await surooh_advanced_chat(advanced_request)
        
        # Convert back to simple response
        return SuroohChatResponse(
            response=advanced_response.response,
            flow_trace=["secretary", "advanced_brain", "synthesis"],
            request_id=chat_request.session_id,
            timestamp=advanced_response.timestamp
        )
        
    except Exception as e:
        logging.error(f"خطأ في surooh_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في النظام: {str(e)}")

@api_router.get("/surooh/brain/status")
async def get_brain_status():
    """Get advanced brain system status"""
    try:
        # Check Advanced AI Router
        ai_router_status = False
        brain_layers_status = {}
        
        try:
            response = requests.get(f"{AI_ROUTER_URL}/brain/status", timeout=5)
            if response.status_code == 200:
                ai_router_status = True
                brain_data = response.json()
                brain_layers_status = brain_data.get("brain_layers", {})
        except:
            pass
            
        # Check Database
        db_status = False
        try:
            await db.command("ping")
            db_status = True
        except:
            pass
            
        return {
            "system": "المخ المتطور متعدد الطبقات",
            "status": "active" if ai_router_status and db_status else "partial",
            "brain_layers": {
                "perception": brain_layers_status.get("perception", ai_router_status),
                "analysis": brain_layers_status.get("analysis", ai_router_status), 
                "reasoning": brain_layers_status.get("reasoning", ai_router_status),
                "creativity": brain_layers_status.get("creativity", ai_router_status),
                "learning": brain_layers_status.get("learning", ai_router_status),
                "memory": brain_layers_status.get("memory", ai_router_status),
                "synthesis": brain_layers_status.get("synthesis", ai_router_status)
            },
            "components": {
                "advanced_ai_router": ai_router_status,
                "database": db_status,
                "learning_system": ai_router_status,
                "memory_system": ai_router_status
            },
            "ai_router_url": AI_ROUTER_URL,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@api_router.get("/surooh/learning/insights")
async def get_learning_insights(limit: int = 20):
    """Get recent learning insights from the brain"""
    try:
        response = requests.get(f"{AI_ROUTER_URL}/learning/insights?limit={limit}", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"insights": [], "error": "Advanced AI Router not available"}
    except Exception as e:
        return {"insights": [], "error": str(e)}

@api_router.get("/surooh/knowledge/base")
async def get_knowledge_base():
    """Get current knowledge base status"""
    try:
        response = requests.get(f"{AI_ROUTER_URL}/knowledge/base", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"knowledge_units": 0, "topics": [], "error": "Advanced AI Router not available"}
    except Exception as e:
        return {"knowledge_units": 0, "topics": [], "error": str(e)}

# Original system status (enhanced)
@api_router.get("/surooh/status")
async def surooh_system_status():
    """Check Surooh AI System status (enhanced)"""
    try:
        # Check Advanced AI Router
        ai_router_status = False
        brain_status = {}
        
        try:
            response = requests.get(f"{AI_ROUTER_URL}/status", timeout=5)
            ai_router_status = response.status_code == 200
            if ai_router_status:
                brain_status = response.json()
        except:
            pass
            
        # Check Database
        db_status = False
        try:
            await db.command("ping")
            db_status = True
        except:
            pass
            
        return {
            "system": "منظومة سُروح المتطورة",
            "status": "active" if ai_router_status and db_status else "partial",
            "components": {
                "secretary": True,  # Always available as fallback
                "brain": ai_router_status,
                "advanced_brain": ai_router_status,
                "smart_core": ai_router_status,
                "bots": ai_router_status,
                "database": db_status,
                "ai_router": ai_router_status,
                "learning_system": ai_router_status,
                "memory_system": ai_router_status
            },
            "brain_layers": brain_status.get("brain_layers", {}),
            "ai_router_url": AI_ROUTER_URL,
            "version": "2.0.0 - Advanced Brain Edition",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@api_router.get("/surooh/chat/history/{user_id}")
async def get_advanced_chat_history(user_id: str, limit: int = 50, chat_type: str = "all"):
    """Get advanced chat history for a user"""
    try:
        query = {"user_id": user_id}
        if chat_type != "all":
            query["type"] = chat_type
            
        chats = await db.advanced_chat_logs.find(query).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "user_id": user_id,
            "chats": chats,
            "count": len(chats),
            "chat_type": chat_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Original routes (unchanged)
@api_router.get("/")
async def root():
    return {
        "message": "مرحباً بك في منظومة سُروح المتطورة!", 
        "system": "Advanced Surooh AI System",
        "version": "2.0.0",
        "description": "النسخة الرقمية المتطورة من أبو شام مع المخ متعدد الطبقات",
        "new_features": [
            "مخ ذكي متعدد الطبقات (7 طبقات)",
            "نظام تعلم ذاتي",
            "ذاكرة طويلة المدى",
            "تحليل متقدم للمحادثات",
            "واجهة شات متطورة"
        ]
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()