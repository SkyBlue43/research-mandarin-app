import os
import sys
import subprocess
import wave
import json
from vosk import Model, KaldiRecognizer, SetLogLevel
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
import uvicorn
import tempfile

SetLogLevel(-1)  # Silence Vosk logs
app = FastAPI()

MODEL_PATH = "vosk-model-cn-0.22"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("❌ Vosk model not found! Download from https://alphacephei.com/vosk/models")

model = Model(MODEL_PATH)

def convert_to_wav(input_path, output_path):
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000", "-ac", "1", output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def transcribe_with_vosk(audio_path):
    wf = wave.open(audio_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        raise ValueError("Audio must be WAV PCM 16kHz Mono")

    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(json.loads(rec.Result()))
    results.append(json.loads(rec.FinalResult()))

    # Extract characters with timestamps
    char_segments = []
    for res in results:
        for word_info in res.get("result", []):
            word = word_info["word"]  # Chinese word (could be multiple chars)
            start = word_info["start"]
            end = word_info["end"]

            # Split into individual characters evenly across duration
            if len(word) > 0:
                char_duration = (end - start) / len(word)
                for i, char in enumerate(word):
                    char_start = round(start + i * char_duration, 2)
                    char_end = round(char_start + char_duration, 2)
                    char_segments.append({
                        "char": char,
                        "start": char_start,
                        "end": char_end
                    })

    return char_segments

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_mp3:
        mp3_path = temp_mp3.name
        await file.seek(0)
        temp_mp3.write(await file.read())

    wav_path = mp3_path.replace(".mp3", ".wav")
    convert_to_wav(mp3_path, wav_path)

    try:
        result = transcribe_with_vosk(wav_path)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        os.remove(mp3_path)
        os.remove(wav_path)

    return JSONResponse(content=result)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

