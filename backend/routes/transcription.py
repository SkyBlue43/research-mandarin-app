from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
import json
import tempfile
import os
import numpy as np

from services.transcription import convert_to_wav, transcribe_with_vosk
from services.pitch_alignment import align_characters, align_pitch, stretch_user_pitch
from services.file_utils import read_lines

router = APIRouter()

@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...), current_phrase: str = Form(...)):
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

@router.post("/dtw_characters/")
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

        stretched_user = stretch_user_pitch(
            np.array(user_time),
            np.array(user_phrase),
            np.array(ref_time)
        )
        for i in range(len(reference_phrase)):
            alignment.append({
                "time": ref_time[i],
                "reference": reference_phrase[i],
                "user": float(stretched_user[i])
            })

    return {"alignment": alignment}


        # user_phrase = user_phrase[::3]
        # reference_phrase = reference_phrase[::3]
        # ref_time = ref_time[::3]
        # user_series = [(f,) for f in user_phrase]
        # reference_series = [(f,) for f in reference_phrase]
        # dist, path = fastdtw(reference_series, user_series, dist=euclidean)
        # # if dist < 50:
        # print(path)
        # print(dist)
        # for x, y in path:
        #     if x < len(reference_phrase) and y < len(user_phrase) and x < len(ref_time):
        #         alignment.append({
        #             "time": ref_time[x],
        #             "reference": reference_phrase[x],
        #             "user": user_phrase[y]
        #         })