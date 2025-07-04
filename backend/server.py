from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
import uuid
from bson import ObjectId
import json
import sys
import os

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_services import story_generator, interest_analyzer, progress_analyzer

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Draw-a-Tale API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "draw_a_tale")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
drawings_collection = db.drawings
progress_collection = db.progress
stories_collection = db.stories
quests_collection = db.quests

# Pydantic models
class UserBase(BaseModel):
    email: str
    username: str
    user_type: str = "child"  # child or parent
    age: Optional[int] = None
    parent_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DrawingBase(BaseModel):
    title: str
    description: Optional[str] = None
    canvas_data: dict
    time_lapse: Optional[List[dict]] = None
    quest_id: Optional[str] = None

class DrawingCreate(DrawingBase):
    pass

class DrawingResponse(DrawingBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class StoryBase(BaseModel):
    title: str
    content: str
    pages: List[dict]
    user_prompt: str

class StoryCreate(StoryBase):
    pass

class StoryResponse(StoryBase):
    id: str
    user_id: str
    created_at: datetime

class ProgressBase(BaseModel):
    quest_id: str
    status: str = "in_progress"  # in_progress, completed
    completion_percentage: float = 0.0
    badges_earned: List[str] = []

class ProgressCreate(ProgressBase):
    pass

class ProgressResponse(ProgressBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

# Custom JSON encoder for MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Helper to convert MongoDB documents
def convert_mongo_document(doc):
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# API Routes

@app.get("/")
async def root():
    return {"message": "Draw-a-Tale API is running!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication routes
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_doc = {
        "email": user.email,
        "username": user.username,
        "user_type": user.user_type,
        "age": user.age,
        "parent_id": user.parent_id,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    # Insert user
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return UserResponse(**convert_mongo_document(user_doc))

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(**convert_mongo_document(current_user))

# Drawing routes
@app.post("/api/drawings", response_model=DrawingResponse)
async def create_drawing(drawing: DrawingCreate, current_user: dict = Depends(get_current_user)):
    drawing_doc = {
        "title": drawing.title,
        "description": drawing.description,
        "canvas_data": drawing.canvas_data,
        "time_lapse": drawing.time_lapse or [],
        "quest_id": drawing.quest_id,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await drawings_collection.insert_one(drawing_doc)
    drawing_doc["_id"] = result.inserted_id
    
    return DrawingResponse(**convert_mongo_document(drawing_doc))

@app.get("/api/drawings", response_model=List[DrawingResponse])
async def get_user_drawings(current_user: dict = Depends(get_current_user)):
    drawings = await drawings_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
    return [DrawingResponse(**convert_mongo_document(drawing)) for drawing in drawings]

@app.get("/api/drawings/{drawing_id}", response_model=DrawingResponse)
async def get_drawing(drawing_id: str, current_user: dict = Depends(get_current_user)):
    drawing = await drawings_collection.find_one({"_id": ObjectId(drawing_id), "user_id": str(current_user["_id"])})
    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")
    return DrawingResponse(**convert_mongo_document(drawing))

@app.delete("/api/drawings/{drawing_id}")
async def delete_drawing(drawing_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if drawing exists and belongs to current user
        drawing = await drawings_collection.find_one({"_id": ObjectId(drawing_id), "user_id": str(current_user["_id"])})
        if not drawing:
            raise HTTPException(status_code=404, detail="Drawing not found")
        
        # Delete the drawing
        result = await drawings_collection.delete_one({"_id": ObjectId(drawing_id), "user_id": str(current_user["_id"])})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Drawing not found or could not be deleted")
        
        return {"message": "Drawing deleted successfully", "drawing_id": drawing_id}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        if "ObjectId" in str(e):
            raise HTTPException(status_code=404, detail="Invalid drawing ID format")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Story routes
@app.post("/api/stories/generate", response_model=StoryResponse)
async def generate_ai_story(
    story_request: dict, 
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered story based on user prompt"""
    try:
        prompt = story_request.get("prompt", "")
        if not prompt:
            raise HTTPException(status_code=400, detail="Story prompt is required")
        
        user_age = current_user.get("age", 7)
        
        # Analyze user's interests based on existing drawings
        user_drawings = await drawings_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
        interests = interest_analyzer.analyze_drawing_patterns(user_drawings)
        top_interests = [k for k, v in sorted(interests.items(), key=lambda x: x[1], reverse=True)[:3]]
        
        # Generate AI story
        story_data = await story_generator.generate_story(prompt, user_age, top_interests)
        
        # Save to database
        story_doc = {
            "title": story_data["title"],
            "content": json.dumps(story_data["pages"]),
            "pages": story_data["pages"],
            "user_prompt": prompt,
            "themes": story_data.get("themes", []),
            "art_focus": story_data.get("art_focus", ""),
            "generated_with": story_data.get("generated_with", "ai"),
            "user_id": str(current_user["_id"]),
            "created_at": datetime.utcnow()
        }
        
        result = await stories_collection.insert_one(story_doc)
        story_doc["_id"] = result.inserted_id
        
        return StoryResponse(**convert_mongo_document(story_doc))
        
    except Exception as e:
        print(f"Story generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

@app.post("/api/stories", response_model=StoryResponse)
async def create_story(story: StoryCreate, current_user: dict = Depends(get_current_user)):
    story_doc = {
        "title": story.title,
        "content": story.content,
        "pages": story.pages,
        "user_prompt": story.user_prompt,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow()
    }
    
    result = await stories_collection.insert_one(story_doc)
    story_doc["_id"] = result.inserted_id
    
    return StoryResponse(**convert_mongo_document(story_doc))

@app.get("/api/stories", response_model=List[StoryResponse])
async def get_user_stories(current_user: dict = Depends(get_current_user)):
    stories = await stories_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
    return [StoryResponse(**convert_mongo_document(story)) for story in stories]

# Progress routes
@app.post("/api/progress", response_model=ProgressResponse)
async def create_progress(progress: ProgressCreate, current_user: dict = Depends(get_current_user)):
    progress_doc = {
        "quest_id": progress.quest_id,
        "status": progress.status,
        "completion_percentage": progress.completion_percentage,
        "badges_earned": progress.badges_earned,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await progress_collection.insert_one(progress_doc)
    progress_doc["_id"] = result.inserted_id
    
    return ProgressResponse(**convert_mongo_document(progress_doc))

@app.get("/api/progress", response_model=List[ProgressResponse])
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    progress = await progress_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
    return [ProgressResponse(**convert_mongo_document(p)) for p in progress]

# Quest routes (placeholder for now)
@app.get("/api/quests")
async def get_quests():
    return {
        "quests": [
            {
                "id": "quest_1",
                "title": "The Quest for Lines",
                "description": "Learn to draw straight and curved lines",
                "difficulty": "beginner",
                "type": "line_drawing"
            },
            {
                "id": "quest_2", 
                "title": "Shape Explorer",
                "description": "Master basic shapes: circles, squares, triangles",
                "difficulty": "beginner",
                "type": "shape_drawing"
            },
            {
                "id": "quest_3",
                "title": "Color Master",
                "description": "Learn color mixing and application",
                "difficulty": "intermediate",
                "type": "color_theory"
            }
        ]
    }

# AI-powered analysis and recommendations
@app.get("/api/ai/interests")
async def get_user_interests(current_user: dict = Depends(get_current_user)):
    """Get AI-analyzed user interests based on drawing patterns"""
    try:
        # Get user's drawings
        user_drawings = await drawings_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
        
        # Analyze interests
        interests = interest_analyzer.analyze_drawing_patterns(user_drawings)
        
        return {
            "interests": interests,
            "top_interests": [k for k, v in sorted(interests.items(), key=lambda x: x[1], reverse=True)[:5]],
            "total_drawings_analyzed": len(user_drawings)
        }
    except Exception as e:
        print(f"Interest analysis error: {e}")
        return {"interests": {}, "top_interests": [], "total_drawings_analyzed": 0}

@app.get("/api/ai/recommendations")
async def get_personalized_recommendations(current_user: dict = Depends(get_current_user)):
    """Get personalized quest and story recommendations"""
    try:
        # Get user's drawings and current progress
        user_drawings = await drawings_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
        user_progress = await progress_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
        
        # Analyze interests
        interests = interest_analyzer.analyze_drawing_patterns(user_drawings)
        
        # Get current quest IDs
        current_quests = [p["quest_id"] for p in user_progress]
        
        # Generate recommendations
        recommendations = interest_analyzer.get_personalized_recommendations(interests, current_quests)
        
        return {
            "recommendations": recommendations,
            "based_on_interests": [k for k, v in sorted(interests.items(), key=lambda x: x[1], reverse=True)[:3]],
            "total_recommendations": len(recommendations)
        }
    except Exception as e:
        print(f"Recommendation error: {e}")
        return {"recommendations": [], "based_on_interests": [], "total_recommendations": 0}

@app.post("/api/ai/analyze-drawing")
async def analyze_drawing_progress(
    analysis_request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Analyze drawing progress and provide intelligent feedback"""
    try:
        drawing_id = analysis_request.get("drawing_id")
        if not drawing_id:
            raise HTTPException(status_code=400, detail="Drawing ID is required")
        
        # Get drawing data
        drawing = await drawings_collection.find_one({
            "_id": ObjectId(drawing_id),
            "user_id": str(current_user["_id"])
        })
        
        if not drawing:
            raise HTTPException(status_code=404, detail="Drawing not found")
        
        # Analyze drawing progress
        time_lapse = drawing.get("time_lapse", [])
        created_at = drawing.get("created_at")
        updated_at = drawing.get("updated_at")
        
        drawing_duration = 0
        if created_at and updated_at:
            drawing_duration = (updated_at - created_at).total_seconds()
        
        analysis = progress_analyzer.analyze_drawing_progress(time_lapse, drawing_duration)
        
        return {
            "drawing_id": drawing_id,
            "analysis": analysis,
            "drawing_title": drawing.get("title", "Untitled"),
            "analysis_timestamp": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Drawing analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/ai/drawing-hints")
async def get_drawing_hints(
    quest_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered drawing hints and tips"""
    try:
        # Get user's skill level based on completed quests
        user_progress = await progress_collection.find({"user_id": str(current_user["_id"])}).to_list(100)
        completed_quests = [p for p in user_progress if p.get("status") == "completed"]
        
        skill_level = "beginner"
        if len(completed_quests) >= 3:
            skill_level = "intermediate"
        elif len(completed_quests) >= 6:
            skill_level = "advanced"
        
        # Generate contextual hints
        hints = []
        
        if quest_id:
            # Quest-specific hints
            quest_hints = {
                "quest_1": [
                    "🖊️ Start with light strokes and gradually make them bolder",
                    "📏 Practice drawing lines from left to right for better control",
                    "🎯 Focus on connecting your lines smoothly"
                ],
                "quest_2": [
                    "⭕ Start shapes with simple gestures, then refine them",
                    "📐 Use the grid in your mind to keep shapes proportional",
                    "🔄 Practice the same shape multiple times to build muscle memory"
                ],
                "quest_3": [
                    "🌈 Try mixing primary colors to discover new ones",
                    "🎨 Use lighter colors first, then add darker ones on top",
                    "✨ Experiment with the rainbow brush for magical effects!"
                ]
            }
            hints = quest_hints.get(quest_id, [])
        
        # General hints based on skill level
        general_hints = {
            "beginner": [
                "🎨 Don't worry about making mistakes - they're part of learning!",
                "⏰ Take your time and enjoy the creative process",
                "🌟 Every artist started with simple lines and shapes"
            ],
            "intermediate": [
                "🎭 Try adding emotions to your characters through their expressions",
                "🌈 Experiment with color combinations to set different moods",
                "🔍 Add small details to make your drawings more interesting"
            ],
            "advanced": [
                "🎪 Challenge yourself with complex compositions",
                "💡 Use light and shadow to give your drawings depth",
                "🎨 Develop your own unique artistic style"
            ]
        }
        
        if not hints:
            hints = general_hints.get(skill_level, general_hints["beginner"])
        
        return {
            "hints": hints,
            "skill_level": skill_level,
            "quest_id": quest_id,
            "personalized": True
        }
        
    except Exception as e:
        print(f"Hints generation error: {e}")
        return {
            "hints": ["🎨 Keep practicing and have fun creating!"],
            "skill_level": "beginner",
            "quest_id": quest_id,
            "personalized": False
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)