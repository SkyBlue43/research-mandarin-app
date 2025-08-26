import shutil
import tempfile
from fastapi.responses import FileResponse
import numpy as np
import parselmouth
from parselmouth.praat import call
from scipy.signal import savgol_filter
from fastapi import APIRouter, File, UploadFile
import os

router = APIRouter()

def _hz_to_st(f0_hz):
    f0_hz = np.asarray(f0_hz, dtype=float)
    with np.errstate(divide='ignore', invalid='ignore'):
        st = 12.0 * np.log2(f0_hz)
    st[~np.isfinite(st)] = np.nan
    return st

def _st_to_hz(st):
    st = np.asarray(st, dtype=float)
    with np.errstate(over='ignore', invalid='ignore'):
        hz = 2.0 ** (st / 12.0)
    hz[~np.isfinite(hz)] = np.nan
    return hz

def _extract_pitch(sound, time_step=0.01, fmin=75, fmax=600):
    pitch = sound.to_pitch(time_step=time_step, pitch_floor=fmin, pitch_ceiling=fmax)
    times = pitch.xs()
    f0 = pitch.selected_array['frequency'].astype(float)
    f0[f0 <= 0] = np.nan
    return times, f0

def _interp_nan(x, y):
    """Linear interpolate NaNs inside the valid range; keep leading/trailing NaNs."""
    y = y.copy()
    n = len(y)
    idx = np.arange(n)
    good = np.isfinite(y)
    if good.sum() < 2:
        return y
    y[~good] = np.interp(idx[~good], idx[good], y[good])
    return y

def correct_pitch_to_reference(
    user_wav: str,
    reference_wav: str,
    output_wav: str,
    time_step: float = 0.01,
    fmin: float = 75.0,
    fmax: float = 600.0,
    smooth_window_ms: int = 35,
    blend: float = 1.0,
):
    """
    Make the user's voice follow the reference pitch *shape* while keeping their voice timbre.
    - blend ∈ [0,1]: 1.0 = full correction, 0.5 = half-way, 0.0 = no change.
    """

    # 1) Load audio
    snd_user = parselmouth.Sound(user_wav)
    snd_ref  = parselmouth.Sound(reference_wav)

    # 2) Extract F0 tracks
    t_u, f0_u = _extract_pitch(snd_user, time_step=time_step, fmin=fmin, fmax=fmax)
    t_r, f0_r = _extract_pitch(snd_ref,  time_step=time_step, fmin=fmin, fmax=fmax)

    if np.all(np.isnan(f0_u)):
        # No voiced frames: just copy input
        snd_user.save(output_wav, "WAV")
        return

    # 3) Build reference *shape* in semitones relative to its own median
    st_r = _hz_to_st(f0_r)
    st_r_med = np.nanmedian(st_r) if np.isfinite(st_r).any() else np.nan
    st_r_rel = st_r - st_r_med  # shape around median

    # Interp the reference *shape* onto the user's timeline
    # Normalize time to [0,1] for robust mapping
    def _norm(t):
        return (t - t[0]) / max(1e-9, (t[-1] - t[0]))
    u_norm = _norm(t_u)
    r_norm = _norm(t_r)

    st_r_rel = _interp_nan(np.arange(len(st_r_rel)), st_r_rel)  # fill interior NaNs
    st_r_rel_on_user = np.interp(u_norm, r_norm, st_r_rel, left=np.nan, right=np.nan)

    # 4) Anchor the shape to the user's register
    f0_u_med = np.nanmedian(f0_u)
    st_u_med = _hz_to_st(f0_u_med)
    st_target = st_u_med + st_r_rel_on_user  # user median + reference shape
    f0_target = _st_to_hz(st_target)

    # 5) Optional smoothing (Savitzky–Golay) on the target contour
    if smooth_window_ms and len(f0_target) > 5:
        # Convert ms to samples (ensure odd window)
        win = int(max(5, round((smooth_window_ms / 1000.0) / time_step)))
        if win % 2 == 0:
            win += 1
        try:
            valid = np.isfinite(f0_target)
            # Only smooth valid segments to avoid NaN propagation
            f0_sm = f0_target.copy()
            if valid.sum() >= win:
                f0_sm[valid] = savgol_filter(f0_target[valid], window_length=win, polyorder=2, mode="interp")
            f0_target = f0_sm
        except Exception:
            pass

    # 6) Blend in semitone domain for perceptual linearity
    st_u = _hz_to_st(f0_u)
    st_t = _hz_to_st(f0_target)
    st_blended = (1.0 - blend) * st_u + blend * st_t
    f0_new = _st_to_hz(st_blended)
    # Clamp to reasonable range
    f0_new = np.clip(f0_new, fmin, fmax)
    f0_new[~np.isfinite(f0_new)] = np.nan

    # 7) Create a PitchTier on user's timeline with f0_new points (skip unvoiced)
    manipulation = call(snd_user, "To Manipulation", time_step, fmin, fmax)
    pt = call("Create PitchTier", "target", float(t_u[0]), float(t_u[-1]))
    for tt, ff in zip(t_u, f0_new):
        if np.isfinite(ff):
            call(pt, "Add point", float(tt), float(ff))

    # Replace tier and resynthesize
    call([manipulation, pt], "Replace pitch tier")
    out = call(manipulation, "Get resynthesis (overlap-add)")
    out.save(output_wav, "WAV")


@router.post("/shift_audio/")
async def shift_audio(reference: UploadFile = File(...), user: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as ref_tmp, \
         tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as user_tmp:

        ref_path = ref_tmp.name
        user_path = user_tmp.name

        shutil.copyfileobj(reference.file, ref_tmp)
        shutil.copyfileobj(user.file, user_tmp)

    corrected_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

    correct_pitch_to_reference(user_path, ref_path, corrected_path, blend=1.0)

    # (Optional) Run softer correction to another temp file
    corrected_soft_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    correct_pitch_to_reference(user_path, ref_path, corrected_soft_path, blend=0.7)

    os.remove(ref_path)
    os.remove(user_path)

    # Return one of the processed audios
    # You could also return both in a zip if you want
    return FileResponse(corrected_path, media_type="audio/wav", filename="user_corrected.wav")