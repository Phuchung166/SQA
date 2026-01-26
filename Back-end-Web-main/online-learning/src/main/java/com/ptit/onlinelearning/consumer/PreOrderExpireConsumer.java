package com.ptit.onlinelearning.consumer;

import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import com.ptit.onlinelearning.config.RabbitMQConfig;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.PreOrderEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreOrderExpireConsumer {

    private final CourseRepository courseRepository;
    private final PreOrderEnrollmentRepository preOrderEnrollmentRepository;
    private final EnrollmentRepository enrollmentRepository;

    @RabbitListener(queues = RabbitMQConfig.PREORDER_EXPIRE_QUEUE)
    @Transactional
    public void handlePreOrderExpire(Long courseId) {
        log.info("Processing pre-order expiration for course ID: {}", courseId);
        
        Optional<Course> optionalCourse = courseRepository.findById(courseId);
        if (optionalCourse.isEmpty()) {
            log.warn("Course with ID {} not found", courseId);
            return;
        }
        
        Course course = optionalCourse.get();
        
        if (Boolean.TRUE.equals(course.getIsPreOrder()) &&
            course.getPreOrderEndDate() != null && 
            !course.getPreOrderEndDate().isAfter(LocalDateTime.now())) {
            
            // Step 1: Update course pre-order status
            course.setIsPreOrder(false);
            course.setPreOrderPrice(null);
            courseRepository.save(course);
            
            log.info("Course {} pre-order period has ended. Pre-order status updated.", 
                    course.getCode());
            
            // Step 2: Convert all PAID pre-order enrollments to actual enrollments
            convertPreOrderEnrollmentsToEnrollments(course);
            
        } else {
            log.info("Course {} pre-order status is already updated or not expired. Current status: isPreOrder={}, endDate={}, now={}", 
                    course.getCode(), course.getIsPreOrder(), course.getPreOrderEndDate(), LocalDateTime.now());
        }
    }
    
    private void convertPreOrderEnrollmentsToEnrollments(Course course) {

        List<PreOrderEnrollment> paidPreOrders = preOrderEnrollmentRepository
                .findByCourseIdAndStatus(course.getId(), PreOrderStatus.PAID);
        
        if (paidPreOrders.isEmpty()) {
            log.info("No PAID pre-order enrollments found for course {}", course.getCode());
            return;
        }
        
        log.info("Found {} PAID pre-order enrollments to convert for course {}", 
                paidPreOrders.size(), course.getCode());
        
        List<Enrollment> newEnrollments = new ArrayList<>();
        List<PreOrderEnrollment> updatedPreOrders = new ArrayList<>();
        
        for (PreOrderEnrollment preOrder : paidPreOrders) {
            // Check if enrollment already exists
            boolean alreadyEnrolled = enrollmentRepository.existsByUserIdAndCourseId(
                    preOrder.getUser().getId(), course.getId());
            
            if (alreadyEnrolled) {
                log.warn("User {} already enrolled in course {}. Skipping conversion.", 
                        preOrder.getUser().getId(), course.getId());
                continue;
            }
            
            // Create new enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(preOrder.getUser());
            enrollment.setCourse(course);
            enrollment.setEnrollmentDate(LocalDateTime.now());
            enrollment.setPreOrderEnrollment(preOrder);
            
            // Calculate end date if course has subscription type
            if (course.getEnrollmentType() == EnrollmentType.SUBSCRIPTION 
                    && course.getExpiredDays() != null) {
                enrollment.setEndDate(LocalDateTime.now().plusDays(course.getExpiredDays()));
            }
            
            newEnrollments.add(enrollment);
            
            // Update pre-order status to CONVERTED
            preOrder.setStatus(PreOrderStatus.CONVERTED);
            updatedPreOrders.add(preOrder);
            
            log.info("Converted pre-order {} to enrollment for user {} on course {}", 
                    preOrder.getId(), preOrder.getUser().getId(), course.getCode());
        }
        
        // Save all enrollments and update pre-order statuses
        if (!newEnrollments.isEmpty()) {
            enrollmentRepository.saveAll(newEnrollments);
            preOrderEnrollmentRepository.saveAll(updatedPreOrders);
            
            log.info("Successfully converted {} pre-order enrollments to actual enrollments for course {}", 
                    newEnrollments.size(), course.getCode());
        }
    }
}

