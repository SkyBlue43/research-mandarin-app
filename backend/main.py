from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional


from routes.analyze_audio import router as analyze_audio_router
from routes.transcribe import router as transcribe_router
from routes.shift_audio import router as shift_audio_router

from routes.get_highest_accuracies import router as get_highest_accuracies_router

from routes.save_accuracy import save_pitch_accuracy
from backend.routes.update_test import update_users_test
from routes.check_password import authenticate_user
from routes.get_characters import get_characters_from_curriculum
from routes.dtw import dtw


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Test(BaseModel):
    test_number: str

@app.post("/get-characters")
async def get_characters(data: Test):
    try:
        result = get_characters_from_curriculum(data.test_number)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    

class Auth(BaseModel):
    username: str
    password: str

@app.post("/check-password")
async def check_password(data: Auth):
    try:
        result = authenticate_user(data.username, data.password)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))


class User(BaseModel):
    username: str

@app.post("/update-test")
async def update_test(data: User):
    try:
        update_users_test(data.username)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

class Accuracy(BaseModel):
    name: str
    test: str
    group: str
    phrase: str
    array_number: str
    accuracy: int | None

@app.post("/save-accuracy")
async def save_accuracy(data: Accuracy):
    try: 
        save_pitch_accuracy(data.name, data.test, data.group, data.phrase, data.array_number, data.accuracy)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IndexError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/")
        

class PitchData(BaseModel):
    frequency: List[float | None]
    time: List[float]

class WordData(BaseModel):
    char: str
    start: float
    end: float

class DTWRequest(BaseModel):
    reference_pitch: PitchData
    user_pitch: PitchData
    test: str
    currentIndex: str
    words_user: List[WordData]

@app.post("/dtw-characters")
async def dtw_characters(data: DTWRequest):
    print(data.reference_pitch.frequency[10])
    try:
        result = dtw(data.reference_pitch, data.user_pitch, data.test, data.currentIndex, data.words_user)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))




app.include_router(analyze_audio_router)
app.include_router(transcribe_router)
app.include_router(shift_audio_router)
app.include_router(get_highest_accuracies_router)

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")
