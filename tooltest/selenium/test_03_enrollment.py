# Selenium enrollment and cart flows mapped from 13_system_test.xlsx.

import time
import unittest

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By

from base_test import BaseTest
from db_helper import (
    enrollment_exists,
    get_cart_item_count,
    rollback_delete_cart_items,
    rollback_delete_enrollment,
)
from config import FREE_COURSE_ID, LEARNER_EMAIL, LEARNER_PASSWORD, PAID_COURSE_ID


class TestEnrollment(BaseTest):
    def _find_course_primary_action(self, timeout=8):
        """
        Tìm nút chính trên sidebar khóa học.
        Source: CourseSidebarWidget.tsx -> button.bd-btn.btn-primary.w-100
        Các trường hợp: Enroll Free / Buy Now / Pre-order Now
        """
        candidates = [
            # Selector chính xác từ CourseSidebarWidget.tsx
            (By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.bd-btn.btn-primary.w-100"),
            (By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.btn-primary"),
            # Fallback theo text
            (By.XPATH, "//div[contains(@class,'bd-course-sidebar-widget-btn')]//button[contains(@class,'btn-primary')]"),
        ]
        for by, value in candidates:
            if self.element_exists(by, value, timeout=3):
                return self.wait_clickable(by, value, timeout=timeout)
        raise TimeoutException("Could not find course primary action button (bd-btn btn-primary w-100)")

    def _find_course_secondary_action(self, timeout=8):
        """
        Tìm nút 'Thêm vào giỏ hàng' trên sidebar.
        Source: CourseSidebarWidget.tsx -> button.bd-btn.btn-outline-primary.w-100
        Chỉ hiển thị khi course is_free=False và is_pre_order=False.
        """
        candidates = [
            # Selector chính xác từ CourseSidebarWidget.tsx
            (By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.bd-btn.btn-outline-primary.w-100"),
            (By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.btn-outline-primary"),
            # Fallback theo text
            (By.XPATH, "//div[contains(@class,'bd-course-sidebar-widget-btn')]//button[contains(@class,'btn-outline-primary')]"),
        ]
        for by, value in candidates:
            if self.element_exists(by, value, timeout=3):
                return self.wait_clickable(by, value, timeout=timeout)
        raise TimeoutException("Could not find add-to-cart button (bd-btn btn-outline-primary w-100)")

    def _body_text(self) -> str:
        return self.driver.find_element(By.TAG_NAME, "body").text

    def setUp(self):
        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)
        time.sleep(2)

    def tearDown(self):
        try:
            self.logout()
        except Exception:
            pass

    def test_TC_ORDER_001_enroll_free_course(self):
        tc_id = "TC-ORDER-001"
        try:
            if enrollment_exists(LEARNER_EMAIL, FREE_COURSE_ID):
                rollback_delete_enrollment(LEARNER_EMAIL, FREE_COURSE_ID)

            self.go_to(f"course-details/{FREE_COURSE_ID}")
            time.sleep(2)

            enroll_btn = self._find_course_primary_action(timeout=8)
            enroll_btn.click()
            time.sleep(3)

            # Verify: redirect về student-enrolled-courses (CourseSidebarWidget router.push)
            # hoặc hiện alert-success "alreadyEnrolled"
            redirected = "student-enrolled-courses" in self.driver.current_url
            success_alert = self.element_exists(
                By.CSS_SELECTOR, "div.alert.alert-success", timeout=5
            )
            db_enrolled = enrollment_exists(LEARNER_EMAIL, FREE_COURSE_ID)

            ss = self.take_screenshot(tc_id)
            if redirected or success_alert or db_enrolled:
                self.record_result(
                    tc_id,
                    "Đăng ký khóa học miễn phí",
                    "PASS",
                    f"Enrollment created. redirected={redirected}, alert={success_alert}, DB={db_enrolled}",
                    ss,
                    db_check=f"enrollment_exists={db_enrolled}",
                    rollback_note="Enrollment deleted in finally block",
                )
            else:
                self.record_result(
                    tc_id,
                    "Đăng ký khóa học miễn phí",
                    "FAIL",
                    f"No success state. URL={self.driver.current_url}, DB={db_enrolled}",
                    ss,
                )
        finally:
            if enrollment_exists(LEARNER_EMAIL, FREE_COURSE_ID):
                rollback_delete_enrollment(LEARNER_EMAIL, FREE_COURSE_ID)

    def test_TC_ORDER_002_enroll_already_enrolled(self):
        tc_id = "TC-ORDER-002"
        if not enrollment_exists(LEARNER_EMAIL, FREE_COURSE_ID):
            self.go_to(f"course-details/{FREE_COURSE_ID}")
            time.sleep(2)
            try:
                self._find_course_primary_action(timeout=5).click()
                time.sleep(3)
            except Exception:
                pass

        self.go_to(f"course-details/{FREE_COURSE_ID}")
        time.sleep(2)

        # Source: CourseSidebarWidget.tsx -> isEnrolled=true -> div.alert.alert-success + button.btn-success
        already_enrolled = self.element_exists(
            By.CSS_SELECTOR, "div.alert.alert-success", timeout=5
        )
        go_to_course_btn = self.element_exists(
            By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.btn-success.w-100", timeout=3
        )
        ss = self.take_screenshot(tc_id)
        if already_enrolled or go_to_course_btn:
            self.record_result(
                tc_id,
                "Đăng ký khóa học đã đăng ký",
                "PASS",
                f"UI shows enrolled state. alert={already_enrolled}, go_btn={go_to_course_btn}",
                ss,
            )
        else:
            self.record_result(
                tc_id,
                "Đăng ký khóa học đã đăng ký",
                "FAIL",
                "UI does not show enrolled state (alert-success or btn-success not found)",
                ss,
            )

    def test_TC_ORDER_003_enroll_not_logged_in(self):
        tc_id = "TC-ORDER-003"
        self.logout()
        time.sleep(1)

        self.go_to(f"course-details/{FREE_COURSE_ID}")
        time.sleep(2)

        # Source: CourseSidebarWidget.tsx -> disabled={!isLoggedIn}, opacity=0.5, cursor=not-allowed
        # Khi chưa login: nút bị disabled, click sẽ gọi router.push('/sign-in')
        btn_disabled = False
        if self.element_exists(
            By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.bd-btn.btn-primary.w-100", timeout=5
        ):
            btn = self.driver.find_element(
                By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.bd-btn.btn-primary.w-100"
            )
            btn_disabled = not btn.is_enabled() or btn.get_attribute("disabled") is not None

        # Thử click để xem có redirect về sign-in không
        if not btn_disabled:
            try:
                btn = self.driver.find_element(
                    By.CSS_SELECTOR, ".bd-course-sidebar-widget-btn button.bd-btn.btn-primary.w-100"
                )
                btn.click()
                time.sleep(2)
            except Exception:
                pass

        on_login = "sign-in" in self.driver.current_url
        ss = self.take_screenshot(tc_id)
        if on_login or btn_disabled:
            self.record_result(
                tc_id,
                "Đăng ký khi chưa đăng nhập",
                "PASS",
                f"Access blocked. on_login_page={on_login}, btn_disabled={btn_disabled}",
                ss,
            )
        else:
            self.record_result(
                tc_id,
                "Đăng ký khi chưa đăng nhập",
                "FAIL",
                f"Unauthenticated user not blocked. URL={self.driver.current_url}",
                ss,
            )

        self.login(LEARNER_EMAIL, LEARNER_PASSWORD)

    def test_TC_ORDER_008_add_to_cart(self):
        tc_id = "TC-ORDER-008"
        try:
            rollback_delete_cart_items(LEARNER_EMAIL)

            self.go_to(f"course-details/{PAID_COURSE_ID}")
            time.sleep(2)

            cart_before = get_cart_item_count(LEARNER_EMAIL)
            # Source: CourseSidebarWidget.tsx -> button.bd-btn.btn-outline-primary.w-100
            # Chỉ hiển thị khi is_free=False và is_pre_order=False
            add_btn = self._find_course_secondary_action(timeout=8)
            add_btn.click()
            time.sleep(3)

            cart_after = get_cart_item_count(LEARNER_EMAIL)
            toast = self.get_toast_message()

            ss = self.take_screenshot(tc_id)
            if cart_after > cart_before:
                self.record_result(
                    tc_id,
                    "Thêm khóa học vào giỏ hàng",
                    "PASS",
                    f"Cart increased {cart_before} -> {cart_after}. Toast={toast}",
                    ss,
                    db_check=f"cart_before={cart_before}, cart_after={cart_after}",
                    rollback_note="Cart items deleted in finally block",
                )
            else:
                self.record_result(
                    tc_id,
                    "Thêm khóa học vào giỏ hàng",
                    "FAIL",
                    f"Cart did not increase. Before={cart_before}, After={cart_after}. Toast={toast}",
                    ss,
                )
        finally:
            rollback_delete_cart_items(LEARNER_EMAIL)

    def test_TC_ORDER_009_remove_from_cart(self):
        tc_id = "TC-ORDER-009"
        try:
            rollback_delete_cart_items(LEARNER_EMAIL)
            # Thêm vào giỏ trước
            self.go_to(f"course-details/{PAID_COURSE_ID}")
            time.sleep(2)
            self._find_course_secondary_action(timeout=8).click()
            time.sleep(3)

            cart_before = get_cart_item_count(LEARNER_EMAIL)
            self.go_to("cart")
            time.sleep(3)

            # Source: CartMain.tsx -> button.remove-cart-btn (class chính xác)
            remove_btn = self.wait_clickable(
                By.CSS_SELECTOR, "button.remove-cart-btn", timeout=8
            )
            remove_btn.click()
            time.sleep(3)

            cart_after = get_cart_item_count(LEARNER_EMAIL)
            ss = self.take_screenshot(tc_id)
            if cart_after < cart_before:
                self.record_result(
                    tc_id,
                    "Xóa khóa học khỏi giỏ hàng",
                    "PASS",
                    f"Cart decreased {cart_before} -> {cart_after}",
                    ss,
                    db_check=f"cart_before={cart_before}, cart_after={cart_after}",
                    rollback_note="Cart already empty after remove",
                )
            else:
                self.record_result(
                    tc_id,
                    "Xóa khóa học khỏi giỏ hàng",
                    "FAIL",
                    f"Cart did not decrease. Before={cart_before}, After={cart_after}",
                    ss,
                )
        finally:
            rollback_delete_cart_items(LEARNER_EMAIL)

    def test_TC_ORDER_011_checkout_empty_cart(self):
        tc_id = "TC-ORDER-011"
        rollback_delete_cart_items(LEARNER_EMAIL)

        self.go_to("cart")
        time.sleep(3)

        # Source: CartMain.tsx -> cartProducts.length === 0 -> div.empty-text -> h3 "yourCartEmpty"
        empty_state = self.element_exists(By.CSS_SELECTOR, "div.empty-text", timeout=5)

        # Khi giỏ trống, section checkout không render -> không có nút thanh toán
        checkout_section_absent = not self.element_exists(
            By.CSS_SELECTOR, "section.bd-shop-details-area", timeout=3
        )

        ss = self.take_screenshot(tc_id)
        if empty_state or checkout_section_absent:
            self.record_result(
                tc_id,
                "Thanh toán giỏ hàng trống",
                "PASS",
                f"Empty cart state shown. empty_div={empty_state}, no_checkout_section={checkout_section_absent}",
                ss,
            )
        else:
            self.record_result(
                tc_id,
                "Thanh toán giỏ hàng trống",
                "FAIL",
                "Empty cart state not shown correctly",
                ss,
            )

    def test_TC_ORDER_012_view_empty_order_history(self):
        tc_id = "TC-ORDER-012"
        self.go_to("student-orders")
        time.sleep(3)

        body_text = self._body_text().lower()
        no_error = "error" not in body_text and "500" not in body_text
        ss = self.take_screenshot(tc_id)
        if no_error:
            self.record_result(
                tc_id,
                "Xem lịch sử mua hàng",
                "PASS",
                "Order history page loaded without server error",
                ss,
            )
        else:
            self.record_result(
                tc_id,
                "Xem lịch sử mua hàng",
                "FAIL",
                "Order history page shows error state",
                ss,
            )

    def test_TC_ORDER_014_view_enrolled_courses_tabs(self):
        tc_id = "TC-ORDER-014"
        self.go_to("student-enrolled-courses")
        time.sleep(4)

        # Source: InstructorCoursesMain.tsx -> Tabs với key "independent" và "group"
        # Tab labels từ i18n: t('independentCourses') và t('groupCourses')
        # Tìm theo ant-tabs hoặc text
        tab_independent = self.element_exists(
            By.XPATH,
            "//*[contains(@class,'ant-tabs-tab') and (contains(.,'Khóa học độc lập') or contains(.,'Standalone') or contains(.,'Independent'))]",
            timeout=5,
        )
        tab_group = self.element_exists(
            By.XPATH,
            "//*[contains(@class,'ant-tabs-tab') and (contains(.,'Chương trình') or contains(.,'Group') or contains(.,'Program'))]",
            timeout=5,
        )

        # Click tab nhóm và kiểm tra không có lỗi
        group_tab_loads = False
        if tab_group:
            try:
                group_tab_el = self.driver.find_element(
                    By.XPATH,
                    "//*[contains(@class,'ant-tabs-tab') and (contains(.,'Chương trình') or contains(.,'Group') or contains(.,'Program'))]",
                )
                group_tab_el.click()
                time.sleep(2)
                # KNOWN FAIL: tab nhóm không load dữ liệu (từ system test)
                no_error = not self.element_exists(
                    By.XPATH, "//*[contains(text(),'Error') or contains(text(),'500')]", timeout=3
                )
                group_tab_loads = no_error
            except Exception:
                group_tab_loads = False

        ss = self.take_screenshot(tc_id)
        # KNOWN FAIL: tab nhóm không load dữ liệu
        if tab_independent and tab_group and group_tab_loads:
            self.record_result(
                tc_id,
                "Xem danh sách khóa học đã đăng ký theo tab",
                "PASS",
                "Both tabs visible and load without error",
                ss,
            )
        else:
            self.record_result(
                tc_id,
                "Xem danh sách khóa học đã đăng ký theo tab",
                "FAIL",
                f"KNOWN FAIL: tab_independent={tab_independent}, tab_group={tab_group}, group_loads={group_tab_loads}. Tab nhóm không load dữ liệu.",
                ss,
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
