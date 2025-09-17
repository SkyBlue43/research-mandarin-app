from fastapi import Request, APIRouter
import csv

router = APIRouter()

@router.post('/get-characters/')
async def get_characters(request: Request):
    data = await request.json()
    test_number = data.get('test')

    file_path = f'backend/curriculum/{test_number}.csv'

    try:
        character_list = []
        with open(file_path, newline='', encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile, delimiter=',', quotechar='"')
            for row in reader:
                # Skip header row
                if "Index" in row[0]:
                    continue
                character_list.append({
                    'index': row[0],
                    'simplified': row[1],
                    'traditional': row[2],
                    'pinyin': row[3],
                    'english': row[4],
                    'hint': row[5]
                })
    except FileNotFoundError:
        return {"error": "File not found."}

    return {'characters': character_list}
