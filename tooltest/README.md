# tooltest/ - Bộ công cụ kiểm thử tự động
# Online Learning System - mapping 13_system_test.xlsx

## Cấu trúc thư mục

```
tooltest/
├── selenium/           # Selenium WebDriver tests (UI + DB check + rollback)
│   ├── config.py           - Cấu hình URL, DB, accounts
│   ├── db_helper.py        - Kiểm tra DB và rollback
│   ├── base_test.py        - Base class: driver, helpers, report HTML
│   ├── test_01_auth.py     - TC-AUTH-001..029 (Đăng ký, Đăng nhập, Đăng xuất)
│   ├── test_02_course_explore.py - TC-COURSE-001..006 (Tìm kiếm, Xem chi tiết)
│   ├── test_03_enrollment.py     - TC-ORDER-001..014 (Giỏ hàng, Đăng ký học)
│   ├── test_04_study_quiz.py     - TC-STUDY-001..012 (Học bài, Quiz, Đánh giá)
│   └── run_all_tests.py    - Chạy toàn bộ test suite
│
├── postman/            # Postman API tests (với rollback script)
│   ├── build_collection.py     - Script tạo collection JSON
│   ├── online_learning_collection.json - 62 requests, 5 folders
│   └── README.md
│
├── jmeter/             # JMeter performance tests
│   ├── online_learning_perf_test.jmx - 5 scenarios, có assertion ngưỡng
│   ├── analyze_jmeter_results.py     - Phân tích CSV và đánh giá ngưỡng
│   └── README.md
│
├── test_data/          # CSV test data
│   ├── auth_test_data.csv
│   ├── login_test_data.csv
│   ├── course_test_data.csv
│   └── enrollment_test_data.csv
│
└── reports/            # Output reports (tự động tạo khi chạy test)
    ├── selenium_report_*.html
    ├── jmeter_results.csv
    ├── jmeter_aggregate.csv
    └── jmeter_html_report/
```

## Yêu cầu cài đặt

### Selenium
```bash
pip install selenium psycopg2-binary
# Tải ChromeDriver phù hợp với Chrome version
# https://chromedriver.chromium.org/downloads
```

### Postman
- Import file `postman/online_learning_collection.json`
- Chạy Collection Runner

### JMeter
- Tải JMeter 5.6+: https://jmeter.apache.org/download_jmeter.cgi
- Chạy: `jmeter -n -t jmeter/online_learning_perf_test.jmx -l reports/jmeter_results.csv -e -o reports/jmeter_html_report`

## Cách chạy Selenium

```bash
cd tooltest/selenium

# Chạy toàn bộ
python run_all_tests.py

# Chạy từng sheet
python -m pytest test_01_auth.py -v
python -m pytest test_02_course_explore.py -v
python -m pytest test_03_enrollment.py -v
python -m pytest test_04_study_quiz.py -v
```

## Seed data cần thiết

Trước khi chạy test, đảm bảo DB có:
- User: learner_test@gmail.com / Test@1234 (role STUDENT, email verified)
- User: instructor_test@gmail.com / Test@1234 (role INSTRUCTOR)
- User: admin@gmail.com / Admin@1234 (role ADMIN)
- Course ID=1: ACTIVE, isFree=true
- Course ID=2: ACTIVE, isFree=false, price=500000
- Course ID=3: DRAFT, 0 enrollments
- Course ID=4: ACTIVE, learner_test đã enroll
- CourseGroup ID=1: ACTIVE

## Mapping với 13_system_test.xlsx

| Sheet | TC IDs | Tool | File |
|---|---|---|---|
| 01_Xác thực | TC-AUTH-001..029 | Selenium + Postman | test_01_auth.py + collection folder 01 |
| 02_Khám phá | TC-COURSE-001..006 | Selenium + Postman | test_02_course_explore.py + folder 02 |
| 03_Thanh toán | TC-ORDER-001..014 | Selenium + Postman | test_03_enrollment.py + folder 03 |
| 04_Học tập | TC-STUDY-001..012 | Selenium | test_04_study_quiz.py |
| 05_QL nội dung | TC-INS-001..033 | Postman | collection folder 05 |
| 06_Quản trị | TC-ADM-001..025 | Postman + JMeter | collection folder 06 + jmx |

## Rollback strategy

- **Selenium**: db_helper.py có hàm rollback_* gọi trong finally block
- **Postman**: Mỗi folder có request [ROLLBACK] ở cuối, chạy sau khi test xong
- **JMeter**: S4 (enroll) cần cleanup thủ công hoặc dùng teardown thread group
