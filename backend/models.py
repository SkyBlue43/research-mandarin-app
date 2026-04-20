from typing import List, Optional
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
    lesson_id: Optional[str] = None
    currentIndex: str
    words_user: List[WordData]

class Test(BaseModel):
    lesson_id: Optional[str] = None
