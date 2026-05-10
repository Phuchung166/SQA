# ============================================================
# test_01_auth.py
# Covers: TC-AUTH-001 to TC-AUTH-029
# Mapping từ 13_system_test.xlsx sheet 01_Xác thực
# ============================================================
import csv
import time
import unittest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from base_test import BaseTest
from db_helper import (
    user_exists, rollback_delete_user,
    enrollment_exists
)
from config import LEARNER_EMAIL, LEARNER_PASSWORD, LEARNER_BASE_URL


class TestAuth(BaseTest):
    """
    Sheet 01_Xác thực
    Tính năng: Đăng ký, Xác thực OTP, Đăng nhập, Quên mật khẩu, Đăng xuất
    """

    # ================================================================
    # ĐĂNG KÝ
    # ================================================================

    def _fill_register_form(self, username: str, email: str, password: str):
        """Helper: điền form đăng ký."""
        self.go_to("sign-up")
        time.sleep(1)
        # Username field
        if self.element_exists(By.NAME, "account_name", timeout=3):
            un = self.driver.find_element(By.NAME, "account_name")
        else:
            un = self.wait_for(By.NAME, "accountName")
        un.clear(); un.send_keys(username)
        # Email field
        em = self.driver.find_element(By.NAME, "email")
        em.clear(); em.send_keys(email)
        # Password field
        pw = self.driver.find_element(By.NAME, "password")
        pw.clear(); pw.send_keys(password)
        # Submit
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)

    def test_TC_AUTH_001_register_success(self):
        """TC-AUTH-001: Đăng ký thành công với dữ liệu hợp lệ."""
        tc_id = "TC-AUTH-001"
        email = "tc_auth_001_test@gmail.com"
        try:
            # Pre-check: xóa nếu đã tồn tại
            if user_exists(email):
                rollback_delete_user(email)

            self._fill_register_form("tcauth001", email, "Test@1234")

            # Verify: chuyển sang trang OTP hoặc hiện thông báo thành công
            success = (
                self.element_exists(By.CSS_SELECTOR, "[class*='otp'], [class*='verify'], input[maxlength='1']", timeout=5)
                or self.element_exists(By.XPATH, "//*[contains(text(),'xác thực') or contains(text(),'OTP') or contains(text(),'thành công')]", timeout=5)
            )

            # DB check
            db_ok = user_exists(email)

            ss = self.take_screenshot(tc_id)
            if success or db_ok:
                self.record_result(tc_id, "Đăng ký thành công với dữ liệu hợp lệ",
                                   "PASS", f"User tạo thành công. DB={db_ok}", ss)
            else:
                self.record_result(tc_id, "Đăng ký thành công với dữ liệu hợp lệ",
                                   "FAIL", "Không thấy trang OTP hoặc thông báo thành công", ss)
                self.fail("TC-AUTH-001 FAIL")
        finally:
            # Rollback
            if user_exists(email):
                rollback_delete_user(email)

    def test_TC_AUTH_002_register_username_too_short(self):
        """TC-AUTH-002: Đăng ký với username quá ngắn (4 ký tự)."""
        tc_id = "TC-AUTH-002"
        self._fill_register_form("abcd", "tc002@gmail.com", "Test@1234")

        # Expect: thông báo lỗi validation
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'5') or contains(text(),'tối thiểu') or contains(text(),'ký tự')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        # Known FAIL: FE không chặn đúng (từ system test)
        if error_shown:
            self.record_result(tc_id, "Đăng ký username quá ngắn (4 ký tự)",
                               "PASS", "Hiển thị thông báo lỗi validation", ss)
        else:
            self.record_result(tc_id, "Đăng ký username quá ngắn (4 ký tự)",
                               "FAIL", "Không hiển thị thông báo lỗi - FE không validate username length", ss)

    def test_TC_AUTH_003_register_username_min_boundary(self):
        """TC-AUTH-003: Đăng ký username đúng 5 ký tự (biên hợp lệ)."""
        tc_id = "TC-AUTH-003"
        email = "tc_auth_003@gmail.com"
        try:
            if user_exists(email):
                rollback_delete_user(email)
            self._fill_register_form("admin", email, "Test@1234")
            db_ok = user_exists(email)
            ss = self.take_screenshot(tc_id)
            if db_ok:
                self.record_result(tc_id, "Đăng ký username 5 ký tự (biên hợp lệ)",
                                   "PASS", "User được tạo thành công", ss)
            else:
                self.record_result(tc_id, "Đăng ký username 5 ký tự (biên hợp lệ)",
                                   "FAIL", "User không được tạo", ss)
        finally:
            if user_exists(email):
                rollback_delete_user(email)

    def test_TC_AUTH_004_register_username_too_long(self):
        """TC-AUTH-004: Đăng ký username 21 ký tự (vượt tối đa 20)."""
        tc_id = "TC-AUTH-004"
        self._fill_register_form("abcdefghijklmnopqrstu", "tc004@gmail.com", "Test@1234")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'20') or contains(text(),'tối đa') or contains(text(),'ký tự')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        if error_shown:
            self.record_result(tc_id, "Đăng ký username 21 ký tự (vượt tối đa)",
                               "PASS", "Hiển thị thông báo lỗi", ss)
        else:
            self.record_result(tc_id, "Đăng ký username 21 ký tự (vượt tối đa)",
                               "FAIL", "Không hiển thị thông báo lỗi", ss)

    def test_TC_AUTH_006_register_email_no_at(self):
        """TC-AUTH-006: Đăng ký email không có @."""
        tc_id = "TC-AUTH-006"
        self._fill_register_form("validuser6", "invalidemail", "Test@1234")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'email') or contains(text(),'định dạng') or contains(text(),'@')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi email" if error_shown else "Không hiển thị lỗi email"
        self.record_result(tc_id, "Đăng ký email không có @", status, actual, ss)

    def test_TC_AUTH_009_register_duplicate_email(self):
        """TC-AUTH-009: Đăng ký email đã tồn tại."""
        tc_id = "TC-AUTH-009"
        # Dùng email đã seed sẵn
        self._fill_register_form("newuser009", LEARNER_EMAIL, "Test@1234")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'đã') or contains(text(),'tồn tại') or contains(text(),'used') or contains(text(),'exist')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi email đã tồn tại" if error_shown else "Không hiển thị lỗi"
        self.record_result(tc_id, "Đăng ký email đã tồn tại", status, actual, ss)

    def test_TC_AUTH_010_register_password_too_short(self):
        """TC-AUTH-010: Đăng ký password 7 ký tự (dưới tối thiểu 8)."""
        tc_id = "TC-AUTH-010"
        self._fill_register_form("validuser10", "tc010@gmail.com", "abc1234")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'8') or contains(text(),'mật khẩu') or contains(text(),'password')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        # Known FAIL từ system test
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi password" if error_shown else "FE không validate password length"
        self.record_result(tc_id, "Đăng ký password 7 ký tự", status, actual, ss)

    def test_TC_AUTH_012_register_all_empty(self):
        """TC-AUTH-012: Đăng ký với tất cả trường để trống."""
        tc_id = "TC-AUTH-012"
        self.go_to("sign-up")
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'bắt buộc') or contains(text(),'required') or contains(text(),'nhập')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi required" if error_shown else "Không hiển thị lỗi"
        self.record_result(tc_id, "Đăng ký tất cả trường trống", status, actual, ss)

    # ================================================================
    # ĐĂNG NHẬP
    # ================================================================

    def test_TC_AUTH_019_login_success(self):
        """TC-AUTH-019: Đăng nhập thành công."""
        tc_id = "TC-AUTH-019"
        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)
        # Verify: redirect về trang chủ, thấy avatar/tên user
        logged_in = self.element_exists(
            By.CSS_SELECTOR,
            ".bd-user-avatar-btn, .user-avatar-img, .user-avatar-placeholder, .user-name, [data-testid='user-menu'], .avatar",
            timeout=8
        )
        ss = self.take_screenshot(tc_id)
        if logged_in:
            self.record_result(tc_id, "Đăng nhập thành công",
                               "PASS", "Redirect về trang chủ, thấy avatar user", ss)
        else:
            self.record_result(tc_id, "Đăng nhập thành công",
                               "FAIL", "Không thấy avatar sau đăng nhập", ss)
        # Logout để clean state
        self.logout()

    def test_TC_AUTH_020_login_wrong_password(self):
        """TC-AUTH-020: Đăng nhập sai password."""
        tc_id = "TC-AUTH-020"
        self.login(LEARNER_EMAIL, "wrongpassword123")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'không đúng') or contains(text(),'sai') or contains(text(),'invalid') or contains(text(),'incorrect')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        # Known FAIL từ system test
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi sai mật khẩu" if error_shown else "Không hiển thị lỗi"
        self.record_result(tc_id, "Đăng nhập sai password", status, actual, ss)

    def test_TC_AUTH_021_login_nonexistent_email(self):
        """TC-AUTH-021: Đăng nhập email không tồn tại."""
        tc_id = "TC-AUTH-021"
        self.login("notexist_xyz@gmail.com", "Test@1234")
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'không đúng') or contains(text(),'không tồn tại') or contains(text(),'not found')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        # Known FAIL từ system test (BE trả 404 thay vì thông báo chung)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi" if error_shown else "Không hiển thị lỗi phù hợp (BE trả 404)"
        self.record_result(tc_id, "Đăng nhập email không tồn tại", status, actual, ss)

    def test_TC_AUTH_023_login_empty_email(self):
        """TC-AUTH-023: Đăng nhập không nhập email."""
        tc_id = "TC-AUTH-023"
        self.go_to("sign-in")
        time.sleep(1)
        pw = self.wait_for(By.NAME, "password")
        pw.send_keys("Test@1234")
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'email') or contains(text(),'bắt buộc') or contains(text(),'required')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi email bắt buộc" if error_shown else "Không hiển thị lỗi"
        self.record_result(tc_id, "Đăng nhập không nhập email", status, actual, ss)

    def test_TC_AUTH_024_login_empty_password(self):
        """TC-AUTH-024: Đăng nhập không nhập password."""
        tc_id = "TC-AUTH-024"
        self.go_to("sign-in")
        time.sleep(1)
        em = self.wait_for(By.NAME, "email")
        em.send_keys(LEARNER_EMAIL)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        error_shown = self.element_exists(
            By.XPATH,
            "//*[contains(text(),'mật khẩu') or contains(text(),'password') or contains(text(),'bắt buộc')]",
            timeout=5
        )
        ss = self.take_screenshot(tc_id)
        status = "PASS" if error_shown else "FAIL"
        actual = "Hiển thị lỗi password bắt buộc" if error_shown else "Không hiển thị lỗi"
        self.record_result(tc_id, "Đăng nhập không nhập password", status, actual, ss)

    # ================================================================
    # ĐĂNG XUẤT
    # ================================================================

    def test_TC_AUTH_029_logout_success(self):
        """TC-AUTH-029: Đăng xuất thành công."""
        tc_id = "TC-AUTH-029"
        # Login trước
        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)
        time.sleep(2)

        # Logout
        self.logout()
        time.sleep(2)

        # Verify: redirect về trang login hoặc trang chủ, không còn avatar
        on_login_page = (
            self.element_exists(By.NAME, "email", timeout=5)
            or "sign-in" in self.driver.current_url
            or not self.element_exists(By.CSS_SELECTOR, ".user-avatar, .bd-user-avatar", timeout=3)
        )
        ss = self.take_screenshot(tc_id)
        if on_login_page:
            self.record_result(tc_id, "Đăng xuất thành công",
                               "PASS", "Redirect về trang login, không còn session", ss)
        else:
            self.record_result(tc_id, "Đăng xuất thành công",
                               "FAIL", "Vẫn còn session sau đăng xuất", ss)


if __name__ == "__main__":
    unittest.main(verbosity=2)
