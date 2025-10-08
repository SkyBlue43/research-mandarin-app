from fastapi import Request, APIRouter
import os
import csv

router = APIRouter()

def read_lines(infile):
    with open(infile, newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        return list(reader)

@router.post("/get_highest_accuracies/")
async def get_highest_accuracies(request: Request):
    data = await request.json()
    name = data.get("name")
    test = data.get("test")
    group = data.get('group')

    base_dir = os.path.join(os.getcwd(), "backend", "data")
    base_dir = os.path.join(base_dir, f'Test_{test}')

    filename = os.path.join(base_dir, f"{name}_{group}.csv")

    lines = read_lines(filename)
    accuracies = []
    for items in lines:
        if items[0] == 'Chinese':
            continue
        if len(items) > 3:
            highest = 0
            for i in range(2, len(items)):
                if float(items[i]) > highest:
                    highest = float(items[i])
        else:
            highest = float(items[2])
        accuracies.append({
            'chinese': items[0],
            'accuracy': highest
        })
    
    return {'accuracies': accuracies}
