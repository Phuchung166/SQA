# JMeter Performance Test Plan
# Online Learning System - 13_system_test.xlsx

## File: online_learning_perf_test.jmx

## Cach chay

### GUI mode (xem ket qua truc tiep):
```
jmeter -t online_learning_perf_test.jmx
```

### Non-GUI mode (khuyen dung cho production):
```
jmeter -n -t online_learning_perf_test.jmx -l ../reports/jmeter_results.csv -e -o ../reports/jmeter_html_report
```

### Tuy chinh tham so:
```
jmeter -n -t online_learning_perf_test.jmx \
  -JBASE_URL=127.0.0.1 \
  -JBASE_PORT=8080 \
  -JRAMP_UP=60 \
  -JDURATION=300
```

## 5 Scenarios (mapping tu 13_system_test.xlsx)

| Scenario | TC ID | Mo ta | Users | Ramp-up | Loops |
|---|---|---|---|---|---|
| S1 | TC-AUTH-019 | Dang nhap dong thoi | 50 | 30s | 3 |
| S2 | TC-COURSE-001 | Tim kiem khoa hoc | 100 | 30s | 5 |
| S3 | TC-COURSE-003 | Xem chi tiet khoa hoc | 100 | 20s | 10 |
| S4 | TC-ORDER-001 | Dang ky khoa hoc mien phi | 30 | 30s | 1 |
| S5 | TC-ADM-020 | Admin xem don hang | 20 | 10s | 5 |

## Nguong danh gia (Performance Thresholds)

| Chi so | Nguong dat | Nguong canh bao |
|---|---|---|
| Response time P95 | < 2000ms | < 5000ms |
| Response time P99 | < 5000ms | < 10000ms |
| Error rate | < 1% | < 5% |
| Throughput | > 50 req/s | > 20 req/s |
| Avg response time | < 1000ms | < 3000ms |

## Giai thich cham (Explain Slow)

Neu response time vuot nguong, kiem tra:
1. **Database query**: Thieu index tren cot search (title, status, category_id)
2. **N+1 query**: CourseResponse.fromEntity() co the goi nhieu query phu
3. **Redis cache miss**: Cac API GET /courses chua duoc cache
4. **Connection pool**: HikariCP pool size mac dinh co the qua nho voi 100 concurrent users
5. **JVM heap**: Spring Boot voi 100 concurrent requests co the bi GC pressure

## Cach doc bao cao

Sau khi chay, mo file `../reports/jmeter_html_report/index.html` de xem:
- Response time percentiles (P50, P90, P95, P99)
- Throughput theo thoi gian
- Error rate theo tung endpoint
- Active threads theo thoi gian
