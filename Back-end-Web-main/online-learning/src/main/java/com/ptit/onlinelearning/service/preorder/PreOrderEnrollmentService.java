package com.ptit.onlinelearning.service.preorder;


import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import com.ptit.onlinelearning.component.NetworkUtils;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.PreOrderEnrollmentRepository;
import com.ptit.onlinelearning.request.InitPaymentRequest;
import com.ptit.onlinelearning.request.PreOrderRequest;
import com.ptit.onlinelearning.response.CreatePreOrderResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.PreOrderUserResponse;
import com.ptit.onlinelearning.response.order.PaymentResponse;
import com.ptit.onlinelearning.service.vnpay.IVNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreOrderEnrollmentService implements IPreOrderEnrollmentService {
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final NetworkUtils networkUtils;
    private final PreOrderEnrollmentRepository preOrderEnrollmentRepository;
    private final IVNPayService vnPayService;


    @Override
    @Transactional
    public CreatePreOrderResponse createPreOrder(PreOrderRequest preOrderRequest, User user,
                                                 HttpServletRequest request) {
        
        if (preOrderRequest.getCourseId() != null && preOrderRequest.getCourseGroupId() != null) {
            throw new InvalidParamException("Cannot pre-order both course and course group at the same time");
        }
        
        if (preOrderRequest.getCourseId() == null && preOrderRequest.getCourseGroupId() == null) {
            throw new InvalidParamException("Either courseId or courseGroupId must be provided");
        }
        
        // Xử lý pre-order cho Course
        if (preOrderRequest.getCourseId() != null) {
            return createCoursePreOrder(preOrderRequest.getCourseId(), user, request);
        }
        
        return createCourseGroupPreOrder(preOrderRequest.getCourseGroupId(), user, request);
    }
    
    private CreatePreOrderResponse createCoursePreOrder(Long courseId, User user, HttpServletRequest request) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) {
            throw new DataNotFoundException("Course not found with id: " + courseId);
        }
        
        Course course = courseOpt.get();
        
        // Validate pre-order is active
        if (!Boolean.TRUE.equals(course.getIsPreOrder())) {
            throw new InvalidParamException("Course is not available for pre-order");
        }
        
        // Validate remaining slots
        if (course.getPreOrderRemainingSlots() == null || course.getPreOrderRemainingSlots() <= 0) {
            throw new InvalidParamException("No remaining slots for pre-order");
        }
        
        // Create pre-order enrollment
        PreOrderEnrollment preOrderEnrollment = new PreOrderEnrollment();
        preOrderEnrollment.setUser(user);
        preOrderEnrollment.setPricePaid(course.getPreOrderPrice());
        preOrderEnrollment.setCourse(course);
        preOrderEnrollment.setPreOrderDate(LocalDateTime.now());
        preOrderEnrollment.setSlotNumber(
            course.getPreOrderTotalSlots() - course.getPreOrderRemainingSlots() + 1
        );
        preOrderEnrollment.setStatus(PreOrderStatus.RESERVED);
        preOrderEnrollment.setPaymentId("PREORDER_COURSE_" + System.currentTimeMillis());
        preOrderEnrollmentRepository.saveAndFlush(preOrderEnrollment);
        
        log.info("Course pre-order enrollment saved successfully for user {} on course {}", 
                user.getId(), course.getCode());
        
        // Create payment URL
        String paymentUrl = createPaymentUrl(preOrderEnrollment, request);
        
        return CreatePreOrderResponse.builder()
                .preOrderDate(preOrderEnrollment.getPreOrderDate())
                .slotNumber(preOrderEnrollment.getSlotNumber())
                .pridePaid(preOrderEnrollment.getPricePaid())
                .courseId(course.getId())
                .courseType(CourseType.STANDALONE)
                .courseTitle(course.getTitle())
                .paymentResponse(PaymentResponse.builder()
                        .paymentUrl(paymentUrl)
                        .provider("VNPay")
                        .build())
                .build();
    }
    
    private CreatePreOrderResponse createCourseGroupPreOrder(Long courseGroupId, User user, HttpServletRequest request) {
        Optional<CourseGroup> courseGroupOpt = courseGroupRepository.findById(courseGroupId);
        if (courseGroupOpt.isEmpty()) {
            throw new DataNotFoundException("Course group not found with id: " + courseGroupId);
        }
        
        CourseGroup courseGroup = courseGroupOpt.get();
        
        // Validate pre-order is active
        if (!Boolean.TRUE.equals(courseGroup.getIsPreOrder())) {
            throw new InvalidParamException("Course group is not available for pre-order");
        }
        
        // Validate remaining slots
        if (courseGroup.getBundleRemainingSlots() == null || courseGroup.getBundleRemainingSlots() <= 0) {
            throw new InvalidParamException("No remaining slots for pre-order");
        }
        
        // Create pre-order enrollment
        PreOrderEnrollment preOrderEnrollment = new PreOrderEnrollment();
        preOrderEnrollment.setUser(user);
        preOrderEnrollment.setPricePaid(courseGroup.getPreOrderPrice());
        preOrderEnrollment.setCourseGroup(courseGroup);
        preOrderEnrollment.setPreOrderDate(LocalDateTime.now());
        preOrderEnrollment.setSlotNumber(
            courseGroup.getBundleTotalSlots() - courseGroup.getBundleRemainingSlots() + 1
        );
        preOrderEnrollment.setStatus(PreOrderStatus.RESERVED);
        preOrderEnrollment.setPaymentId("PREORDER_GROUP_" + System.currentTimeMillis());
        preOrderEnrollmentRepository.saveAndFlush(preOrderEnrollment);
        
        log.info("Course group pre-order enrollment saved successfully for user {} on course group {}", 
                user.getId(), courseGroup.getTitle());
        
        // Create payment URL
        String paymentUrl = createPaymentUrl(preOrderEnrollment, request);
        
        return CreatePreOrderResponse.builder()
                .preOrderDate(preOrderEnrollment.getPreOrderDate())
                .slotNumber(preOrderEnrollment.getSlotNumber())
                .pridePaid(preOrderEnrollment.getPricePaid())
                .courseId(courseGroup.getId()) // Using courseId field for both
                .courseType(CourseType.GROUP)
                .courseTitle(courseGroup.getTitle())
                .paymentResponse(PaymentResponse.builder()
                        .paymentUrl(paymentUrl)
                        .provider("VNPay")
                        .build())
                .build();
    }
    
    private String createPaymentUrl(PreOrderEnrollment preOrderEnrollment, HttpServletRequest request) {
        String ipAddress = networkUtils.getIpAddress(request);
        
        InitPaymentRequest initPaymentRequest = InitPaymentRequest.builder()
                .orderId(preOrderEnrollment.getId())
                .orderNumber(preOrderEnrollment.getPaymentId())
                .ipAddress(ipAddress)
                .totalMoney(preOrderEnrollment.getPricePaid())
                .orderType(OrderType.PRE_ORDER_ENROLLMENT)
                .build();
        
        return vnPayService.createPaymentUrl(initPaymentRequest);
    }

    @Override
    public PreOrderEnrollment getPreOrderEnrollmentByPaymentId(String paymentId) {
        Optional<PreOrderEnrollment> preOrderEnrollment = preOrderEnrollmentRepository.findByPaymentId(paymentId);
        if(preOrderEnrollment.isEmpty()){
            throw new DataNotFoundException("Pre-order enrollment not found");
        }
        return preOrderEnrollment.get();
    }

    @Override
    @Transactional
    public void updatePreOrderStatusSuccess(PreOrderEnrollment preOrderEnrollment) {
        preOrderEnrollmentRepository.save(preOrderEnrollment);
        
        if (PreOrderStatus.PAID.equals(preOrderEnrollment.getStatus())) {
            // Update remaining slots for Course
            Course course = preOrderEnrollment.getCourse();
            if (course != null && course.getPreOrderRemainingSlots() != null && 
                course.getPreOrderRemainingSlots() > 0) {
                course.setPreOrderRemainingSlots(course.getPreOrderRemainingSlots() - 1);
                courseRepository.save(course);
                log.info("Course pre-order paid successfully. Remaining slots decreased to: {}", 
                        course.getPreOrderRemainingSlots());
            }
            
            // Update remaining slots for CourseGroup
            CourseGroup courseGroup = preOrderEnrollment.getCourseGroup();
            if (courseGroup != null && courseGroup.getBundleRemainingSlots() != null && 
                courseGroup.getBundleRemainingSlots() > 0) {
                courseGroup.setBundleRemainingSlots(courseGroup.getBundleRemainingSlots() - 1);
                courseGroupRepository.save(courseGroup);
                log.info("Course group pre-order paid successfully. Remaining slots decreased to: {}", 
                        courseGroup.getBundleRemainingSlots());
            }
        } else if (PreOrderStatus.CANCELLED.equals(preOrderEnrollment.getStatus())) {
            log.info("Pre-order cancelled. Remaining slots unchanged.");
        }
    }

    @Override
    public PageableResponse<PreOrderUserResponse> getAllPreOrdersByUser(User user, int page, int pageSize) {
        int zeroBasedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize);
        
        List<PreOrderStatus> statuses = List.of(PreOrderStatus.PAID, PreOrderStatus.CONVERTED);
        
        Page<PreOrderEnrollment> preOrderPage = preOrderEnrollmentRepository
                .findByUserAndStatusInAndCourseIsNotNullAndCourseGroupIsNull(
                        user, 
                        statuses, 
                        pageable
                );
        
        List<PreOrderUserResponse> data = preOrderPage.getContent().stream()
                .map(preOrder -> {
                    Course course = preOrder.getCourse();
                    return PreOrderUserResponse.builder()
                            .slotNumber(preOrder.getSlotNumber())
                            .pricePaid(preOrder.getPricePaid())
                            .status(preOrder.getStatus())
                            .preOrderDate(preOrder.getPreOrderDate() != null 
                                    ? preOrder.getPreOrderDate().toString() 
                                    : null)
                            .courseTitle(course != null ? course.getTitle() : null)
                            .courseId(course != null ? course.getId() : null)
                            .courseThumbnail(course != null ? course.getThumbnail() : null)
                            .build();
                })
                .toList();
        
        return PageableResponse.<PreOrderUserResponse>builder()
                .currentPage(preOrderPage.getNumber() + 1)
                .totalPages(preOrderPage.getTotalPages())
                .totalElements(preOrderPage.getTotalElements())
                .pageSize(preOrderPage.getSize())
                .hasNext(preOrderPage.hasNext())
                .hasPrevious(preOrderPage.hasPrevious())
                .data(data)
                .build();
    }
}
