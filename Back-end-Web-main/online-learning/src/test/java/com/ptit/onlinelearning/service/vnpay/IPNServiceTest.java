package com.ptit.onlinelearning.service.vnpay;

import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.component.VNPayConfig;
import com.ptit.onlinelearning.component.VNPayUtils;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.response.IpnResponse;
import com.ptit.onlinelearning.response.VnpIpnResponseConst;
import com.ptit.onlinelearning.service.course.ICourseService;
import com.ptit.onlinelearning.service.order.IOrderService;
import com.ptit.onlinelearning.service.preorder.IPreOrderEnrollmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho IPNService (Thanh toán qua VNPay)
 */
@ExtendWith(MockitoExtension.class)
class IPNServiceTest {

    @Mock private IOrderService orderService;
    @Mock private VNPayConfig vnPayConfig;
    @Mock private VNPayUtils vnPayUtils;
    @Mock private ICourseService courseService;
    @Mock private IPreOrderEnrollmentService preOrderEnrollmentService;

    @InjectMocks
    private IPNService ipnService;

    private Map<String, String> params;
    private Order mockOrder;

    @BeforeEach
    void setUp() {
        params = new HashMap<>();
        params.put("vnp_TxnRef", "ONL123");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_Amount", "10000000"); // 100,000 VND * 100

        mockOrder = new Order();
        mockOrder.setOrderNumber("ONL123");
        mockOrder.setTotalMoney(new BigDecimal("100000"));
        mockOrder.setPaymentStatus(PaymentStatus.PENDING);
    }

    // TC-IPN-001: Order không tồn tại
    @Test
    @DisplayName("TC-IPN-001: Order không tồn tại -> Trả về ORDER_NOT_FOUND")
    void processIpnForOrder_notFound() {
        when(orderService.getOrderByOrderNumber("ONL123")).thenReturn(null);

        IpnResponse res = ipnService.processIpnForOrder(params);

        assertThat(res).isEqualTo(VnpIpnResponseConst.ORDER_NOT_FOUND);
    }

    // TC-IPN-002: Sai số tiền
    @Test
    @DisplayName("TC-IPN-002: Số tiền thanh toán sai -> Trả về INVALID_AMOUNT")
    void processIpnForOrder_invalidAmount() {
        params.put("vnp_Amount", "9999900"); // Không khớp với 100000
        when(orderService.getOrderByOrderNumber("ONL123")).thenReturn(mockOrder);

        IpnResponse res = ipnService.processIpnForOrder(params);

        assertThat(res).isEqualTo(VnpIpnResponseConst.INVALID_AMOUNT);
    }

    // TC-IPN-003: Đã xác nhận trước đó
    @Test
    @DisplayName("TC-IPN-003: Đơn hàng đã xử lý xong (SUCCESS) -> Trả về ORDER_ALREADY_CONFIRMED")
    void processIpnForOrder_alreadyConfirmed() {
        mockOrder.setPaymentStatus(PaymentStatus.SUCCESS);
        when(orderService.getOrderByOrderNumber("ONL123")).thenReturn(mockOrder);

        IpnResponse res = ipnService.processIpnForOrder(params);

        assertThat(res).isEqualTo(VnpIpnResponseConst.ORDER_ALREADY_CONFIRMED);
    }

    // TC-IPN-004: Thanh toán thành công -> update order
    @Test
    @DisplayName("TC-IPN-004: Giao dịch thành công (00) -> Cập nhật trạng thái SUCCESS")
    void processIpnForOrder_success() {
        when(orderService.getOrderByOrderNumber("ONL123")).thenReturn(mockOrder);
        when(orderService.updateStatusOrderSuccess(any(Order.class))).thenReturn(mockOrder);

        IpnResponse res = ipnService.processIpnForOrder(params);

        verify(orderService, times(1)).updateStatusOrderSuccess(mockOrder);
        assertThat(mockOrder.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(res).isEqualTo(VnpIpnResponseConst.SUCCESS);
    }

    // TC-IPN-005: Thanh toán thất bại -> update order FAILED
    @Test
    @DisplayName("TC-IPN-005: Giao dịch thất bại (mã khác 00) -> Cập nhật trạng thái FAILED")
    void processIpnForOrder_failed() {
        params.put("vnp_ResponseCode", "24"); // Mã lỗi hủy giao dịch
        when(orderService.getOrderByOrderNumber("ONL123")).thenReturn(mockOrder);
        when(orderService.updateStatusOrderSuccess(any(Order.class))).thenReturn(mockOrder);

        IpnResponse res = ipnService.processIpnForOrder(params);

        verify(orderService, times(1)).updateStatusOrderSuccess(mockOrder);
        assertThat(mockOrder.getPaymentStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(res).isEqualTo(VnpIpnResponseConst.SUCCESS); // IPN logic vẫn trả về SUCCESS cho VNPay
    }

    // TC-IPN-006: PreOrder thanh toán thành công
    @Test
    @DisplayName("TC-IPN-006: PreOrder giao dịch thành công (00) -> Cập nhật PAID")
    void processIpnForPreOrder_success() {
        com.ptit.onlinelearning.model.PreOrderEnrollment preOrder = new com.ptit.onlinelearning.model.PreOrderEnrollment();
        preOrder.setStatus(com.ptit.onlinelearning.common.type.PreOrderStatus.RESERVED);
        preOrder.setPricePaid(new BigDecimal("100000"));

        when(preOrderEnrollmentService.getPreOrderEnrollmentByPaymentId("ONL123")).thenReturn(preOrder);

        IpnResponse res = ipnService.processIpnForPreOrder(params);

        verify(preOrderEnrollmentService, times(1)).updatePreOrderStatusSuccess(preOrder);
        assertThat(preOrder.getStatus()).isEqualTo(com.ptit.onlinelearning.common.type.PreOrderStatus.PAID);
        assertThat(res).isEqualTo(VnpIpnResponseConst.SUCCESS);
    }

    // TC-IPN-007: PreOrder thanh toán thất bại
    @Test
    @DisplayName("TC-IPN-007: PreOrder giao dịch thất bại -> Cập nhật CANCELLED")
    void processIpnForPreOrder_failed() {
        params.put("vnp_ResponseCode", "24");
        com.ptit.onlinelearning.model.PreOrderEnrollment preOrder = new com.ptit.onlinelearning.model.PreOrderEnrollment();
        preOrder.setStatus(com.ptit.onlinelearning.common.type.PreOrderStatus.RESERVED);
        preOrder.setPricePaid(new BigDecimal("100000"));

        when(preOrderEnrollmentService.getPreOrderEnrollmentByPaymentId("ONL123")).thenReturn(preOrder);

        IpnResponse res = ipnService.processIpnForPreOrder(params);

        verify(preOrderEnrollmentService, times(1)).updatePreOrderStatusSuccess(preOrder);
        assertThat(preOrder.getStatus()).isEqualTo(com.ptit.onlinelearning.common.type.PreOrderStatus.CANCELLED);
        assertThat(res).isEqualTo(VnpIpnResponseConst.SUCCESS);
    }

    // TC-IPN-008: verifyIPN
    @Test
    @DisplayName("TC-IPN-008: Xác thực chữ ký IPN")
    void verifyIPN_success() {
        params.put("vnp_SecureHash", "HASHED");
        when(vnPayConfig.getSecretKey()).thenReturn("SECRET");
        when(vnPayUtils.hmacSHA512(eq("SECRET"), anyString())).thenReturn("HASHED");

        Boolean isValid = ipnService.verifyIPN(params);

        assertThat(isValid).isTrue();
    }
}
