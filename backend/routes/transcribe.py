import subprocess
import wave
from vosk import Model, KaldiRecognizer, SetLogLevel
from fastapi.responses import JSONResponse
import tempfile
import os
import json
import zipfile
import requests

SetLogLevel(-1)

MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-cn-0.22.zip"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "vosk-model-cn-0.22")

# Global variable for lazy loading
model = None

# --------------------------------------------------------
# Ensure the Vosk model exists locally or download it
# --------------------------------------------------------
def ensure_model():
    if os.path.exists(MODEL_PATH):
        print("✔ Vosk model found locally.")
        return

    print("⬇ Vosk model not found. Downloading...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    zip_path = os.path.join(MODEL_DIR, "model.zip")

    # Download the model
    with requests.get(MODEL_URL, stream=True) as r:
        r.raise_for_status()
        with open(zip_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    # Extract
    print("📦 Extracting Vosk model...")
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(MODEL_DIR)

    os.remove(zip_path)
    print("✔ Vosk model installed.")

# --------------------------------------------------------
# Lazy load the model on first use
# --------------------------------------------------------
def get_model():
    global model
    if model is None:
        ensure_model()
        model = Model(MODEL_PATH)
        print("✔ Vosk model loaded.")
    return model

# --------------------------------------------------------
# Audio conversion helper
# --------------------------------------------------------
def convert_to_wav(input_path, output_path):
    cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# --------------------------------------------------------
# Char-level transcription with Vosk
# --------------------------------------------------------
def transcribe_with_vosk(audio_path, phrase_list):
    wf = wave.open(audio_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        raise ValueError("Audio must be WAV PCM 16kHz Mono")

    # Lazy-load the model here
    rec = KaldiRecognizer(get_model(), wf.getframerate(), json.dumps(phrase_list))
    rec.SetWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(json.loads(rec.Result()))

    results.append(json.loads(rec.FinalResult()))

    # Convert to char-level timestamped segments
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
                char_segments.append({
                    "char": char,
                    "start": char_start,
                    "end": char_end
                })

    return char_segments

# --------------------------------------------------------
# Public transcribe function
# --------------------------------------------------------
async def transcribe_audio(file, current_phrase):
    # Save MP3
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_mp3:
        mp3_path = temp_mp3.name
        await file.seek(0)
        temp_mp3.write(await file.read())

    wav_path = mp3_path.replace(".mp3", ".wav")
    convert_to_wav(mp3_path, wav_path)

    try:
        phrase_list = current_phrase.strip().split()
        result = transcribe_with_vosk(wav_path, phrase_list)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        os.remove(mp3_path)
        os.remove(wav_path)

    return JSONResponse(content=result)
