from fastapi import APIRouter, Form
import numpy as np
import json
from zhon.hanzi import punctuation
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
from scipy.interpolate import interp1d

from Bio.Align import PairwiseAligner

router = APIRouter()

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

    copy_words_user = []
    for thing in words_user_data:
        copy_words_user.append(thing)

    with open(f'backend/transcripts/results_{test}/{currentIndex}.json') as file:
        characters = json.load(file)['alignment']
    characters_user = words_user_data

    copy_words_ref = []
    for thing in characters:
        copy_words_ref.append(thing)
    
    if len(characters_user) != len(characters):
        return "error"
        align_characters(characters_user, characters)

    char_amount = len(characters)
    reference_alignment = align_pitch(reference_pitch, characters)
    user_alignment = align_pitch(user_pitch, characters_user)

    total_accuracy = 0
    alignment = []
    counter = 0
    user_counter = 0
    for i in range(char_amount):
        word_we_are_on_user = copy_words_user[i]
        word_we_are_on_ref = copy_words_ref[i]
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
            if reference_alignment['character'][j] == None or reference_alignment['character'][j] != current_character or reference_alignment['time'][j] > word_we_are_on_ref['end']:
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
            if user_alignment['character'][j] == None or user_alignment['character'][j] != current_character or user_alignment['time'][j] > word_we_are_on_user['end']:
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