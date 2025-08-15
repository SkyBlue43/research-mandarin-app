from fastapi import APIRouter, Request, HTTPException
from services.file_utils import read_lines

router = APIRouter()

@router.post('/check-password/')
async def check_password(request: Request):
    data = await request.json()
    username = data.get('username')
    password = data.get('password')

    lines = read_lines('backend/students.csv')
    for line in lines:
        items = line.strip().split(',')
        if username == items[0] and password == items[1]:
            return {'test': items[3], 'group': items[2]}
    raise HTTPException(status_code=401, detail="Invalid username or password")
