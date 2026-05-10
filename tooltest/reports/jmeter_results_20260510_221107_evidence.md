# JMeter Evidence

- Result file: `jmeter_results_20260510_221107.csv`
- Generated: `2026-05-10 22:12:01`
- Overall status: **FAIL**

## Thresholds

| Metric | PASS | WARN | FAIL |
|---|---:|---:|---|
| avg_ms | <= 1000 | <= 3000 | value > 3000 |
| p95_ms | <= 2000 | <= 5000 | value > 5000 |
| p99_ms | <= 5000 | <= 10000 | value > 10000 |
| error_rate_pct | <= 1.0 | <= 5.0 | value > 5.0 |
| throughput_rps | >= 50.0 | >= 20.0 | value < 20.0 |

## Endpoint Results

| Label | Req | Avg | P95 | P99 | Err% | TPS | Status | Notes |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Step1 - Admin Login | 100 | 1148 | 1959 | 2065 | 0.0% | 6.1 | FAIL | avg_ms:1147.8 <= 3000; throughput_rps:6.1 < 20.0 |

Slow analysis for `Step1 - Admin Login`:
- Check auth query latency, password hashing cost, and connection pool size.
- Check JVM heap, GC pauses, and backend thread pool saturation.
- Review ramp-up, connection reuse, and server concurrency limits.
| Step1 - Login | 21 | 779 | 1716 | 1716 | 0.0% | 0.7 | FAIL | throughput_rps:0.7 < 20.0 |

Slow analysis for `Step1 - Login`:
- Check auth query latency, password hashing cost, and connection pool size.
- Review ramp-up, connection reuse, and server concurrency limits.
| TC-ADM-020 GET /orders/admin | 100 | 973 | 2055 | 2279 | 6.0% | 6.1 | FAIL | p95_ms:2055.0 <= 5000; error_rate_pct:6.0 > 5.0; throughput_rps:6.1 < 20.0 |

Slow analysis for `TC-ADM-020 GET /orders/admin`:
- Review joins, filter columns, and admin query indexes.
- Check JVM heap, GC pauses, and backend thread pool saturation.
- Inspect response codes and error bodies for application or dependency faults.
- Review ramp-up, connection reuse, and server concurrency limits.
| TC-AUTH-019 POST /auth/login | 150 | 760 | 1620 | 2053 | 36.0% | 5.1 | FAIL | error_rate_pct:36.0 > 5.0; throughput_rps:5.1 < 20.0 |

Slow analysis for `TC-AUTH-019 POST /auth/login`:
- Check auth query latency, password hashing cost, and connection pool size.
- Inspect response codes and error bodies for application or dependency faults.
- Review ramp-up, connection reuse, and server concurrency limits.
| TC-COURSE-001 GET /courses?search=Spring+Boot | 500 | 0 | 0 | 0 | 100.0% | 17.1 | FAIL | error_rate_pct:100.0 > 5.0; throughput_rps:17.1 < 20.0 |

Slow analysis for `TC-COURSE-001 GET /courses?search=Spring+Boot`:
- Check search indexes and pagination query plans.
- Review course list caching and N+1 lookups on course details.
- Inspect response codes and error bodies for application or dependency faults.
- Review ramp-up, connection reuse, and server concurrency limits.
| TC-COURSE-003 GET /courses/{id} | 1000 | 346 | 810 | 1217 | 0.3% | 51.3 | PASS | - |

Slow analysis for `TC-COURSE-003 GET /courses/{id}`:
- Review course list caching and N+1 lookups on course details.
| TC-ORDER-001 POST /enrollments | 21 | 551 | 1825 | 1825 | 0.0% | 0.7 | FAIL | throughput_rps:0.7 < 20.0 |

Slow analysis for `TC-ORDER-001 POST /enrollments`:
- Check transaction contention and duplicate enrollment validation.
- Review ramp-up, connection reuse, and server concurrency limits.
