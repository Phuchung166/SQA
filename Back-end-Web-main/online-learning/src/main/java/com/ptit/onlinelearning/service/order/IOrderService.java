package com.ptit.onlinelearning.service.order;

import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.request.OrderRequest;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.order.CheckOrderResponse;
import com.ptit.onlinelearning.response.order.CreateOrderResponse;
import com.ptit.onlinelearning.response.order.OrderDetailResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface IOrderService {

    CreateOrderResponse createOrder(OrderRequest orderRequest, User user, HttpServletRequest request);

    Order updateStatusOrderSuccess(Order order);

    Order getOrderByOrderNumber(String orderNumber);

    PageableResponse<CreateOrderResponse> getAllOrdersByUser(User user, int page, int size);


    PageableResponse<CreateOrderResponse> getAllOrdersByAdmin(int page, int size, PaymentStatus paymentStatus,String sortBy, String sortOrder);


    OrderDetailResponse getOrderDetailByOrderNumber(String orderNumber);


    CheckOrderResponse checkPriceAndDiscount(OrderRequest orderRequest, User user);
}
