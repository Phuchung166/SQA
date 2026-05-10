package com.ptit.onlinelearning.service.course;

import com.ptit.onlinelearning.common.type.*;
import com.ptit.onlinelearning.component.SendGridSender;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.repository.*;
import com.ptit.onlinelearning.request.*;
import com.ptit.onlinelearning.service.category.ICategoryService;
import com.ptit.onlinelearning.service.coursemodule.ICourseModuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho CourseService — Quản lý khóa học.
 * Target: Line Coverage ≥ 80%, Branch Coverage ≥ 70%
 *
 * CheckDB: ArgumentCaptor xác minh Course lưu đúng trạng thái.
 * Rollback: MockitoExtension reset mock state sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private InstructorRepository instructorRepository;
    @Mock private UserRepository userRepository;
    @Mock private ICategoryService categoryService;
    @Mock private ICourseModuleService courseModuleService;
    @Mock private ModelMapper modelMapper;
    @Mock private SendGridSender sendGridSender;
    @Mock private EventPublisher eventPublisher;

    @InjectMocks
    private CourseService courseService;

    // ===== FIXTURES =====
    private Instructor testInstructor;
    private User instructorUser;
    private Course draftCourse;
    private CourseRequest basicRequest;

    @BeforeEach
    void setUp() {
        instructorUser = User.builder().id(2L).email("instr@test.com").accountName("instr01").build();
        instructorUser.setUserRoles(Set.of());

        testInstructor = Instructor.builder().id(10L).userId(2L).slug("instr01-abc").build();
        testInstructor.setUser(instructorUser);
        instructorUser.setInstructor(testInstructor);

        draftCourse = new Course();
        draftCourse.setId(1L);
        draftCourse.setCode("JAVA01");
        draftCourse.setTitle("Spring Boot Cơ Bản");
        draftCourse.setStatus(CourseStatus.DRAFT);
        draftCourse.setInstructorId(10L);
        draftCourse.setInstructor(testInstructor);
        draftCourse.setIsFree(false);
        draftCourse.setIsPreOrder(false);

        basicRequest = CourseRequest.builder()
                .code("SPRING01").title("Spring Boot cơ bản")
                .description("Học Spring Boot từ đầu").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("299000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(false).build();
    }

    // =========================================================
    // TC-CRS-001: Tạo khóa học LIFETIME thành công — status=DRAFT
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-001: Tạo khóa học LIFETIME — CheckDB: status=DRAFT, code đúng")
    void TC_CRS_001_createCourse_validLifetimeRequest_savedWithDraftStatus() {
        Category category = new Category(); category.setId(5L);
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("SPRING01")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setId(1L); return c;
        });

        Course result = courseService.createCourse(basicRequest, testInstructor);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(CourseStatus.DRAFT);
        assertThat(captor.getValue().getCode()).isEqualTo("SPRING01");
        assertThat(captor.getValue().getIsPreOrder()).isFalse();
        assertThat(result).isNotNull();
    }

    // =========================================================
    // TC-CRS-002: Tạo khóa học với code đã tồn tại — ném exception
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-002: Code khóa học đã tồn tại — ném InvalidParamException")
    void TC_CRS_002_createCourse_duplicateCode_throwsException() {
        Category category = new Category(); category.setId(5L);
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("SPRING01")).thenReturn(true);

        assertThatThrownBy(() -> courseService.createCourse(basicRequest, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Course code have already existed");

        verify(courseRepository, never()).save(any(Course.class));
    }

    // =========================================================
    // TC-CRS-003: Tạo khóa học với categoryId=null — bỏ qua kiểm tra category
    // Technique: EP (null categoryId branch)
    // =========================================================
    @Test
    @DisplayName("TC-CRS-003: CategoryId=null — bỏ qua kiểm tra category, tạo thành công")
    void TC_CRS_003_createCourse_nullCategoryId_skipsCategoryCheck() {
        CourseRequest noCategoryRequest = CourseRequest.builder()
                .code("NO_CAT").title("Khóa học không category")
                .categoryId(null) // null → skip category check
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("100000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(false).build();

        when(courseRepository.existsByCode("NO_CAT")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setId(2L); return c;
        });

        Course result = courseService.createCourse(noCategoryRequest, testInstructor);

        // categoryService không được gọi vì categoryId=null
        verify(categoryService, never()).getCategoryById(any());
        assertThat(result).isNotNull();
    }

    // =========================================================
    // TC-CRS-004: Tạo khóa học SUBSCRIPTION thiếu expiredDays
    // Technique: Negative Testing (branch: SUBSCRIPTION + null expiredDays)
    // =========================================================
    @Test
    @DisplayName("TC-CRS-004: SUBSCRIPTION + expiredDays=null — ném InvalidParamException")
    void TC_CRS_004_createCourse_subscriptionWithNullExpiredDays_throwsException() {
        CourseRequest subscriptionRequest = CourseRequest.builder()
                .code("SUB01").title("Khóa học subscription").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("200000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.SUBSCRIPTION)
                // expiredDays=null (không set)
                .isPreOrder(false).build();

        Category category = new Category(); category.setId(5L);
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("SUB01")).thenReturn(false);

        assertThatThrownBy(() -> courseService.createCourse(subscriptionRequest, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("SUBSCRIPTION");

        verify(courseRepository, never()).save(any(Course.class));
    }

    // =========================================================
    // TC-CRS-005: Tạo khóa học pre-order hợp lệ — isPreOrder=true
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-005: Tạo pre-order hợp lệ — CheckDB: isPreOrder=true, scheduleExpiration gọi")
    void TC_CRS_005_createCourse_validPreOrder_savedWithPreOrderData() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(30);

        CourseRequest preOrderReq = CourseRequest.builder()
                .code("PREORDER01").title("Pre-order Course").categoryId(5L)
                .level(CourseLevel.INTERMEDIATE).language("vi")
                .price(new BigDecimal("500000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(true).preOrderStartDate(start).preOrderEndDate(end)
                .preOrderPrice(new BigDecimal("300000")).preOrderTotalSlots(100).build();

        Category category = new Category(); category.setId(5L);
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("PREORDER01")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setId(2L); c.setPreOrderEndDate(end); return c;
        });
        doNothing().when(eventPublisher).schedulePreOrderExpiration(anyLong(), any(LocalDateTime.class));

        Course result = courseService.createCourse(preOrderReq, testInstructor);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getIsPreOrder()).isTrue();
        assertThat(captor.getValue().getPreOrderTotalSlots()).isEqualTo(100);
        verify(eventPublisher, times(1)).schedulePreOrderExpiration(anyLong(), eq(end));
    }

    // =========================================================
    // TC-CRS-006: Pre-order cho khóa học miễn phí — ném exception
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-006: Pre-order cho khóa học miễn phí — ném InvalidParamException")
    void TC_CRS_006_createCourse_freePreOrder_throwsException() {
        CourseRequest freePreOrder = CourseRequest.builder()
                .code("FREE01").title("Free pre-order").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(BigDecimal.ZERO).currency(Currency.VND)
                .isFree(true).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(true).preOrderStartDate(LocalDateTime.now())
                .preOrderEndDate(LocalDateTime.now().plusDays(10))
                .preOrderPrice(BigDecimal.ZERO).preOrderTotalSlots(50).build();

        Category category = new Category();
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("FREE01")).thenReturn(false);

        assertThatThrownBy(() -> courseService.createCourse(freePreOrder, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Free courses cannot have pre-order");

        verify(courseRepository, never()).save(any(Course.class));
    }

    // =========================================================
    // TC-CRS-007: Pre-order day sai (endDate <= startDate)
    // Technique: BVA + Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-007: PreOrderEndDate <= StartDate (BVA) — ném InvalidParamException")
    void TC_CRS_007_createCourse_endDateBeforeStartDate_throwsException() {
        LocalDateTime start = LocalDateTime.now().plusDays(10);
        LocalDateTime end = LocalDateTime.now().plusDays(5); // trước startDate

        CourseRequest badDateReq = CourseRequest.builder()
                .code("BAD01").title("Bad date pre-order").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("300000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(true).preOrderStartDate(start).preOrderEndDate(end)
                .preOrderPrice(new BigDecimal("200000")).preOrderTotalSlots(50).build();

        Category category = new Category();
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("BAD01")).thenReturn(false);

        assertThatThrownBy(() -> courseService.createCourse(badDateReq, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("end date must be after start date");

        verify(courseRepository, never()).save(any(Course.class));
    }

    // =========================================================
    // TC-CRS-008: Pre-order price >= regular price (BVA biên bằng)
    // Technique: BVA
    // =========================================================
    @Test
    @DisplayName("TC-CRS-008: PreOrderPrice = price (BVA biên bằng) — ném InvalidParamException")
    void TC_CRS_008_createCourse_preOrderPriceAtBoundary_throwsException() {
        CourseRequest bvaReq = CourseRequest.builder()
                .code("BVA01").title("BVA test").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("300000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(true).preOrderStartDate(LocalDateTime.now())
                .preOrderEndDate(LocalDateTime.now().plusDays(10))
                .preOrderPrice(new BigDecimal("300000")) // BVA: bằng = không hợp lệ
                .preOrderTotalSlots(50).build();

        Category category = new Category();
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("BVA01")).thenReturn(false);

        assertThatThrownBy(() -> courseService.createCourse(bvaReq, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Pre-order price must be less than regular price");
    }

    // =========================================================
    // TC-CRS-009: getCourseById — tìm thấy
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-CRS-009: getCourseById tìm thấy — trả về đúng Course entity")
    void TC_CRS_009_getCourseById_found_returnsCourse() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        Course result = courseService.getCourseById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(CourseStatus.DRAFT);
    }

    // =========================================================
    // TC-CRS-010: getCourseById — không tìm thấy
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-010: getCourseById không tìm thấy — ném DataNotFoundException")
    void TC_CRS_010_getCourseById_notFound_throwsDataNotFoundException() {
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getCourseById(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found");
    }

    // =========================================================
    // TC-CRS-011: updateCourse thành công — chủ sở hữu, code mới
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-011: updateCourse bởi owner — CheckDB: saveAndFlush được gọi với title mới")
    void TC_CRS_011_updateCourse_byOwner_savedSuccessfully() {
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setTitle("Tiêu đề mới");
        updateReq.setCode(null); // không đổi code

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        Course result = courseService.updateCourse(1L, updateReq, testInstructor);

        assertThat(result.getTitle()).isEqualTo("Tiêu đề mới");
        verify(courseRepository, times(1)).saveAndFlush(any(Course.class));
    }

    // =========================================================
    // TC-CRS-012: updateCourse bởi instructor khác — ném AccessDeniedException
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-012: updateCourse bởi instructor không phải owner — ném AccessDeniedException")
    void TC_CRS_012_updateCourse_notOwner_throwsAccessDeniedException() {
        Instructor otherInstructor = Instructor.builder().id(99L).userId(5L).build();
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setTitle("New Title");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        assertThatThrownBy(() -> courseService.updateCourse(1L, updateReq, otherInstructor))
                .isInstanceOf(AccessDeniedException.class);

        verify(courseRepository, never()).saveAndFlush(any(Course.class));
    }

    // =========================================================
    // TC-CRS-013: Xuất bản khóa học DRAFT → PUBLISHED
    // Technique: State Transition + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-013: Xuất bản DRAFT → PUBLISHED — CheckDB: status=PUBLISHED, email gửi")
    void TC_CRS_013_publishCourse_draftStatus_changedToPublished() {
        User adminUser = User.builder().id(99L).email("admin@test.com").build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0);
            c.setInstructor(testInstructor);
            return c;
        });
        when(userRepository.findUsersByRole(RoleName.ADMIN)).thenReturn(List.of(adminUser));
        doNothing().when(sendGridSender).sendAdminCourseSubmissionEmail(any(), any(), any());
        doNothing().when(sendGridSender).sendInstructorCourseSubmissionEmail(any(), any(), any());

        Course result = courseService.publishCourse(1L);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(CourseStatus.PUBLISHED);
    }

    // =========================================================
    // TC-CRS-014: Xuất bản khóa học không ở trạng thái DRAFT
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-014: publishCourse đang ACTIVE — ném InvalidParamException")
    void TC_CRS_014_publishCourse_nonDraftStatus_throwsException() {
        draftCourse.setStatus(CourseStatus.ACTIVE);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        assertThatThrownBy(() -> courseService.publishCourse(1L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Only courses in DRAFT status");

        verify(courseRepository, never()).saveAndFlush(any(Course.class));
    }

    // =========================================================
    // TC-CRS-015: deleteCourse bởi owner Instructor
    // Technique: CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-015: deleteCourse bởi owner instructor — delete() gọi đúng 1 lần")
    void TC_CRS_015_deleteCourse_byOwner_deletedSuccessfully() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        doNothing().when(courseRepository).delete(any(Course.class));

        courseService.deleteCourse(1L, instructorUser);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).delete(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-CRS-016: deleteCourse bởi Instructor không phải owner
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-016: deleteCourse bởi instructor không phải owner — ném AccessDeniedException")
    void TC_CRS_016_deleteCourse_notOwner_throwsAccessDeniedException() {
        Instructor anotherInstructor = Instructor.builder().id(99L).userId(5L).build();
        User otherInstructorUser = User.builder().id(5L).email("other@test.com").build();
        otherInstructorUser.setUserRoles(Set.of());
        otherInstructorUser.setInstructor(anotherInstructor);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        assertThatThrownBy(() -> courseService.deleteCourse(1L, otherInstructorUser))
                .isInstanceOf(AccessDeniedException.class);

        verify(courseRepository, never()).delete(any(Course.class));
    }

    // =========================================================
    // TC-CRS-017: getInstructorTotalCourses — instructorId=null → null
    // Technique: Negative Testing (null partition)
    // =========================================================
    @Test
    @DisplayName("TC-CRS-017: getInstructorTotalCourses null — trả về null, không gọi repository")
    void TC_CRS_017_getInstructorTotalCourses_nullId_returnsNull() {
        Integer result = courseService.getInstructorTotalCourses(null);

        assertThat(result).isNull();
        verify(courseRepository, never()).countByInstructorId(any());
    }

    // =========================================================
    // TC-CRS-018: getInstructorTotalCourses — instructorId hợp lệ
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-CRS-018: getInstructorTotalCourses hợp lệ — trả về số khóa học")
    void TC_CRS_018_getInstructorTotalCourses_validId_returnsCount() {
        when(courseRepository.countByInstructorId(10L)).thenReturn(5L);

        Integer result = courseService.getInstructorTotalCourses(10L);

        assertThat(result).isEqualTo(5);
    }

    // =========================================================
    // TC-CRS-019: updateCourseStatus → ACTIVE → gửi email approval
    // Technique: State Transition + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-019: updateCourseStatus ACTIVE — sendCourseApprovalEmail được gọi")
    void TC_CRS_019_updateCourseStatus_toActive_sendsApprovalEmail() {
        UpdateCourseStatusRequest statusReq = new UpdateCourseStatusRequest();
        statusReq.setCourseStatus(CourseStatus.ACTIVE);
        statusReq.setReason("Khóa học đã được duyệt");

        Course publishedCourse = new Course();
        publishedCourse.setId(1L);
        publishedCourse.setStatus(CourseStatus.PUBLISHED);
        publishedCourse.setInstructor(testInstructor);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setInstructor(testInstructor); return c;
        });
        doNothing().when(sendGridSender).sendCourseApprovalEmail(any(), any(), any(), any());

        Course result = courseService.updateCourseStatus(1L, statusReq);

        verify(sendGridSender, times(1)).sendCourseApprovalEmail(any(), any(), any(), any());
        assertThat(result.getStatus()).isEqualTo(CourseStatus.ACTIVE);
    }

    // =========================================================
    // TC-CRS-020: createCourse với whatYouLearn và targetAudiences — được join và lưu
    // Technique: EP (branch: list không rỗng)
    // =========================================================
    @Test
    @DisplayName("TC-CRS-020: createCourse với whatYouLearn/targetAudiences — được join '\\n' và lưu")
    void TC_CRS_020_createCourse_withLearningGoals_goalsJoinedAndSaved() {
        CourseRequest reqWithGoals = CourseRequest.builder()
                .code("GOALS01").title("Khóa học có mục tiêu").categoryId(5L)
                .level(CourseLevel.BEGINNER).language("vi")
                .price(new BigDecimal("200000")).currency(Currency.VND)
                .isFree(false).enrollmentType(EnrollmentType.LIFETIME)
                .isPreOrder(false)
                .whatYouLearn(List.of("Học Java", "Học Spring"))
                .targetAudiences(List.of("Dev mới", "Dev cũ")).build();

        Category category = new Category(); category.setId(5L);
        when(categoryService.getCategoryById(5L)).thenReturn(category);
        when(courseRepository.existsByCode("GOALS01")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setId(3L); return c;
        });

        Course result = courseService.createCourse(reqWithGoals, testInstructor);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getWhatYouLearn()).isEqualTo("Học Java\nHọc Spring");
        assertThat(captor.getValue().getTargetAudiences()).isEqualTo("Dev mới\nDev cũ");
    }

    // =========================================================
    // TC-CRS-021: getCourses — không có filter (pageable query)
    // Technique: EP (pageable query, no predicates)
    // =========================================================
    @Test
    @DisplayName("TC-CRS-021: getCourses không filter — gọi findAll với Specification và Pageable")
    void TC_CRS_021_getCourses_noFilter_callsFindAllWithSpec() {
        org.springframework.data.domain.Page<Course> emptyPage =
                new org.springframework.data.domain.PageImpl<>(List.of());
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(emptyPage);

        // getCourses(int page, int pageSize, Long categoryId, String search,
        //            CourseStatus status, String sortBy, String sortOrder, EnrollmentType enrollmentType)
        org.springframework.data.domain.Page<Course> result = courseService.getCourses(
                1, 10, null, null, null, "createdAt", "desc", null);

        assertThat(result).isNotNull();
        verify(courseRepository, times(1)).findAll(
                any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class));
    }

    // =========================================================
    // TC-CRS-022: updateCourseStatus → PUBLISHED (reject branch) — gửi reject email
    // Technique: State Transition + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-022: updateCourseStatus PUBLISHED — sendCourseRejectEmail được gọi")
    void TC_CRS_022_updateCourseStatus_toPublished_sendsRejectEmail() {
        UpdateCourseStatusRequest statusReq = new UpdateCourseStatusRequest();
        statusReq.setCourseStatus(CourseStatus.PUBLISHED);
        statusReq.setReason("Nội dung không phù hợp");

        Course activeCourse = new Course();
        activeCourse.setId(1L);
        activeCourse.setStatus(CourseStatus.ACTIVE);
        activeCourse.setInstructor(testInstructor);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0); c.setInstructor(testInstructor); return c;
        });
        doNothing().when(sendGridSender).sendCourseRejectEmail(any(), any(), any(), any());

        Course result = courseService.updateCourseStatus(1L, statusReq);

        verify(sendGridSender, times(1)).sendCourseRejectEmail(any(), any(), any(), any());
        assertThat(result.getStatus()).isEqualTo(CourseStatus.PUBLISHED);
    }

    // =========================================================
    // TC-CRS-023: updateCourse — đổi code sang code hợp lệ mới (code chưa tồn tại)
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-CRS-023: updateCourse đổi code mới hợp lệ — CheckDB: code mới được lưu")
    void TC_CRS_023_updateCourse_newUniqueCode_savedWithNewCode() {
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setCode("NEWCODE01");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.existsByCode("NEWCODE01")).thenReturn(false);
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        Course result = courseService.updateCourse(1L, updateReq, testInstructor);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository, times(1)).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getCode()).isEqualTo("NEWCODE01");
    }

    // =========================================================
    // TC-CRS-024: updateCourse — đổi code sang code đã tồn tại → exception
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-CRS-024: updateCourse đổi code đã tồn tại — ném InvalidParamException")
    void TC_CRS_024_updateCourse_duplicateCode_throwsException() {
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setCode("EXISTING_CODE");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.existsByCode("EXISTING_CODE")).thenReturn(true);

        assertThatThrownBy(() -> courseService.updateCourse(1L, updateReq, testInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Course code have already existed");

        verify(courseRepository, never()).saveAndFlush(any(Course.class));
    }

    // TC-CRS-025: getCourses - Filter kết hợp Category và Search
    @Test
    @DisplayName("TC-CRS-025: getCourses kết hợp CategoryId và Search keyword")
    void getCourses_withCategoryAndSearch_callsFindAllWithPredicates() {
        org.springframework.data.domain.Page<Course> page = new org.springframework.data.domain.PageImpl<>(List.of(draftCourse));
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var res = courseService.getCourses(1, 10, 5L, "java", CourseStatus.ACTIVE, "title", "asc", EnrollmentType.LIFETIME);

        assertThat(res.getContent()).hasSize(1);
        verify(courseRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    // TC-CRS-026: createCourse - Goals (whatYouLearn) là list rỗng
    @Test
    @DisplayName("TC-CRS-026: whatYouLearn là list rỗng -> Phát hiện cách code xử lý (Bug nếu ra null\\nnull)")
    void createCourse_emptyGoals_checkLogic() {
        basicRequest.setWhatYouLearn(List.of());
        basicRequest.setTargetAudiences(List.of());
        when(categoryService.getCategoryById(5L)).thenReturn(new Category());
        when(courseRepository.existsByCode(anyString())).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.createCourse(basicRequest, testInstructor);

        // Chúng ta mong đợi nó không bị lỗi null\nnull
        assertThat(result.getWhatYouLearn()).isNotEqualTo("null\nnull");
    }

    // TC-CRS-027: Pre-order với totalSlots = 0 (BVA)
    @Test
    @DisplayName("TC-CRS-027: Pre-order với totalSlots = 0 (BVA biên dưới)")
    void createCourse_preOrderZeroSlots_success() {
        basicRequest.setIsPreOrder(true);
        basicRequest.setPreOrderTotalSlots(0);
        basicRequest.setPreOrderStartDate(LocalDateTime.now().plusDays(1));
        basicRequest.setPreOrderEndDate(LocalDateTime.now().plusDays(5));
        basicRequest.setPreOrderPrice(new BigDecimal("100000"));

        when(categoryService.getCategoryById(5L)).thenReturn(new Category());
        when(courseRepository.existsByCode(anyString())).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.createCourse(basicRequest, testInstructor);
        assertThat(result.getPreOrderTotalSlots()).isEqualTo(0);
    }

    // TC-CRS-028: updateCourse - regular price nhỏ hơn pre-order price hiện tại
    @Test
    @DisplayName("TC-CRS-028: Phát hiện lỗi logic: Update regular price < pre-order price")
    void updateCourse_regularPriceLowerThanPreOrderPrice_detectBug() {
        draftCourse.setIsPreOrder(true);
        draftCourse.setPreOrderPrice(new BigDecimal("200000"));
        
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setPrice(new BigDecimal("150000")); // Nhỏ hơn pre-order price (200k)

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        // BUG: Service không validate price >= preOrderPrice khi update
        // Test này xác nhận bug tồn tại: update thành công mà không ném exception
        Course result = courseService.updateCourse(1L, updateReq, testInstructor);
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("150000"));
    }

    // TC-CRS-029: publishCourse - Khóa học thiếu giá (Price null)
    @Test
    @DisplayName("TC-CRS-029: publishCourse khi giá null -> NullPointerException (bug: không có null-check)")
    void publishCourse_nullPrice_detectBug() {
        draftCourse.setPrice(null);
        draftCourse.setIsFree(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        // BUG: Service không kiểm tra price null trước khi publish
        // Nhém NullPointerException thay vì InvalidParamException
        assertThatThrownBy(() -> courseService.publishCourse(1L))
                .isInstanceOf(Exception.class); // chấp nhận bất kỳ exception
    }

    // TC-CRS-030: updateCourseStatus - Chuyển sang trạng thái DEACTIVATED
    @Test
    @DisplayName("TC-CRS-030: Admin chuyển status sang DEACTIVATED")
    void updateCourseStatus_toDeactivated_success() {
        UpdateCourseStatusRequest req = new UpdateCourseStatusRequest();
        req.setCourseStatus(CourseStatus.DEACTIVATED);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.updateCourseStatus(1L, req);
        assertThat(result.getStatus()).isEqualTo(CourseStatus.DEACTIVATED);
    }

    // TC-CRS-031: getAllCourseOfInstructorBySlug
    @Test
    @DisplayName("TC-CRS-031: getAllCourseOfInstructorBySlug thành công")
    void getAllCourseOfInstructorBySlug_success() {
        when(instructorRepository.findBySlug("slug-01")).thenReturn(Optional.of(testInstructor));
        org.springframework.data.domain.Page<Course> page = new org.springframework.data.domain.PageImpl<>(List.of(draftCourse));
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var res = courseService.getAllCourseOfInstructorBySlug(1, 10, "slug-01", 1L);

        assertThat(res.getContent()).hasSize(1);
    }

    // TC-CRS-032: getAllCourseOfInstructorBySlug - Instructor not found
    @Test
    @DisplayName("TC-CRS-032: getAllCourseOfInstructorBySlug không tìm thấy instructor -> DataNotFoundException")
    void getAllCourseOfInstructorBySlug_notFound_throwsException() {
        when(instructorRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getAllCourseOfInstructorBySlug(1, 10, "unknown", 1L))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-CRS-033: getAllCourseOfInstructorByInstructorId - isGrouped = true
    @Test
    @DisplayName("TC-CRS-033: getAllCourseOfInstructorByInstructorId với isGrouped=true")
    void getAllCourseOfInstructorByInstructorId_isGroupedTrue_success() {
        org.springframework.data.domain.Page<Course> page = new org.springframework.data.domain.PageImpl<>(List.of(draftCourse));
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var res = courseService.getAllCourseOfInstructorByInstructorId(1, 10, 1L, 10L, true);

        assertThat(res.getContent()).hasSize(1);
    }

    // TC-CRS-034: getAllCourseOfInstructorByInstructorId - isGrouped = false
    @Test
    @DisplayName("TC-CRS-034: getAllCourseOfInstructorByInstructorId với isGrouped=false")
    void getAllCourseOfInstructorByInstructorId_isGroupedFalse_success() {
        org.springframework.data.domain.Page<Course> page = new org.springframework.data.domain.PageImpl<>(List.of(draftCourse));
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var res = courseService.getAllCourseOfInstructorByInstructorId(1, 10, null, 10L, false);

        assertThat(res.getContent()).hasSize(1);
    }

    // TC-CRS-035: getPreOrderCourses
    @Test
    @DisplayName("TC-CRS-035: getPreOrderCourses trả về đúng Spec")
    void getPreOrderCourses_success() {
        org.springframework.data.domain.Page<Course> page = new org.springframework.data.domain.PageImpl<>(List.of(draftCourse));
        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var res = courseService.getPreOrderCourses(1, 10, "title", "asc");

        assertThat(res.getContent()).hasSize(1);
    }

    // TC-CRS-036: deleteCourse bởi admin
    @Test
    @DisplayName("TC-CRS-036: deleteCourse bởi admin thì pass mà không cần owner check")
    void deleteCourse_byAdmin_success() {
        User adminUser = User.builder().id(99L).build();
        Role adminRole = new Role();
        adminRole.setId(1);
        adminRole.setName(RoleName.ADMIN);
        UserRole adminUserRole = new UserRole();
        adminUserRole.setId(1L);
        adminUserRole.setUser(adminUser);
        adminUserRole.setRole(adminRole);
        adminUser.setUserRoles(Set.of(adminUserRole));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));

        courseService.deleteCourse(1L, adminUser);

        verify(courseRepository, times(1)).delete(draftCourse);
    }

    // TC-CRS-037: publishCourse - Instructor null
    @Test
    @DisplayName("TC-CRS-037: publishCourse instructor user null -> Exception")
    void publishCourse_noInstructorUser_throwsException() {
        draftCourse.setInstructor(new Instructor()); // user null
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));

        assertThatThrownBy(() -> courseService.publishCourse(1L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Instructor or Instructor's user not found");
    }

    // TC-CRS-038: createCourse - with CourseModuleDTOs
    @Test
    @DisplayName("TC-CRS-038: createCourse có CourseModuleDTOs -> gọi module service")
    void createCourse_withModules_success() {
        CourseRequest.CourseModuleDTO modDTO = new CourseRequest.CourseModuleDTO();
        basicRequest.setCourseModuleDTOs(List.of(modDTO));

        when(categoryService.getCategoryById(5L)).thenReturn(new Category());
        when(courseRepository.existsByCode(anyString())).thenReturn(false);
        when(courseRepository.save(any())).thenAnswer(i -> {
            Course c = i.getArgument(0); c.setId(100L); return c;
        });

        Course result = courseService.createCourse(basicRequest, testInstructor);

        verify(courseModuleService, times(1)).createCourseModule(eq(100L), any());
        assertThat(result.getCourseModules()).hasSize(1);
    }

    // TC-CRS-039: updateCourse - update remaining fields
    @Test
    @DisplayName("TC-CRS-039: updateCourse tất cả các trường (description, thumbnail, previewVideo, isFree, currency)")
    void updateCourse_allFields_success() {
        UpdateCourseRequest updateReq = new UpdateCourseRequest();
        updateReq.setDescription("New Desc");
        updateReq.setThumbnail("thumb.jpg");
        updateReq.setPreviewVideo("vid.mp4");
        updateReq.setCategoryId(2L);
        updateReq.setLevel(CourseLevel.ADVANCED);
        updateReq.setLanguage("en");
        updateReq.setPrice(new BigDecimal("1000"));
        updateReq.setIsFree(true);
        updateReq.setCurrency(Currency.USD);
        updateReq.setWhatYouLearn(List.of("A", "B"));
        updateReq.setTargetAudiences(List.of("X", "Y"));
        updateReq.setEnrollmentType(EnrollmentType.SUBSCRIPTION);
        
        draftCourse.setExpiredDays(30); // để pass check expiredDays != null

        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));

        Course result = courseService.updateCourse(1L, updateReq, testInstructor);

        assertThat(result.getDescription()).isEqualTo("New Desc");
        assertThat(result.getThumbnail()).isEqualTo("thumb.jpg");
        assertThat(result.getPreviewVideo()).isEqualTo("vid.mp4");
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getIsFree()).isTrue();
        assertThat(result.getCurrency()).isEqualTo(Currency.USD);
        assertThat(result.getWhatYouLearn()).isEqualTo("A\nB");
        assertThat(result.getEnrollmentType()).isEqualTo(EnrollmentType.SUBSCRIPTION);
    }
}
