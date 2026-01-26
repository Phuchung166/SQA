package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long>, JpaSpecificationExecutor<Enrollment> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseGroupId(Long userId, Long courseGroupId);

    boolean existsByUserIdAndId(Long userId, Long id);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findAllByUserIdAndCourseGroupId(Long userId, Long courseGroupId);

    @Query("""
            SELECT new com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse(
                e.id,
                null,
                e.enrollmentDate,
                e.completedAt,
                e.lastAccessed,
                c.category.name,
                c.instructor.user.firstName,
                c.instructor.user.lastName,
                c.instructor.user.avatar,
                c.id,
                c.title,
                c.thumbnail,
                c.slug,
                CASE WHEN e.courseGroup.id IS NULL THEN com.ptit.onlinelearning.common.type.CourseType.STANDALONE
                     ELSE com.ptit.onlinelearning.common.type.CourseType.GROUP
                END
            )
            FROM Enrollment e
            JOIN e.course c
            WHERE e.user.id = :userId
            AND e.courseGroup.id IS NULL
            ORDER BY e.enrollmentDate DESC
            """)
    Page<EnrollmentCourseResponse> getAllEnrollmentCourseByUserId(
            @Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT new com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse(
                MIN(e.id),
                null,
                MIN(e.enrollmentDate),
                MAX(e.completedAt),
                MAX(e.lastAccessed),
                e.course.category.name,
                e.course.instructor.user.firstName,
                e.course.instructor.user.lastName,
                e.course.instructor.user.avatar,
                cg.id,
                cg.title,
                cg.thumbnail,
                cg.slug,
                com.ptit.onlinelearning.common.type.CourseType.GROUP
            )
            FROM Enrollment e
            JOIN e.courseGroup cg
            WHERE e.user.id = :userId
            AND e.courseGroup.id IS NOT NULL
            GROUP BY cg.id, cg.title, cg.thumbnail, cg.slug, e.course.category.name,
                     e.course.instructor.user.firstName,
                     e.course.instructor.user.lastName,
                     e.course.instructor.user.avatar
            ORDER BY MIN(e.enrollmentDate) DESC
            """)
    Page<EnrollmentCourseResponse> getAllEnrollmentCourseGroupByUserId(
            @Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("""
                SELECT DISTINCT new com.ptit.onlinelearning.response.UserResponse(
                    u.email,
                    u.phone,
                    u.firstName,
                    u.lastName,
                    u.avatar,
                    u.dateOfBirth,
                    u.gender,
                    u.bio,
                    u.accountName,
                    e.enrollmentDate,
                    u.createdAt,
                    u.updatedAt
                )
                FROM Enrollment e
                JOIN e.user u
                WHERE e.course.id = :courseId
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(u.accountName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<UserResponse> getAllUserEnrolledInCourse(
            @Param("courseId") Long courseId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
                   SELECT DISTINCT new com.ptit.onlinelearning.response.UserResponse(
                                       u.email,
                                       u.phone,
                                       u.firstName,
                                       u.lastName,
                                       u.avatar,
                                       u.dateOfBirth,
                                       u.gender,
                                       u.bio,
                                       u.accountName,
                                       e.enrollmentDate,
                                       u.createdAt,
                                       u.updatedAt
                                   )
                                   FROM Enrollment e
                                   JOIN e.user u
                                   WHERE e.courseGroup.id = :courseGroupId
                                   AND (
                                       :search IS NULL OR :search = '' OR
                                        LOWER(u.accountName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                        LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                        LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                        LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                                   )
            """)
    Page<UserResponse> getAllUserEnrolledInCourseGroup(
            @Param("courseGroupId") Long courseGroupId,
            @Param("search") String search,
            Pageable pageable
    );

}
