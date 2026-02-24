from database import get_connection

def authenticate_user(username, password):
    conn = get_connection()
    curr = conn.cursor()

    curr.execute("SELECT id, password, group_letter, test FROM users WHERE username=%s;", (username, ))
    user = curr.fetchone()
    curr.close()
    conn.close()

    if not user:
        raise PermissionError("Invalid username or password")

    name, user_password, group, test = user
    if password != user_password:
        raise PermissionError("Invalid username or password")
    
    return {'name': name, 'group': group, 'test': test}