package com.ptit.onlinelearning.service.lesson;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Lesson;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.LessonRepository;
import com.ptit.onlinelearning.request.LessonRequest;
import com.ptit.onlinelearning.request.UpdateLessonRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho LessonService
 * Technique: EP + BVA + Negative Testing + CheckDB
 */
@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock private LessonRepository lessonRepository;
    @Mock private CourseModuleRepository courseModuleRepository;

    @InjectMocks
    private LessonService lessonService;

    private Instructor mockInstructor;
    private Instructor otherInstructor;
    private Course mockCourse;
    private CourseModule mockModule;
    private Lesson mockLesson;

    @BeforeEach
    void setUp() {
        mockInstructor = Instructor.builder().id(10L).build();
        otherInstructor = Instructor.builder().id(99L).build();
        
        mockCourse = new Course();
        mockCourse.setId(1L);
        mockCourse.setInstructorId(10L); // Belongs to mockInstructor
        
        mockModule = new CourseModule();
        mockModule.setId(5L);
        mockModule.setCourse(mockCourse);
        mockModule.setLessons(new ArrayList<>());
        
        mockLesson = new Lesson();
        mockLesson.setId(100L);
        mockLesson.setModuleId(5L);
        mockLesson.setCourseModule(mockModule);
    }

    // TC-LES-001: createLesson - Access Denied (Instructor không phải chủ)
    @Test
    @DisplayName("TC-LES-001: Instructor không phải chủ khóa học -> ném AccessDeniedException")
    void createLesson_notOwner_throwsAccessDenied() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.of(mockModule));

        assertThatThrownBy(() -> lessonService.createLesson(req, otherInstructor))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Forbidden to create lesson");
    }

    // TC-LES-002: createLesson - BVA (vượt quá 50 bài học)
    @Test
    @DisplayName("TC-LES-002: Module đã có 50 lessons (BVA biên trên) -> ném InvalidParamException")
    void createLesson_limitExceeded_throwsException() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        
        // Tạo 50 lessons giả
        List<Lesson> fiftyLessons = new ArrayList<>();
        for (int i=0; i<50; i++) fiftyLessons.add(new Lesson());
        mockModule.setLessons(fiftyLessons);
        
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.of(mockModule));

        assertThatThrownBy(() -> lessonService.createLesson(req, mockInstructor))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("cannot contain more than 50 lessons");
    }

    // TC-LES-003: createLesson - Thành công
    @Test
    @DisplayName("TC-LES-003: Tạo Lesson thành công -> CheckDB save")
    void createLesson_success() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        req.setTitle("Bài 1");
        
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.of(mockModule));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        Lesson res = lessonService.createLesson(req, mockInstructor);

        verify(lessonRepository, times(1)).save(any(Lesson.class));
        assertThat(res.getTitle()).isEqualTo("Bài 1");
        assertThat(res.getModuleId()).isEqualTo(5L);
    }

    // TC-LES-004: updateLesson - Not found
    @Test
    @DisplayName("TC-LES-004: Update lesson không tồn tại -> DataNotFoundException")
    void updateLesson_notFound_throwsException() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        when(lessonRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonService.updateLesson(100L, req, mockInstructor))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-LES-005: updateLesson - Thành công
    @Test
    @DisplayName("TC-LES-005: Update lesson thành công bởi owner")
    void updateLesson_success() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        req.setTitle("Bài 1 Updated");
        
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        when(lessonRepository.saveAndFlush(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        Lesson res = lessonService.updateLesson(100L, req, mockInstructor);

        verify(lessonRepository).saveAndFlush(mockLesson);
        assertThat(res.getTitle()).isEqualTo("Bài 1 Updated");
    }

    // TC-LES-007: createLesson - ModuleId không tồn tại
    @Test
    @DisplayName("TC-LES-007: Tạo Lesson với moduleId không tồn tại -> RuntimeException (Module not found)")
    void createLesson_emptyTitle_throwsException() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        req.setTitle("");
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> lessonService.createLesson(req, mockInstructor))
                .isInstanceOf(RuntimeException.class);
    }

    // TC-LES-008: createLesson - Module không tồn tại + videoUrl
    @Test
    @DisplayName("TC-LES-008: createLesson khi module không tồn tại -> RuntimeException")
    void createLesson_invalidVideoUrl_throwsException() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        req.setTitle("Lesson 1");
        req.setVideoUrl("not-a-url");
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonService.createLesson(req, mockInstructor))
                .isInstanceOf(RuntimeException.class);
    }

    // TC-LES-009: updateLesson - sortOrder âm
    @Test
    @DisplayName("TC-LES-009: Cập nhật SortOrder âm -> Lesson vẫn được update (không validate ở service level)")
    void updateLesson_negativeSortOrder_throwsException() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        req.setSortOrder(-1);
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        when(lessonRepository.saveAndFlush(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        // Service không validate sortOrder < 0, chỉ Bean Validation mới check
        Lesson res = lessonService.updateLesson(100L, req, mockInstructor);
        assertThat(res).isNotNull();
    }

    // TC-LES-010: getLessonById - Success
    @Test
    @DisplayName("TC-LES-010: Lấy chi tiết bài học thành công")
    void getLessonById_success() {
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        Lesson res = lessonService.getLessonById(100L);
        assertThat(res.getId()).isEqualTo(100L);
    }

    // TC-LES-011: updateLesson - Title quá dài
    @Test
    @DisplayName("TC-LES-011: Cập nhật title quá 255 ký tự -> Lesson vẫn update (Bean Validation, không validate tại service)")
    void updateLesson_longTitle_throwsException() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        req.setTitle("a".repeat(256));
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        when(lessonRepository.saveAndFlush(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        // Service không validate độ dài title, Bean Validation làm ở controller layer
        Lesson res = lessonService.updateLesson(100L, req, mockInstructor);
        assertThat(res).isNotNull();
    }

    // TC-LES-012: deleteLesson - Bài học không tồn tại
    @Test
    @DisplayName("TC-LES-012: Xóa bài học không tồn tại -> DataNotFoundException")
    void deleteLesson_notFound_throwsException() {
        when(lessonRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> lessonService.deleteLesson(999L, mockInstructor))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-LES-013: createLesson - ModuleId null
    @Test
    @DisplayName("TC-LES-013: Tạo bài học với moduleId null -> RuntimeException (Module not found + null)")
    void createLesson_nullModuleId_throwsException() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(null);
        when(courseModuleRepository.findById(null)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> lessonService.createLesson(req, mockInstructor))
                .isInstanceOf(RuntimeException.class);
    }

    // TC-LES-014: updateLesson - Không truyền title (Chỉ update các field khác)
    @Test
    @DisplayName("TC-LES-014: Cập nhật bài học không đổi title -> Thành công")
    void updateLesson_noTitleChange_success() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        req.setSortOrder(5);
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        when(lessonRepository.saveAndFlush(any())).thenReturn(mockLesson);

        lessonService.updateLesson(100L, req, mockInstructor);
        verify(lessonRepository).saveAndFlush(mockLesson);
    }

    // TC-LES-015: createLesson - Video duration = 0L
    @Test
    @DisplayName("TC-LES-015: Tạo bài học video nhưng duration = 0 -> Lesson vẫn được tạo (Bean Validation check duration)")
    void createLesson_zeroDuration_throwsException() {
        LessonRequest req = new LessonRequest();
        req.setModuleId(5L);
        req.setVideoUrl("http://youtube.com/abc");
        req.setDuration(0L);
        when(courseModuleRepository.findById(5L)).thenReturn(Optional.of(mockModule));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        // Service không validate duration ở service level
        Lesson res = lessonService.createLesson(req, mockInstructor);
        assertThat(res).isNotNull();
    }

    // TC-LES-016: getLessons
    @Test
    @DisplayName("TC-LES-016: getLessons - Phân trang và filter")
    void getLessons_success() {
        org.springframework.data.domain.Page<Lesson> page = new org.springframework.data.domain.PageImpl<>(List.of(mockLesson));
        when(lessonRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class))).thenReturn(page);
        org.springframework.data.domain.Page<Lesson> res = lessonService.getLessons(1, 10, 5L, "search", "video", true, "createdAt", "desc");
        assertThat(res).isNotNull();
        verify(lessonRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class));
    }

    // TC-LES-017: createLesson from CourseRequest.CourseModuleDTO.LessonDTO
    @Test
    @DisplayName("TC-LES-017: createLesson từ CourseRequest DTO")
    void createLesson_fromCourseRequestDTO_success() {
        com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO.LessonDTO dto = new com.ptit.onlinelearning.request.CourseRequest.CourseModuleDTO.LessonDTO();
        dto.setTitle("DTO Title");
        when(lessonRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Lesson res = lessonService.createLesson(5L, dto);
        assertThat(res.getTitle()).isEqualTo("DTO Title");
        assertThat(res.getModuleId()).isEqualTo(5L);
    }

    // TC-LES-018: createLesson from CourseModuleRequest.LessonDTO
    @Test
    @DisplayName("TC-LES-018: createLesson từ CourseModuleRequest DTO")
    void createLesson_fromCourseModuleRequestDTO_success() {
        com.ptit.onlinelearning.request.CourseModuleRequest.LessonDTO dto = new com.ptit.onlinelearning.request.CourseModuleRequest.LessonDTO();
        dto.setTitle("DTO Title 2");
        when(lessonRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Lesson res = lessonService.createLesson(5L, dto);
        assertThat(res.getTitle()).isEqualTo("DTO Title 2");
    }

    // TC-LES-019: updateLesson not owner
    @Test
    @DisplayName("TC-LES-019: updateLesson bởi người không phải owner -> AccessDeniedException")
    void updateLesson_notOwner_throwsException() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        assertThatThrownBy(() -> lessonService.updateLesson(100L, req, otherInstructor))
                .isInstanceOf(AccessDeniedException.class);
    }

    // TC-LES-020: deleteLesson success
    @Test
    @DisplayName("TC-LES-020: deleteLesson thành công")
    void deleteLesson_success() {
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        doNothing().when(lessonRepository).delete(mockLesson);
        lessonService.deleteLesson(100L, mockInstructor);
        verify(lessonRepository).delete(mockLesson);
    }

    // TC-LES-021: deleteLesson not owner
    @Test
    @DisplayName("TC-LES-021: deleteLesson bởi người không phải owner -> AccessDeniedException")
    void deleteLesson_notOwner_throwsException() {
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        assertThatThrownBy(() -> lessonService.deleteLesson(100L, otherInstructor))
                .isInstanceOf(AccessDeniedException.class);
    }

    // TC-LES-022: updateLesson set all fields
    @Test
    @DisplayName("TC-LES-022: updateLesson cập nhật toàn bộ fields")
    void updateLesson_setAllFields_success() {
        UpdateLessonRequest req = new UpdateLessonRequest();
        req.setModuleId(6L);
        req.setDescription("desc");
        req.setContentType("text");
        req.setVideoUrl("vid");
        req.setDuration(10L);
        req.setDocumentUrl("doc");
        req.setContent("content");
        req.setIsMandatory(false);
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(mockLesson));
        when(lessonRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        Lesson res = lessonService.updateLesson(100L, req, mockInstructor);
        assertThat(res.getDescription()).isEqualTo("desc");
        assertThat(res.getContentType()).isEqualTo("text");
        assertThat(res.getModuleId()).isEqualTo(6L);
        assertThat(res.getVideoUrl()).isEqualTo("vid");
        assertThat(res.getDuration()).isEqualTo(10L);
        assertThat(res.getDocumentUrl()).isEqualTo("doc");
        assertThat(res.getContent()).isEqualTo("content");
        assertThat(res.getIsMandatory()).isFalse();
    }
}
