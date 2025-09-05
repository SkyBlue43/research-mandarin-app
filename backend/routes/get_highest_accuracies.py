from fastapi import Request, APIRouter
import os

router = APIRouter()

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()

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
    for line in lines:
        items = line.strip().split(',')
        if items[0] == 'Chinese':
            continue
        if len(items) > 3:
            highest = 0
            for i in range(2, len(items)):
                if items[i] > highest:
                    highest = items[i]
        else:
            highest = items[2]
        accuracies.append({
            'chinese': items[0],
            'accuracy': highest
        })
    
    return {'accuracies': accuracies}