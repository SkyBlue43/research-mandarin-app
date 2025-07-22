from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile, File, Request, Form
from pydub import AudioSegment
import parselmouth
import numpy as np
import shutil, os
from faster_whisper import WhisperModel
import json
from zhon.hanzi import punctuation
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/sounds", StaticFiles(directory="backend/sounds"), name="sounds")

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    

@app.post('/get-characters/')
async def get_characters(request: Request):
    data = await request.json()
    test_number = data.get('test')
    
    try:
        lines = read_lines(f'backend/{test_number}.csv')
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

@app.post('/transcribe/')
async def transcribe(
    file: UploadFile= File(...),
    current_phrase: str = Form(...)
):

    unique_filename = "temp.mp3"
    with open(unique_filename, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # model = whisper.load_model("base")  # You can try "tiny", "base", "small", "medium", "large"
    # result = model.transcribe(unique_filename, language="zh", initial_prompt='你好！你今天怎么样？')

    model = WhisperModel("large", device="cpu", compute_type="int8")  # 'cuda' if on GPU
    segments, info = model.transcribe(unique_filename, language='zh', word_timestamps=True, initial_prompt=current_phrase, vad_filter=False)

    os.remove(unique_filename)

    return segments


@app.post("/dtw_characters/")
async def dtw_new(
    reference_pitch: str = Form(...),
    user_pitch: str = Form(...),
    words_reference: str = Form(...),
    words_user: str = Form(...)
):
    reference_pitch = json.loads(reference_pitch)
    user_pitch = json.loads(user_pitch)
    words_reference_data = json.loads(words_reference)
    words_user_data = json.loads(words_user)


    characters = get_character_array(words_reference_data)
    characters_user = get_character_array(words_user_data)
    
    if len(characters_user) != len(characters):
        return "Error"

    char_amount = len(characters)
    reference_alignment = align_pitch(reference_pitch, characters)
    user_alignment = align_pitch(user_pitch, characters_user)

    alignment = []
    counter = 0
    user_counter = 0
    for i in range(char_amount):
        user_phrase = []
        reference_phrase = []
        ref_time = []
        count = 0
        for j in range(counter, len(reference_alignment['character'])):
            
            if reference_alignment['character'][j] != None:
                counter += count
                break
            else:
                count += 1
                alignment.append({
                    "time": reference_alignment['time'][j],
                    "reference": None,
                    "user": None
                    })
        count = 0
        for j in range(counter, len(reference_alignment['character'])):
            if reference_alignment['character'][j] == None:
                counter += count
                break
            else:
                count += 1
                reference_phrase.append(reference_alignment['frequency'][j])
                ref_time.append(reference_alignment['time'][j])
        count = 0
        for j in range(user_counter, len(user_alignment['character'])):
            if user_alignment['character'][j] != None:
                user_counter += count
                break
            else:
                count += 1
        count = 0
        for j in range(user_counter, len(user_alignment['character'])):
            if user_alignment['character'][j] == None:
                user_counter += count
                break
            else:
                count += 1
                user_phrase.append(user_alignment['frequency'][j])
        user_series = [(f,) for f in user_phrase]
        reference_series = [(f,) for f in reference_phrase]
        dist, path = fastdtw(reference_series, user_series, dist=euclidean)
        # if dist < 50:
        print(path)
        print(dist)
        for x, y in path:
            if x < len(reference_phrase) and y < len(user_phrase) and x < len(ref_time):
                alignment.append({
                    "time": ref_time[x],
                    "reference": reference_phrase[x],
                    "user": user_phrase[y]
                })

    return {"alignment": alignment}


def align_pitch(reference_pitch, characters):
    alignment = {'frequency': [], 'time': [], 'character': []}
    is_char = False
    for pitch, time in zip(reference_pitch['frequency'], reference_pitch['time']):
        if pitch is None and not is_char:
            alignment['frequency'].append(pitch)
            alignment['time'].append(time)
            alignment['character'].append(None)
        elif pitch is not None:
            if len(characters) == 0:
                break
            if time > characters[0]['end']:
                characters.pop(0)
                is_char = False
                alignment['frequency'].append(None)
                alignment['time'].append(time)
                alignment['character'].append(None)
            elif time < characters[0]['start']:
                alignment['frequency'].append(None)
                alignment['time'].append(time)
                alignment['character'].append(None)
            else:
                alignment['frequency'].append(pitch)
                alignment['time'].append(time)
                alignment['character'].append(characters[0]['char'])
                is_char = True
        elif pitch is None and is_char:
            characters.pop(0)
            is_char = False
            alignment['frequency'].append(pitch)
            alignment['time'].append(time)
            alignment['character'].append(None)
    return alignment

def get_character_array(words_reference_data):
    characters = []
    for i in range(len(words_reference_data)):
        if len(words_reference_data[i]['word']) > 1:
            individual = words_reference_data[i]['word'].strip().strip(punctuation)
            start = words_reference_data[i]['start']
            end = words_reference_data[i]['end']
            time_per = (end - start) / len(individual)
            end = start
            for char in individual:
                end = end + time_per
                characters.append({"char": char, "start": start, "end": end})
                start = end
        else:
            start = words_reference_data[i]['start']
            end = words_reference_data[i]['end']
            characters.append({"char": words_reference_data[i]['word'], "start": start, "end": end})
    return characters