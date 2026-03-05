from database import get_connection

def get_highest_accuracies_for_user(user_id, test, group):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT character_id, MAX(accuracy)
                FROM attempts
                WHERE user_id = %s
                AND test = %s
                GROUP BY character_id
                ORDER BY character_id;
                """, (user_id, test))
    
    rows = cur.fetchall()

    accuracies = []

    for chinese, max_accuracy in rows:
        accuracies.append({
            "chinese": chinese,
            "accuracy": float(max_accuracy)
        })

    cur.close()
    conn.close()

    return {"accuracies": accuracies}
