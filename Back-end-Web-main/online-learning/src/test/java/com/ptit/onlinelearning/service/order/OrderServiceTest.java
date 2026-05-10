package com.ptit.onlinelearning.service.order;

import com.ptit.onlinelearning.common.base.OrderType;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.component.NetworkUtils;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.repository.*;
import com.ptit.onlinelearning.request.CartItemRequest;
import com.ptit.onlinelearning.request.InitPaymentRequest;
import com.ptit.onlinelearning.request.OrderRequest;
import com.ptit.onlinelearning.response.order.CreateOrderResponse;
import com.ptit.onlinelearning.service.enrollment.IEnrollmentService;
import com.ptit.onlinelearning.service.vnpay.IVNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho OrderService
 * Technique: EP + Negative Testing + CheckDB
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private CourseGroupRepository courseGroupRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private NetworkUtils networkUtils;
    @Mock private IVNPayService vnPayService;
    @Mock private IEnrollmentService enrollmentService;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private EventPublisher eventPublisher;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private InstructorRepository instructorRepository;

    @Mock private HttpServletRequest mockRequest;

    @InjectMocks
    private OrderService orderService;

    private User mockUser;
    private Course mockCourse;
    private OrderRequest orderReq;
    private Instructor mockInstructor;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("user@mail.com").build();
        mockInstructor = Instructor.builder().id(10L).userId(2L).build(); // Different user
        
        mockCourse = new Course();
        mockCourse.setId(100L);
        mockCourse.setInstructorId(10L);
        mockCourse.setPrice(new BigDecimal("500000"));

        orderReq = new OrderRequest();
        CartItemRequest item = new CartItemRequest();
        item.setCourseId(100L);
        orderReq.setCartItemList(List.of(item));
    }

    // TC-ORD-001: createOrder - Mua khóa học của chính mình -> ném Exception
    @Test
    @DisplayName("TC-ORD-001: Mua khóa học do chính mình tạo -> ném InvalidParamException")
    void createOrder_ownCourse_throwsException() {
        mockInstructor.setUserId(1L); // Same as mockUser
        when(courseRepository.findAllByIdIn(List.of(100L))).thenReturn(List.of(mockCourse));
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));

        assertThatThrownBy(() -> orderService.createOrder(orderReq, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("cannot create an order for your own course");
    }

    // TC-ORD-002: createOrder - Mua khóa học thành công -> Trả về VNPay URL
    @Test
    @DisplayName("TC-ORD-002: Tạo order thành công -> Trả về URL thanh toán VNPay và CheckDB")
    void createOrder_success() {
        when(courseRepository.findAllByIdIn(List.of(100L))).thenReturn(List.of(mockCourse));
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));
        when(courseRepository.sumPriceCourseByIds(List.of(100L))).thenReturn(new BigDecimal("500000"));
        when(courseGroupRepository.sumPriceCourseGroupByIds(anyList())).thenReturn(BigDecimal.ZERO);
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0); o.setId(99L); return o;
        });
        when(networkUtils.getIpAddress(mockRequest)).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any(InitPaymentRequest.class))).thenReturn("http://vnpay.vn/pay");

        CreateOrderResponse res = orderService.createOrder(orderReq, mockUser, mockRequest);

        verify(orderRepository, times(1)).saveAndFlush(any(Order.class));
        verify(orderItemRepository, times(1)).saveAll(anyList());
        verify(eventPublisher, times(1)).scheduleOrderExpiration(anyString(), eq(15));
        
        assertThat(res.getTotalMoney()).isEqualByComparingTo(new BigDecimal("500000"));
        assertThat(res.getPaymentResponse().getPaymentUrl()).isEqualTo("http://vnpay.vn/pay");
    }

    // TC-ORD-003: updateStatusOrderSuccess - Thành công
    @Test
    @DisplayName("TC-ORD-003: Payment SUCCESS -> Xóa Cart, Tạo Enrollment (CheckDB)")
    void updateStatusOrderSuccess_success() {
        Order order = new Order();
        order.setId(99L);
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setUser(mockUser);
        
        OrderItem item = new OrderItem();
        item.setCourse(mockCourse);
        item.setOrder(order);

        when(orderItemRepository.findAllByOrderId(99L)).thenReturn(List.of(item));
        when(cartItemRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);
        doNothing().when(cartItemRepository).deleteByUserIdAndCourseId(1L, 100L);

        Order result = orderService.updateStatusOrderSuccess(order);

        // Verify Enrollment call
        verify(enrollmentService, times(1)).studentEnroll(anyList());
        
        // Verify Cart item deletion
        verify(cartItemRepository, times(1)).deleteByUserIdAndCourseId(1L, 100L);
        
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
    }



    // TC-ORD-004: updateStatusOrderSuccess - Thanh toán FAILED -> chỉ lưu order, không enroll
    @Test
    @DisplayName("TC-ORD-004: Payment FAILED -> Chỉ lưu order, KHÔNG tạo Enrollment")
    void updateStatusOrderSuccess_failedPayment_noEnrollment() {
        Order order = new Order();
        order.setId(99L);
        order.setPaymentStatus(PaymentStatus.FAILED);
        order.setUser(mockUser);

        Order result = orderService.updateStatusOrderSuccess(order);

        verify(orderRepository, times(1)).saveAndFlush(order);
        verify(enrollmentService, never()).studentEnroll(anyList());
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    // TC-ORD-005: getOrderByOrderNumber - Thành công
    @Test
    @DisplayName("TC-ORD-005: Lấy Order theo OrderNumber thành công")
    void getOrderByOrderNumber_success() {
        Order order = new Order();
        order.setOrderNumber("ONL123");
        when(orderRepository.findByOrderNumber("ONL123")).thenReturn(Optional.of(order));

        Order res = orderService.getOrderByOrderNumber("ONL123");

        assertThat(res.getOrderNumber()).isEqualTo("ONL123");
    }

    // TC-ORD-006: getOrderByOrderNumber - Không tìm thấy -> Exception
    @Test
    @DisplayName("TC-ORD-006: OrderNumber không tồn tại -> DataNotFoundException")
    void getOrderByOrderNumber_notFound_throwsException() {
        when(orderRepository.findByOrderNumber("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderByOrderNumber("INVALID"))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Order not found with order number");
    }

    // TC-ORD-007: updateStatusOrderSuccess - Enroll có CourseGroup (branch coverage)
    @Test
    @DisplayName("TC-ORD-007: Payment SUCCESS với CourseGroup -> Update enrollment đã có")
    void updateStatusOrderSuccess_withCourseGroup_updatesEnrollment() {
        Order order = new Order();
        order.setId(99L);
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setUser(mockUser);

        CourseGroup cg = new CourseGroup();
        cg.setId(55L);

        OrderItem item = new OrderItem();
        item.setCourse(mockCourse);
        item.setCourseGroup(cg);
        item.setOrder(order);

        Enrollment existingEnrollment = new Enrollment();
        existingEnrollment.setId(1L);
        existingEnrollment.setCourseGroup(null);

        when(orderItemRepository.findAllByOrderId(99L)).thenReturn(List.of(item));
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.of(existingEnrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(existingEnrollment);
        when(cartItemRepository.existsByUserIdAndCourseGroupId(1L, 55L)).thenReturn(false);

        orderService.updateStatusOrderSuccess(order);

        verify(enrollmentRepository, times(1)).save(existingEnrollment);
        assertThat(existingEnrollment.getCourseGroup()).isEqualTo(cg);
    }

    // TC-ORD-008: getAllOrdersByAdmin - có filter PaymentStatus
    @Test
    @DisplayName("TC-ORD-008: Admin lọc order theo PaymentStatus SUCCESS")
    void getAllOrdersByAdmin_withStatus_success() {
        Order order = new Order();
        order.setOrderNumber("ONL999");
        order.setUser(mockUser);
        order.setTotalMoney(new BigDecimal("500000"));
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setCurrency(com.ptit.onlinelearning.common.type.Currency.VND);
        order.setOrderDate(java.time.LocalDateTime.now());

        org.springframework.data.domain.Page<Order> page =
                new org.springframework.data.domain.PageImpl<>(List.of(order));
        when(orderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        var res = orderService.getAllOrdersByAdmin(1, 10, PaymentStatus.SUCCESS, "createdAt", "desc");

        assertThat(res.getData()).hasSize(1);
        assertThat(res.getData().get(0).getOrderNumber()).isEqualTo("ONL999");
    }

    // TC-ORD-009: getAllOrdersByAdmin - không filter (lấy tất cả)
    @Test
    @DisplayName("TC-ORD-009: Admin lấy tất cả order (không filter)")
    void getAllOrdersByAdmin_noFilter_success() {
        org.springframework.data.domain.Page<Order> page =
                new org.springframework.data.domain.PageImpl<>(List.of());
        when(orderRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        var res = orderService.getAllOrdersByAdmin(1, 10, null, "createdAt", "asc");

        assertThat(res.getData()).isEmpty();
        verify(orderRepository, times(1)).findAll(any(org.springframework.data.domain.Pageable.class));
    }

    // TC-ORD-010: getOrderDetailByOrderNumber - Thành công
    @Test
    @DisplayName("TC-ORD-010: Lấy chi tiết Order theo OrderNumber - Thành công")
    void getOrderDetailByOrderNumber_success() {
        Order order = new Order();
        order.setOrderNumber("ONL123");
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setTotalMoney(new BigDecimal("500000"));
        order.setCurrency(com.ptit.onlinelearning.common.type.Currency.VND);
        order.setOrderDate(java.time.LocalDateTime.now());

        OrderItem item = new OrderItem();
        item.setCourse(mockCourse);
        mockCourse.setTitle("Java Course");
        mockCourse.setPrice(new BigDecimal("500000"));
        order.setOrderItems(new java.util.HashSet<>(List.of(item)));

        when(orderRepository.findByOrderNumberWithDetails("ONL123")).thenReturn(Optional.of(order));

        var res = orderService.getOrderDetailByOrderNumber("ONL123");

        assertThat(res.getOrderNumber()).isEqualTo("ONL123");
        assertThat(res.getOrderItems()).hasSize(1);
    }

    // TC-ORD-011: checkPriceAndDiscount - chỉ course (không có group)
    @Test
    @DisplayName("TC-ORD-011: checkPriceAndDiscount chỉ có course (không group)")
    void checkPriceAndDiscount_onlyCourses_success() {
        CartItemRequest cartItem = new CartItemRequest();
        cartItem.setCourseId(100L);
        OrderRequest req = new OrderRequest();
        req.setCartItemList(List.of(cartItem));

        when(courseRepository.sumPriceCourseByIds(anyList())).thenReturn(new BigDecimal("500000"));

        var res = orderService.checkPriceAndDiscount(req, mockUser);

        assertThat(res.getTotalMoney()).isEqualByComparingTo(new BigDecimal("500000"));
    }

    // TC-ORD-012: createOrder - Mua CourseGroup của chính mình -> ném InvalidParamException
    @Test
    @DisplayName("TC-ORD-012: Mua CourseGroup do chính mình tạo -> ném InvalidParamException")
    void createOrder_ownCourseGroup_throwsException() {
        CourseGroup mockGroup = new CourseGroup();
        mockGroup.setId(50L);
        mockGroup.setCourses(List.of(mockCourse));
        mockInstructor.setUserId(1L); // Same as mockUser

        CartItemRequest groupItem = new CartItemRequest();
        groupItem.setCourseGroupId(50L);
        OrderRequest req = new OrderRequest();
        req.setCartItemList(List.of(groupItem));

        when(courseGroupRepository.findAllByIdIn(List.of(50L))).thenReturn(List.of(mockGroup));
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));

        assertThatThrownBy(() -> orderService.createOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("cannot create an order for your own course group");
    }

    // TC-ORD-013: createOrder - CartItem rỗng (không có courseId và courseGroupId)
    @Test
    @DisplayName("TC-ORD-013: createOrder với cart không có courseId và courseGroupId -> Vẫn tạo order (skip validation)")
    void createOrder_emptyCartIds_createsOrderWithZeroTotal() {
        CartItemRequest emptyItem = new CartItemRequest(); // courseId=null, courseGroupId=null
        OrderRequest req = new OrderRequest();
        req.setCartItemList(List.of(emptyItem));

        when(courseRepository.sumPriceCourseByIds(anyList())).thenReturn(BigDecimal.ZERO);
        when(courseGroupRepository.sumPriceCourseGroupByIds(anyList())).thenReturn(BigDecimal.ZERO);
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0); o.setId(1L); return o;
        });
        when(networkUtils.getIpAddress(mockRequest)).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any(InitPaymentRequest.class))).thenReturn("http://vnpay.vn/pay");

        CreateOrderResponse res = orderService.createOrder(req, mockUser, mockRequest);

        assertThat(res.getTotalMoney()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(orderRepository, times(1)).saveAndFlush(any(Order.class));
    }

    // TC-ORD-014: createOrder - User đã enroll 1 course trong group -> Trừ giá đã đóng
    @Test
    @DisplayName("TC-ORD-014: Tạo order CourseGroup khi user đã enroll 1 course -> Giá được trừ discount")
    void createOrder_withEnrolledCourseInGroup_discountApplied() {
        CartItemRequest groupItem = new CartItemRequest();
        groupItem.setCourseGroupId(50L);
        OrderRequest req = new OrderRequest();
        req.setCartItemList(List.of(groupItem));

        Course course1 = new Course(); course1.setId(100L); course1.setPrice(new BigDecimal("300000"));
        Course course2 = new Course(); course2.setId(101L); course2.setPrice(new BigDecimal("200000"));

        CourseGroup mockGroup = new CourseGroup();
        mockGroup.setId(50L);
        mockGroup.setCourses(List.of(course1, course2));

        Enrollment existingEnrollment = new Enrollment();
        existingEnrollment.setCourseGroup(null); // enrolled individually

        when(courseGroupRepository.findAllByIdIn(List.of(50L))).thenReturn(List.of(mockGroup));
        when(courseRepository.sumPriceCourseByIds(anyList())).thenReturn(BigDecimal.ZERO);
        when(courseGroupRepository.sumPriceCourseGroupByIds(anyList())).thenReturn(new BigDecimal("400000"));
        // course1 đã enrolled -> trừ 300,000
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.of(existingEnrollment));
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 101L)).thenReturn(Optional.empty());
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0); o.setId(2L); return o;
        });
        when(networkUtils.getIpAddress(mockRequest)).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any(InitPaymentRequest.class))).thenReturn("http://vnpay.vn/pay");

        CreateOrderResponse res = orderService.createOrder(req, mockUser, mockRequest);

        // Total = 0 + 400,000 - 300,000 = 100,000
        assertThat(res.getTotalMoney()).isEqualByComparingTo(new BigDecimal("100000"));
    }

    // TC-ORD-015: getAllOrdersByUser - Chỉ lấy order SUCCESS của user
    @Test
    @DisplayName("TC-ORD-015: getAllOrdersByUser -> Chỉ trả về order có PaymentStatus=SUCCESS")
    void getAllOrdersByUser_returnsOnlySuccessOrders() {
        Order successOrder = new Order();
        successOrder.setOrderNumber("ONL_SUCCESS");
        successOrder.setUser(mockUser);
        successOrder.setTotalMoney(new BigDecimal("500000"));
        successOrder.setPaymentStatus(com.ptit.onlinelearning.common.type.PaymentStatus.SUCCESS);
        successOrder.setCurrency(com.ptit.onlinelearning.common.type.Currency.VND);
        successOrder.setOrderDate(java.time.LocalDateTime.now());

        org.springframework.data.domain.Page<Order> page =
                new org.springframework.data.domain.PageImpl<>(List.of(successOrder));
        when(orderRepository.findAll(
                any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class)
        )).thenReturn(page);

        var res = orderService.getAllOrdersByUser(mockUser, 1, 10);

        assertThat(res.getData()).hasSize(1);
        assertThat(res.getData().get(0).getOrderNumber()).isEqualTo("ONL_SUCCESS");
        assertThat(res.getCurrentPage()).isEqualTo(1);
        assertThat(res.getPageSize()).isEqualTo(10);
    }

    // TC-ORD-016: getAllOrdersByUser - Không có order nào -> trả về danh sách rỗng
    @Test
    @DisplayName("TC-ORD-016: getAllOrdersByUser khi user chưa có order nào -> trả về rỗng")
    void getAllOrdersByUser_noOrders_returnsEmpty() {
        org.springframework.data.domain.Page<Order> emptyPage =
                new org.springframework.data.domain.PageImpl<>(List.of());
        when(orderRepository.findAll(
                any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class)
        )).thenReturn(emptyPage);

        var res = orderService.getAllOrdersByUser(mockUser, 1, 10);

        assertThat(res.getData()).isEmpty();
        assertThat(res.getTotalElements()).isEqualTo(0L);
    }

    // TC-ORD-017: getOrderDetailByOrderNumber - Không tìm thấy -> DataNotFoundException
    @Test
    @DisplayName("TC-ORD-017: getOrderDetailByOrderNumber với OrderNumber không tồn tại -> DataNotFoundException")
    void getOrderDetailByOrderNumber_notFound_throwsException() {
        when(orderRepository.findByOrderNumberWithDetails("INVALID_ORDER"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderDetailByOrderNumber("INVALID_ORDER"))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Order not found: INVALID_ORDER");
    }

    // TC-ORD-018: updateStatusOrderSuccess - SUCCESS với CourseGroup đã có CourseGroup -> Bỏ qua (không enroll lại)
    @Test
    @DisplayName("TC-ORD-018: SUCCESS với Enrollment đã có CourseGroup -> Bỏ qua, không update lại")
    void updateStatusOrderSuccess_enrollmentAlreadyHasCourseGroup_skips() {
        Order order = new Order();
        order.setId(99L);
        order.setPaymentStatus(com.ptit.onlinelearning.common.type.PaymentStatus.SUCCESS);
        order.setUser(mockUser);

        CourseGroup cg = new CourseGroup();
        cg.setId(55L);

        OrderItem item = new OrderItem();
        item.setCourse(mockCourse);
        item.setCourseGroup(cg);
        item.setOrder(order);

        Enrollment existingEnrollmentWithGroup = new Enrollment();
        existingEnrollmentWithGroup.setId(1L);
        existingEnrollmentWithGroup.setCourseGroup(cg); // đã có courseGroup rồi

        when(orderItemRepository.findAllByOrderId(99L)).thenReturn(List.of(item));
        when(enrollmentRepository.findByUserIdAndCourseId(mockUser.getId(), 100L))
                .thenReturn(Optional.of(existingEnrollmentWithGroup));
        when(cartItemRepository.existsByUserIdAndCourseGroupId(mockUser.getId(), 55L)).thenReturn(false);

        orderService.updateStatusOrderSuccess(order);

        // Không save enrollment mới vì đã có courseGroup rồi
        verify(enrollmentRepository, never()).save(existingEnrollmentWithGroup);
        verify(enrollmentService, never()).studentEnroll(anyList());
    }

    // TC-ORD-020: createOrder - Khấu trừ giá khi đã sở hữu Course trong Group
    @Test
    @DisplayName("TC-ORD-020: Mua Group khi đã sở hữu 1 Course lẻ -> Tổng tiền khấu trừ đúng giá Course lẻ")
    void createOrder_partialGroupEnrollment_deductsPrice() {
        OrderRequest req = new OrderRequest();
        CartItemRequest groupCartItem = new CartItemRequest();
        groupCartItem.setCourseGroupId(5L);
        req.setCartItemList(List.of(groupCartItem));
        
        Course courseInGroup = new Course();
        courseInGroup.setId(100L);
        courseInGroup.setPrice(new BigDecimal("100000"));
        CourseGroup group = new CourseGroup();
        group.setId(5L);
        group.setPrice(new BigDecimal("250000"));
        group.setCourses(List.of(courseInGroup));

        Enrollment existing = new Enrollment();
        existing.setCourseGroup(null); // Đã mua lẻ

        when(courseGroupRepository.sumPriceCourseGroupByIds(any())).thenReturn(new BigDecimal("250000"));
        when(courseRepository.sumPriceCourseByIds(any())).thenReturn(BigDecimal.ZERO);
        when(courseGroupRepository.findAllByIdIn(any())).thenReturn(List.of(group));
        when(enrollmentRepository.findByUserIdAndCourseId(eq(mockUser.getId()), eq(100L))).thenReturn(Optional.of(existing));
        when(networkUtils.getIpAddress(any())).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any())).thenReturn("url");

        CreateOrderResponse res = orderService.createOrder(req, mockUser, mockRequest);

        // 250,000 (Group) - 100,000 (Lẻ) = 150,000
        assertThat(res.getTotalMoney()).isEqualByComparingTo(new BigDecimal("150000"));
    }

    // TC-ORD-021: getAllOrdersByAdmin - Sắp xếp ASC
    @Test
    @DisplayName("TC-ORD-021: Admin lấy danh sách order sắp xếp ASC")
    void getAllOrdersByAdmin_sortAsc() {
        org.springframework.data.domain.Page<Order> page = new org.springframework.data.domain.PageImpl<>(List.of());
        when(orderRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        orderService.getAllOrdersByAdmin(1, 10, null, "totalMoney", "asc");

        ArgumentCaptor<org.springframework.data.domain.Pageable> captor = ArgumentCaptor.forClass(org.springframework.data.domain.Pageable.class);
        verify(orderRepository).findAll(captor.capture());
        assertThat(captor.getValue().getSort().getOrderFor("totalMoney").getDirection())
                .isEqualTo(org.springframework.data.domain.Sort.Direction.ASC);
    }
}
