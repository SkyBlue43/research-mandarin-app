import tempfile
import os
import asyncio
from ...routes.update_test import update_users_test, read_lines, write_lines

async def test_update_users_test():
    # 1️⃣ Create a temporary CSV file with fake data
    with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_file:
        temp_file.write("alice,20,CS,3.9,pre\n")
        temp_file.write("bob,22,Math,3.5,2\n")
        temp_filename = temp_file.name

    # 2️⃣ Mock your read_lines and write_lines to use the temp file
    def mock_read_lines(_):
        with open(temp_filename, 'r') as f:
            return f.readlines()

    def mock_write_lines(_, lines):
        with open(temp_filename, 'w') as f:
            f.writelines(lines)

    # Monkey-patch your I/O functions
    read_lines = mock_read_lines
    write_lines = mock_write_lines

    # 3️⃣ Call your function
    await update_users_test("alice")

    # 4️⃣ Check if file contents updated correctly
    with open(temp_filename, 'r') as f:
        updated = f.read().splitlines()

    expected = ["alice,20,CS,3.9,1", "bob,22,Math,3.5,2"]
    assert updated == expected, f"Expected {expected}, got {updated}"

    # 5️⃣ Clean up the temp file
    os.remove(temp_filename)
