def read_lines(infile):
    with open(infile) as file:
        return file.readlines()
    
def write_lines(outfile, lines):
    with open(outfile, 'w') as file:
        file.writelines(lines)

async def update_users_test(username):
    try:
        lines = read_lines('students.csv')
    except FileNotFoundError:
        raise FileNotFoundError("File not found")

    new_lines = []
    for line in lines:
        split_line = line.strip().split(',')
        if len(split_line) < 5:
            continue 
        if split_line[0] == username:
            try:
                if split_line[4] == 'pre':
                    new_test = '1'
                elif split_line[4] == '16':
                    new_test = 'post'
                elif split_line[4] == "post":
                    new_test = "DONE"
                else:
                    new_test = str(int(split_line[4]) + 1)
            except ValueError:
                raise ValueError(f"Invalid test number for user {split_line[0]}")
            
            new_lines.append(f'{split_line[0]},{split_line[1]},{split_line[2]},{split_line[3]},{new_test}')
        else:
            new_lines.append(line)

    try:
        write_lines('students.csv', new_lines)
    except PermissionError:
        raise PermissionError("Cannot write to students.csv")

    return
