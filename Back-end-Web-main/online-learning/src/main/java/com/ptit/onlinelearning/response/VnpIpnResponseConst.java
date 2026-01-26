package com.ptit.onlinelearning.response;

import org.bouncycastle.pqc.crypto.newhope.NHOtherInfoGenerator;

public class VnpIpnResponseConst {

    public static final IpnResponse SUCCESS = new IpnResponse("00", "Successful");
    public static final IpnResponse SIGNATURE_FAILED = new IpnResponse("97", "Invalid Checksum");
    public static final IpnResponse ORDER_NOT_FOUND = new IpnResponse("01", "Order not Found");
    public static final IpnResponse UNKNOW_ERROR = new IpnResponse("99", "Unknow Error");
    public static final IpnResponse INVALID_AMOUNT = new IpnResponse("04", "Invalid Amount");
    public static final IpnResponse ORDER_ALREADY_CONFIRMED = new IpnResponse("02", "Order already confirmed");
}
