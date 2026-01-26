package com.ptit.onlinelearning.service.preorder;

import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.request.PreOrderRequest;
import com.ptit.onlinelearning.response.CreatePreOrderResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.PreOrderUserResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface IPreOrderEnrollmentService {

    CreatePreOrderResponse createPreOrder(PreOrderRequest preOrderRequest, User user, HttpServletRequest request);

    PreOrderEnrollment getPreOrderEnrollmentByPaymentId(String paymentId);


    void updatePreOrderStatusSuccess(PreOrderEnrollment preOrderEnrollment);

    PageableResponse<PreOrderUserResponse> getAllPreOrdersByUser(User user, int page, int pageSize);
}
