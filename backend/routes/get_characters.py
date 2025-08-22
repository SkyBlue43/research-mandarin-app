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
        lines = read_lines(f'backend/curriculum/{test_number}.csv')
    except FileNotFoundError:
        return {"error": f"File not found."}
    
    character_list = []
    for line in lines:
        split_line = line.strip().split(',')
        if split_line[0] == "Index":
            continue
        character_list.append({
            'index': split_line[0],
            'simplified': split_line[1],
            'traditional': split_line[2],
            'pinyin': split_line[3],
            'english': split_line[4],
            'hint': split_line[5]
            })
        
    return {'characters': character_list}