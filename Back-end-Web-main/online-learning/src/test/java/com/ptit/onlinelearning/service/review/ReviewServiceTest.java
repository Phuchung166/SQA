package com.ptit.onlinelearning.service.review;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.ReviewRepository;
import com.ptit.onlinelearning.request.ReviewRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho ReviewService — Quản lý đánh giá khóa học.
 * Target: Line Coverage ≥ 80%, Branch Coverage ≥ 70%
 *
 * CheckDB: ArgumentCaptor kiểm tra Review được lưu đúng thông tin.
 * Rollback: MockitoExtension reset toàn bộ mock state sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private CourseRepository courseRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User regularUser;
    private User adminUser;
    private Course testCourse;
    private Enrollment activeEnrollment;
    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        regularUser = User.builder().id(1L).email("student@example.com").accountName("student01").build();
        regularUser.setUserRoles(Set.of());

        Role adminRole = Role.builder().id(3).name(RoleName.ADMIN).build();
        UserRole adminUserRole = new UserRole();
        adminUserRole.setRole(adminRole);
        adminUser = User.builder().id(2L).email("admin@example.com").accountName("admin01").build();
        adminUser.setUserRoles(Set.of(adminUserRole));

        testCourse = new Course();
        testCourse.setId(10L);
        testCourse.setTitle("Khóa học Java cơ bản");

        activeEnrollment = new Enrollment();
        activeEnrollment.setId(100L);
        activeEnrollment.setUser(regularUser);
        activeEnrollment.setCourse(testCourse);
        activeEnrollment.setEndDate(null);

        reviewRequest = new ReviewRequest();
        reviewRequest.setCourseId(10L);
        reviewRequest.setRating(5);
        reviewRequest.setComment("Khóa học rất hay!");
    }

    // =========================================================
    // TC-REV-001: Tạo review thành công — enrolled, endDate=null
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-REV-001: Tạo review thành công — user enrolled, CheckDB xác minh Review lưu đúng")
    void TC_REV_001_createReview_enrolledUserValidEnrollment_reviewSaved() {
        when(courseRepository.findById(10L)).thenReturn(Optional.of(testCourse));
        when(enrollmentRepository.findByUserIdAndCourseId(regularUser.getId(), testCourse.getId()))
                .thenReturn(Optional.of(activeEnrollment));
        Review savedReview = new Review();
        savedReview.setId(1L);
        savedReview.setUser(regularUser);
        savedReview.setCourse(testCourse);
        savedReview.setRating(5);
        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        Review result = reviewService.createReview(regularUser, reviewRequest);

        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).save(reviewCaptor.capture());
        assertThat(reviewCaptor.getValue().getRating()).isEqualTo(5);
        assertThat(reviewCaptor.getValue().getComment()).isEqualTo("Khóa học rất hay!");
        assertThat(reviewCaptor.getValue().getUser().getId()).isEqualTo(regularUser.getId());
        assertThat(result.getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-REV-002: Tạo review khi chưa enrolled (enrollment = null)
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-REV-002: Tạo review khi chưa enrolled — ném AccessDeniedException")
    void TC_REV_002_createReview_notEnrolled_throwsAccessDeniedException() {
        when(courseRepository.findById(10L)).thenReturn(Optional.of(testCourse));
        when(enrollmentRepository.findByUserIdAndCourseId(regularUser.getId(), testCourse.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(regularUser, reviewRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Cannot create review");

        verify(reviewRepository, never()).save(any(Review.class));
    }

    // =========================================================
    // TC-REV-003: Tạo review khi enrollment đã hết hạn
    // Technique: Negative Testing + State Transition
    // =========================================================
    @Test
    @DisplayName("TC-REV-003: Enrollment hết hạn — ném AccessDeniedException")
    void TC_REV_003_createReview_expiredEnrollment_throwsAccessDeniedException() {
        Enrollment expiredEnrollment = new Enrollment();
        expiredEnrollment.setId(101L);
        expiredEnrollment.setUser(regularUser);
        expiredEnrollment.setCourse(testCourse);
        expiredEnrollment.setEndDate(LocalDateTime.now().minusDays(1));

        when(courseRepository.findById(10L)).thenReturn(Optional.of(testCourse));
        when(enrollmentRepository.findByUserIdAndCourseId(regularUser.getId(), testCourse.getId()))
                .thenReturn(Optional.of(expiredEnrollment));

        assertThatThrownBy(() -> reviewService.createReview(regularUser, reviewRequest))
                .isInstanceOf(AccessDeniedException.class);

        verify(reviewRepository, never()).save(any(Review.class));
    }

    // =========================================================
    // TC-REV-004: Xóa review bởi chủ sở hữu
    // Technique: CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-REV-004: Xóa review bởi chủ sở hữu — delete() được gọi đúng 1 lần")
    void TC_REV_004_deleteReviewById_reviewOwner_deletedSuccessfully() {
        Review reviewToDelete = new Review();
        reviewToDelete.setId(1L);
        reviewToDelete.setUser(regularUser);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(reviewToDelete));
        doNothing().when(reviewRepository).delete(any(Review.class));

        reviewService.deleteReviewById(1L, regularUser);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).delete(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(1L);
    }

    // =========================================================
    // TC-REV-005: Xóa review bởi Admin
    // Technique: EP (Admin role)
    // =========================================================
    @Test
    @DisplayName("TC-REV-005: Xóa review bởi Admin — Admin xóa được review của người khác")
    void TC_REV_005_deleteReviewById_adminUser_canDeleteAnyReview() {
        Review review = new Review();
        review.setId(2L);
        review.setUser(regularUser);
        when(reviewRepository.findById(2L)).thenReturn(Optional.of(review));
        doNothing().when(reviewRepository).delete(any(Review.class));

        reviewService.deleteReviewById(2L, adminUser);

        verify(reviewRepository, times(1)).delete(review);
    }

    // =========================================================
    // TC-REV-006: Xóa review bởi user không liên quan
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-REV-006: Xóa review bởi user không liên quan — ném AccessDeniedException")
    void TC_REV_006_deleteReviewById_unauthorizedUser_throwsAccessDeniedException() {
        User anotherUser = User.builder().id(99L).email("other@example.com").build();
        anotherUser.setUserRoles(Set.of());

        Review review = new Review();
        review.setId(1L);
        review.setUser(regularUser);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.deleteReviewById(1L, anotherUser))
                .isInstanceOf(AccessDeniedException.class);

        verify(reviewRepository, never()).delete(any(Review.class));
    }

    // =========================================================
    // TC-REV-007: getReviewById — tìm thấy
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-REV-007: getReviewById tìm thấy — trả về đúng Review entity")
    void TC_REV_007_getReviewById_found_returnsReview() {
        Review review = new Review();
        review.setId(1L);
        review.setRating(4);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        Review result = reviewService.getReviewById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getRating()).isEqualTo(4);
        verify(reviewRepository, times(1)).findById(1L);
    }

    // =========================================================
    // TC-REV-008: getReviewById — không tìm thấy
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-REV-008: getReviewById không tìm thấy — ném DataNotFoundException")
    void TC_REV_008_getReviewById_notFound_throwsDataNotFoundException() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.getReviewById(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Review not found");
    }

    // =========================================================
    // TC-REV-009: getAllReviews — mock page, không lọc gì
    // Technique: EP (pageable query)
    // =========================================================
    @Test
    @DisplayName("TC-REV-009: getAllReviews — mock repository, trả về Page kết quả")
    void TC_REV_009_getAllReviews_noFilter_returnsPage() {
        Page<Review> emptyPage = new PageImpl<>(List.of());
        when(reviewRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        Page<Review> result = reviewService.getAllReviews(1, 10, "createdAt", "desc", null, null, null);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(0);
        verify(reviewRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    // =========================================================
    // TC-REV-010: getAllReviews — lọc theo userId, courseId, rating
    // Technique: EP (all filter branches active)
    // =========================================================
    @Test
    @DisplayName("TC-REV-010: getAllReviews với userId + courseId + rating — gọi findAll với Specification")
    void TC_REV_010_getAllReviews_withAllFilters_callsRepositoryWithSpec() {
        Review review = new Review();
        review.setId(1L);
        review.setRating(5);
        Page<Review> page = new PageImpl<>(List.of(review));
        when(reviewRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<Review> result = reviewService.getAllReviews(1, 10, "createdAt", "asc", 1L, 10L, 5);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(reviewRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    // =========================================================
    // TC-REV-011: createReview — course không tồn tại
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-REV-011: createReview course không tồn tại — ném DataNotFoundException")
    void TC_REV_011_createReview_courseNotFound_throwsDataNotFoundException() {
        when(courseRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(regularUser, reviewRequest))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found");

        verify(reviewRepository, never()).save(any(Review.class));
    }

    // =========================================================
    // TC-REV-012: Xóa review — review không tồn tại
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-REV-012: deleteReviewById review không tồn tại — ném DataNotFoundException")
    void TC_REV_012_deleteReviewById_reviewNotFound_throwsDataNotFoundException() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.deleteReviewById(999L, regularUser))
                .isInstanceOf(DataNotFoundException.class);

        verify(reviewRepository, never()).delete(any(Review.class));
    }

    // TC-REV-013: Coverage cho lambda Specification
    @Test
    @DisplayName("TC-REV-013: Kích hoạt lambda bên trong Specification của getAllReviews")
    @SuppressWarnings("unchecked")
    void TC_REV_013_getAllReviews_specificationCoverage() {
        Page<Review> emptyPage = new PageImpl<>(List.of());
        ArgumentCaptor<Specification<Review>> specCaptor = ArgumentCaptor.forClass(Specification.class);
        when(reviewRepository.findAll(specCaptor.capture(), any(Pageable.class))).thenReturn(emptyPage);

        // Gọi service method để trigger việc tạo Specification
        reviewService.getAllReviews(1, 10, "createdAt", "desc", 1L, 10L, 5);

        Specification<Review> spec = specCaptor.getValue();

        // Khởi tạo các mock objects cho CriteriaBuilder
        jakarta.persistence.criteria.Root<Review> root = mock(jakarta.persistence.criteria.Root.class);
        jakarta.persistence.criteria.CriteriaQuery<?> query = mock(jakarta.persistence.criteria.CriteriaQuery.class);
        jakarta.persistence.criteria.CriteriaBuilder cb = mock(jakarta.persistence.criteria.CriteriaBuilder.class);

        jakarta.persistence.criteria.Join<Object, Object> userJoin = mock(jakarta.persistence.criteria.Join.class);
        when(root.join("user")).thenReturn(userJoin);
        
        jakarta.persistence.criteria.Join<Object, Object> courseJoin = mock(jakarta.persistence.criteria.Join.class);
        when(root.join("course")).thenReturn(courseJoin);

        jakarta.persistence.criteria.Path<Object> userPath = mock(jakarta.persistence.criteria.Path.class);
        when(userJoin.get("id")).thenReturn(userPath);

        jakarta.persistence.criteria.Path<Object> coursePath = mock(jakarta.persistence.criteria.Path.class);
        when(courseJoin.get("id")).thenReturn(coursePath);

        jakarta.persistence.criteria.Path<Object> ratingPath = mock(jakarta.persistence.criteria.Path.class);
        when(root.get("rating")).thenReturn(ratingPath);

        jakarta.persistence.criteria.Predicate predicate = mock(jakarta.persistence.criteria.Predicate.class);
        doReturn(predicate).when(cb).equal(any(jakarta.persistence.criteria.Expression.class), any());
        doReturn(predicate).when(cb).and(any(jakarta.persistence.criteria.Predicate[].class));

        // Gọi method toPredicate để evaluate nội dung lambda
        jakarta.persistence.criteria.Predicate result = spec.toPredicate(root, query, cb);
        assertThat(result).isEqualTo(predicate);
    }

    // TC-REV-014: createReview - enrollment endDate is not null and not expired
    @Test
    @DisplayName("TC-REV-014: createReview với enrollment có endDate nhưng chưa hết hạn")
    void TC_REV_014_createReview_enrollmentNotExpired_success() {
        ReviewRequest request = new ReviewRequest();
        request.setCourseId(10L);
        request.setRating(5);
        request.setComment("Good");

        Course course = new Course();
        course.setId(10L);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));

        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setEndDate(LocalDateTime.now().plusDays(5)); // not expired

        when(enrollmentRepository.findByUserIdAndCourseId(regularUser.getId(), 10L)).thenReturn(Optional.of(enrollment));


        Review savedReview = new Review();
        savedReview.setId(1L);
        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        Review result = reviewService.createReview(regularUser, request);
        assertThat(result).isNotNull();
    }

    // TC-REV-015: getAllReviews - with non-null sortBy and sortOrder asc
    @Test
    @DisplayName("TC-REV-015: getAllReviews với sortBy hợp lệ và sortOrder asc")
    void TC_REV_015_getAllReviews_sortByValidAndAsc_success() {
        Page<Review> emptyPage = new PageImpl<>(List.of());
        when(reviewRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        Page<Review> result = reviewService.getAllReviews(1, 10, "rating", "asc", 1L, 10L, 5);

        assertThat(result).isNotNull();
    }
}
