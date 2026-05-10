# Postman API Test Evidence

- Run time: `2026-05-10 22:36:17` (`Asia/Saigon`)
- Source: `tooltest/postman/online_learning_collection.json`
- Mapping basis: `13_system_test.xlsx`

## Execution Summary

- Collection items: `64`
- HTTP requests executed: `68`
- Assertions: `91`
- Assertion failures: `8`
- Request transport failures: `0`
- Total duration: `1m 11s`
- Average response time: `966 ms`

## Key Result

Bo Postman da duoc chinh lai theo backend va seed local hien tai. Cac loi do sai endpoint, sai method, sai du lieu seed, sai parse response text, va rollback khong phu hop da duoc loai bo phan lon. Sau khi fix tool, chi con `8` case fail va cac case nay phan anh hanh vi backend chua dat ky vong cua system test hon la loi collection.

## Passed Areas

- Auth: dang ky hop le, dang ky email trung, login hop le, login email chua verify, forgot password.
- Course discovery: tim kiem, xem chi tiet course, xem chi tiet course group, 404 khi course khong ton tai.
- Order/enrollment: enroll free course, duplicate enroll bi chan, cart add/remove, order history, danh sach khoa hoc da dang ky.
- Instructor: tao/cap nhat/xoa course hop le, chan xoa course da co hoc vien, publish draft course thanh cong.
- Admin: duyet course, cap nhat/xoa category test, tim kiem hoc vien/giang vien, xem danh sach orders.

## Remaining Defects

1. `TC-AUTH-008`
   Backend chap nhan email khong co TLD (`user@test`) va tra `200` thay vi `400`.
2. `TC-AUTH-021`
   Login email khong ton tai tra `404`, lam lo su ton tai cua tai khoan thay vi tra loi chung `400`.
3. `TC-ORDER-007`
   `POST /payments/init` tra `500`; system test ky vong backend chan amount qua thap bang loi nghiep vu `400`.
4. `TC-INS-007`
   Tao course voi `title=""` van tra `201`, thieu validate bat buoc cho title.
5. `TC-INS-013b`
   Publish course chua co module van tra `200`, khong chan theo rule nghiep vu.
6. `TC-INS-029`
   Tao quiz question voi duoi 4 dap an tra `500` thay vi validate `400`.
7. `TC-ADM-009`
   Tao category trung ten van tra `201`, thieu kiem tra unique.
8. `TC-ADM-023`
   API instructor earnings tra `500`, chua dap ung testcase admin earnings.

## Notable Slow Requests

- `TC-INS-012 /courses/10/publish`: about `18.9s`
- `TC-INS-013b /courses/{id}/publish`: about `20.8s`
- `TC-ADM-001 /courses/5/status`: about `10.8s`
- `ROLLBACK-ADM /courses/5/status`: about `11.3s`

Day khong phai so lieu performance chinh thuc nhu JMeter, nhung la dau hieu can luu y vi cac API publish/status co do tre cao bat thuong ngay ca o functional run.

## Rollback / Data Cleanup

- Da xoa enrollment test cua `student09@test.local` voi `course_id=5`.
- Da reset `course_id=10` ve trang thai `DRAFT`.
- Da xoa cac course test tao ra boi `TC-INS-007` va `TC-INS-013`.
- Da xoa category duplicate tao boi `TC-ADM-009`.
- Da xoa cac user test auth tao boi `TC-AUTH-001`, `TC-AUTH-003`, `TC-AUTH-011`, `TC-AUTH-022`.

## Output Files

- Newman JSON: `tooltest/reports/postman_run_20260510_223617.json`
- Newman JUnit XML: `tooltest/reports/postman_run_20260510_223617.xml`
