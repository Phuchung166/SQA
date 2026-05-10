import html
import os
import time
import unittest
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from config import (
    ADMIN_BASE_URL,
    HEADLESS,
    IMPLICIT_WAIT,
    LEARNER_BASE_URL,
    PAGE_LOAD_TIMEOUT,
    REPORT_DIR,
)
from test_case_registry import get_scope_cases, get_test_case


SELENIUM_SCOPE_PREFIXES = ("TC-AUTH-", "TC-COURSE-", "TC-ORDER-", "TC-STUDY-")
REPORT_PATH = (Path(__file__).resolve().parent / REPORT_DIR).resolve()


def _safe_text(value: str) -> str:
    return html.escape(value or "").replace("\n", "<br>")


class BaseTest(unittest.TestCase):
    """Shared Selenium setup, helpers, and HTML reporting."""

    driver: webdriver.Chrome = None
    results = []
    all_results = []

    @classmethod
    def setUpClass(cls):
        options = Options()
        if HEADLESS:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])

        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(IMPLICIT_WAIT)
        cls.driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
        cls.results = []

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()
        cls._generate_report()

    def go_to(self, path: str = ""):
        self.driver.get(f"{LEARNER_BASE_URL}/{path}".rstrip("/"))

    def go_to_admin(self, path: str = ""):
        self.driver.get(f"{ADMIN_BASE_URL}/{path}".rstrip("/"))

    def wait_for(self, by, value, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )

    def wait_clickable(self, by, value, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )

    def wait_visible(self, by, value, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, value))
        )

    def wait_text_in(self, by, value, text, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.text_to_be_present_in_element((by, value), text)
        )

    def element_exists(self, by, value, timeout=5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def login(self, email: str, password: str):
        self.go_to("sign-in")
        self.wait_for(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)

    def logout(self):
        try:
            avatar = self.wait_clickable(
                By.CSS_SELECTOR,
                ".bd-user-avatar-btn, .user-avatar-img, .user-avatar-placeholder, .user-name, [data-testid='user-menu']",
                timeout=5,
            )
            avatar.click()
            time.sleep(0.5)
            logout_button = self.wait_clickable(
                By.XPATH,
                "//*[contains(text(),'Dang xuat') or contains(text(),'Logout') or contains(text(),'Sign out') or contains(text(),'Đăng xuất')]",
                timeout=5,
            )
            logout_button.click()
            time.sleep(1)
        except Exception:
            self.driver.delete_all_cookies()
            self.driver.refresh()

    def get_toast_message(self, timeout=5) -> str:
        selectors = [
            ".ant-notification-notice-message",
            ".ant-message-notice-content",
            "[class*='toast']",
            "[class*='notification']",
            "[role='alert']",
            ".sonner-toast",
        ]
        for selector in selectors:
            try:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
                )
                return element.text
            except TimeoutException:
                continue
        return ""

    def take_screenshot(self, name: str) -> str:
        REPORT_PATH.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_path = REPORT_PATH / f"{name}_{timestamp}.png"
        self.driver.save_screenshot(str(image_path))
        return image_path.name

    def record_result(
        self,
        tc_id: str,
        scenario: str,
        status: str,
        actual: str,
        screenshot: str = "",
        db_check: str = "",
        rollback_note: str = "",
    ):
        metadata = get_test_case(tc_id)
        entry = {
            "tc_id": tc_id,
            "sheet": metadata.get("sheet", ""),
            "scenario": scenario or metadata.get("scenario", ""),
            "status": status,
            "actual": actual,
            "expected": metadata.get("expected_result", ""),
            "input_data": metadata.get("input_data", ""),
            "csv_summary": metadata.get("csv_summary", ""),
            "manual_status": metadata.get("manual_status", ""),
            "source": metadata.get("source", ""),
            "db_check": db_check,
            "rollback_note": rollback_note,
            "screenshot": screenshot,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        self.__class__.results.append(entry)
        BaseTest.all_results.append(entry)

    @classmethod
    def _generate_report(cls):
        if not BaseTest.all_results:
            return

        REPORT_PATH.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = REPORT_PATH / f"selenium_report_{timestamp}.html"

        results = sorted(BaseTest.all_results, key=lambda item: item["tc_id"])
        total = len(results)
        pass_count = sum(1 for item in results if item["status"] == "PASS")
        fail_count = sum(1 for item in results if item["status"] == "FAIL")
        other_count = total - pass_count - fail_count

        scope_cases = get_scope_cases(SELENIUM_SCOPE_PREFIXES)
        scope_ids = {case["tc_id"] for case in scope_cases}
        executed_ids = {item["tc_id"] for item in results}
        missing_ids = sorted(scope_ids - executed_ids)

        rows = []
        for item in results:
            color = "#d4edda" if item["status"] == "PASS" else "#f8d7da" if item["status"] == "FAIL" else "#fff3cd"
            screenshot_html = (
                f'<a href="{html.escape(item["screenshot"])}" target="_blank">Screenshot</a>'
                if item["screenshot"]
                else ""
            )
            data_html = item["csv_summary"] or item["input_data"]
            rows.append(
                f"""
                <tr style="background:{color}">
                    <td>{_safe_text(item['tc_id'])}</td>
                    <td>{_safe_text(item['sheet'])}</td>
                    <td>{_safe_text(item['scenario'])}</td>
                    <td>{_safe_text(item['expected'])}</td>
                    <td>{_safe_text(data_html)}</td>
                    <td><b>{_safe_text(item['status'])}</b></td>
                    <td>{_safe_text(item['actual'])}</td>
                    <td>{_safe_text(item['manual_status'])}</td>
                    <td>{_safe_text(item['db_check'])}</td>
                    <td>{_safe_text(item['rollback_note'])}</td>
                    <td>{screenshot_html}</td>
                    <td>{_safe_text(item['timestamp'])}</td>
                </tr>
                """
            )

        missing_html = "<br>".join(html.escape(tc_id) for tc_id in missing_ids) if missing_ids else "None"
        html_report = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Selenium Test Report</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 20px; }}
    h1, h2 {{ color: #333; }}
    .summary {{ background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
    .note {{ background: #eef6ff; padding: 12px; border-left: 4px solid #2f6fdb; margin-bottom: 20px; }}
    table {{ border-collapse: collapse; width: 100%; table-layout: fixed; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; word-wrap: break-word; }}
    th {{ background: #4CAF50; color: white; }}
    .missing {{ white-space: pre-wrap; line-height: 1.5; }}
  </style>
</head>
<body>
  <h1>Selenium Test Report - Online Learning System</h1>
  <div class="summary">
    <b>Total executed:</b> {total}<br>
    <b style="color:green">PASS:</b> {pass_count}<br>
    <b style="color:red">FAIL:</b> {fail_count}<br>
    <b>Other:</b> {other_count}<br>
    <b>Execution rate:</b> {pass_count / total * 100:.1f}%<br>
    <b>Workbook scope:</b> {len(scope_cases)} cases from {html.escape("13_system_test.xlsx")}<br>
    <b>Executed in this run:</b> {len(executed_ids)} / {len(scope_ids)}<br>
    <b>Generated:</b> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
  </div>
  <div class="note">
    <b>Missing Selenium coverage in workbook scope:</b><br>
    <span class="missing">{missing_html}</span>
  </div>
  <table>
    <tr>
      <th>TC ID</th>
      <th>Sheet</th>
      <th>Scenario</th>
      <th>Expected</th>
      <th>Input Data</th>
      <th>Status</th>
      <th>Actual</th>
      <th>Workbook Status</th>
      <th>DB Check</th>
      <th>Rollback</th>
      <th>Screenshot</th>
      <th>Time</th>
    </tr>
    {''.join(rows)}
  </table>
</body>
</html>"""

        with report_path.open("w", encoding="utf-8") as handle:
            handle.write(html_report)
        print(f"\n[REPORT] Saved to: {report_path}")
        print(f"[REPORT] PASS={pass_count}/{total}, FAIL={fail_count}/{total}, OTHER={other_count}")
