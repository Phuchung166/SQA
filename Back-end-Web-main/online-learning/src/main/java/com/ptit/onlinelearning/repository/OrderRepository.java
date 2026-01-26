package com.ptit.onlinelearning.repository;


import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.projection.InstructorIncomeProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order,Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.orderItems oi " +
            "LEFT JOIN FETCH oi.course c " +
            "LEFT JOIN FETCH oi.courseGroup cg " +
            "WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithDetails(@Param("orderNumber") String orderNumber);

    @Query(value = """
            SELECT\s
                c.title AS courseTitle,
                SUM(c.price) AS income,
                'STANDALONE' AS courseType,
                c.thumbnail AS thumbnail,
                COUNT(o.id) AS totalSales
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN courses c ON c.id = oi.course_id
            WHERE o.payment_status = 'SUCCESS'\s
              AND c.instructor_id = :instructorId
              AND oi.course_group_id IS NULL
            GROUP BY c.id, c.title, c.thumbnail
           \s
            UNION ALL
           \s
            SELECT
                cg.title AS courseTitle,
                SUM(cg.price) AS income,
                'GROUP' AS courseType,
                cg.thumbnail AS thumbnail,
                COUNT(o.id) AS totalSales
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id\s
            JOIN course_groups cg ON cg.id = oi.course_group_id\s
            WHERE o.payment_status = 'SUCCESS'
              AND EXISTS (
                    SELECT 1
                    FROM courses c
                    WHERE c.course_group_id = cg.id
                      AND c.instructor_id = :instructorId
              )
            GROUP BY cg.id, cg.title, cg.thumbnail
            ORDER BY income DESC
           \s""",
            countQuery = """
            SELECT COUNT(*) FROM (
                SELECT c.id
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN courses c ON c.id = oi.course_id
                WHERE o.payment_status = 'SUCCESS'\s
                  AND c.instructor_id = :instructorId
                  AND oi.course_group_id IS NULL
                GROUP BY c.id
               \s
                UNION ALL
               \s
                SELECT cg.id
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id\s
                JOIN course_groups cg ON cg.id = oi.course_group_id\s
                WHERE o.payment_status = 'SUCCESS'
                  AND EXISTS (
                        SELECT 1
                        FROM courses c
                        WHERE c.course_group_id = cg.id
                          AND c.instructor_id = :instructorId
                  )
                GROUP BY cg.id
            ) AS total
           \s""",
            nativeQuery = true)
    Page<InstructorIncomeProjection> findInstructorIncome(@Param("instructorId") Long instructorId, Pageable pageable);

    @Query(value = """
            SELECT COALESCE(SUM(total_income), 0)
            FROM (
                SELECT SUM(c.price) AS total_income
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN courses c ON c.id = oi.course_id
                WHERE o.payment_status = 'SUCCESS'\s
                  AND c.instructor_id = :instructorId
                  AND oi.course_group_id IS NULL
                GROUP BY c.id
               \s
                UNION ALL
               \s
                SELECT SUM(cg.price) AS total_income
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id\s
                JOIN course_groups cg ON cg.id = oi.course_group_id\s
                WHERE o.payment_status = 'SUCCESS'
                  AND EXISTS (
                        SELECT 1
                        FROM courses c
                        WHERE c.course_group_id = cg.id
                          AND c.instructor_id = :instructorId
                  )
                GROUP BY cg.id
            ) AS all_income
           \s""",
            nativeQuery = true)
    BigDecimal findTotalInstructorIncome(@Param("instructorId") Long instructorId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = 'SUCCESS'")
    Long countSuccessOrders();

    @Query(value = """
            SELECT COALESCE(SUM(o.total_money), 0)
            FROM orders o
            WHERE o.payment_status = 'SUCCESS'
            """,
            nativeQuery = true)
    BigDecimal findTotalSuccessOrdersRevenue();

    @Query(value = """
            SELECT
                u.email AS email,
                u.account_name AS accountName,
                i.bank_name AS bankName,
                i.bank_account AS bankAccount,
                u.first_name AS firstName,
                u.last_name AS lastName,
                COALESCE(SUM(course_income), 0) * COALESCE(i.commission_rate, 70) / 100 AS currentMonthEarning
            FROM instructors i
            INNER JOIN users u ON u.id = i.user_id
            LEFT JOIN (
                SELECT
                    c.instructor_id,
                    SUM(c.price) AS course_income
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN courses c ON c.id = oi.course_id
                WHERE o.payment_status = 'SUCCESS'
                  AND EXTRACT(YEAR FROM o.order_date) = :year
                  AND EXTRACT(MONTH FROM o.order_date) = :month
                  AND oi.course_group_id IS NULL
                GROUP BY c.instructor_id, c.id
               \s
                UNION ALL
               \s
                SELECT
                    c.instructor_id,
                    SUM(cg.price) AS course_income
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN course_groups cg ON cg.id = oi.course_group_id
                JOIN courses c ON c.course_group_id = cg.id
                WHERE o.payment_status = 'SUCCESS'
                  AND EXTRACT(YEAR FROM o.order_date) = :year
                  AND EXTRACT(MONTH FROM o.order_date) = :month
                GROUP BY c.instructor_id, cg.id
            ) AS earnings ON earnings.instructor_id = i.id
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.account_name) LIKE LOWER(CONCAT('%', :search, '%')))
            GROUP BY i.id, u.id, u.email, u.account_name, i.bank_name, i.bank_account, u.first_name, u.last_name, i.commission_rate
           \s""",
            countQuery = """
            SELECT COUNT(DISTINCT i.id)
            FROM instructors i
            INNER JOIN users u ON u.id = i.user_id
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.account_name) LIKE LOWER(CONCAT('%', :search, '%')))
            """,
            nativeQuery = true)
    Page<Object[]> findAllInstructorsCurrentMonthEarning(
            @Param("year") int year,
            @Param("month") int month,
            @Param("search") String search,
            Pageable pageable);

}
