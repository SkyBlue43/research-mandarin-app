import csv

from database import get_connection



def get_characters_from_curriculum(test_number):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT id, curriculum_id, simplified, traditional, pinyin, english, hint
                FROM characters
                WHERE test = %s
                ORDER BY id;
                """, (test_number, ))
    characters = cur.fetchall()
    character_list = []
    for char in characters:
        character_list.append({
            'index': char[0],
            'curriculumId': str(char[1]),
            'simplified': char[2],
            'traditional': char[3],
            'pinyin': char[4],
            'english': char[5],
            'hint': char[6]
        })
    
    
    cur.close()
    conn.close()

    return {'characters': character_list}

    # file_path = f'curriculum/{test_number}.csv'

    # try:
    #     character_list = []
    #     with open(file_path, newline='', encoding="utf-8") as csvfile:
    #         reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    #         # skips the header row
    #         next(reader)
    #         for row in reader:
    #             character_list.append({
    #                 'index': row[0],
    #                 'simplified': row[1],
    #                 'traditional': row[2],
    #                 'pinyin': row[3],
    #                 'english': row[4],
    #                 'hint': row[5]
    #             })
    # except FileNotFoundError:
    #     raise FileNotFoundError("File not found")

    # return {'characters': character_list}
