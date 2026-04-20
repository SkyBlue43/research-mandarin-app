import parselmouth
import numpy as np
import shutil, os
import tempfile
from functools import lru_cache
from pathlib import Path
from pydub import AudioSegment

SOUNDS_DIR = Path(__file__).resolve().parent.parent / "sounds"


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


def analyze_audio_file(input_path, remove_input=False):
    output_path = tempfile.NamedTemporaryFile(delete=False, prefix="audio_", suffix=".wav").name

    try:
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

        if min_freq == float('inf'):
            raise ValueError("Unable to detect pitch from audio. Try recording again.")

        norm_pitch_values = []
        for pitch in pitch_values:
            freq = pitch['frequency']
            if freq is not None:
                if max_freq == min_freq:
                    freq = 0.5
                else:
                    freq = (pitch['frequency'] - min_freq) / (max_freq - min_freq)
            norm_pitch_values.append({"time": pitch['time'], 'frequency': freq})

    finally:
        if remove_input and input_path and os.path.exists(input_path):
            os.remove(input_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)

    return {"pitch": norm_pitch_values}


def analyze_given_audio(infile):
    if infile is None or infile.file is None:
        raise ValueError("No audio file provided.")

    input_tmp = tempfile.NamedTemporaryFile(delete=False, prefix="audio_", suffix=".in")
    input_path = input_tmp.name
    input_tmp.close()

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(infile.file, buffer)

        return analyze_audio_file(input_path, remove_input=True)
    finally:
        if input_path and os.path.exists(input_path):
            os.remove(input_path)


@lru_cache(maxsize=512)
def analyze_reference_audio(lesson_id, curriculum_id):
    audio_path = SOUNDS_DIR / lesson_id / f"{curriculum_id}.mp3"
    if not audio_path.exists():
        raise FileNotFoundError("Reference audio not found")

    return analyze_audio_file(str(audio_path))
