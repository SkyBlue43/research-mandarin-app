from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile, File, Request
from pydub import AudioSegment
import parselmouth
import numpy as np
import shutil, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    

@app.post('/get-characters/')
async def get_characters(request: Request):
    data = await request.json()
    test_number = data.get('test')
    
    try:
        lines = read_lines(f'{test_number}.csv')
    except FileNotFoundError:
        return {"error": f"File not found."}
    
    character_list = []
    for line in lines:
        split_line = line.strip().split(',')
        if split_line[0] == "Character" or split_line[0] == "Phrase":
            continue
        character_list.append({
            'chinese': split_line[0],
            'pinyin': split_line[1],
            'index': split_line[3]
            })
        
    return {'characters': character_list}


@app.post('/get-audio')
async def get_audio():
    pass

@app.post("/analyze-audio-voiceless/")
async def analyze_audio(file: UploadFile = File(...)):
    input_path = "temp_input"
    output_path = "temp.wav"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    audio = AudioSegment.from_file(input_path)
    audio.export(output_path, format="wav")

    sound = parselmouth.Sound(output_path)
    pitch = sound.to_pitch()

    pitch_values = []
    min_freq = float('inf')
    max_freq = 0
    for i in range(pitch.get_number_of_frames()):
        time = pitch.get_time_from_frame_number(i + 1)
        freq = pitch.get_value_in_frame(i + 1)
        if not np.isnan(freq) and freq > 0:
            log_pitch = np.log2(freq)
            pitch_values.append({"time": time, "frequency": log_pitch})
            if log_pitch < min_freq:
                min_freq = log_pitch
            if log_pitch > max_freq:
                max_freq = log_pitch
        else:
            pitch_values.append({"time": time, "frequency": None})  # or null in JSON

    norm_pitch_values = []
    for pitch in pitch_values:
        freq = pitch['frequency']
        if freq is not None:
            freq = (pitch['frequency'] - min_freq) / (max_freq - min_freq)
        norm_pitch_values.append({"time": pitch['time'], 'frequency': freq})

    os.remove(input_path)
    os.remove(output_path)

    return {"pitch": norm_pitch_values}