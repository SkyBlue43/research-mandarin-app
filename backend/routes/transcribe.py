from fastapi import APIRouter, UploadFile, File, Form
import subprocess
import wave
from vosk import Model, KaldiRecognizer, SetLogLevel
from fastapi.responses import JSONResponse
import tempfile
import os
import json

router = APIRouter()

SetLogLevel(-1)

MODEL_PATH = "vosk-model-cn-0.22"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("❌ Vosk model not found! Download from https://alphacephei.com/vosk/models")

model = Model(MODEL_PATH)

def convert_to_wav(input_path, output_path):
    cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def transcribe_with_vosk(audio_path, phrase_list):
    wf = wave.open(audio_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        raise ValueError("Audio must be WAV PCM 16kHz Mono")

    # ✅ Use grammar-based recognition
    rec = KaldiRecognizer(model, wf.getframerate(), json.dumps(phrase_list))
    rec.SetWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(json.loads(rec.Result()))
    results.append(json.loads(rec.FinalResult()))

    # ✅ Convert to char-level timestamps
    char_segments = []
    for res in results:
        for word_info in res.get("result", []):
            word = word_info["word"]
            start = word_info["start"]
            end = word_info["end"]

            char_duration = (end - start) / len(word)
            for i, char in enumerate(word):
                char_start = round(start + i * char_duration, 2)
                char_end = round(char_start + char_duration, 2)
                char_segments.append({"char": char, "start": char_start, "end": char_end})

    return char_segments


@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...), current_phrase: str = Form(...)):
    # Save MP3
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_mp3:
        mp3_path = temp_mp3.name
        await file.seek(0)
        temp_mp3.write(await file.read())

    wav_path = mp3_path.replace(".mp3", ".wav")
    convert_to_wav(mp3_path, wav_path)

    try:
        # ✅ Split phrase into words for Vosk biasing
        phrase_list = current_phrase.strip().split()
        result = transcribe_with_vosk(wav_path, phrase_list)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.remove(mp3_path)
        os.remove(wav_path)

    return JSONResponse(content=result)