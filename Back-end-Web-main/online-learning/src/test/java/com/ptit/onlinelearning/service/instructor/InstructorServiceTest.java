package com.ptit.onlinelearning.service.instructor;

import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.component.SendGridSender;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.projection.InstructorStatsProjection;
import com.ptit.onlinelearning.repository.*;
import com.ptit.onlinelearning.response.instructor.InstructorMonthlyEarningResponse;
import com.ptit.onlinelearning.response.instructor.InstructorUserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho InstructorService
 * Technique: EP + Negative Testing + CheckDB
 */
@ExtendWith(MockitoExtension.class)
class InstructorServiceTest {

    @Mock private InstructorRepository instructorRepository;
    @Mock private UserRepository userRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private InstructorMonthlyEarningRepository instructorMonthlyEarningRepository;
    @Mock private SendGridSender sendGridSender;

    @InjectMocks
    private InstructorService instructorService;

    private User mockUser;
    private Instructor mockInstructor;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("inst@mail.com").build();
        mockInstructor = Instructor.builder().id(10L).userId(1L).slug("inst-slug").expertise("Java").build();
        mockInstructor.setUser(mockUser);
    }

    // TC-INST-001: getInstructorBySlug found
    @Test
    @DisplayName("TC-INST-001: Lấy instructor theo slug thành công")
    void getInstructorBySlug_success() {
        when(instructorRepository.findBySlug("inst-slug")).thenReturn(Optional.of(mockInstructor));
        when(courseRepository.countByInstructorId(10L)).thenReturn(5L);

        InstructorUserResponse res = instructorService.getInstructorBySlug("inst-slug");

        assertThat(res.getEmail()).isEqualTo("inst@mail.com");
        assertThat(res.getExpertise()).isEqualTo("Java");
        assertThat(res.getTotalCourses()).isEqualTo(5L);
    }

    // TC-INST-002: getInstructorBySlug not found
    @Test
    @DisplayName("TC-INST-002: Slug không tồn tại -> DataNotFoundException")
    void getInstructorBySlug_notFound() {
        when(instructorRepository.findBySlug("invalid")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> instructorService.getInstructorBySlug("invalid"))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-INST-003: updatePaymentStatus -> success and change to PAID
    @Test
    @DisplayName("TC-INST-003: Cập nhật Payment Status sang PAID -> Send email và CheckDB")
    void updatePaymentStatus_toPaid_success() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(99L);
        earning.setPaymentStatus(EarningStatus.PENDING);
        earning.setInstructor(mockInstructor);

        when(instructorMonthlyEarningRepository.findById(99L)).thenReturn(Optional.of(earning));
        when(instructorMonthlyEarningRepository.save(any(InstructorMonthlyEarning.class))).thenAnswer(i -> i.getArgument(0));
        doNothing().when(sendGridSender).sendInstructorPaymentSuccessEmail(anyString(), any(), any());

        InstructorMonthlyEarningResponse res = instructorService.updatePaymentStatus(99L, EarningStatus.PAID);

        verify(instructorMonthlyEarningRepository, times(1)).save(earning);
        verify(sendGridSender, times(1)).sendInstructorPaymentSuccessEmail("inst@mail.com", earning, mockInstructor);
        assertThat(res.getPaymentStatus()).isEqualTo(EarningStatus.PAID);
    }

    // TC-INST-004: getInstructorById found
    @Test
    @DisplayName("TC-INST-004: getInstructorById thành công")
    void getInstructorById_success() {
        InstructorStatsProjection projection = mock(InstructorStatsProjection.class);
        when(projection.getTotalCourses()).thenReturn(10L);
        when(projection.getTotalStudents()).thenReturn(100L);

        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));
        when(instructorRepository.getInstructorStats(10L)).thenReturn(projection);

        InstructorUserResponse res = instructorService.getInstructorById(10L);

        assertThat(res.getTotalCourses()).isEqualTo(10L);
        assertThat(res.getTotalStudents()).isEqualTo(100L);
    }

    // TC-INST-005: getAllInstructorsForAdmin
    @Test
    @DisplayName("TC-INST-005: Lấy danh sách Instructor cho Admin")
    void getAllInstructorsForAdmin_success() {
        org.springframework.data.domain.Page<User> page = new org.springframework.data.domain.PageImpl<>(java.util.List.of(mockUser));
        when(userRepository.findUsersByRoleWithSearch(eq(com.ptit.onlinelearning.common.type.RoleName.INSTRUCTOR), anyString(), any())).thenReturn(page);
        
        org.springframework.data.domain.Page<com.ptit.onlinelearning.response.instructor.InstructorAdminResponse> res = 
            instructorService.getAllInstructorsForAdmin(0, 10, "", "createdAt", "desc");
            
        assertThat(res.getContent()).hasSize(1);
        assertThat(res.getContent().get(0).getEmail()).isEqualTo("inst@mail.com");
    }

    // TC-INST-006: getTopInstructors
    @Test
    @DisplayName("TC-INST-006: Lấy danh sách Top Instructors")
    void getTopInstructors_success() {
        when(instructorRepository.findTop10ByOrderByTotalStudentsDescTotalCoursesDesc())
                .thenReturn(java.util.List.of(mockInstructor));

        var res = instructorService.getTopInstructors();

        assertThat(res).hasSize(1);
        verify(instructorRepository, times(1)).findTop10ByOrderByTotalStudentsDescTotalCoursesDesc();
    }

    // TC-INST-007: getInstructorById - Không tìm thấy -> DataNotFoundException
    @Test
    @DisplayName("TC-INST-007: getInstructorById không tìm thấy -> DataNotFoundException")
    void getInstructorById_notFound() {
        when(instructorRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> instructorService.getInstructorById(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Instructor not found with id");
    }

    // TC-INST-008: getInstructorIncome - Success
    @Test
    @DisplayName("TC-INST-008: Tính thu nhập Instructor với commission 70%")
    void getInstructorIncome_success() {
        com.ptit.onlinelearning.projection.InstructorIncomeProjection projection = mock(com.ptit.onlinelearning.projection.InstructorIncomeProjection.class);
        when(projection.getCourseTitle()).thenReturn("Java Course");
        when(projection.getIncome()).thenReturn(new java.math.BigDecimal("1000000"));
        when(projection.getThumbnail()).thenReturn("thumb.jpg");
        when(projection.getCourseType()).thenReturn("STANDALONE");
        when(projection.getTotalSales()).thenReturn(5L);

        mockInstructor.setCommissionRate(new java.math.BigDecimal("70.00"));

        org.springframework.data.domain.Page<com.ptit.onlinelearning.projection.InstructorIncomeProjection> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(projection));

        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));
        when(orderRepository.findInstructorIncome(eq(10L), any())).thenReturn(page);
        when(orderRepository.findTotalInstructorIncome(10L)).thenReturn(new java.math.BigDecimal("1000000"));

        var res = instructorService.getInstructorIncome(10L, 1, 10);

        assertThat(res.getCourses().getData()).hasSize(1);
        assertThat(res.getCourses().getData().get(0).getCourseTitle()).isEqualTo("Java Course");
        // 1,000,000 * 70% = 700,000
        assertThat(res.getCourses().getData().get(0).getIncome())
                .isEqualByComparingTo(new java.math.BigDecimal("700000.00"));
    }

    // TC-INST-009: getAllStudentOfInstructor - CourseType SINGLE
    @Test
    @DisplayName("TC-INST-009: Lấy danh sách student của course đơn lẻ")
    void getAllStudentOfInstructor_single() {
        com.ptit.onlinelearning.response.UserResponse userResp = mock(com.ptit.onlinelearning.response.UserResponse.class);
        org.springframework.data.domain.Page<com.ptit.onlinelearning.response.UserResponse> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(userResp));

        when(enrollmentRepository.getAllUserEnrolledInCourse(eq(100L), anyString(), any())).thenReturn(page);

        var res = instructorService.getAllStudentOfInstructor(100L, com.ptit.onlinelearning.common.type.CourseType.STANDALONE,
                1, 10, "enrollmentDate", "desc", "");

        assertThat(res.getData()).hasSize(1);
        verify(enrollmentRepository, times(1)).getAllUserEnrolledInCourse(eq(100L), anyString(), any());
    }

    // TC-INST-010: updatePaymentStatus - earningId không tồn tại -> DataNotFoundException
    @Test
    @DisplayName("TC-INST-010: updatePaymentStatus với earningId không tồn tại -> DataNotFoundException")
    void updatePaymentStatus_earningNotFound_throwsException() {
        when(instructorMonthlyEarningRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> instructorService.updatePaymentStatus(999L, com.ptit.onlinelearning.common.type.EarningStatus.PAID))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Instructor monthly earning not found with id: 999");
    }

    // TC-INST-011: updatePaymentStatus - Từ PAID -> PAID (không đổi) -> Không gửi email lần nữa
    @Test
    @DisplayName("TC-INST-011: updatePaymentStatus từ PAID -> PAID -> Không trigger email lần nữa")
    void updatePaymentStatus_alreadyPaid_doesNotSendEmail() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(100L);
        earning.setPaymentStatus(EarningStatus.PAID); // đã PAID rồi
        earning.setInstructor(mockInstructor);

        when(instructorMonthlyEarningRepository.findById(100L)).thenReturn(java.util.Optional.of(earning));
        when(instructorMonthlyEarningRepository.save(any(InstructorMonthlyEarning.class))).thenAnswer(i -> i.getArgument(0));

        instructorService.updatePaymentStatus(100L, EarningStatus.PAID);

        // Vì trạng thái đã là PAID -> không gửi email
        verify(sendGridSender, never()).sendInstructorPaymentSuccessEmail(anyString(), any(), any());
        assertThat(earning.getPaymentStatus()).isEqualTo(EarningStatus.PAID);
    }

    // TC-INST-012: getInstructorIncome - instructorId không tồn tại -> DataNotFoundException
    @Test
    @DisplayName("TC-INST-012: getInstructorIncome với instructorId không tồn tại -> DataNotFoundException")
    void getInstructorIncome_instructorNotFound_throwsException() {
        when(instructorRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> instructorService.getInstructorIncome(999L, 1, 10))
                .isInstanceOf(com.ptit.onlinelearning.exception.DataNotFoundException.class)
                .hasMessageContaining("Instructor not found with id: 999");
    }

    // TC-INST-013: getAllStudentOfInstructor - CourseType GROUP -> Gọi đúng repo method
    @Test
    @DisplayName("TC-INST-013: Lấy danh sách student của CourseGroup -> Gọi getAllUserEnrolledInCourseGroup")
    void getAllStudentOfInstructor_group() {
        com.ptit.onlinelearning.response.UserResponse userResp = mock(com.ptit.onlinelearning.response.UserResponse.class);
        org.springframework.data.domain.Page<com.ptit.onlinelearning.response.UserResponse> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(userResp));

        when(enrollmentRepository.getAllUserEnrolledInCourseGroup(eq(50L), anyString(), any())).thenReturn(page);

        var res = instructorService.getAllStudentOfInstructor(50L, com.ptit.onlinelearning.common.type.CourseType.GROUP,
                1, 10, "enrollmentDate", "desc", "");

        assertThat(res.getData()).hasSize(1);
        verify(enrollmentRepository, times(1)).getAllUserEnrolledInCourseGroup(eq(50L), anyString(), any());
        // Không gọi method STANDALONE
        verify(enrollmentRepository, never()).getAllUserEnrolledInCourse(any(), anyString(), any());
    }

    // TC-INST-014: getInstructorsMonthlyEarnings - filter theo paymentStatus PENDING
    @Test
    @DisplayName("TC-INST-014: getInstructorsMonthlyEarnings với filter PENDING -> Gọi đúng repo method")
    void getInstructorsMonthlyEarnings_withStatusFilter_callsCorrectRepo() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(1L);
        earning.setPaymentStatus(EarningStatus.PENDING);
        earning.setInstructor(mockInstructor);

        org.springframework.data.domain.Page<InstructorMonthlyEarning> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(earning));

        when(instructorMonthlyEarningRepository.findByYearAndMonthAndPaymentStatus(
                eq(2026), eq(5), eq(EarningStatus.PENDING), any()))
                .thenReturn(page);

        var result = instructorService.getInstructorsMonthlyEarnings(2026, 5, EarningStatus.PENDING, 1, 10, "totalEarning", "desc");

        assertThat(result.getContent()).hasSize(1);
        verify(instructorMonthlyEarningRepository, times(1))
                .findByYearAndMonthAndPaymentStatus(eq(2026), eq(5), eq(EarningStatus.PENDING), any());
        // Không gọi method không có filter
        verify(instructorMonthlyEarningRepository, never()).findByYearAndMonth(any(), any(), any());
    }

    // TC-INST-015: getInstructorBySlug - User null -> DataNotFoundException
    @Test
    @DisplayName("TC-INST-015: getInstructorBySlug nhưng User null -> DataNotFoundException")
    void getInstructorBySlug_userNull_throwsException() {
        mockInstructor.setUser(null);
        when(instructorRepository.findBySlug("inst-slug")).thenReturn(Optional.of(mockInstructor));

        assertThatThrownBy(() -> instructorService.getInstructorBySlug("inst-slug"))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User information not found");
    }

    // TC-INST-016: getInstructorById - User null -> DataNotFoundException
    @Test
    @DisplayName("TC-INST-016: getInstructorById nhưng User null -> DataNotFoundException")
    void getInstructorById_userNull_throwsException() {
        mockInstructor.setUser(null);
        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));

        assertThatThrownBy(() -> instructorService.getInstructorById(10L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User information not found");
    }

    // TC-INST-017: getAllInstructorsCurrentMonthEarning - success
    @Test
    @DisplayName("TC-INST-017: getAllInstructorsCurrentMonthEarning thành công")
    void getAllInstructorsCurrentMonthEarning_success() {
        Object[] row = new Object[]{
                "inst@mail.com", "instAcc", "BankA", "12345", "John", "Doe", new java.math.BigDecimal("50000")
        };
        org.springframework.data.domain.Page<Object[]> page = new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(row));

        when(orderRepository.findAllInstructorsCurrentMonthEarning(anyInt(), anyInt(), anyString(), any()))
                .thenReturn(page);

        var res = instructorService.getAllInstructorsCurrentMonthEarning(1, 10, "", "currentMonthEarning", "desc");

        assertThat(res.getContent()).hasSize(1);
        assertThat(res.getContent().get(0).getEmail()).isEqualTo("inst@mail.com");
        assertThat(res.getContent().get(0).getCurrentMonthEarning()).isEqualByComparingTo("50000");
    }

    // TC-INST-018: getInstructorsMonthlyEarnings - không filter paymentStatus
    @Test
    @DisplayName("TC-INST-018: getInstructorsMonthlyEarnings không filter paymentStatus -> gọi findByYearAndMonth")
    void getInstructorsMonthlyEarnings_noStatusFilter_callsCorrectRepo() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(1L);
        earning.setInstructor(mockInstructor);

        org.springframework.data.domain.Page<InstructorMonthlyEarning> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(earning));

        when(instructorMonthlyEarningRepository.findByYearAndMonth(eq(2026), eq(5), any())).thenReturn(page);

        var result = instructorService.getInstructorsMonthlyEarnings(2026, 5, null, 1, 10, null, "asc");

        assertThat(result.getContent()).hasSize(1);
        verify(instructorMonthlyEarningRepository, times(1)).findByYearAndMonth(eq(2026), eq(5), any());
    }

    // TC-INST-019: updatePaymentStatus - Instructor null inside earning
    @Test
    @DisplayName("TC-INST-019: updatePaymentStatus nhưng instructor null -> DataNotFoundException")
    void updatePaymentStatus_instructorNull_throwsException() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(99L);
        earning.setInstructor(null); // Null

        when(instructorMonthlyEarningRepository.findById(99L)).thenReturn(Optional.of(earning));

        assertThatThrownBy(() -> instructorService.updatePaymentStatus(99L, EarningStatus.PAID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Instructor not found for earning id: 99");
    }

    // TC-INST-020: updatePaymentStatus - Gửi email bị lỗi (try-catch coverage)
    @Test
    @DisplayName("TC-INST-020: updatePaymentStatus -> Lỗi gửi email -> Bỏ qua, vẫn thành công")
    void updatePaymentStatus_sendEmailError_continuesFlow() {
        InstructorMonthlyEarning earning = new InstructorMonthlyEarning();
        earning.setId(99L);
        earning.setPaymentStatus(EarningStatus.PENDING);
        earning.setInstructor(mockInstructor);

        when(instructorMonthlyEarningRepository.findById(99L)).thenReturn(Optional.of(earning));
        when(instructorMonthlyEarningRepository.save(any(InstructorMonthlyEarning.class))).thenAnswer(i -> i.getArgument(0));
        doThrow(new RuntimeException("SendGrid Error")).when(sendGridSender).sendInstructorPaymentSuccessEmail(anyString(), any(), any());

        InstructorMonthlyEarningResponse res = instructorService.updatePaymentStatus(99L, EarningStatus.PAID);

        assertThat(res.getPaymentStatus()).isEqualTo(EarningStatus.PAID);
        // Error is logged, not re-thrown
    }

    // TC-INST-021: getInstructorIncome - Default commission rate (70%)
    @Test
    @DisplayName("TC-INST-021: getInstructorIncome -> commissionRate null -> mặc định 70%")
    void getInstructorIncome_commissionRateNull_usesDefault() {
        com.ptit.onlinelearning.projection.InstructorIncomeProjection projection = mock(com.ptit.onlinelearning.projection.InstructorIncomeProjection.class);
        when(projection.getCourseTitle()).thenReturn("Java");
        when(projection.getIncome()).thenReturn(new java.math.BigDecimal("1000"));
        when(projection.getThumbnail()).thenReturn("thumb.jpg");
        when(projection.getCourseType()).thenReturn("STANDALONE");
        when(projection.getTotalSales()).thenReturn(1L);

        // Commission rate is NULL
        mockInstructor.setCommissionRate(null);

        org.springframework.data.domain.Page<com.ptit.onlinelearning.projection.InstructorIncomeProjection> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(projection));

        when(instructorRepository.findById(10L)).thenReturn(Optional.of(mockInstructor));
        when(orderRepository.findInstructorIncome(eq(10L), any())).thenReturn(page);
        when(orderRepository.findTotalInstructorIncome(10L)).thenReturn(new java.math.BigDecimal("1000"));

        var res = instructorService.getInstructorIncome(10L, 1, 10);

        assertThat(res.getCommissionRate()).isEqualByComparingTo("70.00");
        assertThat(res.getCourses().getData().get(0).getIncome()).isEqualByComparingTo("700.00");
    }
}

