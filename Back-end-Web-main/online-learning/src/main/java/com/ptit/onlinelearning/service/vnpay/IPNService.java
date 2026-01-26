package com.ptit.onlinelearning.service.vnpay;

import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import com.ptit.onlinelearning.component.VNPayConfig;
import com.ptit.onlinelearning.component.VNPayUtils;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.response.IpnResponse;
import com.ptit.onlinelearning.response.VnpIpnResponseConst;
import com.ptit.onlinelearning.service.course.ICourseService;
import com.ptit.onlinelearning.service.order.IOrderService;
import com.ptit.onlinelearning.service.preorder.IPreOrderEnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;


@Service
@Slf4j
@RequiredArgsConstructor
public class IPNService {
    private final IOrderService orderService;
    private final VNPayConfig vnPayConfig;
    private final VNPayUtils vnPayUtils;

    private final ICourseService courseService;

    private final IPreOrderEnrollmentService preOrderEnrollmentService;

    public IpnResponse processIpnForOrder(Map<String, String> params) {
        try {
//            if(!verifyIPN(params)){
//                return VnpIpnResponseConst.SIGNATURE_FAILED;
//            }
            String orderNumber = params.get("vnp_TxnRef");
            log.info("orderNumber:{}", orderNumber);
            String responseCode = params.get("vnp_ResponseCode");
            log.info("responseCode:{}", responseCode);
            BigDecimal totalMoney = BigDecimal.valueOf(Long.parseLong(params.get("vnp_Amount")));
            Order order = orderService.getOrderByOrderNumber(orderNumber);

            if (order == null) {
                return VnpIpnResponseConst.ORDER_NOT_FOUND;
            }
            BigDecimal moneyInDb = order.getTotalMoney().multiply(BigDecimal.valueOf(100));
            if (moneyInDb.compareTo(totalMoney) != 0) {
                return VnpIpnResponseConst.INVALID_AMOUNT;
            }
            if(order.getPaymentStatus().compareTo(PaymentStatus.PENDING) !=0){
                return VnpIpnResponseConst.ORDER_ALREADY_CONFIRMED;
            }
            if ("00".equals(responseCode)) {
                order.setPaymentStatus(PaymentStatus.SUCCESS);
            } else {
                order.setPaymentStatus(PaymentStatus.FAILED);
            }
            orderService.updateStatusOrderSuccess(order);
            log.info("update order {} with status {}", orderNumber, order.getPaymentStatus());
            return VnpIpnResponseConst.SUCCESS;
        } catch (Exception e) {
            log.error("Error processing IPN: {}", e.getMessage(), e);
            return VnpIpnResponseConst.UNKNOW_ERROR;
        }
    }


    public IpnResponse processIpnForPreOrder(Map<String, String> params) {
        try {
//            if(!verifyIPN(params)){
//                return VnpIpnResponseConst.SIGNATURE_FAILED;
//            }
            String orderNumber = params.get("vnp_TxnRef");
            log.info("orderNumber:{}", orderNumber);
            String responseCode = params.get("vnp_ResponseCode");
            log.info("responseCode:{}", responseCode);
            BigDecimal totalMoney = BigDecimal.valueOf(Long.parseLong(params.get("vnp_Amount")));
            var preOrder = preOrderEnrollmentService.getPreOrderEnrollmentByPaymentId(orderNumber);
            if(preOrder == null){
                return VnpIpnResponseConst.ORDER_NOT_FOUND;
            }
            BigDecimal moneyInDb = preOrder.getPricePaid().multiply(BigDecimal.valueOf(100));
            if (moneyInDb.compareTo(totalMoney) != 0) {
                return VnpIpnResponseConst.INVALID_AMOUNT;
            }
            if(preOrder.getStatus().compareTo(PreOrderStatus.RESERVED) !=0){
                return VnpIpnResponseConst.ORDER_ALREADY_CONFIRMED;
            }

            if ("00".equals(responseCode)) {
                preOrder.setStatus(PreOrderStatus.PAID);
            } else {
                preOrder.setStatus(PreOrderStatus.CANCELLED);
            }
            preOrderEnrollmentService.updatePreOrderStatusSuccess(preOrder);
            return VnpIpnResponseConst.SUCCESS;

        }catch (Exception e){
            log.error("Error processing IPN for PreOrder: {}", e.getMessage(), e);
            return VnpIpnResponseConst.UNKNOW_ERROR;
        }
    }


    public Boolean verifyIPN(Map<String, String> params) {
        var reqSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        var hashPayload = new StringBuilder();
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        Iterator<String> itr = fieldNames.iterator();
        while ( itr.hasNext()) {
            var fieldName = itr.next();
            var fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashPayload.append(fieldName);
                hashPayload.append("=");
                hashPayload.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashPayload.append("&");
                }
            }
        }
        var secureHash = vnPayUtils.hmacSHA512(vnPayConfig.getSecretKey(), hashPayload.toString());
        return secureHash.equals(reqSecureHash);
    }
}
