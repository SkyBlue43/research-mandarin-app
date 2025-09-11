from fastapi import Request, APIRouter

router = APIRouter()

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    
def write_lines(outfile, lines):
    with open(outfile, 'w') as file:
        file.writelines(lines)

@router.post('/update_test/')
async def get_characters(request: Request):
    data = await request.json()
    username = data.get('username')
    
    try:
        lines = read_lines('backend/students.csv')
    except FileNotFoundError:
        return {"error": f"File not found."}
    
    new_lines = []
    for line in lines:
        split_line = line.strip().split(',')
        if "student_name" in split_line[0]:
            new_lines.append(line)
        else:
            if split_line[4] == 'pre':
                new_test = '1'
            elif split_line[4] == '16':
                new_test = 'post'
            else:
                new_test = str(int(split_line[4]) + 1)
            new_lines.append(f'{split_line[0]},{split_line[1]},{split_line[2]},{split_line[3]},{new_test}')

    write_lines('backend/students.csv', new_lines)   
        
    return 