from database import get_connection

def update_users_test(user_id):

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    SELECT test
                    FROM users
                    WHERE id = %s;
                    """, (user_id, ))

        result = cur.fetchone()
        if result is None:
            return
        test = result[0]
        
        if test == 'pre':
            new_test = '1'
        elif test == '16':
            new_test = 'post'
        elif test == 'post':
            new_test = 'done'
        elif test == 'done':
            return
        else:
            new_test = str(int(test) + 1)
        
        cur.execute("""
                    UPDATE users
                    SET test = %s
                    WHERE id = %s;
                    """, (new_test, user_id))
    
        conn.commit()
    finally:
        cur.close()
        conn.close()
