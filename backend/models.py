from typing import List
from pydantic import BaseModel


class Phrase(BaseModel):
    phrase: str

class PitchData(BaseModel):
    frequency: List[float | None]
    time: List[float]

class WordData(BaseModel):
    char: str
    start: float
    end: float

class DTWRequest(BaseModel):
    reference_pitch: PitchData
    user_pitch: PitchData
    test: str
    currentIndex: str
    words_user: List[WordData]

class Highest_Accuracy(BaseModel):
    user_id: int
    test: str
    group: str

class Accuracy(BaseModel):
    user_id: int
    test: str
    accuracy: float
    array_number: str

class User(BaseModel):
    user_id: int

class Auth(BaseModel):
    username: str
    password: str

class Test(BaseModel):
    test_number: str
