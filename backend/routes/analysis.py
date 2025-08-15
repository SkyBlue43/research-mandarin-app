from fastapi import APIRouter, File, UploadFile, Request
from services.audio_processing import process_audio
from services.pitch_alignment import calculate_accuracy

router = APIRouter()

@router.post("/analyze-audio-voiceless/")
async def analyze_audio(file: UploadFile = File(...)):
    return await process_audio(file)

@router.post('/accuracy/')
async def accuracy(request: Request):
    body = await request.json()
    aligned = body.get("aligned", [])
    score = calculate_accuracy(aligned)
    return {"score": score}
