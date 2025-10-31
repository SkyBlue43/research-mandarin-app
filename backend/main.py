from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional


from routes.analyze_audio import router as analyze_audio_router
from routes.transcribe import router as transcribe_router
from routes.shift_audio import router as shift_audio_router
from routes.save_accuracy import router as save_accuracy_router
from routes.get_highest_accuracies import router as get_highest_accuracies_router
from routes.updateTest import router as update_test_router

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
    result = get_characters_from_curriculum(data.test_number)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class Auth(BaseModel):
    username: str
    password: str

@app.post("/check-password")
async def check_password(data: Auth):
    result = authenticate_user(data.username, data.password)
    if 'error' in result:
        raise HTTPException(status_code=result['code'], detail=result["error"])
    return result


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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




app.include_router(analyze_audio_router)
app.include_router(transcribe_router)
app.include_router(shift_audio_router)
app.include_router(save_accuracy_router)
app.include_router(get_highest_accuracies_router)
app.include_router(update_test_router)

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")
