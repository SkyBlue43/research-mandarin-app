from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List


from routes.clone_audio import shift_audio
from routes.transcribe import transcribe_audio
from routes.analyze_audio import analyze_given_audio
from routes.get_highest_accuracies import get_highest_accuracies_for_user
from routes.save_accuracy import save_pitch_accuracy
from routes.update_test import update_users_test
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
def get_characters(data: Test):
    try:
        result = get_characters_from_curriculum(data.test_number)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    

class Auth(BaseModel):
    username: str
    password: str

@app.post("/check-password")
def check_password(data: Auth):
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
def update_test(data: User):
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
    accuracy: int | None
    group: str
    phrase: str
    array_number: str
    
@app.post("/save-accuracy")
def save_accuracy(data: Accuracy):
    try: 
        save_pitch_accuracy(data.name, data.test, data.group, data.phrase, data.array_number, data.accuracy)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IndexError as e:
        raise HTTPException(status_code=400, detail=str(e))


class Highest_Accuracy(BaseModel):
    name: str
    test: str
    group: str

@app.post("/get-highest-accuracies")
def get_highest_accuracies(data: Highest_Accuracy):
    try:
        accuracies = get_highest_accuracies_for_user(data.name, data.test, data.group)
        return accuracies
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except IndexError as e:
        raise HTTPException(status_code=400, detail=str(e))
        

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
def dtw_characters(data: DTWRequest):
    print(data.reference_pitch.frequency[10])
    try:
        result = dtw(data.reference_pitch, data.user_pitch, data.test, data.currentIndex, data.words_user)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/analyze-audio")
def analyze_audio(file: UploadFile = File(...)):
    try:
        pitch_values = analyze_given_audio(file)
        return pitch_values
    except:
        pass


class Phrase(BaseModel):
    phrase: str

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), data: str = Form(...)):
    try:
        data = Phrase(phrase=data)
        return await transcribe_audio(file, data.phrase)
    except:
        pass

@app.post("/clone")
async def clone(reference: UploadFile = File(...), user: UploadFile = File(...)):
    try:
        return await shift_audio(reference, user)
    except:
        pass

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")
