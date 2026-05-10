# DB helpers for Selenium verification and rollback.

import psycopg2

from config import DB_CONFIG


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


# ---------- CHECK ----------

def user_exists(email: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            return cur.fetchone() is not None


def enrollment_exists(user_email: str, course_id: int) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT e.id
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                WHERE u.email = %s AND e.course_id = %s
                """,
                (user_email, course_id),
            )
            return cur.fetchone() is not None


def get_course_status(course_id: int) -> str:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT status FROM courses WHERE id = %s", (course_id,))
            row = cur.fetchone()
            return row[0] if row else None


def get_user_count() -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM users")
            return cur.fetchone()[0]


def get_cart_item_count(user_email: str) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*)
                FROM cart_items ci
                JOIN users u ON ci.user_id = u.id
                WHERE u.email = %s
                """,
                (user_email,),
            )
            return cur.fetchone()[0]


def get_review_count(course_id: int) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM reviews WHERE course_id = %s", (course_id,))
            return cur.fetchone()[0]


# ---------- ROLLBACK ----------

def rollback_delete_user(email: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            if not row:
                return
            user_id = row[0]
            cur.execute("DELETE FROM user_roles WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM auth_tokens WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    print(f"[ROLLBACK] Deleted user: {email}")


def rollback_delete_enrollment(user_email: str, course_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM enrollments e
                USING users u
                WHERE e.user_id = u.id AND u.email = %s AND e.course_id = %s
                """,
                (user_email, course_id),
            )
        conn.commit()
    print(f"[ROLLBACK] Deleted enrollment: {user_email} -> course {course_id}")


def rollback_delete_cart_items(user_email: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM cart_items ci
                USING users u
                WHERE ci.user_id = u.id AND u.email = %s
                """,
                (user_email,),
            )
        conn.commit()
    print(f"[ROLLBACK] Cleared cart for: {user_email}")


def rollback_restore_course_status(course_id: int, original_status: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE courses SET status = %s WHERE id = %s",
                (original_status, course_id),
            )
        conn.commit()
    print(f"[ROLLBACK] Restored course {course_id} status to {original_status}")


def rollback_delete_review(user_email: str, course_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM reviews r
                USING users u
                WHERE r.user_id = u.id AND u.email = %s AND r.course_id = %s
                """,
                (user_email, course_id),
            )
        conn.commit()
    print(f"[ROLLBACK] Deleted review: {user_email} -> course {course_id}")
