import numpy as np
from scipy.interpolate import interp1d

def stretch_user_pitch(user_times, user_pitch, target_times):
    user_times_norm = (user_times - user_times[0]) / (user_times[-1] - user_times[0])
    interpolator = interp1d(user_times_norm, user_pitch, kind='linear', fill_value="extrapolate")
    target_times_norm = (target_times - target_times[0]) / (target_times[-1] - target_times[0])
    stretched_user_pitch = interpolator(target_times_norm)
    return stretched_user_pitch

def calculate_accuracy(aligned: list[dict]) -> float:
    pitch_differences = []
    for pitch in aligned:
        user = pitch.get("user")
        reference = pitch.get("reference")
        if user is not None and reference is not None:
            pitch_differences.append(abs(reference - user))
    if not pitch_differences:
        return 0.0
    average = sum(pitch_differences) / len(pitch_differences)
    return round(max(0.0, 100.0 - average * 100.0), 2)
