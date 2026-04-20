import csv
from pathlib import Path

CURRICULUM_DIR = Path(__file__).resolve().parent.parent / "curriculum"


def get_available_lessons():
    lesson_ids = sorted(
        [path.stem for path in CURRICULUM_DIR.glob("*.csv") if path.stem.isdigit()],
        key=lambda lesson_id: int(lesson_id),
    )

    return {
        "lessons": [
            {"id": lesson_id, "label": f"Lesson {lesson_id}"} for lesson_id in lesson_ids
        ]
    }


def get_characters_from_curriculum(content_id):
    csv_path = CURRICULUM_DIR / f"{content_id}.csv"
    if not csv_path.exists():
        raise FileNotFoundError("File not found")

    character_list = []
    with csv_path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        for row in reader:
            index = str(row["Index"])
            character_list.append(
                {
                    "index": index,
                    "curriculumId": index,
                    "simplified": row["Simplified"],
                    "traditional": row["Traditional"],
                    "pinyin": row["Pinyin"],
                    "english": row["English"],
                    "hint": row["Hint"],
                }
            )

    return {"characters": character_list}
