from fastapi import Request, APIRouter

router = APIRouter()

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()

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
        if split_line[0] == "Character" or split_line[0] == "Phrase" or split_line[0] == "Sentence":
            continue
        character_list.append({
            'chinese': split_line[0],
            'pinyin': split_line[1],
            'index': split_line[3]
            })
        
    return {'characters': character_list}