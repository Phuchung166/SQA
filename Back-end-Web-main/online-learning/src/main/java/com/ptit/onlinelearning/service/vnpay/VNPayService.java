package com.ptit.onlinelearning.service.vnpay;

import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.component.VNPayConfig;
import com.ptit.onlinelearning.component.VNPayUtils;
import com.ptit.onlinelearning.request.InitPaymentRequest;
import com.ptit.onlinelearning.response.IpnResponse;
import com.ptit.onlinelearning.service.order.IOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayService implements IVNPayService {

    private final VNPayConfig vnPayConfig;
    private final VNPayUtils vnPayUtils;



    @Override
    public String createPaymentUrl(InitPaymentRequest initPaymentRequest) {
        String version = "2.1.0";
        String command = "pay";
        String orderType = initPaymentRequest.getOrderType();
        BigDecimal amount = initPaymentRequest.getTotalMoney().multiply(BigDecimal.valueOf(100));


        String transactionReference = initPaymentRequest.getOrderNumber();
        String clientIpAddress = initPaymentRequest.getIpAddress();

        String terminalCode = vnPayConfig.getVnpTmnCode();

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", version);
        params.put("vnp_Command", command);
        params.put("vnp_TmnCode", terminalCode);
        params.put("vnp_Amount", String.valueOf(amount.toBigInteger()));
        params.put("vnp_CurrCode", "VND");

        params.put("vnp_TxnRef", transactionReference);
        params.put("vnp_OrderInfo", "Thanh toan don hang:" + transactionReference);
        params.put("vnp_OrderType", orderType);

        params.put("vnp_Locale", "vn");

        params.put("vnp_ReturnUrl", orderType.equals(OrderType.PRE_ORDER_ENROLLMENT) ? vnPayConfig.getVnpReturnUrlPreOrder() : vnPayConfig.getVnpReturnUrlOrder());
        params.put("vnp_IpAddr", clientIpAddress);

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        String createdDate = dateFormat.format(calendar.getTime());
        params.put("vnp_CreateDate", createdDate);

        calendar.add(Calendar.MINUTE, 15);
        String expirationDate = dateFormat.format(calendar.getTime());
        params.put("vnp_ExpireDate", expirationDate);

        List<String> sortedFieldNames = new ArrayList<>(params.keySet());
        Collections.sort(sortedFieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder queryData = new StringBuilder();

        Iterator<String> iterator = sortedFieldNames.iterator();

        while (iterator.hasNext()) {
            String fieldName = iterator.next();
            String fieldValue = params.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {

                hashData.append(fieldName)
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                queryData.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (iterator.hasNext()) {
                    hashData.append("&");
                    queryData.append("&");
                }
            }
        }


        String secureHash = vnPayUtils.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryData.append("&vnp_SecureHash=").append(secureHash);

        return vnPayConfig.getVnpPayUrl() + "?" + queryData;
    }


}
