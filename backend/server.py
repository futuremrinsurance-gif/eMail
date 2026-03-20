from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get LLM key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# AI Email Writing Models
class AIWriteRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    tone: str = "professional"
    length: str = "medium"

class AIImproveRequest(BaseModel):
    original_text: str
    instruction: str = "improve"

class AIReplyRequest(BaseModel):
    original_email: str
    reply_type: str = "professional"
    key_points: Optional[List[str]] = None

class AISubjectRequest(BaseModel):
    email_body: str
    style: str = "professional"

class AIResponse(BaseModel):
    success: bool
    content: str
    error: Optional[str] = None

# AI Email Assistant System Prompts
EMAIL_WRITER_SYSTEM = """You are an expert email writing assistant. Write clear, professional, and effective emails.

Guidelines:
- Be concise but thorough
- Use appropriate tone based on context
- Include proper greetings and sign-offs
- Structure emails clearly with paragraphs
- Avoid jargon unless appropriate for the audience

Always provide just the email content, no explanations or meta-commentary."""

EMAIL_IMPROVER_SYSTEM = """You are an expert email editor. Improve emails while maintaining the original intent.

Guidelines:
- Fix grammar and spelling errors
- Improve clarity and flow
- Maintain the original tone unless asked to change it
- Keep the same key information
- Make it more professional and polished

Return only the improved email text, no explanations."""

EMAIL_REPLY_SYSTEM = """You are an expert at crafting email replies. Generate thoughtful, appropriate responses.

Guidelines:
- Address all points from the original email
- Be professional and courteous
- Keep responses focused and relevant
- Use appropriate greeting and sign-off
- Match the tone of the original or adjust as requested

Return only the reply email content, no explanations."""

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Email AI API Ready"}

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

# AI Email Writing Endpoints
@api_router.post("/ai/write", response_model=AIResponse)
async def ai_write_email(request: AIWriteRequest):
    """Generate an email draft from a prompt"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"email-write-{uuid.uuid4()}",
            system_message=EMAIL_WRITER_SYSTEM
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Write an email with the following details:

Topic/Request: {request.prompt}
Tone: {request.tone}
Length: {request.length}
{f'Additional Context: {request.context}' if request.context else ''}

Write the email now:"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return AIResponse(success=True, content=response)
    except Exception as e:
        logger.error(f"AI write error: {str(e)}")
        return AIResponse(success=False, content="", error=str(e))

@api_router.post("/ai/improve", response_model=AIResponse)
async def ai_improve_email(request: AIImproveRequest):
    """Improve an existing email draft"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"email-improve-{uuid.uuid4()}",
            system_message=EMAIL_IMPROVER_SYSTEM
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Please {request.instruction} the following email:

{request.original_text}

Improved version:"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return AIResponse(success=True, content=response)
    except Exception as e:
        logger.error(f"AI improve error: {str(e)}")
        return AIResponse(success=False, content="", error=str(e))

@api_router.post("/ai/reply", response_model=AIResponse)
async def ai_generate_reply(request: AIReplyRequest):
    """Generate a reply to an email"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"email-reply-{uuid.uuid4()}",
            system_message=EMAIL_REPLY_SYSTEM
        ).with_model("openai", "gpt-4o")
        
        key_points_str = ""
        if request.key_points:
            key_points_str = "\nKey points to include:\n" + "\n".join(f"- {p}" for p in request.key_points)
        
        prompt = f"""Generate a {request.reply_type} reply to the following email:

--- Original Email ---
{request.original_email}
--- End Original Email ---
{key_points_str}

Write the reply:"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return AIResponse(success=True, content=response)
    except Exception as e:
        logger.error(f"AI reply error: {str(e)}")
        return AIResponse(success=False, content="", error=str(e))

@api_router.post("/ai/subject", response_model=AIResponse)
async def ai_generate_subject(request: AISubjectRequest):
    """Generate a subject line for an email"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"email-subject-{uuid.uuid4()}",
            system_message="You are an expert at writing email subject lines. Generate concise, clear, and effective subject lines."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Generate a {request.style} subject line for this email:

{request.email_body}

Provide only the subject line, nothing else:"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return AIResponse(success=True, content=response.strip())
    except Exception as e:
        logger.error(f"AI subject error: {str(e)}")
        return AIResponse(success=False, content="", error=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
