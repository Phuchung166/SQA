package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.response.IpnResponse;
import com.ptit.onlinelearning.response.VnpIpnResponseConst;
import com.ptit.onlinelearning.service.vnpay.IPNService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {


    private final IPNService ipnService;


    @GetMapping("/vnpay-ipn")
    public ResponseEntity<IpnResponse> handleIPN(@RequestParam Map<String, String> allParams) {
        log.info("Received IPN with params: {}", allParams);
        IpnResponse ipnResponse = null;
        if(!ipnService.verifyIPN(allParams)){
            ipnResponse =VnpIpnResponseConst.SIGNATURE_FAILED;
        }
        String txnRef = allParams.get("vnp_TxnRef");

        if(txnRef.startsWith("ONL")){
            ipnResponse = ipnService.processIpnForOrder(allParams);
        } else if (txnRef.startsWith("PREORDER")) {
            ipnResponse = ipnService.processIpnForPreOrder(allParams);
        }
        return ResponseEntity.ok(ipnResponse);
    }
}
