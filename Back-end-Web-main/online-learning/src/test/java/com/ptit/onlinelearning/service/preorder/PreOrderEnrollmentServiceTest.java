package com.ptit.onlinelearning.service.preorder;

import com.ptit.onlinelearning.common.type.CourseType;
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
import com.ptit.onlinelearning.service.vnpay.IVNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho PreOrderEnrollmentService
 */
@ExtendWith(MockitoExtension.class)
class PreOrderEnrollmentServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private CourseGroupRepository courseGroupRepository;
    @Mock private NetworkUtils networkUtils;
    @Mock private PreOrderEnrollmentRepository preOrderEnrollmentRepository;
    @Mock private IVNPayService vnPayService;
    @Mock private HttpServletRequest mockRequest;

    @InjectMocks
    private PreOrderEnrollmentService preOrderService;

    private User mockUser;
    private Course mockCourse;
    private CourseGroup mockCourseGroup;
    private PreOrderRequest req;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("user@mail.com").build();
        
        mockCourse = new Course();
        mockCourse.setId(10L);
        mockCourse.setTitle("Test Course");
        mockCourse.setIsPreOrder(true);
        mockCourse.setPreOrderTotalSlots(100);
        mockCourse.setPreOrderRemainingSlots(50);
        mockCourse.setPreOrderPrice(new BigDecimal("1000"));

        mockCourseGroup = new CourseGroup();
        mockCourseGroup.setId(20L);
        mockCourseGroup.setTitle("Test Group");
        mockCourseGroup.setIsPreOrder(true);
        mockCourseGroup.setBundleTotalSlots(100);
        mockCourseGroup.setBundleRemainingSlots(50);
        mockCourseGroup.setPreOrderPrice(new BigDecimal("2000"));

        req = new PreOrderRequest();
    }

    // TC-PRE-001: Course và Group null
    @Test
    @DisplayName("TC-PRE-001: Truyền thiếu ID -> ném InvalidParamException")
    void createPreOrder_nullIds_throwsException() {
        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Either courseId or courseGroupId must be provided");
    }

    // TC-PRE-002: Truyền cả Course và Group
    @Test
    @DisplayName("TC-PRE-002: Truyền cả 2 ID -> ném InvalidParamException")
    void createPreOrder_bothIds_throwsException() {
        req.setCourseId(10L);
        req.setCourseGroupId(20L);
        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Cannot pre-order both");
    }

    // TC-PRE-003: PreOrder Course thành công
    @Test
    @DisplayName("TC-PRE-003: Đặt trước Course thành công -> Sinh URL thanh toán")
    void createPreOrder_course_success() {
        req.setCourseId(10L);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(mockCourse));
        when(preOrderEnrollmentRepository.saveAndFlush(any(PreOrderEnrollment.class))).thenAnswer(i -> {
            PreOrderEnrollment p = i.getArgument(0); p.setId(99L); return p;
        });
        when(networkUtils.getIpAddress(mockRequest)).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any(InitPaymentRequest.class))).thenReturn("http://vnpay.vn/pay");

        CreatePreOrderResponse res = preOrderService.createPreOrder(req, mockUser, mockRequest);

        verify(preOrderEnrollmentRepository, times(1)).saveAndFlush(any(PreOrderEnrollment.class));
        assertThat(res.getCourseId()).isEqualTo(10L);
        assertThat(res.getCourseType()).isEqualTo(CourseType.STANDALONE);
        assertThat(res.getPaymentResponse().getPaymentUrl()).isEqualTo("http://vnpay.vn/pay");
    }

    // TC-PRE-004: PreOrder Group thành công
    @Test
    @DisplayName("TC-PRE-004: Đặt trước Group thành công -> Sinh URL thanh toán")
    void createPreOrder_group_success() {
        req.setCourseGroupId(20L);
        when(courseGroupRepository.findById(20L)).thenReturn(Optional.of(mockCourseGroup));
        when(preOrderEnrollmentRepository.saveAndFlush(any(PreOrderEnrollment.class))).thenAnswer(i -> {
            PreOrderEnrollment p = i.getArgument(0); p.setId(99L); return p;
        });
        when(networkUtils.getIpAddress(mockRequest)).thenReturn("127.0.0.1");
        when(vnPayService.createPaymentUrl(any(InitPaymentRequest.class))).thenReturn("http://vnpay.vn/pay");

        CreatePreOrderResponse res = preOrderService.createPreOrder(req, mockUser, mockRequest);

        verify(preOrderEnrollmentRepository, times(1)).saveAndFlush(any(PreOrderEnrollment.class));
        assertThat(res.getCourseId()).isEqualTo(20L);
        assertThat(res.getCourseType()).isEqualTo(CourseType.GROUP);
        assertThat(res.getPaymentResponse().getPaymentUrl()).isEqualTo("http://vnpay.vn/pay");
    }

    // TC-PRE-005: updatePreOrderStatusSuccess - PAID
    @Test
    @DisplayName("TC-PRE-005: Thanh toán PreOrder thành công -> CheckDB trừ slot")
    void updatePreOrderStatusSuccess_paid_decreasesSlots() {
        PreOrderEnrollment pre = new PreOrderEnrollment();
        pre.setStatus(PreOrderStatus.PAID);
        pre.setCourse(mockCourse); // Has 50 remaining slots
        
        preOrderService.updatePreOrderStatusSuccess(pre);

        verify(preOrderEnrollmentRepository, times(1)).save(pre);
        verify(courseRepository, times(1)).save(mockCourse);
        assertThat(mockCourse.getPreOrderRemainingSlots()).isEqualTo(49);
    }

    // TC-PRE-006: Course không hỗ trợ preorder -> Exception
    @Test
    @DisplayName("TC-PRE-006: Course không hỗ trợ PreOrder -> InvalidParamException")
    void createPreOrder_courseNotPreOrder_throwsException() {
        mockCourse.setIsPreOrder(false);
        req.setCourseId(10L);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(mockCourse));

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("not available for pre-order");
    }

    // TC-PRE-007: Course hết slot -> Exception
    @Test
    @DisplayName("TC-PRE-007: Course hết slot PreOrder -> InvalidParamException")
    void createPreOrder_courseNoSlots_throwsException() {
        mockCourse.setPreOrderRemainingSlots(0);
        req.setCourseId(10L);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(mockCourse));

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("No remaining slots");
    }

    // TC-PRE-008: updatePreOrderStatusSuccess - CANCELLED (không thay đổi slot)
    @Test
    @DisplayName("TC-PRE-008: PreOrder CANCELLED -> Chỉ lưu, không thay đổi slot")
    void updatePreOrderStatusSuccess_cancelled_noSlotChange() {
        PreOrderEnrollment pre = new PreOrderEnrollment();
        pre.setStatus(PreOrderStatus.CANCELLED);
        pre.setCourse(mockCourse); // 50 remaining slots

        preOrderService.updatePreOrderStatusSuccess(pre);

        verify(preOrderEnrollmentRepository, times(1)).save(pre);
        // CANCELLED -> không gọi courseRepository.save
        verify(courseRepository, never()).save(any());
        assertThat(mockCourse.getPreOrderRemainingSlots()).isEqualTo(50); // không đổi
    }

    // TC-PRE-009: getPreOrderEnrollmentByPaymentId - not found -> DataNotFoundException
    @Test
    @DisplayName("TC-PRE-009: getPreOrderEnrollmentByPaymentId không tìm thấy -> DataNotFoundException")
    void getPreOrderEnrollmentByPaymentId_notFound_throwsException() {
        when(preOrderEnrollmentRepository.findByPaymentId("NO_ID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> preOrderService.getPreOrderEnrollmentByPaymentId("NO_ID"))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Pre-order enrollment not found");
    }

    // TC-PRE-010: getPreOrderEnrollmentByPaymentId - found
    @Test
    @DisplayName("TC-PRE-010: getPreOrderEnrollmentByPaymentId tìm thấy -> trả về entity")
    void getPreOrderEnrollmentByPaymentId_found_returnsEntity() {
        PreOrderEnrollment pre = new PreOrderEnrollment();
        pre.setPaymentId("PAY123");
        when(preOrderEnrollmentRepository.findByPaymentId("PAY123")).thenReturn(Optional.of(pre));

        PreOrderEnrollment res = preOrderService.getPreOrderEnrollmentByPaymentId("PAY123");

        assertThat(res).isNotNull();
        assertThat(res.getPaymentId()).isEqualTo("PAY123");
    }

    // TC-PRE-011: createCoursePreOrder - course không tồn tại -> Exception
    @Test
    @DisplayName("TC-PRE-011: Course không tồn tại -> DataNotFoundException")
    void createCoursePreOrder_courseNotFound_throwsException() {
        req.setCourseId(999L);
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-PRE-012: createCourseGroupPreOrder - courseGroup không tồn tại -> Exception
    @Test
    @DisplayName("TC-PRE-012: CourseGroup không tồn tại -> DataNotFoundException")
    void createCourseGroupPreOrder_groupNotFound_throwsException() {
        req.setCourseGroupId(999L);
        when(courseGroupRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-PRE-013: createCourseGroupPreOrder - group không hỗ trợ preorder -> Exception
    @Test
    @DisplayName("TC-PRE-013: CourseGroup không hỗ trợ PreOrder -> InvalidParamException")
    void createCourseGroupPreOrder_groupNotPreOrder_throwsException() {
        req.setCourseGroupId(20L);
        mockCourseGroup.setIsPreOrder(false);
        when(courseGroupRepository.findById(20L)).thenReturn(Optional.of(mockCourseGroup));

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("not available for pre-order");
    }

    // TC-PRE-014: createCourseGroupPreOrder - group hết slot -> Exception
    @Test
    @DisplayName("TC-PRE-014: CourseGroup hết slot PreOrder -> InvalidParamException")
    void createCourseGroupPreOrder_groupNoSlots_throwsException() {
        req.setCourseGroupId(20L);
        mockCourseGroup.setBundleRemainingSlots(0);
        when(courseGroupRepository.findById(20L)).thenReturn(Optional.of(mockCourseGroup));

        assertThatThrownBy(() -> preOrderService.createPreOrder(req, mockUser, mockRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("No remaining slots");
    }

    // TC-PRE-015: updatePreOrderStatusSuccess - PAID cho CourseGroup
    @Test
    @DisplayName("TC-PRE-015: Thanh toán PreOrder CourseGroup thành công -> CheckDB trừ slot")
    void updatePreOrderStatusSuccess_paidGroup_decreasesSlots() {
        PreOrderEnrollment pre = new PreOrderEnrollment();
        pre.setStatus(PreOrderStatus.PAID);
        pre.setCourseGroup(mockCourseGroup); // Has 50 remaining slots
        
        preOrderService.updatePreOrderStatusSuccess(pre);

        verify(preOrderEnrollmentRepository, times(1)).save(pre);
        verify(courseGroupRepository, times(1)).save(mockCourseGroup);
        assertThat(mockCourseGroup.getBundleRemainingSlots()).isEqualTo(49);
    }

    // TC-PRE-016: getAllPreOrdersByUser
    @Test
    @DisplayName("TC-PRE-016: Lấy danh sách PreOrders của User thành công")
    void getAllPreOrdersByUser_success() {
        PreOrderEnrollment pre = new PreOrderEnrollment();
        pre.setSlotNumber(1);
        pre.setPricePaid(new BigDecimal("1000"));
        pre.setStatus(PreOrderStatus.PAID);
        pre.setCourse(mockCourse);
        pre.setPreOrderDate(java.time.LocalDateTime.now());
        
        org.springframework.data.domain.Page<PreOrderEnrollment> page = new org.springframework.data.domain.PageImpl<>(java.util.List.of(pre));
        
        when(preOrderEnrollmentRepository.findByUserAndStatusInAndCourseIsNotNullAndCourseGroupIsNull(
                eq(mockUser), anyList(), any(org.springframework.data.domain.Pageable.class)
        )).thenReturn(page);

        com.ptit.onlinelearning.response.PageableResponse<com.ptit.onlinelearning.response.PreOrderUserResponse> res = preOrderService.getAllPreOrdersByUser(mockUser, 1, 10);

        assertThat(res).isNotNull();
        assertThat(res.getData()).hasSize(1);
        assertThat(res.getData().get(0).getCourseId()).isEqualTo(10L);
    }
}
