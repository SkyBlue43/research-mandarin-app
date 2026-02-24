import os
import csv
import psycopg2

from database import DATABASE_URL


def seed_words():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(BASE_DIR, "curriculum")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    count = 0
    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(folder_path, filename)
            stem = os.path.splitext(filename)[0]

            print(f"Importing {stem}...")

            with open(file_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)

                for row in reader:
                    count += 1
                    cur.execute("""
                        INSERT INTO characters
                        (id, test, simplified, traditional, pinyin, english, hint)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING
                    """, (
                        count,
                        stem,  # test column from filename
                        row["Simplified"],
                        row["Traditional"],
                        row["Pinyin"],
                        row["English"],
                        row["Hint"]
                    ))

    conn.commit()
    cur.close()
    conn.close()

    print("Seeding complete!")


if __name__ == "__main__":
    seed_words()