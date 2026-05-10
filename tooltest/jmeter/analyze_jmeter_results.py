"""
Read a JMeter CSV results file, evaluate thresholds, and generate evidence.

Usage:
    python analyze_jmeter_results.py ../reports/jmeter_results.csv
"""

from __future__ import annotations

import csv
import os
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


THRESHOLDS = {
    "avg_ms": {"pass": 1000, "warn": 3000, "lower_is_better": True},
    "p95_ms": {"pass": 2000, "warn": 5000, "lower_is_better": True},
    "p99_ms": {"pass": 5000, "warn": 10000, "lower_is_better": True},
    "error_rate_pct": {"pass": 1.0, "warn": 5.0, "lower_is_better": True},
    "throughput_rps": {"pass": 50.0, "warn": 20.0, "lower_is_better": False},
}

SLOW_HINTS = [
    ("search", "Check search indexes and pagination query plans."),
    ("courses", "Review course list caching and N+1 lookups on course details."),
    ("login", "Check auth query latency, password hashing cost, and connection pool size."),
    ("orders", "Review joins, filter columns, and admin query indexes."),
    ("enroll", "Check transaction contention and duplicate enrollment validation."),
]


def percentile(data: List[int], pct: int) -> int:
    if not data:
        return 0
    ordered = sorted(data)
    index = int((len(ordered) - 1) * pct / 100)
    return ordered[index]


def metric_status(metric_name: str, value: float) -> Tuple[str, str]:
    rules = THRESHOLDS[metric_name]
    pass_limit = rules["pass"]
    warn_limit = rules["warn"]
    lower_is_better = rules["lower_is_better"]

    if lower_is_better:
        if value <= pass_limit:
            return "PASS", f"{value:.1f} <= {pass_limit}"
        if value <= warn_limit:
            return "WARN", f"{value:.1f} <= {warn_limit}"
        return "FAIL", f"{value:.1f} > {warn_limit}"

    if value >= pass_limit:
        return "PASS", f"{value:.1f} >= {pass_limit}"
    if value >= warn_limit:
        return "WARN", f"{value:.1f} >= {warn_limit}"
    return "FAIL", f"{value:.1f} < {warn_limit}"


def overall_status(metric_results: Iterable[str]) -> str:
    values = set(metric_results)
    if "FAIL" in values:
        return "FAIL"
    if "WARN" in values:
        return "WARN"
    return "PASS"


def suggest_hints(label: str, failed_metrics: List[str]) -> List[str]:
    lowered = label.lower()
    hints = []
    for keyword, message in SLOW_HINTS:
        if keyword in lowered:
            hints.append(message)
    if any(metric in {"p95_ms", "p99_ms", "avg_ms"} for metric in failed_metrics):
        hints.append("Check JVM heap, GC pauses, and backend thread pool saturation.")
    if "error_rate_pct" in failed_metrics:
        hints.append("Inspect response codes and error bodies for application or dependency faults.")
    if "throughput_rps" in failed_metrics:
        hints.append("Review ramp-up, connection reuse, and server concurrency limits.")
    return list(dict.fromkeys(hints))


def analyze(csv_path: str):
    csv_file = Path(csv_path)
    if not csv_file.exists():
        print(f"File not found: {csv_file}")
        sys.exit(1)

    by_label: Dict[str, Dict[str, object]] = defaultdict(
        lambda: {"times": [], "errors": 0, "total": 0, "start": None, "end": None}
    )

    with csv_file.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            label = row.get("label", "unknown")
            elapsed = int(row.get("elapsed", 0))
            success = row.get("success", "true").lower() == "true"
            timestamp = int(row.get("timeStamp", 0))

            current = by_label[label]
            current["times"].append(elapsed)
            current["total"] += 1
            if not success:
                current["errors"] += 1
            if current["start"] is None or timestamp < current["start"]:
                current["start"] = timestamp
            if current["end"] is None or timestamp > current["end"]:
                current["end"] = timestamp

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("=" * 100)
    print("JMETER PERFORMANCE TEST RESULTS")
    print(f"File: {csv_file}")
    print(f"Time: {now}")
    print("=" * 100)
    print(f"{'Label':<42} {'Req':>5} {'Avg':>7} {'P95':>7} {'P99':>7} {'Err%':>7} {'TPS':>8} {'Status':>8}")
    print("-" * 100)

    results = []
    global_statuses = []

    for label, data in sorted(by_label.items()):
        total = int(data["total"])
        if total == 0:
            continue

        times = list(data["times"])
        avg = sum(times) / total
        p95 = percentile(times, 95)
        p99 = percentile(times, 99)
        err_pct = int(data["errors"]) / total * 100
        duration_s = (int(data["end"]) - int(data["start"])) / 1000 if data["start"] and data["end"] else 1
        throughput = total / max(duration_s, 1)

        metrics = {
            "avg_ms": avg,
            "p95_ms": p95,
            "p99_ms": p99,
            "error_rate_pct": err_pct,
            "throughput_rps": throughput,
        }
        evaluations = {name: metric_status(name, value) for name, value in metrics.items()}
        status = overall_status(result[0] for result in evaluations.values())
        failed_metrics = [name for name, result in evaluations.items() if result[0] != "PASS"]
        hints = suggest_hints(label, failed_metrics)

        print(f"{label[:42]:<42} {total:>5} {avg:>7.0f} {p95:>7} {p99:>7} {err_pct:>7.1f} {throughput:>8.1f} {status:>8}")
        if failed_metrics:
            print("  -> " + "; ".join(f"{name}:{evaluations[name][1]}" for name in failed_metrics))

        results.append(
            {
                "label": label,
                "total": total,
                "avg": avg,
                "p95": p95,
                "p99": p99,
                "err_pct": err_pct,
                "throughput": throughput,
                "status": status,
                "evaluations": evaluations,
                "hints": hints,
            }
        )
        global_statuses.append(status)

    overall = overall_status(global_statuses)
    print("=" * 100)
    print(f"OVERALL: {overall}")

    html_path = csv_file.with_name(csv_file.stem + "_analysis.html")
    md_path = csv_file.with_name(csv_file.stem + "_evidence.md")

    html_rows = []
    md_rows = [
        "# JMeter Evidence",
        "",
        f"- Result file: `{csv_file.name}`",
        f"- Generated: `{now}`",
        f"- Overall status: **{overall}**",
        "",
        "## Thresholds",
        "",
        "| Metric | PASS | WARN | FAIL |",
        "|---|---:|---:|---|",
    ]

    for metric_name, rules in THRESHOLDS.items():
        comparator = "<=" if rules["lower_is_better"] else ">="
        fail_rule = f"value {'>' if rules['lower_is_better'] else '<'} {rules['warn']}"
        md_rows.append(f"| {metric_name} | {comparator} {rules['pass']} | {comparator} {rules['warn']} | {fail_rule} |")

    md_rows.extend(
        [
            "",
            "## Endpoint Results",
            "",
            "| Label | Req | Avg | P95 | P99 | Err% | TPS | Status | Notes |",
            "|---|---:|---:|---:|---:|---:|---:|---|---|",
        ]
    )

    for item in results:
        background = {"PASS": "#d4edda", "WARN": "#fff3cd", "FAIL": "#f8d7da"}[item["status"]]
        notes = "; ".join(f"{name}:{result[1]}" for name, result in item["evaluations"].items() if result[0] != "PASS")
        hints = "<br>".join(item["hints"])
        html_rows.append(
            f"""
            <tr style="background:{background}">
              <td>{item['label']}</td>
              <td>{item['total']}</td>
              <td>{item['avg']:.0f}</td>
              <td>{item['p95']}</td>
              <td>{item['p99']}</td>
              <td>{item['err_pct']:.1f}%</td>
              <td>{item['throughput']:.1f}</td>
              <td><b>{item['status']}</b></td>
              <td>{notes}<br>{hints}</td>
            </tr>
            """
        )
        md_rows.append(
            f"| {item['label']} | {item['total']} | {item['avg']:.0f} | {item['p95']} | {item['p99']} | {item['err_pct']:.1f}% | {item['throughput']:.1f} | {item['status']} | {notes or '-'} |"
        )
        if item["hints"]:
            md_rows.append("")
            md_rows.append(f"Slow analysis for `{item['label']}`:")
            for hint in item["hints"]:
                md_rows.append(f"- {hint}")

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JMeter Analysis Report</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 20px; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }}
    th {{ background: #4CAF50; color: white; }}
    .summary {{ background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
  </style>
</head>
<body>
  <h1>JMeter Performance Analysis</h1>
  <div class="summary">
    <b>File:</b> {csv_file}<br>
    <b>Generated:</b> {now}<br>
    <b>Overall:</b> {overall}<br>
    <b>Evidence markdown:</b> {md_path.name}
  </div>
  <table>
    <tr>
      <th>Label</th>
      <th>Req</th>
      <th>Avg</th>
      <th>P95</th>
      <th>P99</th>
      <th>Err%</th>
      <th>TPS</th>
      <th>Status</th>
      <th>Notes</th>
    </tr>
    {''.join(html_rows)}
  </table>
</body>
</html>"""

    html_path.write_text(html, encoding="utf-8")
    md_path.write_text("\n".join(md_rows) + "\n", encoding="utf-8")
    print(f"HTML report: {html_path}")
    print(f"Evidence markdown: {md_path}")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "../reports/jmeter_results.csv"
    analyze(path)
