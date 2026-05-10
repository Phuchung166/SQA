"""
Convert a Newman/JUnit XML report to a readable standalone HTML file.

Usage:
    python xml_to_html.py <input.xml> [-o output.html]
"""

from __future__ import annotations

import argparse
import html
from pathlib import Path
import xml.etree.ElementTree as ET


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert JUnit XML to HTML.")
    parser.add_argument("input_xml", type=Path, help="Path to Newman JUnit XML report")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output HTML path (default: same name as XML with .html suffix)",
    )
    return parser.parse_args()


def clean_text(text: str | None) -> str:
    if not text:
        return ""
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def format_seconds(value: float) -> str:
    if value >= 60:
        minutes = int(value // 60)
        seconds = value - minutes * 60
        return f"{minutes}m {seconds:.1f}s"
    if value >= 1:
        return f"{value:.3f}s"
    return f"{value * 1000:.0f}ms"


def load_report(xml_path: Path) -> dict:
    root = ET.parse(xml_path).getroot()
    suites = []

    if root.tag == "testsuite":
        suite_nodes = [root]
        suite_collection_name = root.attrib.get("name", xml_path.stem)
    else:
        suite_nodes = root.findall("testsuite")
        suite_collection_name = root.attrib.get("name", xml_path.stem)

    total_assertions = 0
    total_failures = 0
    total_errors = 0
    total_time = 0.0

    for suite in suite_nodes:
        suite_name = suite.attrib.get("name", "(unnamed testsuite)")
        suite_tests = int(suite.attrib.get("tests", 0))
        suite_failures = int(suite.attrib.get("failures", 0))
        suite_errors = int(suite.attrib.get("errors", 0))
        suite_time = float(suite.attrib.get("time", 0) or 0)

        cases = []
        for case in suite.findall("testcase"):
            case_name = case.attrib.get("name", "(unnamed testcase)")
            case_time = float(case.attrib.get("time", 0) or 0)
            failure_node = case.find("failure")
            error_node = case.find("error")

            failure_type = None
            failure_message = ""
            failure_detail = ""

            if failure_node is not None:
                failure_type = failure_node.attrib.get("type", "failure")
                failure_message = failure_node.attrib.get("message", "")
                failure_detail = clean_text(" ".join(part.strip() for part in failure_node.itertext()))
            elif error_node is not None:
                failure_type = error_node.attrib.get("type", "error")
                failure_message = error_node.attrib.get("message", "")
                failure_detail = clean_text(" ".join(part.strip() for part in error_node.itertext()))

            cases.append(
                {
                    "name": case_name,
                    "time": case_time,
                    "failure_type": failure_type,
                    "failure_message": failure_message,
                    "failure_detail": failure_detail,
                }
            )

        suites.append(
            {
                "name": suite_name,
                "tests": suite_tests,
                "failures": suite_failures,
                "errors": suite_errors,
                "time": suite_time,
                "status": "FAIL" if (suite_failures or suite_errors) else "PASS",
                "cases": cases,
            }
        )

        total_assertions += suite_tests
        total_failures += suite_failures
        total_errors += suite_errors
        total_time += suite_time

    return {
        "title": suite_collection_name,
        "requests": len(suites),
        "assertions": total_assertions,
        "failures": total_failures,
        "errors": total_errors,
        "passes": total_assertions - total_failures - total_errors,
        "time": total_time,
        "suites": suites,
    }


def suite_html(suite: dict) -> str:
    case_rows = []
    for case in suite["cases"]:
        status = "FAIL" if case["failure_type"] else "PASS"
        detail_block = ""
        if case["failure_type"]:
            detail_text = html.escape(case["failure_detail"] or case["failure_message"])
            detail_block = (
                f'<div class="failure">'
                f'<div class="failure-title">{html.escape(case["failure_message"] or case["failure_type"])}</div>'
                f'<pre>{detail_text}</pre>'
                f"</div>"
            )

        case_rows.append(
            f"""
            <tr>
              <td><span class="pill pill-{status.lower()}">{status}</span></td>
              <td>{html.escape(case["name"])}</td>
              <td>{format_seconds(case["time"])}</td>
            </tr>
            <tr class="detail-row">
              <td colspan="3">{detail_block or '<span class="muted">No failure detail.</span>'}</td>
            </tr>
            """
        )

    return f"""
    <details class="suite" {"open" if suite["status"] == "FAIL" else ""}>
      <summary>
        <div class="suite-head">
          <span class="pill pill-{suite["status"].lower()}">{suite["status"]}</span>
          <span class="suite-name">{html.escape(suite["name"])}</span>
          <span class="suite-meta">{suite["tests"]} assertions | {suite["failures"]} failures | {format_seconds(suite["time"])}</span>
        </div>
      </summary>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Testcase</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {"".join(case_rows)}
        </tbody>
      </table>
    </details>
    """


def build_html(report: dict, xml_path: Path) -> str:
    fail_rate = 0.0
    if report["assertions"]:
        fail_rate = (report["failures"] + report["errors"]) / report["assertions"] * 100

    failing_suites = [suite for suite in report["suites"] if suite["status"] == "FAIL"]
    passing_suites = [suite for suite in report["suites"] if suite["status"] == "PASS"]

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(report["title"])} - HTML Report</title>
  <style>
    :root {{
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #142033;
      --muted: #5b6678;
      --border: #d8deea;
      --pass: #1e8e5a;
      --fail: #c62828;
      --warn: #b26a00;
      --shadow: 0 14px 35px rgba(20, 32, 51, 0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 32px 20px 48px;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(180deg, #eef3fb 0%, var(--bg) 100%);
      color: var(--text);
    }}
    .wrap {{
      max-width: 1200px;
      margin: 0 auto;
    }}
    .hero {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
      box-shadow: var(--shadow);
      margin-bottom: 24px;
    }}
    h1 {{
      margin: 0 0 10px;
      font-size: 30px;
      line-height: 1.15;
    }}
    .sub {{
      color: var(--muted);
      margin: 0;
      font-size: 14px;
    }}
    .cards {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin: 22px 0 8px;
    }}
    .card {{
      background: #f9fbff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
    }}
    .card-label {{
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .card-value {{
      margin-top: 8px;
      font-size: 28px;
      font-weight: 700;
    }}
    .sections {{
      display: grid;
      gap: 16px;
    }}
    .panel {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow);
      padding: 22px;
    }}
    .panel h2 {{
      margin: 0 0 14px;
      font-size: 20px;
    }}
    .suite {{
      border: 1px solid var(--border);
      border-radius: 16px;
      background: #fcfdff;
      margin-bottom: 12px;
      overflow: hidden;
    }}
    .suite summary {{
      list-style: none;
      cursor: pointer;
      padding: 16px 18px;
    }}
    .suite summary::-webkit-details-marker {{
      display: none;
    }}
    .suite-head {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }}
    .suite-name {{
      font-weight: 600;
    }}
    .suite-meta {{
      color: var(--muted);
      font-size: 13px;
    }}
    .pill {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 56px;
      height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }}
    .pill-pass {{
      background: rgba(30, 142, 90, 0.12);
      color: var(--pass);
    }}
    .pill-fail {{
      background: rgba(198, 40, 40, 0.12);
      color: var(--fail);
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }}
    thead {{
      background: #f4f7fc;
    }}
    th, td {{
      padding: 12px 18px;
      text-align: left;
      vertical-align: top;
      border-top: 1px solid var(--border);
    }}
    .detail-row td {{
      padding-top: 0;
      background: #fffdfd;
    }}
    .failure {{
      border-left: 4px solid var(--fail);
      background: #fff6f6;
      padding: 12px 14px;
      border-radius: 8px;
      margin: 4px 0 10px;
    }}
    .failure-title {{
      font-weight: 700;
      color: var(--fail);
      margin-bottom: 8px;
    }}
    pre {{
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: Consolas, "Courier New", monospace;
      font-size: 12px;
      color: #3a4352;
    }}
    .muted {{
      color: var(--muted);
    }}
    .footer {{
      color: var(--muted);
      font-size: 12px;
      margin-top: 10px;
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>{html.escape(report["title"])}</h1>
      <p class="sub">Source XML: {html.escape(str(xml_path))}</p>
      <div class="cards">
        <div class="card">
          <div class="card-label">Requests</div>
          <div class="card-value">{report["requests"]}</div>
        </div>
        <div class="card">
          <div class="card-label">Assertions</div>
          <div class="card-value">{report["assertions"]}</div>
        </div>
        <div class="card">
          <div class="card-label">Passed</div>
          <div class="card-value">{report["passes"]}</div>
        </div>
        <div class="card">
          <div class="card-label">Failed</div>
          <div class="card-value">{report["failures"] + report["errors"]}</div>
        </div>
        <div class="card">
          <div class="card-label">Fail Rate</div>
          <div class="card-value">{fail_rate:.1f}%</div>
        </div>
        <div class="card">
          <div class="card-label">Duration</div>
          <div class="card-value">{format_seconds(report["time"])}</div>
        </div>
      </div>
    </section>

    <div class="sections">
      <section class="panel">
        <h2>Failing Requests ({len(failing_suites)})</h2>
        {''.join(suite_html(suite) for suite in failing_suites) or '<p class="muted">No failing requests.</p>'}
      </section>

      <section class="panel">
        <h2>Passing Requests ({len(passing_suites)})</h2>
        {''.join(suite_html(suite) for suite in passing_suites) or '<p class="muted">No passing requests.</p>'}
      </section>
    </div>

    <div class="footer">Generated by tooltest/postman/xml_to_html.py</div>
  </div>
</body>
</html>
"""


def main() -> None:
    args = parse_args()
    input_xml = args.input_xml.resolve()
    output_html = args.output.resolve() if args.output else input_xml.with_suffix(".html")

    report = load_report(input_xml)
    output_html.write_text(build_html(report, input_xml), encoding="utf-8")
    print(f"HTML report saved to: {output_html}")


if __name__ == "__main__":
    main()
