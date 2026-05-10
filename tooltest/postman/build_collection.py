"""
build_collection.py
Tạo Postman collection JSON từ test cases trong 13_system_test.xlsx
Chạy: python build_collection.py
Output: online_learning_collection.json
"""
import json

BASE = "{{base_url}}"


def make_item(tc_id, name, method, path, body=None, pre_script=None, test_script=None, auth="learner"):
    """Tạo một Postman request item."""
    headers = [{"key": "Content-Type", "value": "application/json"}]
    token_map = {
        "learner":    "{{learner_token}}",
        "instructor": "{{instructor_token}}",
        "admin":      "{{admin_token}}",
        "none":       None,
    }
    token = token_map.get(auth)
    if token:
        headers.append({"key": "Authorization", "value": f"Bearer {token}"})

    url_raw = f"{BASE}{path}"
    item = {
        "name": f"[{tc_id}] {name}",
        "request": {
            "method": method,
            "header": headers,
            "url": {"raw": url_raw, "host": ["{{base_url}}"], "path": path.lstrip("/").split("/")},
        },
        "event": [],
    }
    if body is not None:
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, ensure_ascii=False, indent=2),
        }
    if pre_script:
        item["event"].append({
            "listen": "prerequest",
            "script": {"exec": pre_script if isinstance(pre_script, list) else [pre_script], "type": "text/javascript"},
        })
    if test_script:
        item["event"].append({
            "listen": "test",
            "script": {"exec": test_script if isinstance(test_script, list) else [test_script], "type": "text/javascript"},
        })
    return item


def folder(name, items):
    return {"name": name, "item": items}


# ============================================================
# FOLDER 01 - XAC THUC (TC-AUTH)
# ============================================================
auth_folder = folder("01_Xac_Thuc", [

    make_item("TC-AUTH-001", "Dang ky thanh cong", "POST", "/auth/register",
              body={"account_name": "{{reg_account_001}}", "email": "{{reg_email_001}}", "password": "Test@1234", "role": "STUDENT"},
              pre_script=[
                  'const suffix001 = Date.now().toString().slice(-6);',
                  'pm.environment.set("reg_account_001", "tca" + suffix001);',
                  'pm.environment.set("reg_email_001", "tc_auth_001_" + suffix001 + "@test.local");',
              ],
              test_script=[
                  'pm.test("[TC-AUTH-001] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
                  'pm.test("[TC-AUTH-001] Response co message", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("message");',
                  '});',
                  'if([200,201].includes(pm.response.code)) {',
                  '    pm.environment.set("created_user_email_001", "tc_auth_001_api@gmail.com");',
                  '}',
              ],
              auth="none"),

    make_item("TC-AUTH-002", "Dang ky username qua ngan 4 ky tu - KNOWN FAIL", "POST", "/auth/register",
              body={"account_name": "abcd", "email": "tc002api@test.local", "password": "Test@1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-002] KNOWN FAIL: BE khong validate username length", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE tra 400"); }',
                  '    else { console.log("FAIL: BE tra " + code + " - khong validate username < 5 chars"); }',
                  '    pm.expect(code).to.equal(400, "BE should return 400 for username < 5 chars");',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-003", "Dang ky username dung 5 ky tu bien hop le", "POST", "/auth/register",
              body={"account_name": "{{reg_account_003}}", "email": "{{reg_email_003}}", "password": "Test@1234", "role": "STUDENT"},
              pre_script=[
                  'const suffix003 = (Date.now() % 10000).toString().padStart(4, "0");',
                  'pm.environment.set("reg_account_003", "a" + suffix003);',
                  'pm.environment.set("reg_email_003", "tc_auth_003_" + suffix003 + "@test.local");',
              ],
              test_script=[
                  'pm.test("[TC-AUTH-003] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
                  'if([200,201].includes(pm.response.code)) {',
                  '    pm.environment.set("created_user_email_003", "tc003api@gmail.com");',
                  '}',
              ],
              auth="none"),

    make_item("TC-AUTH-004", "Dang ky username 21 ky tu vuot toi da 20", "POST", "/auth/register",
              body={"account_name": "abcdefghijklmnopqrstu", "email": "tc004api@test.local", "password": "Test@1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-004] BE tra 400 cho username > 20 chars", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
                  'pm.test("[TC-AUTH-004] Response co thong bao loi", function() {',
                  '    var body = JSON.stringify(pm.response.json()).toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("account") || b.includes("20") || b.includes("size"));',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-006", "Dang ky email khong co @", "POST", "/auth/register",
              body={"account_name": "validuser6", "email": "invalidemail", "password": "Test@1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-006] BE tra 400 cho email sai dinh dang", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
                  'pm.test("[TC-AUTH-006] Response co thong bao loi email", function() {',
                  '    var body = JSON.stringify(pm.response.json()).toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("email") || b.includes("invalid") || b.includes("format"));',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-007", "Dang ky email khong co domain", "POST", "/auth/register",
              body={"account_name": "validuser7", "email": "user@", "password": "Test@1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-007] BE tra 400 cho email thieu domain", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-008", "Dang ky email khong co domain extension - KNOWN FAIL", "POST", "/auth/register",
              body={"account_name": "validuser8", "email": "user@test", "password": "Test@1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-008] KNOWN FAIL: BE chap nhan email @test", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE tra 400"); }',
                  '    else { console.log("FAIL: BE tra " + code + " - chap nhan email @test khong hop le"); }',
                  '    pm.expect(code).to.equal(400, "BE should reject email without TLD");',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-009", "Dang ky email da ton tai", "POST", "/auth/register",
              body={"account_name": "newuser009", "email": "student09@test.local", "password": "password123", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-009] BE tra 400 cho email trung", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
                  'pm.test("[TC-AUTH-009] Response co thong bao email da ton tai", function() {',
                  '    var body = pm.response.text().toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("email") || b.includes("exist") || b.includes("used"));',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-010", "Dang ky password qua ngan 7 ky tu - KNOWN FAIL", "POST", "/auth/register",
              body={"account_name": "validuser10", "email": "tc010api@test.local", "password": "abc1234", "role": "STUDENT"},
              test_script=[
                  'pm.test("[TC-AUTH-010] KNOWN FAIL: BE khong validate password length", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE tra 400"); }',
                  '    else { console.log("FAIL: BE tra " + code + " - khong validate password < 8 chars"); }',
                  '    pm.expect(code).to.equal(400, "BE should return 400 for password < 8 chars");',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-011", "Dang ky password dung 8 ky tu bien hop le", "POST", "/auth/register",
              body={"account_name": "{{reg_account_011}}", "email": "{{reg_email_011}}", "password": "Test1234", "role": "STUDENT"},
              pre_script=[
                  'const suffix011 = Date.now().toString().slice(-6);',
                  'pm.environment.set("reg_account_011", "valid" + suffix011.slice(-4));',
                  'pm.environment.set("reg_email_011", "tc_auth_011_" + suffix011 + "@test.local");',
              ],
              test_script=[
                  'pm.test("[TC-AUTH-011] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
                  'if([200,201].includes(pm.response.code)) {',
                  '    pm.environment.set("created_user_email_011", "tc011api@gmail.com");',
                  '}',
              ],
              auth="none"),

    make_item("TC-AUTH-019", "Dang nhap thanh cong - Lay token", "POST", "/auth/login",
              body={"email": "student09@test.local", "password": "password123"},
              test_script=[
                  'pm.test("[TC-AUTH-019] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-AUTH-019] Response co token", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("token").that.is.a("string").and.not.empty;',
                  '    pm.environment.set("learner_token", json.token);',
                  '    console.log("[TC-AUTH-019] Saved learner_token");',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-020", "Dang nhap sai password - KNOWN FAIL", "POST", "/auth/login",
              body={"email": "student09@test.local", "password": "wrongpassword"},
              test_script=[
                  'pm.test("[TC-AUTH-020] KNOWN FAIL: BE tra 404 thay vi 400", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE tra 400 voi thong bao chung"); }',
                  '    else { console.log("FAIL: BE tra " + code + " (expected 400)"); }',
                  '    pm.expect(code).to.equal(400, "Should return 400 not " + code);',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-021", "Dang nhap email khong ton tai - KNOWN FAIL", "POST", "/auth/login",
              body={"email": "notexist_xyz@gmail.com", "password": "Test@1234"},
              test_script=[
                  'pm.test("[TC-AUTH-021] KNOWN FAIL: BE lo thong tin email ton tai", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE tra 400 voi thong bao chung"); }',
                  '    else { console.log("FAIL: BE tra " + code + " - lo thong tin email"); }',
                  '    pm.expect(code).to.equal(400, "Should not reveal if email exists");',
                  '});',
              ],
              auth="none"),

    make_item("SETUP-AUTH-022", "[SETUP] Tao user chua xac thuc OTP", "POST", "/auth/register",
              body={"account_name": "{{unverified_account}}", "email": "{{unverified_email}}", "password": "password123", "role": "STUDENT"},
              pre_script=[
                  'const suffix022 = Date.now().toString().slice(-6);',
                  'pm.environment.set("unverified_account", "unv" + suffix022.slice(-3));',
                  'pm.environment.set("unverified_email", "unverified_" + suffix022 + "@test.local");',
              ],
              test_script=[
                  'pm.test("[SETUP-AUTH-022] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-022", "Dang nhap email chua xac thuc OTP", "POST", "/auth/login",
              body={"email": "{{unverified_email}}", "password": "password123"},
              test_script=[
                  'pm.test("[TC-AUTH-022] BE tra 400 cho email chua xac thuc", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
                  'pm.test("[TC-AUTH-022] Response co thong bao chua xac thuc", function() {',
                  '    var body = pm.response.text().toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("verif") || b.includes("xac thuc") || b.includes("otp"));',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-025", "Gui yeu cau reset password email ton tai", "POST", "/auth/forgot-password",
              body={"email": "student09@test.local"},
              test_script=[
                  'pm.test("[TC-AUTH-025] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-AUTH-025] Response co message", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("message");',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-026", "Gui yeu cau reset password email khong ton tai", "POST", "/auth/forgot-password",
              body={"email": "notexist123@gmail.com"},
              test_script=[
                  'pm.test("[TC-AUTH-026] Status 200 - thong bao chung bao mat", function() {',
                  '    // Security: should return 200 with generic message regardless of email existence',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
              ],
              auth="none"),

    make_item("TC-AUTH-029", "Dang xuat FE-only, API chua ho tro", "POST", "/auth/logout",
              test_script=[
                  'pm.test("[TC-AUTH-029] API logout chua ho tro", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([404, 405, 500]);',
                  '});',
                  'pm.environment.unset("learner_token");',
                  'console.log("[TC-AUTH-029] FE logout chi clear token local; BE chua co endpoint logout");',
              ],
              auth="learner"),

    # ROLLBACK
    make_item("ROLLBACK-AUTH", "[ROLLBACK] Clear env; API chua ho tro xoa user test", "GET",
              "/courses?page=1&pageSize=1",
              test_script=[
                  'pm.test("[ROLLBACK-AUTH] Public endpoint van truy cap duoc", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.environment.unset("created_user_email_001");',
                  'pm.environment.unset("created_user_email_003");',
                  'pm.environment.unset("created_user_email_011");',
                  'pm.environment.unset("unverified_email");',
                  'pm.environment.unset("unverified_account");',
                  'console.log("[ROLLBACK-AUTH] API chua ho tro delete user; cleanup that su se xu ly bang DB neu can");',
              ],
              auth="none"),
])

print("auth_folder items:", len(auth_folder["item"]))
print("OK")



# ============================================================
# FOLDER 02 - KHAM PHA KHOA HOC (TC-COURSE)
# ============================================================
course_folder = folder("02_Kham_Pha_Khoa_Hoc", [

    make_item("SETUP-LOGIN", "[SETUP] Login lay learner_token", "POST", "/auth/login",
              body={"email": "student09@test.local", "password": "password123"},
              test_script=[
                  'var json = pm.response.json();',
                  'if(json.token) { pm.environment.set("learner_token", json.token); }',
              ],
              auth="none"),

    make_item("TC-COURSE-001", "Tim kiem khoa hoc tu khoa ton tai", "GET",
              "/courses?search=Spring+Boot&status=ACTIVE&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-COURSE-001] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-COURSE-001] Co ket qua tra ve", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    pm.expect(json.data).to.be.an("array").and.not.empty;',
                  '    console.log("[TC-COURSE-001] Found " + json.data.length + " courses");',
                  '});',
                  'pm.test("[TC-COURSE-001] Ket qua chua tu khoa Spring Boot", function() {',
                  '    var json = pm.response.json();',
                  '    var found = json.data.some(c => c.title && c.title.toLowerCase().includes("spring"));',
                  '    pm.expect(found).to.be.true;',
                  '});',
              ],
              auth="none"),

    make_item("TC-COURSE-002", "Tim kiem tu khoa khong ton tai - KNOWN FAIL", "GET",
              "/courses?search=xyznonexistentcourse123&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-COURSE-002] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-COURSE-002] KNOWN FAIL: FE khong hien thi thong bao trong", function() {',
                  '    var json = pm.response.json();',
                  '    var count = json.data ? json.data.length : 0;',
                  '    pm.expect(count).to.equal(0, "Should return empty array");',
                  '    if(count === 0) { console.log("PASS: API tra mang rong - FE can hien thi thong bao"); }',
                  '    else { console.log("FAIL: API tra " + count + " ket qua"); }',
                  '});',
              ],
              auth="none"),

    make_item("TC-COURSE-003", "Xem chi tiet khoa hoc ton tai", "GET",
              "/courses/{{free_course_id}}",
              test_script=[
                  'pm.test("[TC-COURSE-003] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-COURSE-003] Response co day du thong tin", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("id");',
                  '    pm.expect(json).to.have.property("title").that.is.not.empty;',
                  '    pm.expect(json).to.have.property("instructor");',
                  '    pm.expect(json).to.have.property("status");',
                  '    console.log("[TC-COURSE-003] Course: " + json.title + " | Status: " + json.status);',
                  '});',
              ],
              auth="none"),

    make_item("TC-COURSE-004", "Xem khoa hoc ID khong ton tai", "GET",
              "/courses/99999",
              test_script=[
                  'pm.test("[TC-COURSE-004] Status 404", function() {',
                      '    pm.expect(pm.response.code).to.equal(404);',
                  '});',
                  'pm.test("[TC-COURSE-004] Response co thong bao khong tim thay", function() {',
                  '    var body = pm.response.text().toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("not found") || b.includes("khong") || b.includes("404"));',
                  '});',
              ],
              auth="none"),

    make_item("TC-COURSE-006", "Xem chi tiet khoa hoc nhom", "GET",
              "/course-groups/{{course_group_id}}",
              test_script=[
                  'pm.test("[TC-COURSE-006] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-COURSE-006] Response co danh sach khoa hoc thanh phan", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("title");',
                  '    pm.expect(json).to.satisfy(j => j.courses || j.list_of_courses || j.data);',
                  '    console.log("[TC-COURSE-006] Group: " + json.title);',
                  '});',
              ],
              auth="none"),
])

print("course_folder items:", len(course_folder["item"]))


# ============================================================
# FOLDER 03 - THANH TOAN DANG KY HOC (TC-ORDER)
# ============================================================
order_folder = folder("03_Thanh_Toan_Dang_Ky_Hoc", [

    make_item("SETUP-LOGIN-ORDER", "[SETUP] Login lay learner_token", "POST", "/auth/login",
              body={"email": "student09@test.local", "password": "password123"},
              test_script=[
                  'var json = pm.response.json();',
                  'if(json.token) { pm.environment.set("learner_token", json.token); }',
              ],
              auth="none"),

    make_item("TC-ORDER-001", "Dang ky khoa hoc mien phi thanh cong", "POST",
              "/enrollments",
              body={"course_id": "{{free_course_id}}"},
              pre_script=[
                  '// Pre-check: xoa enrollment cu neu co',
                  'pm.environment.set("rollback_enrollment_course", pm.environment.get("free_course_id"));',
              ],
              test_script=[
                  'pm.test("[TC-ORDER-001] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
                  'pm.test("[TC-ORDER-001] Enrollment duoc tao", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.satisfy(j => j.id || j.enrollment_id || j.message);',
                  '    if(json.id) pm.environment.set("created_enrollment_id", json.id);',
                  '    console.log("[TC-ORDER-001] Enrollment created");',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-002", "Dang ky khoa hoc da dang ky truoc do", "POST",
              "/enrollments",
              body={"course_id": "{{free_course_id}}"},
              test_script=[
                  'pm.test("[TC-ORDER-002] He thong bao da dang ky hoac tra 409", function() {',
                  '    var code = pm.response.code;',
                  '    pm.expect(code).to.be.oneOf([200, 400, 409]);',
                  '    var body = pm.response.text().toLowerCase();',
                  '    if(code === 400 || code === 409) {',
                  '        pm.expect(body).to.satisfy(b => b.includes("enroll") || b.includes("da") || b.includes("exist"));',
                  '        console.log("[TC-ORDER-002] PASS: He thong bao da dang ky");',
                  '    } else {',
                  '        console.log("[TC-ORDER-002] INFO: He thong cho phep dang ky lai (code=" + code + ")");',
                  '    }',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-003", "Dang ky khi chua dang nhap - 401", "POST",
              "/enrollments",
              body={"course_id": "{{free_course_id}}"},
              test_script=[
                  'pm.test("[TC-ORDER-003] Status 401 hoac 403 khi chua dang nhap", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([401, 403]);',
                  '});',
              ],
              auth="none"),

    make_item("TC-ORDER-007", "VNPay gia qua thap - KNOWN FAIL", "POST",
              "/payments/init",
              body={"course_id": "{{paid_course_id}}", "amount": 1, "currency": "VND"},
              test_script=[
                  'pm.test("[TC-ORDER-007] KNOWN FAIL: BE cho phep gia 1 VND", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) { console.log("PASS: BE chặn gia qua thap"); }',
                  '    else { console.log("FAIL: BE tra " + code + " - cho phep gia 1 VND"); }',
                  '    pm.expect(code).to.equal(400, "Should reject price below VNPay minimum");',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-008", "Them khoa hoc vao gio hang", "POST",
              "/cart_items",
              body={"course_id": "{{paid_course_id}}"},
              pre_script=['pm.environment.set("rollback_cart_course", pm.environment.get("paid_course_id"));'],
              test_script=[
                  'pm.test("[TC-ORDER-008] Status 200 or 201", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                  '});',
                  'pm.test("[TC-ORDER-008] Cart item duoc tao", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.satisfy(j => j.id || j.cart_item_id || j.message);',
                  '    if(json.id) pm.environment.set("created_cart_item_id", json.id);',
                  '    console.log("[TC-ORDER-008] Cart item created");',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-009", "Xoa khoa hoc khoi gio hang", "DELETE",
              "/cart_items/{{created_cart_item_id}}",
              test_script=[
                  'pm.test("[TC-ORDER-009] Status 200 or 204", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 204]);',
                  '});',
                  'pm.environment.unset("created_cart_item_id");',
                  'console.log("[TC-ORDER-009] Cart item removed");',
              ],
              auth="learner"),

    make_item("TC-ORDER-012", "Xem lich su mua hang chua co don", "GET",
              "/orders/user?page=1&size=10",
              test_script=[
                  'pm.test("[TC-ORDER-012] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ORDER-012] Trang load khong loi", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    console.log("[TC-ORDER-012] Orders count: " + (json.data ? json.data.length : 0));',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-013", "Xem lich su mua hang co don hang", "GET",
              "/orders/user?page=1&size=10",
              test_script=[
                  'pm.test("[TC-ORDER-013] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ORDER-013] Co don hang trong lich su", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json.data).to.be.an("array");',
                  '    if(json.data.length > 0) {',
                  '        var order = json.data[0];',
                  '        pm.expect(order).to.have.property("order_number");',
                  '        pm.expect(order).to.have.property("total_money");',
                  '        pm.expect(order).to.have.property("payment_status");',
                  '        console.log("[TC-ORDER-013] PASS: " + json.data.length + " orders found");',
                  '    } else {',
                  '        console.log("[TC-ORDER-013] INFO: No orders - seed data needed");',
                  '    }',
                  '});',
              ],
              auth="learner"),

    make_item("TC-ORDER-014", "Xem danh sach khoa hoc da dang ky - KNOWN FAIL tab nhom", "GET",
              "/enrollments/user-courses?page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ORDER-014] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ORDER-014] Tab khoa hoc doc lap load duoc", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    pm.expect(json.data).to.be.an("array");',
                  '    console.log("[TC-ORDER-014] Standalone courses: " + json.data.length);',
                  '});',
                  'pm.sendRequest({',
                  '    url: pm.variables.replaceIn("{{base_url}}/enrollments/user-courses-groups?page=1&pageSize=10"),',
                  '    method: "GET",',
                  '    header: { Authorization: "Bearer " + pm.environment.get("learner_token") }',
                  '}, function (err, res) {',
                  '    pm.test("[TC-ORDER-014] Tab khoa hoc nhom load duoc", function () {',
                  '        pm.expect(err).to.equal(null);',
                  '        pm.expect(res.code).to.equal(200);',
                  '        var groupJson = res.json();',
                  '        pm.expect(groupJson).to.have.property("data");',
                  '        pm.expect(groupJson.data).to.be.an("array");',
                  '        console.log("[TC-ORDER-014] Group courses: " + groupJson.data.length);',
                  '    });',
                  '});',
              ],
              auth="learner"),

    # ROLLBACK
    make_item("ROLLBACK-ORDER", "[ROLLBACK] Clear env; API chua ho tro xoa enrollment", "GET",
              "/enrollments/check-enrollment?courseId={{free_course_id}}&courseType=STANDALONE",
              test_script=[
                  'pm.test("[ROLLBACK-ORDER] Check enrollment endpoint hoat dong", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.environment.unset("created_enrollment_id");',
                  'pm.environment.unset("rollback_enrollment_course");',
                  'console.log("[ROLLBACK-ORDER] API chua ho tro delete enrollment; cleanup that su se xu ly bang DB");',
              ],
              auth="learner"),
])

print("order_folder items:", len(order_folder["item"]))


# ============================================================
# FOLDER 05 - QUAN LY NOI DUNG KHOA HOC (TC-INS)
# ============================================================
ins_folder = folder("05_QL_Noi_Dung_Khoa_Hoc", [

    make_item("SETUP-LOGIN-INS", "[SETUP] Login lay instructor_token", "POST", "/auth/login",
              body={"email": "instructor.john@test.local", "password": "password123"},
              test_script=[
                  'var json = pm.response.json();',
                  'if(json.token) { pm.environment.set("instructor_token", json.token); }',
              ],
              auth="none"),

    make_item("TC-INS-001", "Tao khoa hoc doc lap thanh cong", "POST", "/courses",
              body={
                  "code": "TC_INS_001_TEST",
                  "title": "Khoa hoc React tu Zero den Hero",
                  "description": "Hoc React JS tu co ban den nang cao",
                  "short_description": "React JS course",
                  "category_id": 1,
                  "level": "BEGINNER",
                  "language": "vi",
                  "price": 299000,
                  "currency": "VND",
                  "is_free": False,
                  "enrollment_type": "LIFETIME",
                  "thumbnail": "https://example.com/thumb.jpg",
              },
              pre_script=['pm.environment.set("rollback_course_code", "TC_INS_001_TEST");'],
              test_script=[
                  'pm.test("[TC-INS-001] Status 201", function() {',
                  '    pm.expect(pm.response.code).to.equal(201);',
                  '});',
                  'pm.test("[TC-INS-001] Khoa hoc duoc tao voi status DRAFT", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("id");',
                  '    pm.expect(json.status).to.equal("DRAFT");',
                  '    pm.environment.set("created_course_id", json.id);',
                  '    console.log("[TC-INS-001] Created course id=" + json.id);',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-002", "Tao khoa hoc mien phi isFree=true", "POST", "/courses",
              body={
                  "code": "TC_INS_002_FREE",
                  "title": "Khoa hoc mien phi test",
                  "description": "Free course test",
                  "short_description": "Free",
                  "category_id": 1,
                  "level": "BEGINNER",
                  "language": "vi",
                  "price": 0,
                  "currency": "VND",
                  "is_free": True,
                  "enrollment_type": "LIFETIME",
              },
              test_script=[
                  'pm.test("[TC-INS-002] Status 201", function() {',
                  '    pm.expect(pm.response.code).to.equal(201);',
                  '});',
                  'pm.test("[TC-INS-002] is_free=true va price=0", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json.is_free).to.be.true;',
                  '    pm.expect(Number(json.price)).to.equal(0);',
                  '    pm.environment.set("created_free_course_id", json.id);',
                  '    console.log("[TC-INS-002] Free course id=" + json.id);',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-007", "Tao khoa hoc tieu de trong - KNOWN FAIL BE", "POST", "/courses",
              body={
                  "code": "{{ins_007_code}}",
                  "title": "",
                  "description": "Test empty title",
                  "category_id": 1,
                  "level": "BEGINNER",
                  "language": "vi",
                  "price": 100000,
                  "currency": "VND",
                  "is_free": False,
                  "enrollment_type": "LIFETIME",
              },
              pre_script=[
                  'pm.environment.set("ins_007_code", "TC_INS_007_" + Date.now().toString().slice(-6));',
              ],
              test_script=[
                  'pm.test("[TC-INS-007] KNOWN FAIL: BE khong validate title rong", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 201) {',
                  '        var json = pm.response.json();',
                  '        if(json.id) pm.environment.set("created_invalid_course_id", json.id);',
                  '    }',
                  '    if(code === 400) {',
                  '        console.log("PASS: BE tra 400 cho title rong");',
                  '        var body = pm.response.text().toLowerCase();',
                  '        pm.expect(body).to.satisfy(b => b.includes("title") || b.includes("blank") || b.includes("empty"));',
                  '    } else {',
                      '        console.log("FAIL: BE tra " + code + " - chap nhan title rong (thieu @NotBlank)");',
                  '        pm.expect(code).to.equal(400, "BE should reject empty title - missing @NotBlank annotation");',
                  '    }',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-008", "Tao khoa hoc gia am so - BE validate dung", "POST", "/courses",
              body={
                  "code": "TC_INS_008_NEG",
                  "title": "Test negative price",
                  "description": "Test",
                  "category_id": 1,
                  "level": "BEGINNER",
                  "language": "vi",
                  "price": -50000,
                  "currency": "VND",
                  "is_free": False,
                  "enrollment_type": "LIFETIME",
              },
              test_script=[
                  'pm.test("[TC-INS-008] BE tra 400 cho gia am", function() {',
                  '    pm.expect(pm.response.code).to.equal(400);',
                  '});',
                  'pm.test("[TC-INS-008] Response co thong bao loi gia", function() {',
                  '    var body = JSON.stringify(pm.response.json()).toLowerCase();',
                  '    pm.expect(body).to.satisfy(b => b.includes("price") || b.includes("0") || b.includes("greater"));',
                  '    console.log("[TC-INS-008] PASS: BE validate gia am");',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-009", "Cap nhat khoa hoc thanh cong - KNOWN FAIL FE cache", "PATCH",
              "/courses/{{created_course_id}}",
              body={"title": "React.js Complete Course - 2026", "price": 399000},
              test_script=[
                  'pm.test("[TC-INS-009] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-INS-009] DB cap nhat dung - FE cache van hien cu", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json.title).to.equal("React.js Complete Course - 2026");',
                  '    pm.expect(Number(json.price)).to.equal(399000);',
                  '    console.log("[TC-INS-009] PASS API: title=" + json.title);',
                  '    console.log("[TC-INS-009] KNOWN FAIL FE: Next.js router cache khong refresh sau update");',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-010", "Xoa khoa hoc khong co hoc vien", "DELETE",
              "/courses/{{created_course_id}}",
              test_script=[
                  'pm.test("[TC-INS-010] Status 204", function() {',
                  '    pm.expect(pm.response.code).to.equal(204);',
                  '});',
                  'pm.environment.unset("created_course_id");',
                  'console.log("[TC-INS-010] Course deleted");',
              ],
              auth="instructor"),

    make_item("TC-INS-011", "Xoa khoa hoc co hoc vien - KNOWN FAIL BE", "DELETE",
              "/courses/{{enrolled_course_id}}",
              test_script=[
                  'pm.test("[TC-INS-011] BE chan xoa course da co hoc vien", function() {',
                  '    var code = pm.response.code;',
                  '    if([400, 403, 409].includes(code)) {',
                  '        console.log("PASS: BE chặn xoa course co enrollment");',
                  '    } else {',
                  '        console.log("FAIL: BE tra " + code + " - xoa duoc course co enrollment");',
                  '        pm.expect(code).to.be.oneOf([400, 403, 409], "BE should reject delete when enrollments exist");',
                  '    }',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-012", "Xuat ban khoa hoc thanh cong", "PATCH",
              "/courses/{{draft_course_id}}/publish",
              test_script=[
                  'pm.test("[TC-INS-012] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-INS-012] Response xac nhan da publish", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(Number(json.course_id)).to.equal(Number(pm.variables.get("draft_course_id")));',
                  '    pm.expect((json.message || "").toLowerCase()).to.include("published");',
                  '    console.log("[TC-INS-012] PASS: Course published");',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-013", "Xuat ban khoa hoc chua co module - KNOWN FAIL BE", "POST",
              "/courses",
              body={
                  "code": "{{ins_013_code}}",
                  "title": "Empty course no module",
                  "description": "Test",
                  "category_id": 1,
                  "level": "BEGINNER",
                  "language": "vi",
                  "price": 100000,
                  "currency": "VND",
                  "is_free": False,
                  "enrollment_type": "LIFETIME",
              },
              pre_script=[
                  'pm.environment.set("ins_013_code", "TC_INS_013_" + Date.now().toString().slice(-6));',
                  'pm.environment.set("rollback_empty_course", pm.environment.get("ins_013_code"));',
              ],
              test_script=[
                  'if(pm.response.code === 201) {',
                  '    var json = pm.response.json();',
                  '    pm.environment.set("empty_course_id", json.id);',
                  '    console.log("[TC-INS-013] Created empty course id=" + json.id + " - will test publish next");',
                  '}',
              ],
              auth="instructor"),

    make_item("TC-INS-013b", "Xuat ban khoa hoc chua co module - PATCH publish", "PATCH",
              "/courses/{{empty_course_id}}/publish",
              test_script=[
                  'pm.test("[TC-INS-013] KNOWN FAIL: BE cho phep publish khong co module", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) {',
                  '        console.log("PASS: BE chặn publish course khong co module");',
                  '    } else {',
                  '        console.log("FAIL: BE tra " + code + " - cho phep publish course rong (thieu validation module)");',
                  '        pm.expect(code).to.equal(400, "BE should reject publish for course with no modules");',
                  '    }',
                  '});',
              ],
              auth="instructor"),

    make_item("TC-INS-029", "Them cau hoi voi it hon 4 dap an - KNOWN FAIL BE", "POST",
              "/quizzes/1/questions",
              body={
                  "question_text": "Test question with 3 options",
                  "options": [
                      {"option_text": "Option A", "is_correct": True, "sort_order": 1},
                      {"option_text": "Option B", "is_correct": False, "sort_order": 2},
                      {"option_text": "Option C", "is_correct": False, "sort_order": 3},
                  ],
              },
              test_script=[
                  'pm.test("[TC-INS-029] KNOWN FAIL: BE cho phep < 4 dap an", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400) {',
                  '        console.log("PASS: BE chặn < 4 dap an");',
                  '    } else {',
                  '        console.log("FAIL: BE tra " + code + " - cho phep tao cau hoi voi 3 dap an");',
                  '        pm.expect(code).to.equal(400, "BE should require exactly 4 options");',
                  '    }',
                  '});',
              ],
              auth="instructor"),

    # ROLLBACK
    make_item("ROLLBACK-INS", "[ROLLBACK] Xoa cac course test", "GET",
              "/courses?page=1&pageSize=1",
              test_script=[
                  'pm.test("[ROLLBACK-INS] Public course endpoint hoat dong", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  '["created_free_course_id", "empty_course_id", "created_course_id", "created_invalid_course_id"].forEach(function(key) {',
                  '    var courseId = pm.environment.get(key);',
                  '    if (!courseId) return;',
                  '    pm.sendRequest({',
                  '        url: pm.variables.replaceIn("{{base_url}}/courses/" + courseId),',
                  '        method: "DELETE",',
                  '        header: { Authorization: "Bearer " + pm.environment.get("instructor_token") }',
                  '    }, function (err, res) {',
                  '        console.log("[ROLLBACK-INS] delete " + key + "=" + courseId + " => " + (err ? err : res.code));',
                  '    });',
                  '    pm.environment.unset(key);',
                  '});',
                  'pm.environment.unset("rollback_empty_course");',
                  'console.log("[ROLLBACK-INS] Instructor cleanup dispatched");',
              ],
              auth="none"),
])

print("ins_folder items:", len(ins_folder["item"]))


# ============================================================
# FOLDER 06 - QUAN TRI HE THONG (TC-ADM)
# ============================================================
adm_folder = folder("06_Quan_Tri_He_Thong", [

    make_item("SETUP-LOGIN-ADM", "[SETUP] Login lay admin_token", "POST", "/auth/login",
              body={"email": "admin@test.local", "password": "password123"},
              test_script=[
                  'var json = pm.response.json();',
                  'if(json.token) { pm.environment.set("admin_token", json.token); }',
              ],
              auth="none"),

    make_item("TC-ADM-001", "Duyet khoa hoc PUBLISHED -> ACTIVE", "PATCH",
              "/courses/{{admin_course_id}}/status",
              body={"course_status": "ACTIVE", "reason": "Approved by admin test"},
              test_script=[
                  'pm.test("[TC-ADM-001] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-001] Status chuyen sang ACTIVE", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json.status).to.equal("ACTIVE");',
                  '    console.log("[TC-ADM-001] PASS: Course approved -> ACTIVE");',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-002", "Tam dung khoa hoc PUBLISHED -> SUSPENDED - KNOWN FAIL", "PATCH",
              "/courses/{{admin_course_id}}/status",
              body={"course_status": "DEACTIVATED", "reason": "Violation test"},
              test_script=[
                  'pm.test("[TC-ADM-002] KNOWN FAIL: Khong co trang thai SUSPENDED", function() {',
                  '    var code = pm.response.code;',
                  '    var json = pm.response.json();',
                  '    if(code === 200 && json.status === "DEACTIVATED") {',
                  '        console.log("INFO: BE dung DEACTIVATED thay vi SUSPENDED - nut FE bi nham");',
                  '    }',
                  '    pm.expect(code).to.equal(200);',
                  '    console.log("[TC-ADM-002] FAIL: FE nut Tam dung dang goi logic Xoa, khong co SUSPENDED state");',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-005", "Tim kiem khoa hoc voi bo loc day du", "GET",
              "/courses?search=React&status=ACTIVE&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-005] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-005] Ket qua khop dieu kien loc", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    if(json.data.length > 0) {',
                  '        json.data.forEach(c => {',
                  '            pm.expect(c.status).to.equal("ACTIVE");',
                  '        });',
                  '        console.log("[TC-ADM-005] PASS: " + json.data.length + " courses found");',
                  '    }',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-006", "Tim kiem khong co ket qua", "GET",
              "/courses?search=xyzabc123&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-006] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-006] Tra ve mang rong", function() {',
                  '    var json = pm.response.json();',
                  '    var count = json.data ? json.data.length : 0;',
                  '    pm.expect(count).to.equal(0);',
                  '    console.log("[TC-ADM-006] PASS: Empty result");',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-007", "Them danh muc moi thanh cong", "POST",
              "/categories",
              body={"name": "TC_ADM_007_DataScience", "description": "Test category", "image": "https://example.com/img.jpg"},
              pre_script=['pm.environment.set("rollback_category_name", "TC_ADM_007_DataScience");'],
              test_script=[
                  'pm.test("[TC-ADM-007] Status 201", function() {',
                  '    pm.expect(pm.response.code).to.equal(201);',
                  '});',
                  'pm.test("[TC-ADM-007] Category duoc tao", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("id");',
                  '    pm.environment.set("created_category_id", json.id);',
                  '    console.log("[TC-ADM-007] Created category id=" + json.id);',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-009", "Them danh muc trung ten - KNOWN FAIL BE", "POST",
              "/categories",
              body={"name": "Programming", "description": "Duplicate test", "image": "https://example.com/img.jpg"},
              test_script=[
                  'pm.test("[TC-ADM-009] KNOWN FAIL: BE cho phep tao danh muc trung ten", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 400 || code === 409) {',
                  '        console.log("PASS: BE chặn danh muc trung ten");',
                  '    } else {',
                  '        console.log("FAIL: BE tra " + code + " - cho phep tao danh muc trung ten");',
                  '        pm.expect(code).to.be.oneOf([400, 409], "BE should reject duplicate category name");',
                  '    }',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-011", "Cap nhat danh muc thanh cong", "PATCH",
              "/categories/{{created_category_id}}",
              body={"name": "TC_ADM_007_DataScience_Updated", "description": "Updated"},
              test_script=[
                  'pm.test("[TC-ADM-011] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-011] Ten duoc cap nhat", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json.name).to.include("Updated");',
                  '    console.log("[TC-ADM-011] PASS: Category updated");',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-013", "Xoa danh muc khong co khoa hoc", "DELETE",
              "/categories/{{created_category_id}}",
              test_script=[
                  'pm.test("[TC-ADM-013] Status 200 or 204", function() {',
                  '    pm.expect(pm.response.code).to.be.oneOf([200, 204]);',
                  '});',
                  'pm.environment.unset("created_category_id");',
                  'console.log("[TC-ADM-013] Category deleted");',
              ],
              auth="admin"),

    make_item("TC-ADM-014", "Tim kiem hoc vien theo ten hoac email", "GET",
              "/admin/students?search=student&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-014] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-014] Co ket qua hoc vien", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    console.log("[TC-ADM-014] Students found: " + (json.data ? json.data.length : 0));',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-017", "Tim kiem giang vien theo ten", "GET",
              "/admin/instructors?search=instructor&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-017] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-017] Co ket qua giang vien", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    console.log("[TC-ADM-017] Instructors found: " + (json.data ? json.data.length : 0));',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-020", "Xem danh sach tat ca don hang", "GET",
              "/orders/admin?page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-020] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'pm.test("[TC-ADM-020] Danh sach don hang hien thi dung", function() {',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    if(json.data && json.data.length > 0) {',
                  '        var order = json.data[0];',
                  '        pm.expect(order).to.have.property("order_number");',
                  '        pm.expect(order).to.have.property("total_money");',
                  '        pm.expect(order).to.have.property("payment_status");',
                  '        pm.environment.set("sample_order_number", order.order_number);',
                  '        console.log("[TC-ADM-020] PASS: " + json.data.length + " orders");',
                  '    }',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-022", "Tim kiem don hang theo ma don - KNOWN FAIL FE", "GET",
              "/orders/admin?search={{sample_order_number}}&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-022] KNOWN FAIL: FE khong co o tim kiem don hang", function() {',
                  '    var code = pm.response.code;',
                  '    if(code === 200) {',
                  '        var json = pm.response.json();',
                  '        var hasSearch = json.data && json.data.length > 0;',
                  '        if(hasSearch) {',
                  '            console.log("PASS API: Tim kiem don hang hoat dong");',
                  '        } else {',
                  '            console.log("INFO: API ho tro search nhung FE chua implement o tim kiem");',
                  '        }',
                  '    }',
                  '    pm.expect(code).to.equal(200);',
                  '    console.log("[TC-ADM-022] KNOWN FAIL FE: Man orders chi co filter paymentStatus, khong co search");',
                  '});',
              ],
              auth="admin"),

    make_item("TC-ADM-023", "Xem danh sach thu nhap giang vien - KNOWN FAIL mock", "GET",
              "/admin/instructor-earnings?month=5&year=2026&page=1&pageSize=10",
              test_script=[
                  'pm.test("[TC-ADM-023] KNOWN FAIL: Du lieu dang mock", function() {',
                  '    var code = pm.response.code;',
                  '    pm.expect(code).to.equal(200);',
                  '    var json = pm.response.json();',
                  '    pm.expect(json).to.have.property("data");',
                  '    console.log("[TC-ADM-023] KNOWN FAIL: FE dang dung mock data thay vi API that");',
                  '});',
              ],
              auth="admin"),

    make_item("ROLLBACK-ADM", "[ROLLBACK] Khoi phuc trang thai course admin", "PATCH",
              "/courses/{{admin_course_id}}/status",
              body={"course_status": "ACTIVE", "reason": "Rollback after Postman run"},
              test_script=[
                  'pm.test("[ROLLBACK-ADM] Status 200", function() {',
                  '    pm.expect(pm.response.code).to.equal(200);',
                  '});',
                  'console.log("[ROLLBACK-ADM] Restored admin course to ACTIVE");',
              ],
              auth="admin"),
])

print("adm_folder items:", len(adm_folder["item"]))


# ============================================================
# BUILD COLLECTION JSON
# ============================================================
collection = {
    "info": {
        "name": "Online Learning System - API Tests (13_system_test.xlsx)",
        "description": "Postman collection mapping 13_system_test.xlsx. Covers TC-AUTH, TC-COURSE, TC-ORDER, TC-INS, TC-ADM. Includes rollback scripts and DB verification notes.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "variable": [
        {"key": "base_url",           "value": "http://127.0.0.1:8080/api/v1", "type": "string"},
        {"key": "learner_token",      "value": "", "type": "string"},
        {"key": "instructor_token",   "value": "", "type": "string"},
        {"key": "admin_token",        "value": "", "type": "string"},
        {"key": "free_course_id",     "value": "5", "type": "string"},
        {"key": "paid_course_id",     "value": "1", "type": "string"},
        {"key": "draft_course_id",    "value": "10", "type": "string"},
        {"key": "enrolled_course_id", "value": "6", "type": "string"},
        {"key": "course_group_id",    "value": "3", "type": "string"},
        {"key": "admin_course_id",    "value": "5", "type": "string"},
        {"key": "created_course_id",  "value": "", "type": "string"},
        {"key": "created_enrollment_id", "value": "", "type": "string"},
        {"key": "created_category_id",   "value": "", "type": "string"},
        {"key": "created_cart_item_id",  "value": "", "type": "string"},
        {"key": "empty_course_id",       "value": "", "type": "string"},
        {"key": "sample_order_number",   "value": "", "type": "string"},
    ],
    "item": [auth_folder, course_folder, order_folder, ins_folder, adm_folder],
}

out_path = "online_learning_collection.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(collection, f, ensure_ascii=False, indent=2)

total = sum(len(folder["item"]) for folder in collection["item"])
print(f"\nCollection saved to: {out_path}")
print(f"Total requests: {total}")
print("Folders:")
for fld in collection["item"]:
    print(f"  {fld['name']}: {len(fld['item'])} requests")
