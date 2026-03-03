import os
import csv

def read_lines(infile):
    with open(infile, newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        return list(reader)

async def get_highest_accuracies_for_user(user_id, test, group):

    try: 
        base_dir = os.path.join(os.getcwd(), "data")
        base_dir = os.path.join(base_dir, f'Test_{test}')
        filename = os.path.join(base_dir, f"{name}_{group}.csv")

        lines = read_lines(filename)
        accuracies = []
        for items in lines:
            if len(items) <= 2:
                raise IndexError("Malformed line: not enough columns")

            if items[0] == 'Chinese':
                continue
            if len(items) > 3:
                highest = 0
                for i in range(2, len(items)):
                    if float(items[i]) > highest:
                        highest = float(items[i])
            else:
                highest = float(items[2])
            accuracies.append({
                'chinese': items[0],
                'accuracy': highest
            })
        
        return {'accuracies': accuracies}
    except FileNotFoundError:
        raise FileNotFoundError("File not found")
    except PermissionError:
        raise PermissionError("Permission denied reading file")
