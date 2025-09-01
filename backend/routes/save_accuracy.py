from fastapi import Request, APIRouter
import os

router = APIRouter()

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    
def write_lines(outfile, lines):
    with open(outfile, 'w') as file:
        file.writelines(lines)

@router.post("/save_accuracy/")
async def save_accuracy(request: Request):
    data = await request.json()
    name = data.get("name")
    test = data.get("test")
    group = data.get('group')
    phrase = data.get('phrase')
    array_number = data.get('array_number')
    accuracy = data.get("accuracy")

    os.makedirs(os.path.dirname(f'/backend/data/{test}', exist_ok=True))

    filename = f'/backend/data/{test}/{name}_{group}.csv'

    if os.path.isfile(filename):
        lines = read_lines(filename)
        for line in lines:
            items = line.strip().split(',')
            if items[0] == phrase:
                line = line.strip()
                line += f',{accuracy}\n'
        lines.append(f"{phrase},{array_number},{accuracy}")
        write_lines(filename,lines)
    else:
        new_list = []
        first_line = 'Chinese,Array_number,Attempts\n'
        new_list.append(first_line)
        new_list.append(f"{phrase},{array_number},{accuracy}")
        write_lines(filename, new_list)
    
    return
