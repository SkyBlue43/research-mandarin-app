import shutil
import os
from pydub import AudioSegment
import parselmouth
import numpy as np

def clean_audio(input_path: str, output_path: str):
    audio = AudioSegment.from_file(input_path)
    audio = audio.high_pass_filter(80)
    audio = audio.low_pass_filter(8000)
    audio.export(output_path, format="wav")
    return output_path

def extract_pitch(audio_path: str):
    sound = parselmouth.Sound(audio_path)
    pitch = sound.to_pitch()

    pitch_values = []
    min_freq = float("inf")
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
            min_freq = min(min_freq, log_pitch)
            max_freq = max(max_freq, log_pitch)
        else:
            pitch_values.append({"time": time, "frequency": None})

    norm_pitch_values = []
    for pitch in pitch_values:
        freq = pitch["frequency"]
        if freq is not None:
            freq = (freq - min_freq) / (max_freq - min_freq)
        norm_pitch_values.append({"time": pitch["time"], "frequency": freq})

    return norm_pitch_values
