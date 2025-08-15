def read_lines(infile: str):
    with open(infile, "r", encoding="utf-8") as file:
        return file.readlines()
