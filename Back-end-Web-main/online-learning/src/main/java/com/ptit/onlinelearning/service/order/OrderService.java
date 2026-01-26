package com.ptit.onlinelearning.service.order;


import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.component.NetworkUtils;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.repository.*;
import com.ptit.onlinelearning.request.*;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.order.*;
import com.ptit.onlinelearning.service.enrollment.IEnrollmentService;
import com.ptit.onlinelearning.service.vnpay.IVNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService implements IOrderService {
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final OrderItemRepository orderItemRepository;
    private final NetworkUtils networkUtils;
    private final IVNPayService vnPayService;
    private final IEnrollmentService enrollmentService;
    private final CartItemRepository cartItemRepository;
    private final EventPublisher eventPublisher;
    private final EnrollmentRepository enrollmentRepository;
    private final InstructorRepository instructorRepository;

    @Override
    @Transactional
    public CreateOrderResponse createOrder(OrderRequest orderRequest, User user, HttpServletRequest request) {
        List<Long> courseIds = orderRequest.getCartItemList().stream()
                .map(CartItemRequest::getCourseId)
                .filter(id -> id != null)
                .toList();
        List<Long> courseGroupIds = orderRequest.getCartItemList().stream()
                .map(CartItemRequest::getCourseGroupId)
                .filter(id -> id != null)
                .toList();
        
        // Check if user is the creator of any course
        if (!courseIds.isEmpty()) {
            checkUserIsCourseCreator(courseIds, user);
        }
        
        // Check if user is the creator of any course group
        if (!courseGroupIds.isEmpty()) {
            checkUserIsCourseGroupCreator(courseGroupIds, user);
        }
        
        BigDecimal totalPriceCourses = courseRepository.sumPriceCourseByIds(courseIds);
        
        BigDecimal totalPriceCourseGroups = courseGroupRepository.sumPriceCourseGroupByIds(courseGroupIds);
        
        BigDecimal totalPriceEnrolledCourses = BigDecimal.ZERO;
        if (!courseGroupIds.isEmpty()) {
            List<CourseGroup> courseGroups = courseGroupRepository.findAllByIdIn(courseGroupIds);
            for (CourseGroup courseGroup : courseGroups) {
                List<Course> coursesInGroup = courseGroup.getCourses();
                
                for (Course courseInGroup : coursesInGroup) {
                    Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseInGroup.getId());
                    
                    if (enrollmentOpt.isPresent()) {
                        Enrollment enrollment = enrollmentOpt.get();
                        if (enrollment.getCourseGroup() == null) {
                            totalPriceEnrolledCourses = totalPriceEnrolledCourses.add(courseInGroup.getPrice());
                        }
                    }
                }
            }
        }
        
        BigDecimal totalAll = totalPriceCourses
                .add(totalPriceCourseGroups)
                .subtract(totalPriceEnrolledCourses);
        
//        if(totalAll.compareTo(orderRequest.getTotalMoney()) != 0){
//            log.error("Total money mismatch: calculated={}, provided={}", totalAll, orderRequest.getTotalMoney());
//            throw new InvalidParamException("Total money does not match the sum of cart items.");
//        }

        Order order = new Order();
        order.setUser(user);
        order.setCurrency(Currency.VND);
        order.setTotalMoney(totalAll);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderNumber("ONL" + System.currentTimeMillis());
        orderRepository.saveAndFlush(order);

        List<OrderItem> listOrderItems = new ArrayList<>();
        if(!courseIds.isEmpty()){
            List<Course> courses = courseRepository.findAllByIdIn(courseIds);
            courses.forEach(course -> listOrderItems.add(createOrderItem(order, course, null)));

        }
        if(!courseGroupIds.isEmpty()){
            List<CourseGroup> courseGroups = courseGroupRepository.findAllByIdIn(courseGroupIds);
            courseGroups.forEach(group ->
                    group.getCourses().forEach(course ->
                            listOrderItems.add(createOrderItem(order, course, group))
                    )
            );
        }
        orderItemRepository.saveAll(listOrderItems);
        log.info("created order {} for user {}", order.getOrderNumber(), user.getUsername());
        String ipAddress = networkUtils.getIpAddress(request);
        InitPaymentRequest initPaymentRequest = InitPaymentRequest.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .ipAddress(ipAddress)
                .totalMoney(order.getTotalMoney())
                .orderType(OrderType.ORDER_COURSE)
                .build();
        String paymentUrl = vnPayService.createPaymentUrl(initPaymentRequest);
        log.info("VNPay payment URL generated for order {}: {}", order.getOrderNumber(), paymentUrl);
        eventPublisher.scheduleOrderExpiration(order.getOrderNumber(), 15);
        return CreateOrderResponse.builder()
                .orderDate(order.getOrderDate().toString())
                .orderNumber(order.getOrderNumber())
                .totalMoney(order.getTotalMoney())
                .username(order.getUser().getUsername())
                .email(order.getUser().getEmail())
                .currency(order.getCurrency())
                .paymentStatus(order.getPaymentStatus())
                .paymentResponse(PaymentResponse.builder()
                        .paymentUrl(paymentUrl)
                        .provider("VNPay")
                        .build()
                )
                .build();
    }

    @Override
    @Transactional
    public Order updateStatusOrderSuccess(Order order) {
        if(order.getPaymentStatus() == PaymentStatus.SUCCESS){
            orderRepository.saveAndFlush(order);
            List<OrderItem> orderItemList = orderItemRepository.findAllByOrderId(order.getId());
            Long userId = order.getUser().getId();
            
            List<CreateEnrollment> enrollmentList = new ArrayList<>();
            
            for (OrderItem item : orderItemList) {
                if (item.getCourseGroup() != null) {
                    Optional<Enrollment> existingEnrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, item.getCourse().getId());
                    
                    if (existingEnrollmentOpt.isPresent()) {
                        Enrollment existingEnrollment = existingEnrollmentOpt.get();
                        
                        if (existingEnrollment.getCourseGroup() == null) {
                            existingEnrollment.setCourseGroup(item.getCourseGroup());
                            enrollmentRepository.save(existingEnrollment);
                            log.info("Updated enrollment {} with course group {} for user {}", 
                                    existingEnrollment.getId(), item.getCourseGroup().getId(), userId);
                        } else {
                            log.info("User {} already enrolled in course {} from course group {}, skipping",
                                    userId, item.getCourse().getId(), existingEnrollment.getCourseGroup().getId());
                        }
                    } else {
                        enrollmentList.add(CreateEnrollment.builder()
                                .course(item.getCourse())
                                .order(order)
                                .user(order.getUser())
                                .courseGroup(item.getCourseGroup())
                                .build());
                    }
                } else {
                    enrollmentList.add(CreateEnrollment.builder()
                            .course(item.getCourse())
                            .order(order)
                            .user(order.getUser())
                            .courseGroup(null)
                            .build());
                }
            }
            
            if (!enrollmentList.isEmpty()) {
                enrollmentService.studentEnroll(enrollmentList);
                log.info("Order {} payment successful. {} enrollments created for user {}.", 
                        order.getOrderNumber(), enrollmentList.size(), order.getUser().getUsername());
            } else {
                log.info("Order {} payment successful. No new enrollments needed for user {}.", 
                        order.getOrderNumber(), order.getUser().getUsername());
            }
            
            for (OrderItem orderItem : orderItemList) {
                if (orderItem.getCourseGroup() != null) {
                    if (cartItemRepository.existsByUserIdAndCourseGroupId(userId, orderItem.getCourseGroup().getId())) {
                        cartItemRepository.deleteByUserIdAndCourseGroupId(userId, orderItem.getCourseGroup().getId());
                        log.info("Deleted cart item for user {} and course group {}", userId, orderItem.getCourseGroup().getId());
                    }
                } else if (orderItem.getCourse() != null) {
                    if (cartItemRepository.existsByUserIdAndCourseId(userId, orderItem.getCourse().getId())) {
                        cartItemRepository.deleteByUserIdAndCourseId(userId, orderItem.getCourse().getId());
                        log.info("Deleted cart item for user {} and course {}", userId, orderItem.getCourse().getId());
                    }
                }
            }
        } else {
            orderRepository.saveAndFlush(order);
        }
        return order;
    }

    @Override
    public Order getOrderByOrderNumber(String orderNumber) {
        Optional<Order> orderOptional = orderRepository.findByOrderNumber(orderNumber);
        if(orderOptional.isEmpty()){
            throw new DataNotFoundException("Order not found with order number: " + orderNumber);
        }
        return orderOptional.get();
    }

    @Override
    public PageableResponse<CreateOrderResponse> getAllOrdersByUser(User user, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page - 1, 
                size, 
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        
        // Only get orders with SUCCESS payment status for users
        org.springframework.data.jpa.domain.Specification<Order> spec = (root, query, cb) -> 
            cb.and(
                cb.equal(root.get("user"), user),
                cb.equal(root.get("paymentStatus"), PaymentStatus.SUCCESS)
            );
        
        org.springframework.data.domain.Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        
        List<CreateOrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .toList();
        
        return PageableResponse.<CreateOrderResponse>builder()
                .data(orderResponses)
                .currentPage(page)
                .pageSize(size)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Override
    public PageableResponse<CreateOrderResponse> getAllOrdersByAdmin(int page, int size, PaymentStatus paymentStatus,
                                                                     String sortBy, String sortOrder) {
        org.springframework.data.domain.Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page - 1, 
                size, 
                org.springframework.data.domain.Sort.by(direction, sortBy)
        );
        
        org.springframework.data.domain.Page<Order> orderPage;
        
        // Admin can filter by payment status or get all
        if (paymentStatus != null) {
            org.springframework.data.jpa.domain.Specification<Order> spec = (root, query, cb) -> 
                cb.equal(root.get("paymentStatus"), paymentStatus);
            orderPage = orderRepository.findAll(spec, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }
        
        List<CreateOrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .toList();
        
        return PageableResponse.<CreateOrderResponse>builder()
                .data(orderResponses)
                .currentPage(page)
                .pageSize(size)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Override
    public OrderDetailResponse getOrderDetailByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberWithDetails(orderNumber)
                .orElseThrow(() -> new DataNotFoundException("Order not found: " + orderNumber));
        Set<OrderItemResponse> orderItems = order.getOrderItems().stream()
                .map(oi ->{
                    String courseName = (oi.getCourseGroup() != null) ? oi.getCourseGroup().getTitle() : oi.getCourse().getTitle();
                    Long courseId = (oi.getCourseGroup() != null) ? oi.getCourseGroup().getId() : oi.getCourse().getId();
                    String thumbnail = (oi.getCourseGroup() != null) ? oi.getCourseGroup().getThumbnail() : oi.getCourse().getThumbnail();
                    BigDecimal price = (oi.getCourseGroup() != null) ? oi.getCourseGroup().getPrice() : oi.getCourse().getPrice();
                    CourseType courseType = (oi.getCourseGroup() != null) ? CourseType.GROUP : CourseType.STANDALONE;
                    return  OrderItemResponse.builder()
                            .courseId(courseId)
                            .coursePrice(price)
                            .courseType(courseType)
                            .courseTitle(courseName)
                            .thumbnail(thumbnail)
                            .build();

                }).collect(java.util.stream.Collectors.toSet());
        return OrderDetailResponse.builder()
                .orderItems(orderItems)
                .orderNumber(orderNumber)
                .orderDate(order.getOrderDate())
                .paymentStatus(order.getPaymentStatus())
                .currency(order.getCurrency().toString())
                .totalMoney(order.getTotalMoney())
                .build();
    }

    @Override
    public CheckOrderResponse checkPriceAndDiscount(OrderRequest orderRequest, User user) {
        List<Long> courseGroupIds = orderRequest.getCartItemList().stream()
                .map(CartItemRequest::getCourseGroupId)
                .toList();

        List<Long> courseIds = orderRequest.getCartItemList().stream()
                .map(CartItemRequest::getCourseId)
                .toList();

        BigDecimal totalPriceCourses = courseRepository.sumPriceCourseByIds(courseIds);

        if(courseGroupIds.isEmpty()){
             return CheckOrderResponse.builder()
                     .totalMoney(totalPriceCourses)
                     .build();
        }

        List<CourseGroup> courseGroups = courseGroupRepository.findAllByIdIn(courseGroupIds);
        BigDecimal totalPriceCourseGroups = courseGroups.stream()
                .map(CourseGroup::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CourseEnrolledResponse> enrolledCoursesInGroups = new ArrayList<>();
        BigDecimal totalPriceEnrolledCourses = BigDecimal.ZERO;

        for (CourseGroup courseGroup : courseGroups) {
            List<Course> coursesInGroup = courseGroup.getCourses();
            
            for (Course courseInGroup : coursesInGroup) {
                Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseInGroup.getId());
                
                if (enrollmentOpt.isPresent()) {
                    Enrollment enrollment = enrollmentOpt.get();
                    if (enrollment.getCourseGroup() == null) {
                        enrolledCoursesInGroups.add(CourseEnrolledResponse.builder()
                                .id(courseInGroup.getId())
                                .title(courseInGroup.getTitle())
                                .image(courseInGroup.getThumbnail())
                                .price(courseInGroup.getPrice())
                                .build());
                        totalPriceEnrolledCourses = totalPriceEnrolledCourses.add(courseInGroup.getPrice());
                    }
                }
            }
        }

        BigDecimal finalTotalMoney = totalPriceCourses
                .add(totalPriceCourseGroups)
                .subtract(totalPriceEnrolledCourses);

        return CheckOrderResponse.builder()
                .totalMoney(finalTotalMoney)
                .courseEnrolledResponses(enrolledCoursesInGroups.isEmpty() ? null : enrolledCoursesInGroups)
                .build();
    }

    private CreateOrderResponse mapToOrderResponse(Order order) {
        return CreateOrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .username(order.getUser().getAccountName())
                .email(order.getUser().getEmail())
                .currency(order.getCurrency())
                .totalMoney(order.getTotalMoney())
                .paymentStatus(order.getPaymentStatus())
                .orderDate(order.getOrderDate().toString())
                .paymentResponse(null) // Set PaymentResponse to null as requested
                .build();
    }


    private OrderItem createOrderItem(Order order, Course course, CourseGroup group) {
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setCourse(course);
        item.setCourseGroup(group);
        return item;
    }

    private void checkUserIsCourseCreator(List<Long> courseIds, User user) {
        List<Course> courses = courseRepository.findAllByIdIn(courseIds);
        for (Course course : courses) {
            if (course.getInstructorId() != null) {
                Optional<Instructor> instructor = instructorRepository.findById(course.getInstructorId());
                if (instructor.isPresent() && instructor.get().getUserId().equals(user.getId())) {
                    throw new InvalidParamException("You cannot create an order for your own course");
                }
            }
        }
    }

    private void checkUserIsCourseGroupCreator(List<Long> courseGroupIds, User user) {
        List<CourseGroup> courseGroups = courseGroupRepository.findAllByIdIn(courseGroupIds);
        for (CourseGroup courseGroup : courseGroups) {
            List<Course> courses = courseGroup.getCourses();
            if (courses != null && !courses.isEmpty()) {
                // All courses in a group must have the same instructor, so check the first course
                Course firstCourse = courses.getFirst();
                if (firstCourse.getInstructorId() != null) {
                    Optional<Instructor> instructor = instructorRepository.findById(firstCourse.getInstructorId());
                    if (instructor.isPresent() && instructor.get().getUserId().equals(user.getId())) {
                        throw new InvalidParamException("You cannot create an order for your own course group");
                    }
                }
            }
        }
    }
}
