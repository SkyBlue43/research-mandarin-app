def read_lines(infile):
    with open(infile) as file:
        return file.readlines()

def authenticate_user(username, password):
    try: 
        lines = read_lines('students.csv')
    except FileNotFoundError:
        raise FileNotFoundError("File not found")
    for line in lines:
        items = line.strip().split(',')
        if username == items[1] and password == items[2]:
            return {'name': items[0], 'group': items[3], 'test': items[4]}
    raise PermissionError("Invalid username or password")