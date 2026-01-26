package com.ptit.onlinelearning.controller;


import com.fasterxml.jackson.annotation.JsonView;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.request.OrderRequest;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.order.CheckOrderResponse;
import com.ptit.onlinelearning.response.order.CreateOrderResponse;
import com.ptit.onlinelearning.response.order.OrderDetailResponse;
import com.ptit.onlinelearning.response.view.Views;
import com.ptit.onlinelearning.service.order.IOrderService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;



    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @JsonView(Views.Detail.class)
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody OrderRequest orderRequest,
                                             @AuthenticationPrincipal User user, HttpServletRequest request) {
        CreateOrderResponse result = orderService.createOrder(orderRequest, user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }


    @GetMapping("/{orderNumber}/status")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get order status by order number")
    public ResponseEntity<Order> getOrderStatusByOrderNumber(@PathVariable String orderNumber) {
        Order order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get all orders by user")
    @JsonView(Views.Basic.class)
    public ResponseEntity<PageableResponse<CreateOrderResponse>> getAllOrdersByUser(@AuthenticationPrincipal User user,
                                                                                 @RequestParam(defaultValue = "1") int page,
                                                                                 @RequestParam(defaultValue = "10") int size) {
        PageableResponse<CreateOrderResponse> orders = orderService.getAllOrdersByUser(user, page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Get all orders - Admin only")
    @JsonView(Views.Basic.class)
    public ResponseEntity<PageableResponse<CreateOrderResponse>> getAllOrdersByAdmin(@RequestParam(defaultValue = "1") int page,
                                                                                     @RequestParam(defaultValue = "10") int size,
                                                                                     @RequestParam(required = false) String paymentStatus,
                                                                                     @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                                     @RequestParam(defaultValue = "desc") String sortOrder
                                                                                     ) {
        PaymentStatus status = null;
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            try {
                status = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidParamException("Invalid payment status: " + paymentStatus);
            }
        }
        
        PageableResponse<CreateOrderResponse> orders = orderService.getAllOrdersByAdmin(page, size, status, sortBy, sortOrder);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderNumber}")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get order detail by order number")
    public ResponseEntity<OrderDetailResponse> getOrderDetailByOrderNumber(@PathVariable String orderNumber) {
        OrderDetailResponse orderDetail = orderService.getOrderDetailByOrderNumber(orderNumber);
        return ResponseEntity.ok(orderDetail);
    }

    @PostMapping("/check-price")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Check price and discount for order", 
               description = "Calculate total price with discount for enrolled courses in course groups")
    public ResponseEntity<CheckOrderResponse> checkPriceAndDiscount(@RequestBody OrderRequest orderRequest,
                                                                     @AuthenticationPrincipal User user) {
        CheckOrderResponse response = orderService.checkPriceAndDiscount(orderRequest, user);
        return ResponseEntity.ok(response);
    }
}
