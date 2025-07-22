import os
import sys
import subprocess
import tempfile
import json
from textgrid import TextGrid

def convert_mp3_to_wav(mp3_path, wav_path):
    cmd = ["ffmpeg", "-y", "-i", mp3_path, "-ar", "16000", "-ac", "1", wav_path]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def run_mfa_align(corpus_dir, dictionary_path, acoustic_model_path, output_dir):
    cmd = [
        "mfa",
        "align",
        corpus_dir,
        dictionary_path,
        acoustic_model_path,
        output_dir,
        "-j", "4",
        "--clean"
    ]
    print("Running MFA align command...")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print("MFA stdout:\n", result.stdout.decode())
    print("MFA stderr:\n", result.stderr.decode())

def parse_textgrid(textgrid_path):
    tg = TextGrid.fromFile(textgrid_path)
    for tier in tg.tiers:
        if "word" in tier.name.lower():  # This now represents characters after splitting
            for interval in tier.intervals:
                if interval.mark.strip():
                    yield {
                        "char": interval.mark.strip(),
                        "start": round(interval.minTime, 2),
                        "end": round(interval.maxTime, 2)
                    }

def split_characters_with_spaces(text):
    """Insert spaces between every character, skipping whitespace."""
    return " ".join(list(text.replace(" ", "")))

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python mfa_batch.py <folder_of_mp3_files> <transcripts_folder> <output_folder>")
        sys.exit(1)

    mp3_folder = sys.argv[1]
    transcripts_folder = sys.argv[2]
    output_folder = sys.argv[3]

    dictionary_path = "MFA/pretrained_models/dictionary/mandarin_mfa.dict"
    acoustic_model_path = "MFA/pretrained_models/acoustic/mandarin_mfa.zip"

    # Validate paths
    if not os.path.exists(mp3_folder):
        print(f"Error: MP3 folder {mp3_folder} does not exist.")
        sys.exit(1)
    if not os.path.exists(transcripts_folder):
        print(f"Error: Transcripts folder {transcripts_folder} does not exist.")
        sys.exit(1)
    os.makedirs(output_folder, exist_ok=True)

    with tempfile.TemporaryDirectory() as temp_dir:
        wav_dir = os.path.join(temp_dir, "corpus")
        os.makedirs(wav_dir, exist_ok=True)

        # Convert all MP3s and copy transcripts
        file_map = {}
        for mp3_file in os.listdir(mp3_folder):
            if mp3_file.endswith(".mp3"):
                base_name = os.path.splitext(mp3_file)[0]
                mp3_path = os.path.join(mp3_folder, mp3_file)
                wav_path = os.path.join(wav_dir, base_name + ".wav")
                lab_path = os.path.join(wav_dir, base_name + ".lab")

                convert_mp3_to_wav(mp3_path, wav_path)

                transcript_file = os.path.join(transcripts_folder, base_name + ".txt")
                if os.path.exists(transcript_file):
                    with open(transcript_file, "r", encoding="utf-8") as f:
                        transcript = f.read().strip()
                else:
                    print(f"Warning: No transcript found for {mp3_file}. Skipping.")
                    continue

                # Insert spaces between characters
                spaced_transcript = split_characters_with_spaces(transcript)

                with open(lab_path, "w", encoding="utf-8") as f:
                    f.write(spaced_transcript + "\n")

                file_map[base_name] = mp3_file

        output_dir = os.path.join(temp_dir, "aligned")
        run_mfa_align(wav_dir, dictionary_path, acoustic_model_path, output_dir)

        # Parse all TextGrids and store results in individual JSON files
        for tg_file in os.listdir(output_dir):
            if tg_file.endswith(".TextGrid"):
                base_name = os.path.splitext(tg_file)[0]
                mp3_name = file_map.get(base_name, base_name)
                tg_path = os.path.join(output_dir, tg_file)

                data = {
                    "filename": mp3_name,
                    "alignment": list(parse_textgrid(tg_path))
                }

                json_path = os.path.join(output_folder, f"{base_name}.json")
                with open(json_path, "w", encoding="utf-8") as json_out:
                    json.dump(data, json_out, ensure_ascii=False, indent=2)

                print(f"✅ Saved {json_path}")

        print("\n✅ All alignments complete. JSON files created in", output_folder)
