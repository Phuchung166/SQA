# Run the Selenium test suite mapped from 13_system_test.xlsx.

import os
import sys
import unittest
from datetime import datetime


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(__file__))

from test_01_auth import TestAuth
from test_02_course_explore import TestCourseExplore
from test_03_enrollment import TestEnrollment
from test_04_study_quiz import TestStudyQuiz


def run_suite():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestAuth))
    suite.addTests(loader.loadTestsFromTestCase(TestCourseExplore))
    suite.addTests(loader.loadTestsFromTestCase(TestEnrollment))
    suite.addTests(loader.loadTestsFromTestCase(TestStudyQuiz))

    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(suite)

    print(f"\n{'=' * 60}")
    print("SELENIUM TEST SUMMARY")
    print(f"{'=' * 60}")
    print(f"Total tests: {result.testsRun}")
    print(f"PASS: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"FAIL: {len(result.failures)}")
    print(f"ERROR: {len(result.errors)}")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(run_suite())
