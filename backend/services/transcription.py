import os
import subprocess
import wave
import json
from vosk import Model, KaldiRecognizer, SetLogLevel

SetLogLevel(-1)

MODEL_PATH = "backend/vosk-model-cn-0.22"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("Vosk model not found!")

model = Model(MODEL_PATH)

def convert_to_wav(input_path: str, output_path: str):
    cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def transcribe_with_vosk(audio_path: str, phrase_list: list):
    wf = wave.open(audio_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        raise ValueError("Audio must be WAV PCM 16kHz Mono")

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
