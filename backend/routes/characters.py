from fastapi import APIRouter, Request
from services.file_utils import read_lines

router = APIRouter()

@router.post('/get-characters/')
async def get_characters(request: Request):
    data = await request.json()
    test_number = data.get('test')

    try:
        lines = read_lines(f'backend/{test_number}.csv')
    except FileNotFoundError:
        return {"error": f"File not found."}

    character_list = []
    for line in lines:
        split_line = line.strip().split(',')
        if split_line[0] in ["Character", "Phrase", "Sentence"]:
            continue
        character_list.append({
            'chinese': split_line[0],
            'pinyin': split_line[1],
            'index': split_line[3]
        })

    return {'characters': character_list}
