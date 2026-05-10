package com.ptit.onlinelearning.service.vnpay;

import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.component.VNPayConfig;
import com.ptit.onlinelearning.component.VNPayUtils;
import com.ptit.onlinelearning.request.InitPaymentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Unit Test cho VNPayService
 * Technique: EP + BVA + Negative Testing
 */
@ExtendWith(MockitoExtension.class)
class VNPayServiceTest {

    @Mock private VNPayConfig vnPayConfig;
    @Mock private VNPayUtils vnPayUtils;

    @InjectMocks
    private VNPayService vnPayService;

    private InitPaymentRequest req;

    @BeforeEach
    void setUp() {
        req = InitPaymentRequest.builder()
                .orderNumber("ONL123")
                .ipAddress("127.0.0.1")
                .totalMoney(new BigDecimal("100000"))
                .orderType(OrderType.ORDER_COURSE)
                .build();
    }

    // TC-VNP-001: Tạo URL thanh toán Order thông thường
    @Test
    @DisplayName("TC-VNP-001: Tạo URL thanh toán VNPay cho Order thành công")
    void createPaymentUrl_order_success() {
        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpReturnUrlOrder()).thenReturn("http://localhost/return");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(eq("SECRET"), anyString())).thenReturn("HASHEDSTRING");

        String url = vnPayService.createPaymentUrl(req);

        assertThat(url).contains("http://vnpay.vn/pay?");
        assertThat(url).contains("vnp_Amount=10000000"); // 100,000 * 100
        assertThat(url).contains("vnp_TxnRef=ONL123");
        assertThat(url).contains("vnp_ReturnUrl=http%3A%2F%2Flocalhost%2Freturn");
        assertThat(url).contains("vnp_SecureHash=HASHEDSTRING");
    }

    // TC-VNP-002: Tạo URL thanh toán PreOrder Enrollment
    @Test
    @DisplayName("TC-VNP-002: Tạo URL thanh toán VNPay cho PreOrder thành công")
    void createPaymentUrl_preOrder_success() {
        req.setOrderType(OrderType.PRE_ORDER_ENROLLMENT);

        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpReturnUrlPreOrder()).thenReturn("http://localhost/return-preorder");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(eq("SECRET"), anyString())).thenReturn("HASHEDSTRING");

        String url = vnPayService.createPaymentUrl(req);

        assertThat(url).contains("vnp_ReturnUrl=http%3A%2F%2Flocalhost%2Freturn-preorder");
    }

    // TC-VNP-003: Amount 1,500,000 VND -> vnp_Amount phải là 150,000,000 (nhân 100)
    @Test
    @DisplayName("TC-VNP-003: Amount 1,500,000 VND -> vnp_Amount=150000000 (BVA: nhân 100)")
    void createPaymentUrl_largeAmount_multipliedBy100() {
        req.setTotalMoney(new BigDecimal("1500000"));

        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpReturnUrlOrder()).thenReturn("http://localhost/return");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(eq("SECRET"), anyString())).thenReturn("HASH");

        String url = vnPayService.createPaymentUrl(req);

        assertThat(url).contains("vnp_Amount=150000000");
    }

    // TC-VNP-004: vnp_TxnRef phải khớp chính xác với OrderNumber
    @Test
    @DisplayName("TC-VNP-004: vnp_TxnRef phải khớp với OrderNumber được truyền vào")
    void createPaymentUrl_txnRefMatchesOrderNumber() {
        req.setOrderNumber("ONL_SPECIAL_789");

        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpReturnUrlOrder()).thenReturn("http://localhost/return");
        when(vnPayConfig.getSecretKey()).thenReturn("MY_SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(eq("MY_SECRET"), anyString())).thenReturn("HASH789");

        String url = vnPayService.createPaymentUrl(req);

        assertThat(url).contains("vnp_TxnRef=ONL_SPECIAL_789");
        assertThat(url).contains("vnp_SecureHash=HASH789");
    }

    // TC-VNP-005: ReturnUrl chứa ký tự đặc biệt phải được URL-encode đúng
    @Test
    @DisplayName("TC-VNP-005: ReturnUrl chứa ký tự đặc biệt (:, /) phải được URL-encode trong URL kết quả")
    void createPaymentUrl_returnUrlEncoded_correctly() {
        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpReturnUrlOrder()).thenReturn("http://localhost:8080/api/v1/return?source=web");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(eq("SECRET"), anyString())).thenReturn("HASH_ENCODED");

        String url = vnPayService.createPaymentUrl(req);

        // Dấu : và / phải được encode thành %3A và %2F
        assertThat(url).contains("vnp_ReturnUrl=http%3A%2F%2Flocalhost");
        assertThat(url).contains("vnp_SecureHash=HASH_ENCODED");
    }

    // TC-VNP-006: URL phải chứa vnp_TmnCode của merchant
    @Test
    @DisplayName("TC-VNP-006: URL tạo ra phải chứa vnp_TmnCode của merchant")
    void createPaymentUrl_containsTmnCode() {
        when(vnPayConfig.getVnpTmnCode()).thenReturn("MERCHANT_CODE_XYZ");
        when(vnPayConfig.getVnpReturnUrlOrder()).thenReturn("http://localhost/return");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn/pay");
        when(vnPayUtils.hmacSHA512(anyString(), anyString())).thenReturn("HASH");

        String url = vnPayService.createPaymentUrl(req);

        assertThat(url).contains("vnp_TmnCode=MERCHANT_CODE_XYZ");
    }
}
