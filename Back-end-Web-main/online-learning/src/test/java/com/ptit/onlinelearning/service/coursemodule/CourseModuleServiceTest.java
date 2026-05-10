package com.ptit.onlinelearning.service.coursemodule;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.LessonProgressRepository;
import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.service.lesson.ILessonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho CourseModuleService
 */
@ExtendWith(MockitoExtension.class)
class CourseModuleServiceTest {

    @Mock private CourseModuleRepository courseModuleRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private ILessonService lessonService;

    @InjectMocks
    private CourseModuleService courseModuleService;

    private Instructor mockInstructor;
    private Course mockCourse;
    private CourseModuleRequest req;

    @BeforeEach
    void setUp() {
        mockInstructor = new Instructor();
        mockInstructor.setId(10L);

        mockCourse = new Course();
        mockCourse.setId(100L);
        mockCourse.setInstructorId(10L); // Trùng khớp với instructor

        req = new CourseModuleRequest();
        req.setCourseId(100L);
        req.setTitle("Module 1");
    }

    // TC-CMOD-001: Không tìm thấy course
    @Test
    @DisplayName("TC-CMOD-001: Tạo CourseModule với Course không tồn tại -> DataNotFoundException")
    void createCourseModule_courseNotFound() {
        when(courseRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseModuleService.createCourseModule(req, mockInstructor))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-CMOD-002: Lỗi quyền truy cập (AccessDenied)
    @Test
    @DisplayName("TC-CMOD-002: Tạo CourseModule cho Course của Instructor khác -> AccessDeniedException")
    void createCourseModule_accessDenied() {
        mockCourse.setInstructorId(99L); // Khác với mockInstructor.getId() (10L)
        when(courseRepository.findById(100L)).thenReturn(Optional.of(mockCourse));

        assertThatThrownBy(() -> courseModuleService.createCourseModule(req, mockInstructor))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Forbidden to create");
    }

    // TC-CMOD-003: Tạo CourseModule thành công
    @Test
    @DisplayName("TC-CMOD-003: Tạo CourseModule thành công -> CheckDB save")
    void createCourseModule_success() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(mockCourse));
        when(courseModuleRepository.save(any(CourseModule.class))).thenAnswer(i -> {
            CourseModule cm = i.getArgument(0);
            cm.setId(50L);
            return cm;
        });

        CourseModule res = courseModuleService.createCourseModule(req, mockInstructor);

        verify(courseModuleRepository, times(1)).save(any(CourseModule.class));
        assertThat(res.getId()).isEqualTo(50L);
        assertThat(res.getTitle()).isEqualTo("Module 1");
    }

    // TC-CMOD-004: Xóa CourseModule thành công
    @Test
    @DisplayName("TC-CMOD-004: Xóa CourseModule thành công")
    void deleteCourseModule_success() {
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);
        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));

        courseModuleService.deleteCourseModule(50L, mockInstructor);

        verify(courseModuleRepository, times(1)).delete(cm);
    }

    // TC-CMOD-005: updateCourseModule - Thành công
    @Test
    @DisplayName("TC-CMOD-005: Cập nhật CourseModule thành công")
    void updateCourseModule_success() {
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);
        cm.setTitle("Old Title");

        com.ptit.onlinelearning.request.UpdateCourseModuleRequest updateReq = new com.ptit.onlinelearning.request.UpdateCourseModuleRequest();
        updateReq.setTitle("New Title");
        updateReq.setSortOrder(2);

        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));
        when(courseModuleRepository.save(any(CourseModule.class))).thenAnswer(i -> i.getArgument(0));

        CourseModule res = courseModuleService.updateCourseModule(50L, updateReq, mockInstructor);

        assertThat(res.getTitle()).isEqualTo("New Title");
        assertThat(res.getSortOrder()).isEqualTo(2L);
        verify(courseModuleRepository, times(1)).save(cm);
    }

    // TC-CMOD-006: updateCourseModule - AccessDenied (Instructor khác)
    @Test
    @DisplayName("TC-CMOD-006: Update CourseModule của Instructor khác -> AccessDeniedException")
    void updateCourseModule_accessDenied() {
        mockCourse.setInstructorId(99L); // Khác Instructor id=10
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);

        com.ptit.onlinelearning.request.UpdateCourseModuleRequest updateReq = new com.ptit.onlinelearning.request.UpdateCourseModuleRequest();
        updateReq.setTitle("Hack Title");

        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));

        assertThatThrownBy(() -> courseModuleService.updateCourseModule(50L, updateReq, mockInstructor))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    // TC-CMOD-007: deleteCourseModule - AccessDenied
    @Test
    @DisplayName("TC-CMOD-007: Xóa CourseModule của Instructor khác -> AccessDeniedException")
    void deleteCourseModule_accessDenied() {
        mockCourse.setInstructorId(99L);
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);

        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));

        assertThatThrownBy(() -> courseModuleService.deleteCourseModule(50L, mockInstructor))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    // TC-CMOD-008: createCourseModule với LessonDTOs
    @Test
    @DisplayName("TC-CMOD-008: Tạo CourseModule kèm theo danh sách Lesson")
    void createCourseModule_withLessons_success() {
        CourseModuleRequest.LessonDTO lessonDTO = new CourseModuleRequest.LessonDTO();
        lessonDTO.setTitle("Lesson 1");
        req.setLessonDTOs(java.util.List.of(lessonDTO));

        com.ptit.onlinelearning.model.Lesson mockLesson = new com.ptit.onlinelearning.model.Lesson();
        mockLesson.setId(200L);

        when(courseRepository.findById(100L)).thenReturn(Optional.of(mockCourse));
        when(courseModuleRepository.save(any(CourseModule.class))).thenAnswer(i -> {
            CourseModule cm = i.getArgument(0);
            cm.setId(50L);
            return cm;
        });
        when(lessonService.createLesson(eq(50L), any(CourseModuleRequest.LessonDTO.class))).thenReturn(mockLesson);

        CourseModule res = courseModuleService.createCourseModule(req, mockInstructor);

        assertThat(res.getLessons()).hasSize(1);
        verify(lessonService, times(1)).createLesson(eq(50L), any(CourseModuleRequest.LessonDTO.class));
    }

    // TC-CMOD-009: createCourseModule from CourseRequest.CourseModuleDTO
    @Test
    @DisplayName("TC-CMOD-009: Tạo CourseModule từ CourseRequest DTO")
    void createCourseModule_fromCourseRequestDTO_success() {
        com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO dto = new com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO();
        dto.setTitle("DTO Title");
        dto.setDescription("DTO Desc");
        dto.setSortOrder(1);
        com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO.LessonDTO lessonDTO = new com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO.LessonDTO();
        lessonDTO.setTitle("Lesson DTO");
        dto.setLessonDTOs(java.util.List.of(lessonDTO));

        when(courseModuleRepository.save(any())).thenAnswer(i -> {
            CourseModule cm = i.getArgument(0);
            cm.setId(50L);
            return cm;
        });
        when(lessonService.createLesson(eq(50L), any(com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO.LessonDTO.class))).thenReturn(new com.ptit.onlinelearning.model.Lesson());

        CourseModule res = courseModuleService.createCourseModule(100L, dto);

        assertThat(res.getTitle()).isEqualTo("DTO Title");
        assertThat(res.getCourseId()).isEqualTo(100L);
        assertThat(res.getLessons()).hasSize(1);
    }

    // TC-CMOD-010: updateCourseModule - Cập nhật toàn bộ các trường
    @Test
    @DisplayName("TC-CMOD-010: Cập nhật tất cả các trường hợp lệ")
    void updateCourseModule_setAllFields_success() {
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);
        
        com.ptit.onlinelearning.request.UpdateCourseModuleRequest updateReq = new com.ptit.onlinelearning.request.UpdateCourseModuleRequest();
        updateReq.setTitle("New Title");
        updateReq.setDescription("New Desc");
        updateReq.setSortOrder(2);
        updateReq.setCourseId(101L);

        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));
        when(courseModuleRepository.save(any(CourseModule.class))).thenAnswer(i -> i.getArgument(0));

        CourseModule res = courseModuleService.updateCourseModule(50L, updateReq, mockInstructor);

        assertThat(res.getTitle()).isEqualTo("New Title");
        assertThat(res.getDescription()).isEqualTo("New Desc");
        assertThat(res.getSortOrder()).isEqualTo(2);
        assertThat(res.getCourseId()).isEqualTo(101L);
    }

    // TC-CMOD-011: getCourseModules
    @Test
    @DisplayName("TC-CMOD-011: Lấy danh sách CourseModules với phân trang")
    void getCourseModules_success() {
        org.springframework.data.domain.Page<CourseModule> page = new org.springframework.data.domain.PageImpl<>(java.util.List.of(new CourseModule()));
        when(courseModuleRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);
        
        org.springframework.data.domain.Page<CourseModule> res = courseModuleService.getCourseModules(100L, 1, 10, true, "search", "createdAt", "desc");
        
        assertThat(res).isNotNull();
        verify(courseModuleRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    // TC-CMOD-012: getAllCourseModulesOfUserEnrolledInCourse
    @Test
    @DisplayName("TC-CMOD-012: Lấy tất cả CourseModules cho User đã enroll")
    void getAllCourseModulesOfUserEnrolledInCourse_success() {
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCreatedAt(java.time.LocalDateTime.now());
        cm.setUpdatedAt(java.time.LocalDateTime.now());
        com.ptit.onlinelearning.model.Lesson lesson = new com.ptit.onlinelearning.model.Lesson();
        lesson.setId(10L);
        lesson.setCreatedAt(java.time.LocalDateTime.now());
        lesson.setUpdatedAt(java.time.LocalDateTime.now());
        cm.setLessons(java.util.List.of(lesson));
        
        org.springframework.data.domain.Page<CourseModule> page = new org.springframework.data.domain.PageImpl<>(java.util.List.of(cm));
        
        when(courseModuleRepository.findAllByCourseId(eq(100L), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);
        when(lessonProgressRepository.existsByEnrollmentIdAndLessonIdAndUserId(200L, 10L, 1L)).thenReturn(true);
        
        com.ptit.onlinelearning.response.PageableResponse<com.ptit.onlinelearning.response.course.CourseModuleResponse> res = 
            courseModuleService.getAllCourseModulesOfUserEnrolledInCourse(1L, 200L, 100L, 1, 10, "createdAt", "desc");
            
        assertThat(res.getData()).hasSize(1);
        assertThat(res.getData().get(0).getLessons().get(0).getIsCompleted()).isTrue();
    }

    // TC-CMOD-013: updateCourseModule - Update request rỗng (Null branches)
    @Test
    @DisplayName("TC-CMOD-013: Update CourseModule không có dữ liệu mới -> Không thay đổi trường nào")
    void updateCourseModule_emptyFields_success() {
        CourseModule cm = new CourseModule();
        cm.setId(50L);
        cm.setCourse(mockCourse);
        cm.setTitle("Old Title");
        
        com.ptit.onlinelearning.request.UpdateCourseModuleRequest updateReq = new com.ptit.onlinelearning.request.UpdateCourseModuleRequest();
        // Không set field nào -> tất cả null

        when(courseModuleRepository.findById(50L)).thenReturn(Optional.of(cm));
        when(courseModuleRepository.save(any(CourseModule.class))).thenAnswer(i -> i.getArgument(0));

        CourseModule res = courseModuleService.updateCourseModule(50L, updateReq, mockInstructor);

        assertThat(res.getTitle()).isEqualTo("Old Title"); // Giữ nguyên
    }

    // TC-CMOD-014: createCourseModule - List lessonDTOs rỗng
    @Test
    @DisplayName("TC-CMOD-014: Tạo CourseModule với List LessonDTOs rỗng")
    void createCourseModule_emptyLessonDTOs_success() {
        req.setLessonDTOs(new java.util.ArrayList<>()); // Rỗng
        
        when(courseRepository.findById(100L)).thenReturn(Optional.of(mockCourse));
        when(courseModuleRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CourseModule res = courseModuleService.createCourseModule(req, mockInstructor);
        assertThat(res.getLessons()).isNull(); // vì list ban đầu rỗng nên chưa set list mới
    }
}
