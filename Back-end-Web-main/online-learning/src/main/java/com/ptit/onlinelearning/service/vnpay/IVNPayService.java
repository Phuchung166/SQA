package com.ptit.onlinelearning.service.vnpay;

import com.ptit.onlinelearning.request.InitPaymentRequest;


public interface IVNPayService {

    String createPaymentUrl(InitPaymentRequest initPaymentRequest);


}
