# Postman Test Collection - Online Learning System

## Cách import và chạy

1. Mở Postman
2. Import file `online_learning_collection.json`
3. Import file `environment.json` (set variables)
4. Chạy Collection Runner: Collection > Run > chọn environment

## Cấu trúc collection

- **01_Auth** - TC-AUTH-001 to TC-AUTH-029
- **02_Course** - TC-COURSE-001 to TC-COURSE-006
- **03_Enrollment** - TC-ORDER-001 to TC-ORDER-014
- **04_Study_Quiz** - TC-STUDY-001 to TC-STUDY-012
- **05_Instructor** - TC-INS-001 to TC-INS-033
- **06_Admin** - TC-ADM-001 to TC-ADM-025

## Rollback

Mỗi request có Pre-request Script để lưu state và Tests script để rollback.
