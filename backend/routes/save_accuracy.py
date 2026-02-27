
from database import get_connection


def save_pitch_accuracy(user_id, char_id, accuracy):
    if accuracy == 0 or accuracy is None:
        return
    
    conn = get_connection()
    cur = conn.cursor()


    cur.execute("""
                INSERT INTO attempts
                (user_id, character_id, accuracy)
                VALUES (%s, %s, %s);
                """, (
                    int(user_id),
                    int(char_id),
                    accuracy
                ))
    
    conn.commit()
    cur.close()
    conn.close()
