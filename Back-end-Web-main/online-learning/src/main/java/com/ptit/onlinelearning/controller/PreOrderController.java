package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.request.PreOrderRequest;
import com.ptit.onlinelearning.response.CreatePreOrderResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.PreOrderUserResponse;
import com.ptit.onlinelearning.service.preorder.IPreOrderEnrollmentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequestMapping("${api.prefix}/pre-order-enrollments")
@RestController
@RequiredArgsConstructor
public class PreOrderController {

    private final IPreOrderEnrollmentService preOrderEnrollmentService;


    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<CreatePreOrderResponse> createPreOrderEnrollment(
            @RequestBody PreOrderRequest preOrderRequest,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
            ) {
        CreatePreOrderResponse response = preOrderEnrollmentService.createPreOrder(preOrderRequest, user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{paymentId}/status")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    ResponseEntity<PreOrderEnrollment> getStatusByPaymentId(@PathVariable String paymentId) {
        PreOrderEnrollment preOrderEnrollment = preOrderEnrollmentService.getPreOrderEnrollmentByPaymentId(paymentId);
        return ResponseEntity.ok(preOrderEnrollment);
    }

    @GetMapping("/my-paid-courses")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<PageableResponse<PreOrderUserResponse>> getMyPaidPreOrderCourses(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        PageableResponse<PreOrderUserResponse> response = 
                preOrderEnrollmentService.getAllPreOrdersByUser(user, page, pageSize);
        return ResponseEntity.ok(response);
    }

}
