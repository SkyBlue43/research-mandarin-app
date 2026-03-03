
from database import get_connection


def save_pitch_accuracy(user_id, test, char_id, accuracy):
    if accuracy == 0 or accuracy is None:
        return
    
    conn = get_connection()
    cur = conn.cursor()


    cur.execute("""
                INSERT INTO attempts
                (user_id, character_id, test, accuracy)
                VALUES (%s, %s, %s, %s);
                """, (
                    int(user_id),
                    int(char_id),
                    test,
                    accuracy
                ))
    
    conn.commit()
    cur.close()
    conn.close()
