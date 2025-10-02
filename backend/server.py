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
from typing import List, Optional
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
    title="منظومة سُروح - Surooh AI System",
    description="النظام الذكي المتكامل لإدارة الأعمال",
    version="1.0.0"
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

class SuroohChatResponse(BaseModel):
    response: str
    flow_trace: List[str] = []
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Surooh AI Routes
@api_router.post("/surooh/chat", response_model=SuroohChatResponse)
async def surooh_chat(chat_request: SuroohChatRequest):
    """
    Main endpoint for Surooh AI chat
    Routes through: Secretary → Brain → Smart Core → Bot
    """
    try:
        # Save chat to database
        chat_log = {
            "user_id": chat_request.user_id,
            "message": chat_request.message,
            "session_id": chat_request.session_id or str(uuid.uuid4()),
            "timestamp": datetime.utcnow(),
            "status": "processing"
        }
        result = await db.chat_logs.insert_one(chat_log)
        chat_id = str(result.inserted_id)

        # Forward to External AI Router
        try:
            response = requests.post(
                f"{AI_ROUTER_URL}/chat",
                json={
                    "message": chat_request.message,
                    "user_id": chat_request.user_id,
                    "session_id": chat_request.session_id
                },
                timeout=30
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                
                # Update chat log with response
                await db.chat_logs.update_one(
                    {"_id": result.inserted_id},
                    {"$set": {
                        "ai_response": ai_response.get("response"),
                        "flow_trace": ai_response.get("flow_trace", []),
                        "request_id": ai_response.get("requestId"),
                        "status": "completed",
                        "completed_at": datetime.utcnow()
                    }}
                )
                
                return SuroohChatResponse(
                    response=ai_response.get("response", "تم استلام طلبك، سُروح تعمل عليه..."),
                    flow_trace=ai_response.get("flow_trace", ["secretary"]),
                    request_id=ai_response.get("requestId")
                )
            else:
                raise Exception(f"AI Router returned status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            # Fallback response if AI Router is down
            await db.chat_logs.update_one(
                {"_id": result.inserted_id},
                {"$set": {
                    "ai_response": "النظام الخارجي غير متاح حالياً",
                    "status": "failed",
                    "error": str(e),
                    "completed_at": datetime.utcnow()
                }}
            )
            
            return SuroohChatResponse(
                response=f"أهلا {chat_request.user_id}! أنا سُروح، النظام الخارجي مش متاح هلق، بس استلمت طلبك: '{chat_request.message}'. راح أرد عليك بأسرع وقت!",
                flow_trace=["secretary", "fallback"]
            )
            
    except Exception as e:
        logging.error(f"خطأ في surooh_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في النظام: {str(e)}")

@api_router.get("/surooh/status")
async def surooh_system_status():
    """Check Surooh AI System status"""
    try:
        # Check AI Router
        ai_router_status = False
        try:
            response = requests.get(f"{AI_ROUTER_URL}/status", timeout=5)
            ai_router_status = response.status_code == 200
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
            "system": "منظومة سُروح",
            "status": "active" if ai_router_status and db_status else "partial",
            "components": {
                "secretary": True,  # Always available as fallback
                "brain": ai_router_status,
                "smart_core": ai_router_status,
                "bots": ai_router_status,
                "database": db_status,
                "ai_router": ai_router_status
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

@api_router.get("/surooh/chat/history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 50):
    """Get chat history for a user"""
    try:
        chats = await db.chat_logs.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "user_id": user_id,
            "chats": chats,
            "count": len(chats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Original routes
@api_router.get("/")
async def root():
    return {
        "message": "مرحباً بك في منظومة سُروح!", 
        "system": "Surooh AI System",
        "version": "1.0.0",
        "description": "النسخة الرقمية من أبو شام"
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
