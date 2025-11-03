import csv


def get_characters_from_curriculum(test_number):

    file_path = f'curriculum/{test_number}.csv'

    try:
        character_list = []
        with open(file_path, newline='', encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile, delimiter=',', quotechar='"')
            # skips the header row
            next(reader)
            for row in reader:
                character_list.append({
                    'index': row[0],
                    'simplified': row[1],
                    'traditional': row[2],
                    'pinyin': row[3],
                    'english': row[4],
                    'hint': row[5]
                })
    except FileNotFoundError:
        raise FileNotFoundError("File not found")

    return {'characters': character_list}
