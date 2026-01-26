package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.CartItem;
import com.ptit.onlinelearning.response.order.CartItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;


import java.util.Collection;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long>, JpaSpecificationExecutor<CartItem> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseGroupId(Long userId, Long courseGroupId);
    Optional<CartItem> findByUserIdAndCourseId(Long userId, Long courseId);
    void deleteByUserIdAndCourseId(Long userId, Long courseId);
    void deleteByUserIdAndCourseGroupId(Long userId, Long courseGroupId);
    void deleteAllByUserId(Long userId);

    boolean existsByUserIdAndCourseIdIn(Long user_id, Collection<Long> course_id);

    @Query("""

            SELECT new com.ptit.onlinelearning.response.order.CartItemResponse(
            ci.id,
            COALESCE(c.id, cg.id),
            COALESCE(c.title, cg.title),
            COALESCE(c.slug, cg.slug),
            COALESCE(c.price, cg.price),
            COALESCE(c.currency, cg.currency),
            CASE
                WHEN c.id IS NOT NULL THEN com.ptit.onlinelearning.common.type.CourseType.STANDALONE
                ELSE com.ptit.onlinelearning.common.type.CourseType.GROUP
            END
        )
        FROM CartItem ci
        LEFT JOIN ci.course c
        LEFT JOIN ci.courseGroup cg
        WHERE ci.user.id = :userId
    """)
    Page<CartItemResponse> getAllCartItemsByUserId(@Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
}
