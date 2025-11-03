from typing import List
from pydantic import BaseModel

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from routes import dtw
import pytest

class PitchData(BaseModel):
    frequency: List[float | None]
    time: List[float]
    
# @pytest.fixture(autouse=True)
# def setup_each():

test_ref_pitch = PitchData(frequency=[None, None, None, 0.33, 0.45, 0.73, None, None, None], time=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
test_user_pitch = PitchData(frequency=[None, None, None, 0.45, 0.73, 0.3, None, None, None], time=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
current_index = "1"
test = "1"
word_user = [{"char": "八", "start": 0.1, "end": 0.53}]

def test_get_characters_from_csv():
    result = dtw.get_characters_from_csv(test, current_index)
    assert result == word_user

def test_get_characters_from_csv_no_file_found():
    with pytest.raises(FileNotFoundError):
        dtw.get_characters_from_csv(0, "1")

    with pytest.raises(FileNotFoundError):
        dtw.get_characters_from_csv(1, "0")

