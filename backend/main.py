import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, File, Form, HTTPException, UploadFile


from models import DTWRequest, Phrase, Test
from routes.transcribe import transcribe_audio
from routes.analyze_audio import analyze_given_audio, analyze_reference_audio
from routes.get_characters import get_available_lessons, get_characters_from_curriculum
from routes.dtw import dtw

port = int(os.environ.get("PORT", 8000))

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # which domains can access your backend
    allow_credentials=True,      # allow cookies/credentials
    allow_methods=["*"],         # GET, POST, PUT, DELETE…
    allow_headers=["*"],         # headers like Content-Type
)

@app.get("/")
def root():
    return {"message": "Welcome to the Mandarin Tone Practice API!"}


@app.get("/lessons")
def lessons():
    try:
        return get_available_lessons()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-characters")
def get_characters(data: Test):
    try:
        content_id = data.lesson_id
        if not content_id:
            raise ValueError("Lesson ID is required.")
        result = get_characters_from_curriculum(content_id)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/dtw-characters")
def dtw_characters(data: DTWRequest):
    try:
        content_id = data.lesson_id
        if not content_id:
            raise ValueError("Lesson ID is required.")
        result = dtw(data.reference_pitch, data.user_pitch, content_id, data.currentIndex, data.words_user)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-audio")
def analyze_audio(file: UploadFile = File(...)):
    try:
        pitch_values = analyze_given_audio(file)
        return pitch_values
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reference-pitch/{lesson_id}/{curriculum_id}")
def reference_pitch(lesson_id: str, curriculum_id: str):
    try:
        return analyze_reference_audio(lesson_id, curriculum_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), data: str = Form(...)):
    try:
        data = Phrase(phrase=data)
        return await transcribe_audio(file, data.phrase)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")
