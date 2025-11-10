import os

def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    
def write_lines(outfile, lines):
    with open(outfile, 'w') as file:
        file.writelines(lines)

async def save_pitch_accuracy(name, test, group, phrase, array_number, accuracy):
    if accuracy == 0 or accuracy is None:
        return

    try: 
        base_dir = os.path.join(os.getcwd(), "data")
        os.makedirs(os.path.join(base_dir, f'Test_{test}'), exist_ok=True)
        filename = os.path.join(base_dir, f"Test_{test}", f"{name}_{group}.csv")

        if os.path.isfile(filename):
            lines = read_lines(filename)
            new_lines = []
            found = False
            for line in lines:
                items = line.strip().split(',')
                if items[0] == phrase:
                    line = line.strip()
                    line += f',{accuracy}\n'
                    found = True
                new_lines.append(line)
            if not found:
                lines.append(f"{phrase},{array_number},{accuracy}\n")
                write_lines(filename,lines)
            else:
                write_lines(filename, new_lines)
        else:
             write_lines(
                filename,
                ['Chinese,Array_number,Attempts\n', f"{phrase},{array_number},{accuracy}\n"]
            )
    except FileNotFoundError:
        raise FileNotFoundError("File not found")
    except IndexError:
        raise IndexError("Malformed line in CSV file")
