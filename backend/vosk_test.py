import sys
import subprocess
import os
import wave
import json
from vosk import Model, KaldiRecognizer, SetLogLevel

# Optional: Set Vosk log level (0 = info, -1 = silent)
SetLogLevel(0)

def convert_mp3_to_wav(mp3_path, wav_path):
    # Convert MP3 to WAV with volume boost, 16kHz mono PCM
    cmd = [
        "ffmpeg", "-y", "-i", mp3_path,
        "-af", "volume=2.0",
        "-ar", "16000",
        "-ac", "1",
        wav_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    print("ffmpeg stdout:", result.stdout.decode())
    print("ffmpeg stderr:", result.stderr.decode())
    
    if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
        print("Error: WAV file missing or empty after conversion.")
        sys.exit(1)

    # Play converted WAV audio (macOS)
    print(f"▶️ Playing converted WAV audio...")
    play_cmd = ["afplay", wav_path]
    play_result = subprocess.run(play_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if play_result.returncode != 0:
        print("Error: Audio playback failed.")
        print("Playback stderr:", play_result.stderr.decode())

def transcribe_with_vosk(audio_path):
    model_path = "vosk-model-cn-0.22"
    if not os.path.exists(model_path):
        print("Model folder not found! Download a model from https://alphacephei.com/vosk/models")
        sys.exit(1)

    try:
        wf = wave.open(audio_path, "rb")
    except wave.Error as e:
        print(f"Failed to open WAV file: {e}")
        sys.exit(1)

    # Check WAV format
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        print("Audio file must be WAV format Mono PCM 16kHz")
        sys.exit(1)

    rec = KaldiRecognizer(Model(model_path), wf.getframerate())
    rec.SetMaxAlternatives(10)
    rec.SetWords(True)
    rec.SetPartialWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            results.append(res)
        else:
            partial = json.loads(rec.PartialResult())
            # Only print partial if not empty
            if partial.get("partial", "") != "":
                print("Partial:", partial)

    # Add final recognition result
    results.append(json.loads(rec.FinalResult()))

    # Combine all recognized text
    full_text = " ".join([res.get("text", "") for res in results]).strip()
    print("\n✅ Recognized text:")
    print(full_text if full_text else "[No speech recognized]")

    # Print word-level timestamps
    print("\n✅ Word-level timestamps:")
    for res in results:
        for word_info in res.get("result", []):
            word = word_info.get("word", "")
            start = word_info.get("start", 0)
            end = word_info.get("end", 0)
            print(f"{word}: {start:.2f}s - {end:.2f}s")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vosk_transcribe.py <audiofile.mp3>")
        sys.exit(1)

    mp3_file = sys.argv[1]
    wav_file = "converted.wav"

    print("🎵 Converting MP3 to WAV...")
    convert_mp3_to_wav(mp3_file, wav_file)

    print("🔍 Running Vosk transcription...")
    transcribe_with_vosk(wav_file)
