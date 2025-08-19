from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Form
from pydub import AudioSegment
import parselmouth
import numpy as np
import shutil, os
from faster_whisper import WhisperModel
import json
from zhon.hanzi import punctuation
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import textgrid
from scipy.signal import savgol_filter
import subprocess
import wave
from vosk import Model, KaldiRecognizer, SetLogLevel
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
from scipy.interpolate import interp1d
from typing import List
from pydantic import BaseModel
from Bio.Align import PairwiseAligner
from Bio import Align

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
        if split_line[0] == "Character" or split_line[0] == "Phrase" or split_line[0] == "Sentence":
            continue
        character_list.append({
            'chinese': split_line[0],
            'pinyin': split_line[1],
            'index': split_line[3]
            })
        
    return {'characters': character_list}


@app.post('/check-password/')
async def check_password(request: Request):
    data = await request.json()
    username = data.get('username')
    password = data.get('password')
    
    lines = read_lines('backend/students.csv')
    for line in lines:
        items = line.strip().split(',')
        if username == items[0] and password == items[1]:
            return {'test': items[3], 'group': items[2]}
    raise HTTPException(status_code=401, detail="Invalid username or password")



@app.post("/analyze-audio-voiceless/")
async def analyze_audio(file: UploadFile = File(...)):
    input_path = "temp_input"
    output_path = "temp.wav"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    audio = AudioSegment.from_file(input_path)

    #clean audio
    audio = audio.high_pass_filter(80)
    audio = audio.low_pass_filter(8000)

    audio.export(output_path, format="wav")

    sound = parselmouth.Sound(output_path)
    pitch = sound.to_pitch()

    pitch_values = []
    min_freq = float('inf')
    max_freq = 0
    for i in range(pitch.get_number_of_frames()):
        time = pitch.get_time_from_frame_number(i + 1)
        freq = pitch.get_value_in_frame(i + 1)

        if freq is None or freq < 80 or freq > 400:
            pitch_values.append({"time": time, "frequency": None})
            continue

        if not np.isnan(freq) and freq > 0:
            log_pitch = np.log2(freq)
            pitch_values.append({"time": time, "frequency": log_pitch})
            if log_pitch < min_freq:
                min_freq = log_pitch
            if log_pitch > max_freq:
                max_freq = log_pitch
        else:
            pitch_values.append({"time": time, "frequency": None})

    norm_pitch_values = []
    for pitch in pitch_values:
        freq = pitch['frequency']
        if freq is not None:
            freq = (pitch['frequency'] - min_freq) / (max_freq - min_freq)
        norm_pitch_values.append({"time": pitch['time'], 'frequency': freq})

    os.remove(input_path)
    os.remove(output_path)

    return {"pitch": norm_pitch_values}

SetLogLevel(-1)

MODEL_PATH = "backend/vosk-model-cn-0.22"
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


@app.post("/transcribe/")
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


def align_characters(user, ref):
    user_string = ''
    ref_string = ''
    for item in user:
        user_string += item['char']
    for item in ref:
        ref_string += item['char']
    print(user_string)
    print(ref_string)
    aligner = PairwiseAligner()
    aligner.open_gap_score = -10
    aligner.extend_gap_score = -10
    alignments = aligner.align(user_string, ref_string)
    alignment = alignments[0]

    first = alignment[0]
    second = alignment[1]

    print(first)
    print(second)
    return



@app.post("/dtw_characters/")
async def dtw_new(
    reference_pitch: str = Form(...),
    user_pitch: str = Form(...),
    test: str = Form(...),
    currentIndex: str = Form(...),
    words_user: str = Form(...)
):
    reference_pitch = json.loads(reference_pitch)
    user_pitch = json.loads(user_pitch)
    test = json.loads(test)
    currentIndex = json.loads(currentIndex)
    words_user_data = json.loads(words_user)

    with open(f'backend/transcripts/results_{test}/{currentIndex}.json') as file:
        characters = json.load(file)['alignment']
    characters_user = words_user_data
    
    if len(characters_user) != len(characters):
        align_characters(characters_user, characters)

    char_amount = len(characters)
    reference_alignment = align_pitch(reference_pitch, characters)
    user_alignment = align_pitch(user_pitch, characters_user)

    total_accuracy = 0
    alignment = []
    counter = 0
    user_counter = 0
    for i in range(char_amount):
        user_phrase = []
        reference_phrase = []
        ref_time = []
        user_time = []
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
        current_character = reference_alignment["character"][counter]
        for j in range(counter, len(reference_alignment['character'])):
            if reference_alignment['character'][j] == None or reference_alignment['character'][j] != current_character:
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
        current_character = user_alignment['character'][user_counter]
        for j in range(user_counter, len(user_alignment['character'])):
            if user_alignment['character'][j] == None or user_alignment['character'][j] != current_character:
                user_counter += count
                break
            else:
                count += 1
                user_phrase.append(user_alignment['frequency'][j])
                user_time.append(user_alignment['time'][j])


                # --- Height-based accuracy ---
        user_series = [(f,) for f in user_phrase]
        reference_series = [(f,) for f in reference_phrase]

        dist, path = fastdtw(reference_series, user_series, dist=euclidean)
        max_diff = len(reference_phrase) * (max(reference_phrase) - min(reference_phrase))

        accuracy = 1 - (dist / max_diff)
        accuracy = np.clip(accuracy, 0, 1)
        print("Height-based accuracy:", accuracy)

        # --- Slope-based accuracy ---
        user_slope = np.diff(user_phrase, prepend=user_phrase[0])
        ref_slope  = np.diff(reference_phrase, prepend=reference_phrase[0])

        user_s = [(f,) for f in user_slope]
        ref_s = [(f,) for f in ref_slope]

        dist_slope, _ = fastdtw(user_s, ref_s, dist=euclidean)
        max_slope_diff = len(ref_slope) * (max(ref_slope) - min(ref_slope))

        slope_score = 1 - (dist_slope / max_slope_diff)
        slope_score = np.clip(slope_score, 0, 1)
        print("Slope score:", slope_score)

        # --- Combined score ---
        combined_accuracy = 0.6 * accuracy + 0.4 * slope_score
        print("Total score:", combined_accuracy)
        total_accuracy += combined_accuracy



        stretched_user = stretch_user_pitch(np.array(user_time), np.array(user_phrase), np.array(ref_time))
        for i in range(len(reference_phrase)):
            alignment.append({
                "time": ref_time[i],
                "reference": reference_phrase[i],
                "user": float(stretched_user[i]),
                "accuracy": combined_accuracy
            })

    return {"alignment": alignment, "accuracy": round((total_accuracy / char_amount) * 100, 2)}


def stretch_user_pitch(user_times, user_pitch, target_times):
    # Normalize user times to [0, 1]
    user_times_norm = (user_times - user_times[0]) / (user_times[-1] - user_times[0])

    # Interpolator over normalized time
    interpolator = interp1d(user_times_norm, user_pitch, kind='linear', fill_value="extrapolate")

    # Normalize target times to [0, 1] for mapping
    target_times_norm = (target_times - target_times[0]) / (target_times[-1] - target_times[0])

    # Get stretched user pitch values at target times
    stretched_user_pitch = interpolator(target_times_norm)

    return stretched_user_pitch


def align_pitch(pitch, characters):
    alignment = {'frequency': [], 'time': [], 'character': []}
    if pitch['frequency'][0] is None:
        is_none = True
        char = False
    else:
        is_none = False
        char = True
    blocked_end = False
    blocked_first = False
    for i, (frequency, time) in enumerate(zip(pitch['frequency'], pitch['time'])):
        if i == len(pitch['frequency']) - 1:
            alignment["frequency"].append(None)
            alignment["time"].append(time)
            alignment["character"].append(None)
            break
        
        if is_none or blocked_end or blocked_first:
            alignment["frequency"].append(None)
            alignment["time"].append(time)
            alignment["character"].append(None)
            if pitch['frequency'][i + 1] is not None:
                char = True
                is_none = False
            if pitch['frequency'][i + 1] is None:
                blocked_first = False
                is_none = True 

        elif char:
            alignment["frequency"].append(frequency)
            alignment["time"].append(time)
            alignment["character"].append(characters[0]['char'])
            if pitch['frequency'][i + 1] is None:
                blocked_end = True
                char = False
                is_none = True
            
        if pitch['time'][i + 1] > characters[0]['end'] and len(characters) > 1:
                k = i + 1
                first_word = []
                second_word = []
                first = True
                second = False
                while pitch['time'][k] < characters[1]['end']:
                    k += 1
                    if pitch['frequency'][k] is None:
                        first = False
                        second = True
                    elif first:
                        first_word.append(None)
                    elif second:
                        second_word.append(None)
                if len(first_word) < len(second_word):
                    blocked_first = True
                characters.pop(0)
                blocked_end = False
    characters.pop(0)
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


def calculate_accuracy(aligned: List[dict]) -> float:
    pitch_differences = []

    for pitch in aligned:
        user = pitch.get("user")
        reference = pitch.get("reference")

        if user is not None and reference is not None:
            pitch_differences.append(abs(reference - user))

    if not pitch_differences:
        return 0.0        

    average = sum(pitch_differences) / len(pitch_differences)
    return round(max(0.0, 100.0 - average * 100.0), 2)  # assuming normalized scale


@app.post('/accuracy/')
async def accuracy(request: Request):
    body = await request.json()
    aligned = body.get("aligned", [])

    score = calculate_accuracy(aligned)
    return {"score": score}
