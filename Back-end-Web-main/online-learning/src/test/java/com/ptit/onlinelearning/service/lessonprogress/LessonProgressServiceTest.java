package com.ptit.onlinelearning.service.lessonprogress;

import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.LessonProgress;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.LessonProgressRepository;
import com.ptit.onlinelearning.repository.LessonRepository;
import com.ptit.onlinelearning.request.CreateLessonProgressRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho LessonProgressService — Quản lý tiến độ học tập.
 *
 * CheckDB: ArgumentCaptor xác minh LessonProgress được lưu đúng.
 * Rollback: MockitoExtension reset toàn bộ mock state sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
class LessonProgressServiceTest {

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private LessonProgressService lessonProgressService;

    // Constants cho test
    private static final Long USER_ID      = 1L;
    private static final Long LESSON_ID    = 10L;
    private static final Long ENROLLMENT_ID = 100L;
    private static final Long COURSE_ID    = 50L;

    private CreateLessonProgressRequest createProgressRequest;

    @BeforeEach
    void setUp() {
        // Chuẩn bị request tạo lesson progress
        createProgressRequest = new CreateLessonProgressRequest();
        createProgressRequest.setLessonId(LESSON_ID);
        createProgressRequest.setEnrollmentId(ENROLLMENT_ID);
    }

    // =========================================================
    // TC-LP-001: Tạo lesson progress thành công
    // Objective: Lesson tồn tại, enrollment hợp lệ, chưa có progress
    //            → LessonProgress được lưu vào DB.
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-LP-001: Tạo lesson progress thành công — CheckDB xác minh entity lưu đúng")
    void TC_LP_001_createLessonProgress_validInput_progressSaved() {
        // === ARRANGE ===
        when(lessonRepository.existsById(LESSON_ID)).thenReturn(true);
        when(enrollmentRepository.existsByUserIdAndId(USER_ID, ENROLLMENT_ID)).thenReturn(true);
        // Progress chưa tồn tại
        when(lessonProgressRepository.existsByEnrollmentIdAndLessonIdAndUserId(
                ENROLLMENT_ID, LESSON_ID, USER_ID)).thenReturn(false);
        when(lessonProgressRepository.save(any(LessonProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0)); // trả về chính entity được lưu

        // === ACT ===
        lessonProgressService.createLessonProgress(USER_ID, createProgressRequest);

        // === ASSERT (CheckDB) ===
        ArgumentCaptor<LessonProgress> progressCaptor = ArgumentCaptor.forClass(LessonProgress.class);
        verify(lessonProgressRepository, times(1)).save(progressCaptor.capture());

        LessonProgress capturedProgress = progressCaptor.getValue();
        assertThat(capturedProgress.getLessonId()).isEqualTo(LESSON_ID);
        assertThat(capturedProgress.getEnrollmentId()).isEqualTo(ENROLLMENT_ID);
        assertThat(capturedProgress.getUserId()).isEqualTo(USER_ID);
    }

    // =========================================================
    // TC-LP-002: Tạo progress — lesson không tồn tại
    // Objective: lessonId không có trong DB → ném InvalidParamException.
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-LP-002: Lesson không tồn tại — ném InvalidParamException, không lưu progress")
    void TC_LP_002_createLessonProgress_lessonNotExist_throwsInvalidParamException() {
        // === ARRANGE ===
        when(lessonRepository.existsById(LESSON_ID)).thenReturn(false);

        // === ACT & ASSERT ===
        assertThatThrownBy(() ->
                lessonProgressService.createLessonProgress(USER_ID, createProgressRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Lesson does not exist");

        // Rollback: save() không được gọi
        verify(lessonProgressRepository, never()).save(any(LessonProgress.class));
    }

    // =========================================================
    // TC-LP-003: Tạo progress — user không enrolled
    // Objective: Enrollment không tồn tại cho user → ném InvalidParamException.
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-LP-003: User không enrolled — ném InvalidParamException, không lưu progress")
    void TC_LP_003_createLessonProgress_userNotEnrolled_throwsInvalidParamException() {
        // === ARRANGE ===
        when(lessonRepository.existsById(LESSON_ID)).thenReturn(true);
        // Enrollment không tồn tại
        when(enrollmentRepository.existsByUserIdAndId(USER_ID, ENROLLMENT_ID)).thenReturn(false);

        // === ACT & ASSERT ===
        assertThatThrownBy(() ->
                lessonProgressService.createLessonProgress(USER_ID, createProgressRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("not enrolled in the course");

        verify(lessonProgressRepository, never()).save(any(LessonProgress.class));
    }

    // =========================================================
    // TC-LP-004: Tạo progress đã tồn tại — không tạo duplicate
    // Objective: Progress cho combo lesson+enrollment+user đã có → ném exception.
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-LP-004: Progress đã tồn tại — ném InvalidParamException, không lưu lại")
    void TC_LP_004_createLessonProgress_progressAlreadyExists_throwsInvalidParamException() {
        // === ARRANGE ===
        when(lessonRepository.existsById(LESSON_ID)).thenReturn(true);
        when(enrollmentRepository.existsByUserIdAndId(USER_ID, ENROLLMENT_ID)).thenReturn(true);
        // Progress đã tồn tại rồi
        when(lessonProgressRepository.existsByEnrollmentIdAndLessonIdAndUserId(
                ENROLLMENT_ID, LESSON_ID, USER_ID)).thenReturn(true);

        // === ACT & ASSERT ===
        assertThatThrownBy(() ->
                lessonProgressService.createLessonProgress(USER_ID, createProgressRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("already exists");

        verify(lessonProgressRepository, never()).save(any(LessonProgress.class));
    }

    // =========================================================
    // TC-LP-005: Tính tiến độ 50% (hoàn thành 5/10 bài)
    // Objective: completed=5, total=10 → kết quả phải là chính xác 50.00%.
    // Technique: BVA (boundary: exactly 50%)
    // =========================================================
    @Test
    @DisplayName("TC-LP-005: Tính tiến độ 5/10 bài — kết quả đúng 50.00%")
    void TC_LP_005_calculateUserCourseProgress_fiveOfTenLessons_returnsFiftyPercent() {
        // === ARRANGE ===
        long totalCompletedLessons = 5L;
        long totalLessons         = 10L;

        when(lessonProgressRepository.countByEnrollmentIdAndUserId(ENROLLMENT_ID, USER_ID))
                .thenReturn(totalCompletedLessons);
        when(courseRepository.countTotalLessonByCourseId(COURSE_ID))
                .thenReturn(totalLessons);

        // === ACT ===
        Double actualProgress = lessonProgressService.calculateUserCourseProgress(
                USER_ID, COURSE_ID, ENROLLMENT_ID);

        // === ASSERT ===
        assertThat(actualProgress).isEqualTo(50.00);
    }

    // =========================================================
    // TC-LP-006: Tính tiến độ khi không có bài học nào
    // Objective: Khóa học chưa có lesson → trả về 0.0 thay vì chia cho 0.
    // Technique: BVA (boundary: totalLessons = 0) + Negative
    // =========================================================
    @Test
    @DisplayName("TC-LP-006: Không có bài học nào (total=0) — trả về 0.0, tránh chia cho 0")
    void TC_LP_006_calculateUserCourseProgress_noLessons_returnsZero() {
        // === ARRANGE ===
        when(lessonProgressRepository.countByEnrollmentIdAndUserId(ENROLLMENT_ID, USER_ID))
                .thenReturn(0L);
        // totalLessons = 0 → không có bài học nào
        when(courseRepository.countTotalLessonByCourseId(COURSE_ID)).thenReturn(0L);

        // === ACT ===
        Double actualProgress = lessonProgressService.calculateUserCourseProgress(
                USER_ID, COURSE_ID, ENROLLMENT_ID);

        // === ASSERT ===
        assertThat(actualProgress).isEqualTo(0.0);
    }
}
