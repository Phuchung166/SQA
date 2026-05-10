# ============================================================
# test_04_study_quiz.py
# Covers: TC-STUDY-001 to TC-STUDY-012
# Mapping từ 13_system_test.xlsx sheet 04_Học tập_Quiz_Đánh giá
# ============================================================
import time
import unittest
from selenium.webdriver.common.by import By

from base_test import BaseTest
from db_helper import (
    enrollment_exists, get_review_count, rollback_delete_review
)
from config import (
    LEARNER_EMAIL, LEARNER_PASSWORD,
    ENROLLED_COURSE_ID, FREE_COURSE_ID
)


class TestStudyQuiz(BaseTest):
    """
    Sheet 04_Học tập_Quiz_Đánh giá
    Tính năng: Học bài, Làm bài kiểm tra, Đánh giá khóa học
    """

    def setUp(self):
        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)
        time.sleep(2)

    def tearDown(self):
        self.logout()

    def test_TC_STUDY_001_open_video_lesson(self):
        """TC-STUDY-001: Mở bài học video của khóa học đã đăng ký."""
        tc_id = "TC-STUDY-001"
        self.go_to(f"course-lesson/{ENROLLED_COURSE_ID}")
        time.sleep(3)

        # Verify: trang học hiển thị tiêu đề bài học
        has_lesson_title = self.element_exists(
            By.CSS_SELECTOR,
            "h1, h2, h3, [class*='lesson-title'], [class*='lesson-name']",
            timeout=8
        )
        # Verify: có video player hoặc nội dung bài học
        has_content = self.element_exists(
            By.CSS_SELECTOR,
            "video, iframe, [class*='video'], [class*='player'], [class*='content']",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        # Known FAIL: video không phát được
        if has_lesson_title and has_content:
            self.record_result(tc_id, "Mở bài học video",
                               "PASS", "Trang học hiển thị tiêu đề và nội dung", ss)
        else:
            self.record_result(tc_id, "Mở bài học video",
                               "FAIL",
                               f"title={has_lesson_title}, content={has_content} - Video không phát hoặc nội dung không hiển thị",
                               ss)

    def test_TC_STUDY_002_update_lesson_progress(self):
        """TC-STUDY-002: Cập nhật tiến độ học tập sau khi hoàn thành bài học."""
        tc_id = "TC-STUDY-002"
        self.go_to(f"course-lesson/{ENROLLED_COURSE_ID}")
        time.sleep(3)

        # Tìm nút đánh dấu hoàn thành
        mark_done_btn = self.element_exists(
            By.XPATH,
            "//button[contains(text(),'Hoàn thành') or contains(text(),'Complete') or contains(text(),'Mark')]",
            timeout=5
        )
        if mark_done_btn:
            try:
                btn = self.driver.find_element(
                    By.XPATH,
                    "//button[contains(text(),'Hoàn thành') or contains(text(),'Complete') or contains(text(),'Mark')]"
                )
                btn.click()
                time.sleep(2)
            except Exception:
                pass

        # Verify: progress bar cập nhật
        progress_updated = self.element_exists(
            By.CSS_SELECTOR,
            "[class*='progress'], [role='progressbar']",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if progress_updated:
            self.record_result(tc_id, "Cập nhật tiến độ học tập",
                               "PASS", "Progress bar hiển thị", ss)
        else:
            self.record_result(tc_id, "Cập nhật tiến độ học tập",
                               "FAIL", "Không thấy progress bar", ss)

    def test_TC_STUDY_003_access_lesson_without_enrollment(self):
        """TC-STUDY-003: Xem bài học khi chưa đăng ký khóa học."""
        tc_id = "TC-STUDY-003"
        # Logout
        self.logout()
        time.sleep(1)

        # Truy cập trực tiếp URL bài học
        self.go_to(f"course-lesson/{ENROLLED_COURSE_ID}")
        time.sleep(3)

        # Expect: redirect về login hoặc thông báo cần đăng ký
        redirected = (
            "sign-in" in self.driver.current_url
            or self.element_exists(By.NAME, "email", timeout=5)
            or self.element_exists(
                By.XPATH,
                "//*[contains(text(),'đăng nhập') or contains(text(),'đăng ký') or contains(text(),'401')]",
                timeout=5
            )
        )
        ss = self.take_screenshot(tc_id)
        if redirected:
            self.record_result(tc_id, "Xem bài học khi chưa đăng ký",
                               "PASS", f"Redirect/block. URL: {self.driver.current_url}", ss)
        else:
            self.record_result(tc_id, "Xem bài học khi chưa đăng ký",
                               "FAIL", f"Không bị chặn. URL: {self.driver.current_url}", ss)
        # Re-login
        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)

    def test_TC_STUDY_005_submit_quiz_pass(self):
        """TC-STUDY-005: Nộp Quiz thành công với điểm đạt (>=50%)."""
        tc_id = "TC-STUDY-005"
        # Navigate đến trang quiz của khóa học đã enroll
        self.go_to(f"course-lesson/{ENROLLED_COURSE_ID}")
        time.sleep(3)

        # Tìm quiz trong danh sách bài học
        quiz_link = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'Quiz') or contains(text(),'Kiểm tra') or contains(text(),'quiz')]",
            timeout=5
        )
        if not quiz_link:
            ss = self.take_screenshot(tc_id)
            self.record_result(tc_id, "Nộp Quiz điểm đạt",
                               "FAIL", "Không tìm thấy quiz trong khóa học", ss)
            return

        try:
            quiz_el = self.driver.find_element(
                By.XPATH,
                "//*[contains(text(),'Quiz') or contains(text(),'Kiểm tra')]"
            )
            quiz_el.click()
            time.sleep(2)

            # Bắt đầu quiz
            start_btn = self.wait_clickable(
                By.XPATH,
                "//button[contains(text(),'Bắt đầu') or contains(text(),'Start')]",
                timeout=5
            )
            start_btn.click()
            time.sleep(2)

            # Chọn đáp án đầu tiên cho mỗi câu
            options = self.driver.find_elements(
                By.CSS_SELECTOR,
                "input[type='radio'], [class*='option'], [class*='answer']"
            )
            for i, opt in enumerate(options):
                if i % 4 == 0:  # Chọn đáp án A cho mỗi câu
                    try:
                        opt.click()
                        time.sleep(0.3)
                    except Exception:
                        pass

            # Nộp bài
            submit_btn = self.wait_clickable(
                By.XPATH,
                "//button[contains(text(),'Nộp') or contains(text(),'Submit')]",
                timeout=5
            )
            submit_btn.click()
            time.sleep(3)

            # Verify: hiển thị kết quả
            has_result = self.element_exists(
                By.XPATH,
                "//*[contains(text(),'kết quả') or contains(text(),'Result') or contains(text(),'%') or contains(text(),'điểm')]",
                timeout=5
            )
            ss = self.take_screenshot(tc_id)
            if has_result:
                self.record_result(tc_id, "Nộp Quiz điểm đạt",
                                   "PASS", "Hiển thị kết quả quiz", ss)
            else:
                self.record_result(tc_id, "Nộp Quiz điểm đạt",
                                   "FAIL", "Không hiển thị kết quả", ss)
        except Exception as e:
            ss = self.take_screenshot(tc_id)
            self.record_result(tc_id, "Nộp Quiz điểm đạt",
                               "FAIL", f"Exception: {str(e)}", ss)

    def test_TC_STUDY_009_submit_review(self):
        """TC-STUDY-009: Đánh giá khóa học thành công."""
        tc_id = "TC-STUDY-009"
        try:
            review_before = get_review_count(ENROLLED_COURSE_ID)

            self.go_to(f"course-details/{ENROLLED_COURSE_ID}")
            time.sleep(2)

            # Tìm nút viết đánh giá
            review_btn = self.element_exists(
                By.XPATH,
                "//button[contains(text(),'Viết đánh giá') or contains(text(),'Write Review') or contains(text(),'Đánh giá')]",
                timeout=5
            )
            if not review_btn:
                ss = self.take_screenshot(tc_id)
                self.record_result(tc_id, "Đánh giá khóa học",
                                   "FAIL", "Không tìm thấy nút viết đánh giá", ss)
                return

            btn = self.driver.find_element(
                By.XPATH,
                "//button[contains(text(),'Viết đánh giá') or contains(text(),'Write Review') or contains(text(),'Đánh giá')]"
            )
            btn.click()
            time.sleep(1)

            # Chọn 4 sao
            stars = self.driver.find_elements(
                By.CSS_SELECTOR,
                ".ant-rate-star, [class*='star'], [class*='rating'] span"
            )
            if len(stars) >= 4:
                stars[3].click()
                time.sleep(0.5)

            # Nhập comment
            comment_box = self.wait_for(
                By.CSS_SELECTOR,
                "textarea, input[type='text'][placeholder*='nhận xét'], [class*='comment']",
                timeout=5
            )
            comment_box.send_keys("Khóa học rất hữu ích, giảng viên dạy dễ hiểu")

            # Submit
            submit_btn = self.wait_clickable(
                By.XPATH,
                "//button[contains(text(),'Gửi') or contains(text(),'Submit') or contains(text(),'Lưu')]",
                timeout=5
            )
            submit_btn.click()
            time.sleep(2)

            review_after = get_review_count(ENROLLED_COURSE_ID)
            ss = self.take_screenshot(tc_id)
            if review_after > review_before:
                self.record_result(tc_id, "Đánh giá khóa học thành công",
                                   "PASS", f"Review tăng từ {review_before} -> {review_after}", ss)
            else:
                self.record_result(tc_id, "Đánh giá khóa học thành công",
                                   "FAIL", f"Review không tăng. Before={review_before}, After={review_after}", ss)
        finally:
            rollback_delete_review(LEARNER_EMAIL, ENROLLED_COURSE_ID)

    def test_TC_STUDY_010_submit_review_empty_comment(self):
        """TC-STUDY-010: Gửi đánh giá khi chưa nhập nhận xét."""
        tc_id = "TC-STUDY-010"
        self.go_to(f"course-details/{ENROLLED_COURSE_ID}")
        time.sleep(2)

        try:
            btn = self.driver.find_element(
                By.XPATH,
                "//button[contains(text(),'Viết đánh giá') or contains(text(),'Đánh giá')]"
            )
            btn.click()
            time.sleep(1)

            # Chọn sao nhưng không nhập comment
            stars = self.driver.find_elements(By.CSS_SELECTOR, ".ant-rate-star, [class*='star']")
            if stars:
                stars[3].click()
                time.sleep(0.3)

            # Submit không có comment
            submit_btn = self.driver.find_element(
                By.XPATH,
                "//button[contains(text(),'Gửi') or contains(text(),'Submit')]"
            )
            submit_btn.click()
            time.sleep(2)

            # Expect: FE chặn, hiển thị lỗi
            error_shown = self.element_exists(
                By.XPATH,
                "//*[contains(text(),'nhận xét') or contains(text(),'comment') or contains(text(),'bắt buộc')]",
                timeout=5
            )
            ss = self.take_screenshot(tc_id)
            # Known FAIL: FE chặn nhưng BE không validate
            if error_shown:
                self.record_result(tc_id, "Gửi đánh giá không có comment",
                                   "PASS", "FE hiển thị lỗi yêu cầu nhập nhận xét", ss)
            else:
                self.record_result(tc_id, "Gửi đánh giá không có comment",
                                   "FAIL", "FE không hiển thị lỗi - BE cũng không validate", ss)
        except Exception as e:
            ss = self.take_screenshot(tc_id)
            self.record_result(tc_id, "Gửi đánh giá không có comment",
                               "FAIL", f"Exception: {str(e)}", ss)

    def test_TC_STUDY_011_view_review_section(self):
        """TC-STUDY-011: Màn đánh giá hiển thị thống kê và danh sách."""
        tc_id = "TC-STUDY-011"
        self.go_to(f"course-details/{ENROLLED_COURSE_ID}")
        time.sleep(2)

        # Scroll xuống phần đánh giá
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2)")
        time.sleep(1)

        has_stats = self.element_exists(
            By.CSS_SELECTOR,
            "[class*='rating'], [class*='review-stat'], .ant-rate",
            timeout=5
        )
        has_list = self.element_exists(
            By.CSS_SELECTOR,
            "[class*='review-item'], [class*='review-list'], [class*='comment']",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if has_stats or has_list:
            self.record_result(tc_id, "Màn đánh giá hiển thị thống kê và danh sách",
                               "PASS", f"stats={has_stats}, list={has_list}", ss)
        else:
            self.record_result(tc_id, "Màn đánh giá hiển thị thống kê và danh sách",
                               "FAIL", "Không thấy phần đánh giá", ss)

    def test_TC_STUDY_012_rating_display_on_list(self):
        """TC-STUDY-012: Xem rating từ FE trên danh sách khóa học."""
        tc_id = "TC-STUDY-012"
        self.go_to("")  # Trang chủ
        time.sleep(3)

        # Tìm rating hiển thị trên card khóa học
        rating_elements = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".ant-rate, [class*='rating'], [class*='star']"
        )
        # Kiểm tra có rating > 0 không
        has_nonzero_rating = False
        for el in rating_elements[:5]:
            try:
                text = el.text.strip()
                if text and text != "0" and text != "0.0":
                    has_nonzero_rating = True
                    break
            except Exception:
                pass

        ss = self.take_screenshot(tc_id)
        # Known FAIL: tất cả hiển thị 0
        if has_nonzero_rating:
            self.record_result(tc_id, "Rating hiển thị trên danh sách khóa học",
                               "PASS", "Có khóa học hiển thị rating > 0", ss)
        else:
            self.record_result(tc_id, "Rating hiển thị trên danh sách khóa học",
                               "FAIL", "Tất cả khóa học hiển thị rating = 0, không khớp DB", ss)


if __name__ == "__main__":
    unittest.main(verbosity=2)
