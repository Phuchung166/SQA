package com.ptit.onlinelearning.service.coursegroup;

import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Category;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.repository.CourseGroupRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.request.CreateCourseGroupRequest;
import com.ptit.onlinelearning.request.UpdateCourseGroupRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho CourseGroupService
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CourseGroupServiceTest {

    @Mock private CourseGroupRepository courseGroupRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private EventPublisher eventPublisher;

    @InjectMocks
    private CourseGroupService courseGroupService;

    private Course mockCourse1;
    private Course mockCourse2;
    private CreateCourseGroupRequest createReq;
    private UpdateCourseGroupRequest updateReq;

    @BeforeEach
    void setUp() {
        Category cat = new Category(); cat.setId(1L);
        mockCourse1 = new Course();
        mockCourse1.setCode("C1");
        mockCourse1.setCategory(cat);
        mockCourse1.setCategoryId(1L);
        mockCourse1.setEnrollmentType(EnrollmentType.LIFETIME);
        mockCourse1.setCurrency(Currency.VND);
        mockCourse1.setInstructorId(10L);
        mockCourse1.setIsFree(true);
        mockCourse1.setPrice(BigDecimal.ZERO);

        mockCourse2 = new Course();
        mockCourse2.setCode("C2");
        mockCourse2.setCategory(cat);
        mockCourse2.setCategoryId(1L);
        mockCourse2.setEnrollmentType(EnrollmentType.LIFETIME);
        mockCourse2.setCurrency(Currency.VND);
        mockCourse2.setInstructorId(10L);
        mockCourse2.setIsFree(true);
        mockCourse2.setPrice(BigDecimal.ZERO);

        createReq = new CreateCourseGroupRequest();
        createReq.setCourseCodes(List.of("C1", "C2"));
        createReq.setCurrency(Currency.VND);
        createReq.setEnrollmentType(EnrollmentType.LIFETIME);
        createReq.setPrice(BigDecimal.ZERO);
        createReq.setTitle("My Group");
    }

    // TC-CGR-001: Không tìm thấy khóa học
    @Test
    @DisplayName("TC-CGR-001: Tạo CourseGroup với mã khóa học không hợp lệ -> InvalidParamException")
    void createCourseGroup_invalidCourses_throwsException() {
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(new ArrayList<>());
        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("list course codes is invalid");
    }

    // TC-CGR-002: Khóa học đã thuộc group khác
    @Test
    @DisplayName("TC-CGR-002: Khóa học đã thuộc Group khác -> InvalidParamException")
    void createCourseGroup_alreadyInGroup_throwsException() {
        mockCourse1.setCourseGroup(new CourseGroup());
        mockCourse2.setCourseGroup(new CourseGroup());
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));
        
        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already belong to a course group");
    }

    // TC-CGR-003: Tạo CourseGroup thành công
    @Test
    @DisplayName("TC-CGR-003: Tạo CourseGroup thành công -> CheckDB save")
    void createCourseGroup_success() {
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));
        when(courseGroupRepository.save(any(CourseGroup.class))).thenAnswer(i -> {
            CourseGroup cg = i.getArgument(0);
            cg.setId(99L);
            return cg;
        });

        CourseGroup res = courseGroupService.createCourseGroup(createReq, 10L);

        verify(courseGroupRepository, times(1)).save(any(CourseGroup.class));
        assertThat(res.getTitle()).isEqualTo("My Group");
        assertThat(res.getCourses()).contains(mockCourse1, mockCourse2);
        assertThat(mockCourse1.getCourseGroup()).isEqualTo(res);
    }

    // TC-CGR-004: Xóa CourseGroup
    @Test
    @DisplayName("TC-CGR-004: Xóa CourseGroup thành công -> Mở khóa Courses")
    void deleteCourseGroup_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setCourses(new ArrayList<>(List.of(mockCourse1, mockCourse2)));
        when(courseGroupRepository.findCourseGroupById(99L)).thenReturn(Optional.of(cg));

        courseGroupService.deleteCourseGroup(99L, 10L);

        verify(courseRepository, times(1)).saveAll(anyList());
        verify(courseGroupRepository, times(1)).delete(cg);
        assertThat(mockCourse1.getCourseGroup()).isNull();
    }

    // TC-CGR-005: Update CourseGroup
    @Test
    @DisplayName("TC-CGR-005: Cập nhật CourseGroup thành công")
    void updateCourseGroup_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setPrice(BigDecimal.ZERO);
        cg.setTitle("Old Title");
        cg.setCurrency(com.ptit.onlinelearning.common.type.Currency.VND);
        cg.setEnrollmentType(com.ptit.onlinelearning.common.type.EnrollmentType.LIFETIME);
        cg.setCourses(new ArrayList<>(List.of(mockCourse1)));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setTitle("New Title");
        req.setCourseCodes(List.of("C1", "C2"));

        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));
        when(courseGroupRepository.saveAndFlush(any(CourseGroup.class))).thenAnswer(i -> i.getArgument(0));

        CourseGroup res = courseGroupService.updateCourseGroup(99L, req, 10L);

        assertThat(res.getTitle()).isEqualTo("New Title");
        assertThat(res.getCourses()).contains(mockCourse1, mockCourse2);
        verify(courseGroupRepository, times(1)).saveAndFlush(cg);
    }

    // TC-CGR-006: getCourseGroupById - Thành công
    @Test
    @DisplayName("TC-CGR-006: getCourseGroupById thành công")
    void getCourseGroupById_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setTitle("My Group");
        when(courseGroupRepository.findCourseGroupById(99L)).thenReturn(Optional.of(cg));

        CourseGroup res = courseGroupService.getCourseGroupById(99L);

        assertThat(res.getId()).isEqualTo(99L);
        assertThat(res.getTitle()).isEqualTo("My Group");
    }

    // TC-CGR-007: getCourseGroupById - Không tìm thấy
    @Test
    @DisplayName("TC-CGR-007: getCourseGroupById không tồn tại -> DataNotFoundException")
    void getCourseGroupById_notFound() {
        when(courseGroupRepository.findCourseGroupById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseGroupService.getCourseGroupById(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("course group not found with id");
    }

    // TC-CGR-008: Tạo CourseGroup với giá sai -> Exception
    @Test
    @DisplayName("TC-CGR-008: Giá CourseGroup lớn hơn tổng giá courses -> InvalidParamException")
    void createCourseGroup_wrongPrice_throwsException() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("100000"));
        mockCourse2.setIsFree(false);
        mockCourse2.setPrice(new BigDecimal("200000"));

        // Đặt giá group = 100000, nhưng tổng courses = 300000 -> giá group < tổng -> hợp lệ
        // Đặt giá group = 50000, tổng courses = 300000 -> 300000 > 50000 -> ném exception
        createReq.setPrice(new BigDecimal("50000"));

        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("price of course group is calculated incorrectly");
    }

    // TC-CGR-009: Instructor khác không được tạo group -> Exception
    @Test
    @DisplayName("TC-CGR-009: Instructor không phải chủ khóa học -> InvalidParamException")
    void createCourseGroup_wrongInstructor_throwsException() {
        mockCourse1.setInstructorId(99L); // Khác với instructorId=10
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("same instructor");
    }

    // TC-CGR-010: Khóa học đang PreOrder không thể thêm vào group -> Exception
    @Test
    @DisplayName("TC-CGR-010: Course đang PreOrder không thể tạo Group -> InvalidParamException")
    void createCourseGroup_preOrderCourse_throwsException() {
        mockCourse1.setIsPreOrder(true);
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("active pre-order");
    }

    // TC-CGR-011: Hỗn hợp free + paid -> Exception
    @Test
    @DisplayName("TC-CGR-011: Mix free + paid courses trong group -> InvalidParamException")
    void createCourseGroup_mixedFreeAndPaid_throwsException() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("100000"));
        // mockCourse2 vẫn free (price=0, isFree=true)

        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("all free or all paid");
    }

    // TC-CGR-012: Category khác nhau -> Exception
    @Test
    @DisplayName("TC-CGR-012: Courses category khác nhau -> InvalidParamException")
    void createCourseGroup_differentCategory_throwsException() {
        mockCourse2.setCategoryId(999L); // Khác category
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("same category");
    }

    // TC-CGR-013: Currency khác nhau -> Exception
    @Test
    @DisplayName("TC-CGR-013: Course currency không khớp yêu cầu -> InvalidParamException")
    void createCourseGroup_differentCurrency_throwsException() {
        mockCourse1.setCurrency(Currency.USD); // Khác với createReq.currency = VND
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("same category");
    }

    // TC-CGR-014: Tạo CourseGroup với PreOrder hợp lệ -> Thành công
    @Test
    @DisplayName("TC-CGR-014: Tạo CourseGroup với PreOrder hợp lệ -> Thành công + event scheduled")
    void createCourseGroup_withValidPreOrder_success() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("500000"));
        mockCourse2.setIsFree(false);
        mockCourse2.setPrice(new BigDecimal("300000"));

        createReq.setPrice(new BigDecimal("800000")); // == 800000 tong -> ok (khong dn exception price)
        createReq.setIsPreOrder(true);
        createReq.setPreOrderPrice(new BigDecimal("600000")); // < regular price
        createReq.setBundleTotalSlots(100);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        createReq.setBundlePreorderStartDate(now.minusDays(1));
        createReq.setBundlePreorderEndDate(now.plusDays(30));

        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1, mockCourse2));
        when(courseGroupRepository.save(any(CourseGroup.class))).thenAnswer(i -> {
            CourseGroup cg = i.getArgument(0);
            cg.setId(77L);
            return cg;
        });

        CourseGroup res = courseGroupService.createCourseGroup(createReq, 10L);

        assertThat(res.getId()).isEqualTo(77L);
        assertThat(res.getIsPreOrder()).isTrue();
        assertThat(res.getBundleRemainingSlots()).isEqualTo(100);
        verify(eventPublisher, times(1)).schedulePreOrderGroupExpiration(eq(77L), any());
    }

    // TC-CGR-015: PreOrder nhưng giá preorder >= giá thường -> Exception
    @Test
    @DisplayName("TC-CGR-015: PreOrder price >= regular price -> InvalidParamException")
    void createCourseGroup_preOrderPriceNotLess_throwsException() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("500000"));

        createReq.setPrice(new BigDecimal("500000")); // == sum of course prices -> ok, passes price check
        createReq.setIsPreOrder(true);
        createReq.setPreOrderPrice(new BigDecimal("500000")); // == regular price -> lỗi
        createReq.setBundleTotalSlots(50);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        createReq.setBundlePreorderStartDate(now);
        createReq.setBundlePreorderEndDate(now.plusDays(10));

        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Pre-order price must be less than regular price");
    }

    // TC-CGR-016: updateCourseGroup - Group không tồn tại -> Exception
    @Test
    @DisplayName("TC-CGR-016: updateCourseGroup không tìm thấy group -> DataNotFoundException")
    void updateCourseGroup_notFound_throwsException() {
        when(courseGroupRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setTitle("New Title");

        assertThatThrownBy(() -> courseGroupService.updateCourseGroup(999L, req, 10L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("course group not found");
    }

    // TC-CGR-017: getAllCourseGroupsOfInstructor - Trả về PageImpl hợp lệ
    @Test
    @DisplayName("TC-CGR-017: getAllCourseGroupsOfInstructor - Trả về Page kết quả")
    void getAllCourseGroupsOfInstructor_success() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage =
                new org.springframework.data.domain.PageImpl<>(List.of());
        when(courseGroupRepository.findAll(
                any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(emptyPage);

        var res = courseGroupService.getAllCourseGroupsOfInstructor(1, 10, null, null, 10L);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).isEmpty();
    }

    // TC-CGR-018: createCourseGroup - Free course + preorder
    @Test
    @DisplayName("TC-CGR-018: Khóa học free không được preorder")
    void createCourseGroup_freeAndPreorder_throwsException() {
        createReq.setIsPreOrder(true);
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Free course groups cannot have pre-order");
    }

    // TC-CGR-019: createCourseGroup - Preorder thiếu trường
    @Test
    @DisplayName("TC-CGR-019: Preorder thiếu trường dữ liệu")
    void createCourseGroup_preorderMissingFields_throwsException() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("100"));
        createReq.setPrice(new BigDecimal("100"));
        createReq.setIsPreOrder(true);
        // Thiếu StartDate, EndDate, Price, Slots
        
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Pre-order requires start date, end date, price, and total slots");
    }

    // TC-CGR-020: createCourseGroup - Preorder end date trước start date
    @Test
    @DisplayName("TC-CGR-020: Preorder end date <= start date")
    void createCourseGroup_preorderInvalidDates_throwsException() {
        mockCourse1.setIsFree(false);
        mockCourse1.setPrice(new BigDecimal("100"));
        createReq.setPrice(new BigDecimal("100"));
        createReq.setIsPreOrder(true);
        createReq.setPreOrderPrice(new BigDecimal("50"));
        createReq.setBundleTotalSlots(10);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        createReq.setBundlePreorderStartDate(now);
        createReq.setBundlePreorderEndDate(now.minusDays(1)); // lỗi
        
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        assertThatThrownBy(() -> courseGroupService.createCourseGroup(createReq, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Pre-order end date must be after start date");
    }

    // TC-CGR-021: updateCourseGroup - Cập nhật thông tin cơ bản
    @Test
    @DisplayName("TC-CGR-021: Update CourseGroup thông tin text, thumbnail, whatYouLearn")
    void updateCourseGroup_updateFields_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));
        when(courseGroupRepository.saveAndFlush(any(CourseGroup.class))).thenAnswer(i -> i.getArgument(0));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setDescription("Desc");
        req.setThumbnail("Thumb");
        req.setCustomPrice(new BigDecimal("1000"));
        req.setWhatYouLearn("Learn");

        CourseGroup res = courseGroupService.updateCourseGroup(99L, req, 10L);
        
        assertThat(res.getDescription()).isEqualTo("Desc");
        assertThat(res.getThumbnail()).isEqualTo("Thumb");
        assertThat(res.getCustomPrice()).isEqualTo(new BigDecimal("1000"));
        assertThat(res.getWhatYouLearn()).isEqualTo("Learn");
    }

    // TC-CGR-022: updateCourseGroup - Xóa course khỏi group
    @Test
    @DisplayName("TC-CGR-022: Remove courses khỏi group")
    void updateCourseGroup_removeCourses_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setPrice(new BigDecimal("500"));
        mockCourse1.setPrice(new BigDecimal("200"));
        mockCourse1.setCourseGroup(cg);
        cg.setCourses(new ArrayList<>(List.of(mockCourse1)));
        
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));
        when(courseGroupRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setRemovedCourseCodes(List.of("C1"));

        CourseGroup res = courseGroupService.updateCourseGroup(99L, req, 10L);
        
        verify(courseRepository).saveAll(anyList());
        assertThat(res.getPrice()).isEqualTo(new BigDecimal("300")); // 500 - 200
        assertThat(res.getCourses()).isEmpty();
    }

    // TC-CGR-023: updateCourseGroup - Xóa course mã sai
    @Test
    @DisplayName("TC-CGR-023: Remove courses với mã không đúng")
    void updateCourseGroup_removeCoursesInvalid_throwsException() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of()); // rỗng
        
        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setRemovedCourseCodes(List.of("CX"));

        assertThatThrownBy(() -> courseGroupService.updateCourseGroup(99L, req, 10L))
                .isInstanceOf(InvalidParamException.class);
    }

    // TC-CGR-024: getAllCourseGroups
    @Test
    @DisplayName("TC-CGR-024: Lấy danh sách CourseGroups với search")
    void getAllCourseGroups_success() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage = new org.springframework.data.domain.PageImpl<>(List.of());
        when(courseGroupRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(emptyPage);

        courseGroupService.getAllCourseGroups(1, 10, "search", EnrollmentType.LIFETIME, 1L, "title", "asc");
        verify(courseGroupRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    // TC-CGR-025: getPreOrderCourseGroups
    @Test
    @DisplayName("TC-CGR-025: Lấy danh sách PreOrderCourseGroups")
    void getPreOrderCourseGroups_success() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage = new org.springframework.data.domain.PageImpl<>(List.of());
        when(courseGroupRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(emptyPage);

        courseGroupService.getPreOrderCourseGroups(1, 10, "createdAt", "desc");
        verify(courseGroupRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    // TC-CGR-026: deleteCourseGroup - Not owner
    @Test
    @DisplayName("TC-CGR-026: Xóa group không phải chủ -> InvalidParamException")
    void deleteCourseGroup_notOwner_throwsException() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        mockCourse1.setInstructorId(99L); // khác 10L
        cg.setCourses(List.of(mockCourse1));
        
        when(courseGroupRepository.findCourseGroupById(99L)).thenReturn(Optional.of(cg));

        assertThatThrownBy(() -> courseGroupService.deleteCourseGroup(99L, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("You don't have permission");
    }

    // TC-CGR-027: deleteCourseGroup - Không có course
    @Test
    @DisplayName("TC-CGR-027: Xóa group không có course nào -> Thành công")
    void deleteCourseGroup_emptyCourses_success() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setCourses(new ArrayList<>());
        
        when(courseGroupRepository.findCourseGroupById(99L)).thenReturn(Optional.of(cg));
        doNothing().when(courseGroupRepository).delete(cg);

        // Vẫn throw permission error vì isOwner map rỗng (allMatch trả về true) nên passes isOwner check. 
        // Wait, deleteCourseGroup is empty list, returns true, then saves courses.
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> courseGroupService.deleteCourseGroup(99L, 10L));
    }

    // TC-CGR-028: getAllCourseGroupsOfInstructor - Specification coverage
    @Test
    @DisplayName("TC-CGR-028: Kích hoạt lambda bên trong Specification của getAllCourseGroupsOfInstructor")
    @SuppressWarnings("unchecked")
    void TC_CGR_028_getAllCourseGroupsOfInstructor_specificationCoverage() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage = new org.springframework.data.domain.PageImpl<>(List.of());
        org.mockito.ArgumentCaptor<org.springframework.data.jpa.domain.Specification<CourseGroup>> specCaptor = 
            org.mockito.ArgumentCaptor.forClass(org.springframework.data.jpa.domain.Specification.class);
        
        when(courseGroupRepository.findAll(specCaptor.capture(), any(org.springframework.data.domain.Pageable.class))).thenReturn(emptyPage);

        courseGroupService.getAllCourseGroupsOfInstructor(1, 10, "searchKey", com.ptit.onlinelearning.common.type.EnrollmentType.LIFETIME, 10L);

        org.springframework.data.jpa.domain.Specification<CourseGroup> spec = specCaptor.getValue();

        jakarta.persistence.criteria.Root<CourseGroup> root = mock(jakarta.persistence.criteria.Root.class);
        jakarta.persistence.criteria.CriteriaQuery<?> query = mock(jakarta.persistence.criteria.CriteriaQuery.class);
        jakarta.persistence.criteria.CriteriaBuilder cb = mock(jakarta.persistence.criteria.CriteriaBuilder.class);

        jakarta.persistence.criteria.Join<Object, Object> coursesJoin = mock(jakarta.persistence.criteria.Join.class);
        when(root.join("courses")).thenReturn(coursesJoin);

        jakarta.persistence.criteria.Path<Object> instIdPath = mock(jakarta.persistence.criteria.Path.class);
        when(coursesJoin.get("instructorId")).thenReturn(instIdPath);
        
        jakarta.persistence.criteria.Path<Object> titlePath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("title")).thenReturn(titlePath);

        jakarta.persistence.criteria.Path<Object> descPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("description")).thenReturn(descPath);

        jakarta.persistence.criteria.Path<Object> enrollPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("enrollmentType")).thenReturn(enrollPath);

        jakarta.persistence.criteria.Expression<String> lowerExpr = mock(jakarta.persistence.criteria.Expression.class);
        when(cb.lower(any())).thenReturn(lowerExpr);

        jakarta.persistence.criteria.Predicate predicate = mock(jakarta.persistence.criteria.Predicate.class);
        doReturn(predicate).when(cb).equal(any(jakarta.persistence.criteria.Expression.class), any());
        doReturn(predicate).when(cb).like(any(jakarta.persistence.criteria.Expression.class), anyString());
        doReturn(predicate).when(cb).or(any(jakarta.persistence.criteria.Predicate[].class));
        doReturn(predicate).when(cb).and(any(jakarta.persistence.criteria.Predicate[].class));

        jakarta.persistence.criteria.Predicate result = spec.toPredicate(root, query, cb);
        assertThat(result).isEqualTo(predicate);
    }

    // TC-CGR-029: getAllCourseGroups - Specification coverage
    @Test
    @DisplayName("TC-CGR-029: Kích hoạt lambda bên trong Specification của getAllCourseGroups")
    @SuppressWarnings("unchecked")
    void TC_CGR_029_getAllCourseGroups_specificationCoverage() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage = new org.springframework.data.domain.PageImpl<>(List.of());
        org.mockito.ArgumentCaptor<org.springframework.data.jpa.domain.Specification<CourseGroup>> specCaptor = 
            org.mockito.ArgumentCaptor.forClass(org.springframework.data.jpa.domain.Specification.class);
        
        // Use an invalid sort field to trigger the fallback logic
        when(courseGroupRepository.findAll(specCaptor.capture(), any(org.springframework.data.domain.Pageable.class))).thenReturn(emptyPage);

        courseGroupService.getAllCourseGroups(1, 10, "searchKey", com.ptit.onlinelearning.common.type.EnrollmentType.LIFETIME, 1L, "invalidSortField", "asc");

        org.springframework.data.jpa.domain.Specification<CourseGroup> spec = specCaptor.getValue();

        jakarta.persistence.criteria.Root<CourseGroup> root = mock(jakarta.persistence.criteria.Root.class);
        jakarta.persistence.criteria.CriteriaQuery<?> query = mock(jakarta.persistence.criteria.CriteriaQuery.class);
        jakarta.persistence.criteria.CriteriaBuilder cb = mock(jakarta.persistence.criteria.CriteriaBuilder.class);

        jakarta.persistence.criteria.Path<Object> preOrderPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("isPreOrder")).thenReturn(preOrderPath);

        jakarta.persistence.criteria.Join<Object, Object> coursesJoin = mock(jakarta.persistence.criteria.Join.class);
        when(root.join("courses")).thenReturn(coursesJoin);

        jakarta.persistence.criteria.Path<Object> catIdPath = mock(jakarta.persistence.criteria.Path.class);
        when(coursesJoin.get("categoryId")).thenReturn(catIdPath);
        
        jakarta.persistence.criteria.Path<Object> titlePath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("title")).thenReturn(titlePath);

        jakarta.persistence.criteria.Path<Object> descPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("description")).thenReturn(descPath);

        jakarta.persistence.criteria.Path<Object> enrollPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("enrollmentType")).thenReturn(enrollPath);

        jakarta.persistence.criteria.Expression<String> lowerExpr = mock(jakarta.persistence.criteria.Expression.class);
        when(cb.lower(any())).thenReturn(lowerExpr);

        jakarta.persistence.criteria.Predicate predicate = mock(jakarta.persistence.criteria.Predicate.class);
        doReturn(predicate).when(cb).equal(any(jakarta.persistence.criteria.Expression.class), any());
        doReturn(predicate).when(cb).like(any(jakarta.persistence.criteria.Expression.class), anyString());
        doReturn(predicate).when(cb).or(any(jakarta.persistence.criteria.Predicate[].class));
        doReturn(predicate).when(cb).and(any(jakarta.persistence.criteria.Predicate[].class));
        doReturn(predicate).when(cb).isFalse(any(jakarta.persistence.criteria.Expression.class));
        doReturn(predicate).when(cb).isNull(any(jakarta.persistence.criteria.Expression.class));

        jakarta.persistence.criteria.Predicate result = spec.toPredicate(root, query, cb);
        assertThat(result).isEqualTo(predicate);
        verify(query, times(1)).distinct(true);
    }

    // TC-CGR-030: getPreOrderCourseGroups - Specification coverage
    @Test
    @DisplayName("TC-CGR-030: Kích hoạt lambda bên trong Specification của getPreOrderCourseGroups")
    @SuppressWarnings("unchecked")
    void TC_CGR_030_getPreOrderCourseGroups_specificationCoverage() {
        org.springframework.data.domain.Page<CourseGroup> emptyPage = new org.springframework.data.domain.PageImpl<>(List.of());
        org.mockito.ArgumentCaptor<org.springframework.data.jpa.domain.Specification<CourseGroup>> specCaptor = 
            org.mockito.ArgumentCaptor.forClass(org.springframework.data.jpa.domain.Specification.class);
        
        // Use an invalid sort field to trigger the fallback logic
        when(courseGroupRepository.findAll(specCaptor.capture(), any(org.springframework.data.domain.Pageable.class))).thenReturn(emptyPage);

        courseGroupService.getPreOrderCourseGroups(1, 10, "invalidSortField", "asc");

        org.springframework.data.jpa.domain.Specification<CourseGroup> spec = specCaptor.getValue();

        jakarta.persistence.criteria.Root<CourseGroup> root = mock(jakarta.persistence.criteria.Root.class);
        jakarta.persistence.criteria.CriteriaQuery<?> query = mock(jakarta.persistence.criteria.CriteriaQuery.class);
        jakarta.persistence.criteria.CriteriaBuilder cb = mock(jakarta.persistence.criteria.CriteriaBuilder.class);

        jakarta.persistence.criteria.Path<Object> preOrderPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("isPreOrder")).thenReturn(preOrderPath);

        jakarta.persistence.criteria.Path<Object> endDatePath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("bundlePreorderEndDate")).thenReturn(endDatePath);

        jakarta.persistence.criteria.Path<Object> slotsPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("bundleRemainingSlots")).thenReturn(slotsPath);

        jakarta.persistence.criteria.Predicate predicate = mock(jakarta.persistence.criteria.Predicate.class);
        doReturn(predicate).when(cb).isTrue(any(jakarta.persistence.criteria.Expression.class));
        doReturn(predicate).when(cb).greaterThan(any(jakarta.persistence.criteria.Expression.class), any(java.time.LocalDateTime.class));
        doReturn(predicate).when(cb).greaterThan(any(jakarta.persistence.criteria.Expression.class), any(Integer.class));
        doReturn(predicate).when(cb).and(any(jakarta.persistence.criteria.Predicate[].class));

        jakarta.persistence.criteria.Predicate result = spec.toPredicate(root, query, cb);
        assertThat(result).isEqualTo(predicate);
    }

    // TC-CGR-031: updateCourseGroup - category / enrollmentType mismatch
    @Test
    @DisplayName("TC-CGR-031: updateCourseGroup với category không khớp -> ném exception")
    void updateCourseGroup_differentCategory_throwsException() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setCurrency(Currency.VND);
        cg.setEnrollmentType(EnrollmentType.LIFETIME);
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));

        mockCourse1.setCategoryId(2L); // Different from other courses or group criteria
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setCourseCodes(List.of("C1"));

        assertThatThrownBy(() -> courseGroupService.updateCourseGroup(99L, req, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("courses must have the same category");
    }

    // TC-CGR-032: updateCourseGroup - instructor mismatch
    @Test
    @DisplayName("TC-CGR-032: updateCourseGroup với instructor không khớp -> ném exception")
    void updateCourseGroup_differentInstructor_throwsException() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        cg.setCurrency(Currency.VND);
        cg.setEnrollmentType(EnrollmentType.LIFETIME);
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));

        mockCourse1.setCategoryId(1L);
        mockCourse1.setInstructorId(999L); // Different from 10L
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setCourseCodes(List.of("C1"));

        assertThatThrownBy(() -> courseGroupService.updateCourseGroup(99L, req, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("same instructor");
    }

    // TC-CGR-033: updateCourseGroup - course belongs to another group
    @Test
    @DisplayName("TC-CGR-033: updateCourseGroup course đã thuộc group khác -> ném exception")
    void updateCourseGroup_alreadyInAnotherGroup_throwsException() {
        CourseGroup cg = new CourseGroup();
        cg.setId(99L);
        when(courseGroupRepository.findById(99L)).thenReturn(Optional.of(cg));

        mockCourse1.setCourseGroup(new CourseGroup()); // Already in a group
        when(courseRepository.findAllByCodeIn(anyList())).thenReturn(List.of(mockCourse1));

        UpdateCourseGroupRequest req = new UpdateCourseGroupRequest();
        req.setCourseCodes(List.of("C1"));

        assertThatThrownBy(() -> courseGroupService.updateCourseGroup(99L, req, 10L))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already belong to a course group");
    }
}
