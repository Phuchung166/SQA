# Environment configuration for the local Online Learning QA setup.

# URLs
LEARNER_BASE_URL = "http://127.0.0.1:3000/vi"
ADMIN_BASE_URL = "http://127.0.0.1:8158"
API_BASE_URL = "http://127.0.0.1:8080/api/v1"

# Database (docker-compose local stack)
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "online_learning",
    "user": "postgres",
    "password": "ptit",
}

# Demo accounts seeded by SeedDataRunner (password123)
LEARNER_EMAIL = "student09@test.local"
LEARNER_PASSWORD = "password123"
INSTRUCTOR_EMAIL = "instructor.john@test.local"
INSTRUCTOR_PASSWORD = "password123"
ADMIN_EMAIL = "admin@test.local"
ADMIN_PASSWORD = "password123"

# Seed data IDs verified in the local DB
FREE_COURSE_ID = 5
PAID_COURSE_ID = 1
DRAFT_COURSE_ID = 10
ENROLLED_COURSE_ID = 3
COURSE_GROUP_ID = 3

# Selenium
IMPLICIT_WAIT = 10
PAGE_LOAD_TIMEOUT = 30
HEADLESS = False

# Report output
REPORT_DIR = "../reports"
