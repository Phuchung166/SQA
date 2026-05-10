# ============================================================
# test_02_course_explore.py
# Covers: TC-COURSE-001 to TC-COURSE-006
# Mapping từ 13_system_test.xlsx sheet 02_Khám phá khóa học
# ============================================================
import time
import unittest
from selenium.webdriver.common.by import By

from base_test import BaseTest
from db_helper import get_course_status
from config import LEARNER_EMAIL, LEARNER_PASSWORD, FREE_COURSE_ID, COURSE_GROUP_ID


class TestCourseExplore(BaseTest):
    """
    Sheet 02_Khám phá khóa học
    Tính năng: Tìm kiếm, Xem chi tiết khóa học, Xem chi tiết khóa học nhóm
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Login một lần cho cả class
        cls.driver.get(f"http://127.0.0.1:3000/vi/sign-in")
        time.sleep(1)
        cls.driver.find_element(By.NAME, "email").send_keys(LEARNER_EMAIL)
        cls.driver.find_element(By.NAME, "password").send_keys(LEARNER_PASSWORD)
        cls.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(3)

    def test_TC_COURSE_001_search_existing_keyword(self):
        """TC-COURSE-001: Tìm kiếm khóa học với từ khóa tồn tại."""
        tc_id = "TC-COURSE-001"
        self.go_to("courses-filter-search?keyword=Spring+Boot")
        time.sleep(2)

        # Verify: có kết quả hiển thị
        has_results = self.element_exists(
            By.CSS_SELECTOR,
            ".bd-course-wrapper, .course-card, [class*='course-item']",
            timeout=8
        )
        # Verify: không hiển thị "không tìm thấy"
        no_empty_msg = not self.element_exists(
            By.XPATH,
            "//*[contains(text(),'Không tìm thấy') or contains(text(),'No result')]",
            timeout=3
        )
        ss = self.take_screenshot(tc_id)
        if has_results and no_empty_msg:
            self.record_result(tc_id, "Tìm kiếm từ khóa tồn tại 'Spring Boot'",
                               "PASS", "Hiển thị danh sách khóa học liên quan", ss)
        else:
            self.record_result(tc_id, "Tìm kiếm từ khóa tồn tại 'Spring Boot'",
                               "FAIL", f"has_results={has_results}", ss)

    def test_TC_COURSE_002_search_nonexistent_keyword(self):
        """TC-COURSE-002: Tìm kiếm từ khóa không tồn tại."""
        tc_id = "TC-COURSE-002"
        self.go_to("courses-filter-search?keyword=xyznonexistentcourse123")
        time.sleep(2)

        # Expect: hiển thị thông báo không tìm thấy
        empty_msg = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'Không tìm thấy') or contains(text(),'No result') or contains(text(),'không có')]",
            timeout=5
        )
        # Known FAIL: FE render trống không có thông báo
        ss = self.take_screenshot(tc_id)
        if empty_msg:
            self.record_result(tc_id, "Tìm kiếm từ khóa không tồn tại",
                               "PASS", "Hiển thị thông báo không tìm thấy", ss)
        else:
            self.record_result(tc_id, "Tìm kiếm từ khóa không tồn tại",
                               "FAIL", "Không hiển thị thông báo - FE render trống", ss)

    def test_TC_COURSE_003_view_course_detail(self):
        """TC-COURSE-003: Xem chi tiết khóa học tồn tại."""
        tc_id = "TC-COURSE-003"
        self.go_to(f"course-details/{FREE_COURSE_ID}")
        time.sleep(2)

        # Verify: hiển thị tiêu đề, mô tả, instructor
        has_title = self.element_exists(By.CSS_SELECTOR, "h1, h2, .course-title, [class*='title']", timeout=5)
        has_instructor = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'Giảng viên') or contains(text(),'Instructor')]",
            timeout=5
        )
        has_enroll_btn = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'Đăng ký') or contains(text(),'Enroll') or contains(text(),'Mua')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if has_title and (has_instructor or has_enroll_btn):
            self.record_result(tc_id, "Xem chi tiết khóa học tồn tại",
                               "PASS", "Hiển thị đầy đủ thông tin khóa học", ss)
        else:
            self.record_result(tc_id, "Xem chi tiết khóa học tồn tại",
                               "FAIL", f"title={has_title}, instructor={has_instructor}", ss)

    def test_TC_COURSE_004_view_nonexistent_course(self):
        """TC-COURSE-004: Xem khóa học với ID không tồn tại."""
        tc_id = "TC-COURSE-004"
        self.go_to("course-details/99999")
        time.sleep(2)

        # Expect: 404 hoặc thông báo không tồn tại
        not_found = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'404') or contains(text(),'không tồn tại') or contains(text(),'Not Found') or contains(text(),'not found')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if not_found:
            self.record_result(tc_id, "Xem khóa học ID không tồn tại",
                               "PASS", "Hiển thị 404 hoặc thông báo không tồn tại", ss)
        else:
            self.record_result(tc_id, "Xem khóa học ID không tồn tại",
                               "FAIL", "Không hiển thị thông báo lỗi phù hợp", ss)

    def test_TC_COURSE_006_view_course_group_detail(self):
        """TC-COURSE-006: Xem chi tiết khóa học nhóm."""
        tc_id = "TC-COURSE-006"
        self.go_to(f"course-program/{COURSE_GROUP_ID}")
        time.sleep(2)

        has_title = self.element_exists(By.CSS_SELECTOR, "h1, h2, [class*='title']", timeout=5)
        has_courses = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'khóa học') or contains(text(),'course') or contains(text(),'Courses')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if has_title and has_courses:
            self.record_result(tc_id, "Xem chi tiết khóa học nhóm",
                               "PASS", "Hiển thị thông tin khóa học nhóm và danh sách khóa học", ss)
        else:
            self.record_result(tc_id, "Xem chi tiết khóa học nhóm",
                               "FAIL", f"title={has_title}, courses={has_courses}", ss)


if __name__ == "__main__":
    unittest.main(verbosity=2)
