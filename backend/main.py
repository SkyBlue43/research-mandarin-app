from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/sounds", StaticFiles(directory="sounds"), name="sounds")

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    

@app.post('/get-characters/')
async def get_characters(request: Request):
    data = await request.json()
    test_number = data.get('test')
    
    try:
        lines = read_lines(f'{test_number}.csv')
    except FileNotFoundError:
        return {"error": f"File not found."}
    
    character_list = []
    for line in lines:
        split_line = line.strip().split(',')
        if split_line[0] == "Character" or split_line[0] == "Phrase":
            continue
        character_list.append({
            'chinese': split_line[0],
            'pinyin': split_line[1],
            'index': split_line[3]
            })
        
    return {'characters': character_list}


@app.post('/get-audio')
async def get_audio():
    pass