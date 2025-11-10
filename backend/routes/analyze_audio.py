from fastapi import UploadFile, File
import parselmouth
import numpy as np
import shutil, os
from pydub import AudioSegment


def clean_audio(pitch):
    on_pitch = False
    pitch_list = []
    for i in range(len(pitch)):
        if pitch[i]['frequency'] is None and on_pitch is True:
            on_pitch = False
            if len(pitch_list) < 6:
                for num in pitch_list:
                    pitch[num]['frequency'] = None
            else:
                pitch_list = []
        elif pitch[i]['frequency'] is not None:
            on_pitch = True
            pitch_list.append(i)
    return pitch


def analyze_given_audio(infile):
    input_path = "temp_input"
    output_path = "temp.wav"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(infile.file, buffer)

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

    pitch_values = clean_audio(pitch_values)

    norm_pitch_values = []
    for pitch in pitch_values:
        freq = pitch['frequency']
        if freq is not None:
            freq = (pitch['frequency'] - min_freq) / (max_freq - min_freq)
        norm_pitch_values.append({"time": pitch['time'], 'frequency': freq})

    os.remove(input_path)
    os.remove(output_path)

    return {"pitch": norm_pitch_values}