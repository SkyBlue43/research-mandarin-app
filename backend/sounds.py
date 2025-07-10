import sys
from gtts import gTTS
import os

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()


def get_audio(lines, folder):
    os.makedirs(folder, exist_ok=True)

    for line in lines:
        things = line.split(",")
        chinese = things[0]
        if chinese != "Chinese":
            tts = gTTS(text=chinese, lang="zh")
            tts.save(os.path.join(folder, f"{chinese}.mp3"))


def main(infile, folder):
    lines = read_lines(infile)
    get_audio(lines, folder)
    

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])