# Tooltest Traceability

- Source workbook: `13_system_test.xlsx`
- Total manual system test cases: **118**
- Selenium references found: **35**
- Postman references found: **54**
- JMeter references found: **5**

## Workbook Sheets

| Sheet | Cases |
|---|---:|
| 01_Xác thực | 29 |
| 02_Khám phá khóa học | 6 |
| 03_Thanh toán_Đăng ký học | 14 |
| 04_Học tập_Quiz_Đánh giá | 12 |
| 05_QL nội dung khóa học | 32 |
| 06_Quản trị hệ thống | 25 |

## Case Index

| TC ID | Sheet | Manual Status | Selenium | Postman | JMeter | Test Data | Scenario |
|---|---|---|---|---|---|---|---|
| TC-ADM-001 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Duyệt khóa học thành công (PENDING → PUBLISHED) |
| TC-ADM-002 | 06_Quản trị hệ thống | FAIL | - | online_learning_collection.json | - | - | Tạm dừng khóa học đang hoạt động (PUBLISHED → SUSPENDED) |
| TC-ADM-003 | 06_Quản trị hệ thống | PENDING | - | - | - | - | Kích hoạt lại khóa học bị tạm dừng |
| TC-ADM-004 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xóa khóa học vi phạm nghiêm trọng |
| TC-ADM-005 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Tìm kiếm với bộ lọc đầy đủ |
| TC-ADM-006 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Tìm kiếm không có kết quả phù hợp |
| TC-ADM-007 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Thêm danh mục mới thành công |
| TC-ADM-008 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Thêm danh mục mới thất bại |
| TC-ADM-009 | 06_Quản trị hệ thống | FAIL | - | online_learning_collection.json | - | - | Thêm danh mục trùng tên với danh mục đã tồn tại |
| TC-ADM-010 | 06_Quản trị hệ thống | PASS | - | - | - | - | Xóa danh mục đang có khóa học |
| TC-ADM-011 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Cập nhật danh mục thành công |
| TC-ADM-012 | 06_Quản trị hệ thống | PASS | - | - | - | - | Tìm kiếm danh mục theo tên |
| TC-ADM-013 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Xóa danh mục không có khóa học |
| TC-ADM-014 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Tìm kiếm học viên theo tên hoặc email |
| TC-ADM-015 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xóa tài khoản học viên |
| TC-ADM-016 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xem thông tin chi tiết học viên |
| TC-ADM-017 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | - | - | Tìm kiếm giảng viên theo tên |
| TC-ADM-018 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xóa giảng viên |
| TC-ADM-019 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xem thông tin chi tiết giảng viên |
| TC-ADM-020 | 06_Quản trị hệ thống | PASS | - | online_learning_collection.json | online_learning_perf_test.jmx | - | Xem danh sách tất cả đơn hàng |
| TC-ADM-021 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xem thông tin chi tiết đơn hàng |
| TC-ADM-022 | 06_Quản trị hệ thống | FAIL | - | online_learning_collection.json | - | - | Tìm kiếm đơn hàng theo mã đơn hoặc học viên |
| TC-ADM-023 | 06_Quản trị hệ thống | FAIL | - | online_learning_collection.json | - | - | Xem danh sách thu nhập giảng viên |
| TC-ADM-024 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Xác nhận thanh toán hoa hồng cho giảng viên |
| TC-ADM-025 | 06_Quản trị hệ thống | FAIL | - | - | - | - | Lọc danh sách trả lương theo tháng, năm và trạng thái thanh toán |
| TC-AUTH-001 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký thành công với dữ liệu hợp lệ đầy đủ |
| TC-AUTH-002 | 01_Xác thực | FAIL | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với username quá ngắn - 4 ký tự (dưới tối thiểu 5) |
| TC-AUTH-003 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với username đúng 5 ký tự - giá trị biên hợp lệ |
| TC-AUTH-004 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với username quá dài - 21 ký tự (vượt tối đa 20) |
| TC-AUTH-005 | 01_Xác thực | PASS | - | - | - | auth_test_data.csv | Đăng ký với username đúng 20 ký tự - giá trị biên trên hợp lệ |
| TC-AUTH-006 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với email không có ký tự @ |
| TC-AUTH-007 | 01_Xác thực | PASS | - | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với email không có phần domain (@gmail.com) |
| TC-AUTH-008 | 01_Xác thực | FAIL | - | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với email không có domain extension (@test) |
| TC-AUTH-009 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với email đã tồn tại trong hệ thống |
| TC-AUTH-010 | 01_Xác thực | FAIL | test_01_auth.py | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với password quá ngắn - 7 ký tự (dưới tối thiểu 8) |
| TC-AUTH-011 | 01_Xác thực | PASS | - | online_learning_collection.json | - | auth_test_data.csv | Đăng ký với password đúng 8 ký tự - biên hợp lệ |
| TC-AUTH-012 | 01_Xác thực | PASS | test_01_auth.py | - | - | auth_test_data.csv | Đăng ký với tất cả trường để trống |
| TC-AUTH-013 | 01_Xác thực | PASS | - | - | - | - | Xác thực OTP với mã 6 chữ số đúng |
| TC-AUTH-014 | 01_Xác thực | PASS | - | - | - | - | Xác thực OTP với mã sai (6 chữ số không đúng) |
| TC-AUTH-015 | 01_Xác thực | PASS | - | - | - | - | Xác thực OTP với mã không đủ 6 chữ số |
| TC-AUTH-016 | 01_Xác thực | PASS | - | - | - | - | Xác thực OTP với mã chứa ký tự không phải số |
| TC-AUTH-017 | 01_Xác thực | PASS | - | - | - | - | Xác thực OTP sau khi hết hạn (>5 phút) |
| TC-AUTH-018 | 01_Xác thực | PASS | - | - | - | - | Gửi lại mã OTP mới |
| TC-AUTH-019 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | online_learning_perf_test.jmx | login_test_data.csv | Đăng nhập thành công với credentials hợp lệ |
| TC-AUTH-020 | 01_Xác thực | FAIL | test_01_auth.py | online_learning_collection.json | - | login_test_data.csv | Đăng nhập thất bại với email đúng nhưng password sai |
| TC-AUTH-021 | 01_Xác thực | FAIL | test_01_auth.py | online_learning_collection.json | - | login_test_data.csv | Đăng nhập thất bại với email không tồn tại trong hệ thống |
| TC-AUTH-022 | 01_Xác thực | PASS | - | online_learning_collection.json | - | login_test_data.csv | Đăng nhập với email chưa được xác thực OTP |
| TC-AUTH-023 | 01_Xác thực | PASS | test_01_auth.py | - | - | login_test_data.csv | Đăng nhập khi chưa nhập email |
| TC-AUTH-024 | 01_Xác thực | PASS | test_01_auth.py | - | - | login_test_data.csv | Đăng nhập khi chưa nhập password |
| TC-AUTH-025 | 01_Xác thực | PASS | - | online_learning_collection.json | - | - | Gửi yêu cầu reset password với email tồn tại |
| TC-AUTH-026 | 01_Xác thực | PASS | - | online_learning_collection.json | - | - | Gửi yêu cầu reset với email không tồn tại |
| TC-AUTH-027 | 01_Xác thực | PASS | - | - | - | - | Đặt lại mật khẩu với link token hết hạn |
| TC-AUTH-028 | 01_Xác thực | PASS | - | - | - | - | Đổi mật khẩu thành công với OTP hoặc reset token hợp lệ |
| TC-AUTH-029 | 01_Xác thực | PASS | test_01_auth.py | online_learning_collection.json | - | - | Đăng xuất thành công từ trang chủ |
| TC-COURSE-001 | 02_Khám phá khóa học | PASS | test_02_course_explore.py | online_learning_collection.json | online_learning_perf_test.jmx | course_test_data.csv | Tìm kiếm khóa học với từ khóa tồn tại trong hệ thống |
| TC-COURSE-002 | 02_Khám phá khóa học | FAIL | test_02_course_explore.py | online_learning_collection.json | - | course_test_data.csv | Tìm kiếm với từ khóa không tồn tại trong hệ thống |
| TC-COURSE-003 | 02_Khám phá khóa học | PASS | test_02_course_explore.py | online_learning_collection.json | online_learning_perf_test.jmx | course_test_data.csv | Xem thông tin đầy đủ của khóa học tồn tại |
| TC-COURSE-004 | 02_Khám phá khóa học | PASS | test_02_course_explore.py | online_learning_collection.json | - | course_test_data.csv | Xem khóa học với ID không tồn tại |
| TC-COURSE-005 | 02_Khám phá khóa học | PENDING | - | - | - | - | Xem khóa học bị tạm dừng (SUSPENDED) |
| TC-COURSE-006 | 02_Khám phá khóa học | PASS | test_02_course_explore.py | online_learning_collection.json | - | course_test_data.csv | Xem thông tin đầy đủ của khóa học nhóm tồn tại |
| TC-INS-001 | 05_QL nội dung khóa học | PASS | - | online_learning_collection.json | - | - | Tạo khóa học độc lập thành công với đầy đủ thông tin |
| TC-INS-002 | 05_QL nội dung khóa học | PASS | - | online_learning_collection.json | - | - | Tạo khóa học miễn phí (isFree = true) |
| TC-INS-003 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Upload thumbnail với định dạng không hỗ trợ (.gif) |
| TC-INS-004 | 05_QL nội dung khóa học | PENDING | - | - | - | - | Upload thumbnail với kích thước vượt quá giới hạn (>2MB) |
| TC-INS-005 | 05_QL nội dung khóa học | PASS | - | - | - | - | Upload thumbnail đúng 2MB - boundary value |
| TC-INS-006 | 05_QL nội dung khóa học | PENDING | - | - | - | - | Upload video với kích thước vượt quá 50MB |
| TC-INS-007 | 05_QL nội dung khóa học | FAIL | - | online_learning_collection.json | - | - | Tạo khóa học với tiêu đề trống (validation) |
| TC-INS-008 | 05_QL nội dung khóa học | PASS | - | online_learning_collection.json | - | - | Tạo khóa học với giá là số âm |
| TC-INS-009 | 05_QL nội dung khóa học | FAIL | - | online_learning_collection.json | - | - | Cập nhật thông tin khóa học thành công |
| TC-INS-010 | 05_QL nội dung khóa học | PASS | - | online_learning_collection.json | - | - | Xóa khóa học không có học viên đăng ký |
| TC-INS-011 | 05_QL nội dung khóa học | FAIL | - | online_learning_collection.json | - | - | Cố gắng xóa khóa học đã có học viên đăng ký |
| TC-INS-012 | 05_QL nội dung khóa học | PASS | - | online_learning_collection.json | - | - | Xuất bản khóa học thành công (có module và bài học) |
| TC-INS-013 | 05_QL nội dung khóa học | FAIL | - | online_learning_collection.json | - | - | Cố gắng xuất bản khóa học chưa có module |
| TC-INS-014 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Tạo khóa học nhóm thành công với đầy đủ thông tin bắt buộc |
| TC-INS-015 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Tạo khóa học nhóm khi thiếu trường bắt buộc |
| TC-INS-016 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Cập nhật khóa học nhóm thành công |
| TC-INS-017 | 05_QL nội dung khóa học | PASS | - | - | - | - | Xóa khóa học nhóm chưa có học viên đăng ký |
| TC-INS-018 | 05_QL nội dung khóa học | PASS | - | - | - | - | Thêm module mới vào khóa học |
| TC-INS-019 | 05_QL nội dung khóa học | PASS | - | - | - | - | Chỉnh sửa module đã tạo |
| TC-INS-020 | 05_QL nội dung khóa học | PASS | - | - | - | - | Thêm bài học video vào module |
| TC-INS-021 | 05_QL nội dung khóa học | PASS | - | - | - | - | Thêm bài học tài liệu (document) vào module |
| TC-INS-022 | 05_QL nội dung khóa học | PASS | - | - | - | - | Tạo Quiz từ file Excel đúng định dạng |
| TC-INS-023 | 05_QL nội dung khóa học | PASS | - | - | - | - | Upload file không phải Excel (.docx) |
| TC-INS-024 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Upload file Excel sai cấu trúc (thiếu cột) |
| TC-INS-025 | 05_QL nội dung khóa học | PASS | - | - | - | - | Chọn danh mục không có khóa học khi tạo bài kiểm tra |
| TC-INS-027 | 05_QL nội dung khóa học | PASS | - | - | - | - | Tạo bài kiểm tra nhưng chưa tải tệp câu hỏi |
| TC-INS-028 | 05_QL nội dung khóa học | PASS | - | - | - | - | Thêm câu hỏi mới vào Quiz đã tạo |
| TC-INS-029 | 05_QL nội dung khóa học | FAIL | - | online_learning_collection.json | - | - | Thêm câu hỏi với ít hơn 4 đáp án |
| TC-INS-030 | 05_QL nội dung khóa học | PASS | - | - | - | - | Vô hiệu hóa  Quiz |
| TC-INS-031 | 05_QL nội dung khóa học | PASS | - | - | - | - | Xem danh sách đánh giá của khóa học |
| TC-INS-032 | 05_QL nội dung khóa học | FAIL | - | - | - | - | Xóa đánh giá vi phạm hoặc không phù hợp |
| TC-INS-033 | 05_QL nội dung khóa học | PASS | - | - | - | - | Xem thống kê doanh thu tổng quan của giảng viên |
| TC-ORDER-001 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | online_learning_perf_test.jmx | enrollment_test_data.csv | Đăng ký thành công khóa học miễn phí |
| TC-ORDER-002 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | - | enrollment_test_data.csv | Cố gắng đăng ký khóa học đã đăng ký trước đó |
| TC-ORDER-003 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | - | enrollment_test_data.csv | Cố gắng đăng ký khi chưa đăng nhập |
| TC-ORDER-004 | 03_Thanh toán_Đăng ký học | PASS | - | - | - | - | Thanh toán thành công qua VNPay |
| TC-ORDER-005 | 03_Thanh toán_Đăng ký học | PASS | - | - | - | - | Thanh toán thất bại trên VNPay |
| TC-ORDER-006 | 03_Thanh toán_Đăng ký học | PASS | - | - | - | - | Callback VNPay với transaction ID trùng lặp (idempotent) |
| TC-ORDER-007 | 03_Thanh toán_Đăng ký học | FAIL | - | online_learning_collection.json | - | - | Khởi tạo thanh toán VNPay cho khóa học có giá quá thấp |
| TC-ORDER-008 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | - | enrollment_test_data.csv | Thêm khóa học vào giỏ hàng |
| TC-ORDER-009 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | - | enrollment_test_data.csv | Xóa khóa học khỏi giỏ hàng |
| TC-ORDER-010 | 03_Thanh toán_Đăng ký học | PASS | - | - | - | - | Thanh toán nhiều khóa học cùng lúc |
| TC-ORDER-011 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | - | - | enrollment_test_data.csv | Thanh toán với giỏ hàng trống |
| TC-ORDER-012 | 03_Thanh toán_Đăng ký học | PASS | test_03_enrollment.py | online_learning_collection.json | - | enrollment_test_data.csv | Xem lịch sử mua hàng khi chưa có đơn hàng thành công |
| TC-ORDER-013 | 03_Thanh toán_Đăng ký học | PASS | - | online_learning_collection.json | - | enrollment_test_data.csv | Xem lịch sử mua hàng khi đã có đơn hàng thành công |
| TC-ORDER-014 | 03_Thanh toán_Đăng ký học | FAIL | test_03_enrollment.py | online_learning_collection.json | - | - | Xem danh sách khóa học đã đăng ký theo tab khóa học độc lập và khóa học nhóm |
| TC-STUDY-001 | 04_Học tập_Quiz_Đánh giá | FAIL | test_04_study_quiz.py | - | - | - | Mở bài học video của khóa học đã đăng ký |
| TC-STUDY-002 | 04_Học tập_Quiz_Đánh giá | PASS | test_04_study_quiz.py | - | - | - | Cập nhật tiến độ học tập sau khi hoàn thành bài học |
| TC-STUDY-003 | 04_Học tập_Quiz_Đánh giá | PASS | test_04_study_quiz.py | - | - | - | Cố gắng xem bài học khi chưa đăng ký khóa học |
| TC-STUDY-004 | 04_Học tập_Quiz_Đánh giá | PENDING | - | - | - | - | Xem bài học của khóa học bị tạm dừng |
| TC-STUDY-005 | 04_Học tập_Quiz_Đánh giá | PASS | test_04_study_quiz.py | - | - | - | Bắt đầu và nộp Quiz thành công với điểm đạt (>=50%) |
| TC-STUDY-006 | 04_Học tập_Quiz_Đánh giá | PASS | - | - | - | - | Nộp Quiz với điểm không đạt (<50%) |
| TC-STUDY-007 | 04_Học tập_Quiz_Đánh giá | PASS | - | - | - | - | Nộp Quiz mà chưa trả lời hết tất cả câu hỏi |
| TC-STUDY-008 | 04_Học tập_Quiz_Đánh giá | FAIL | - | - | - | - | Hết thời gian làm Quiz (timeout) |
| TC-STUDY-009 | 04_Học tập_Quiz_Đánh giá | PASS | test_04_study_quiz.py | - | - | - | Đánh giá khóa học thành công với rating và comment |
| TC-STUDY-010 | 04_Học tập_Quiz_Đánh giá | FAIL | test_04_study_quiz.py | - | - | - | Gửi đánh giá khi chưa nhập nhận xét |
| TC-STUDY-011 | 04_Học tập_Quiz_Đánh giá | PASS | test_04_study_quiz.py | - | - | - | Mở màn đánh giá khóa học hiển thị thống kê, danh sách đánh giá và nút viết đánh giá |
| TC-STUDY-012 | 04_Học tập_Quiz_Đánh giá | FAIL | test_04_study_quiz.py | - | - | - | Xem rating từ Fe |

## Missing Selenium Coverage In UI Scope

TC-AUTH-005, TC-AUTH-007, TC-AUTH-008, TC-AUTH-011, TC-AUTH-013, TC-AUTH-014, TC-AUTH-015, TC-AUTH-016, TC-AUTH-017, TC-AUTH-018, TC-AUTH-022, TC-AUTH-025, TC-AUTH-026, TC-AUTH-027, TC-AUTH-028, TC-COURSE-005, TC-ORDER-004, TC-ORDER-005, TC-ORDER-006, TC-ORDER-007, TC-ORDER-010, TC-ORDER-013, TC-STUDY-004, TC-STUDY-006, TC-STUDY-007, TC-STUDY-008
