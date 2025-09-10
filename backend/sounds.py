import sys
from gtts import gTTS
import os
import subprocess

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()

""" 
    parameters: sounds.py curriculum/(filenumber).csv sounds/(filenumber)
"""


def get_audio(lines, folder):
    os.makedirs(folder, exist_ok=True)
    transcript_folder = f"{folder}_transcript"
    os.makedirs(transcript_folder, exist_ok=True)

    for line in lines:
        things = line.strip().split(",")
        if things[0] == 'Index':
            continue
        index = things[0]
        chinese = things[1]
        tts = gTTS(text=chinese, lang="zh")
        tts.save(os.path.join(folder, f"{index}.mp3"))
        transcript_path = os.path.join(transcript_folder, f"{index}.txt")
        with open(transcript_path, "w", encoding="utf-8") as file:
            file.write(chinese)
    
    if folder[-2] == "/":
        subprocess.run(["python", "mfa_test.py", folder, transcript_folder, f"transcripts/results_{folder[-1]}"])
    else:
        subprocess.run(["python", "mfa_test.py", folder, transcript_folder, f"transcripts/results_{folder[-2]}{folder[-1]}"])



def main(infile, folder):
    lines = read_lines(infile)
    get_audio(lines, folder)
    

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])